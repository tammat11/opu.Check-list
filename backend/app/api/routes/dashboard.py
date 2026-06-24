from datetime import date, datetime

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.db import get_db
from app.models import ActiveChecklist, BrowserFingerprint, ChecklistAssignment, ChecklistProgress, ChecklistTemplate, Object, ShiftSession, TemplateItem, User, UserLocation
from app.schemas.dashboard import CleanerDashboardOut, CuratorDashboardOut, CuratorObjectSummary, DashboardStatCard


router = APIRouter(prefix="/dashboard", tags=["dashboard"])

ASTANA_FALLBACK_CENTER = (51.1282, 71.4304)
CLEANER_GEOFENCE_RADIUS_METERS = 200


def fallback_object_coords(object_id: int) -> tuple[float, float]:
    lat_base, lng_base = ASTANA_FALLBACK_CENTER
    lat_offset = ((object_id % 5) - 2) * 0.012
    lng_offset = (((object_id // 5) % 5) - 2) * 0.018
    return lat_base + lat_offset, lng_base + lng_offset


def format_last_seen(dt: datetime | None) -> str:
    if not dt:
        return "нет данных"
    diff = max(int((datetime.utcnow() - dt).total_seconds() // 60), 0)
    if diff < 1:
        return "только что"
    if diff < 60:
        return f"{diff} мин назад"
    hours = diff // 60
    return f"{hours} ч назад"


def ensure_cleaner_active_checklist(db: Session, current_user: User) -> ActiveChecklist | None:
    today = date.today()
    if not current_user.assigned_object_id:
        return None

    obj = db.get(Object, current_user.assigned_object_id)
    if not obj:
        return None

    checklist = (
        db.query(ActiveChecklist)
        .filter(
            ActiveChecklist.assigned_to == current_user.id,
            ActiveChecklist.object_id == obj.id,
            ActiveChecklist.status != "completed",
        )
        .order_by(ActiveChecklist.created_at.desc())
        .first()
    )
    if checklist:
        return checklist

    checklist_for_today = (
        db.query(ActiveChecklist)
        .filter(
            ActiveChecklist.assigned_to == current_user.id,
            ActiveChecklist.object_id == obj.id,
            ActiveChecklist.shift_date == today,
        )
        .order_by(ActiveChecklist.created_at.desc())
        .first()
    )
    if checklist_for_today:
        return checklist_for_today if checklist_for_today.status != "completed" else None

    assignment = (
        db.query(ChecklistAssignment)
        .filter(ChecklistAssignment.object_id == obj.id)
        .order_by(ChecklistAssignment.created_at.desc())
        .first()
    )
    if not assignment:
        assignment = (
            db.query(ChecklistAssignment)
            .filter(ChecklistAssignment.is_default.is_(True))
            .order_by(ChecklistAssignment.created_at.desc())
            .first()
        )
    if not assignment:
        return None

    template = db.get(ChecklistTemplate, assignment.template_id)
    if not template or not template.is_active:
        return None

    checklist = ActiveChecklist(
        template_id=template.id,
        object_id=obj.id,
        assigned_to=current_user.id,
        assigned_by=current_user.assigned_by_id or current_user.parent_id or current_user.id,
        status="pending",
        priority="normal",
        shift_date=today,
    )
    db.add(checklist)
    db.flush()
    db.add(
        ShiftSession(
            user_id=current_user.id,
            object_id=obj.id,
            active_checklist_id=checklist.id,
            status="planned",
        )
    )
    db.commit()
    db.refresh(checklist)
    return checklist


@router.get("/curator", response_model=CuratorDashboardOut)
def curator_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> CuratorDashboardOut:
    query = db.query(Object)
    if current_user.role == "partner":
        query = query.filter(Object.partner_id == current_user.id)
    elif current_user.role == "curator":
        query = query.filter((Object.curator_id == current_user.id) | (Object.partner_id == current_user.parent_id))
    objects = query.order_by(Object.name.asc()).all()

    object_summaries: list[CuratorObjectSummary] = []
    total_plan = 0
    total_fact = 0
    total_workers = 0
    behind_objects = 0
    done_objects = 0
    behind_workers_total = 0

    for obj in objects:
        active = db.query(ActiveChecklist).filter(ActiveChecklist.object_id == obj.id).all()
        plan = 0
        fact = 0
        assigned_cleaners = {row.assigned_to for row in active}
        behind_workers = 0

        for checklist in active:
            items = db.query(TemplateItem).filter(TemplateItem.template_id == checklist.template_id).count()
            completed = (
                db.query(ChecklistProgress)
                .filter(ChecklistProgress.checklist_id == checklist.id, ChecklistProgress.completed.is_(True))
                .count()
            )
            plan += items
            fact += completed
            if checklist.status != "completed":
                behind_workers += 1

        status = "done" if plan and fact >= plan else "behind" if behind_workers else "ok"
        if status == "done":
            done_objects += 1
        if status == "behind":
            behind_objects += 1

        workers_count = len(assigned_cleaners) or obj.workers_count
        total_plan += plan
        total_fact += fact
        total_workers += workers_count
        behind_workers_total += behind_workers

        object_summaries.append(
            CuratorObjectSummary(
                id=obj.id,
                name=obj.name,
                district=obj.district,
                plan=plan,
                fact=fact,
                workers_count=workers_count,
                behind_workers=behind_workers,
                status=status,
                latitude=obj.latitude,
                longitude=obj.longitude,
            )
        )

    overall_progress = int((total_fact / total_plan) * 100) if total_plan else 0
    return CuratorDashboardOut(
        user_name=current_user.name,
        total_plan=total_plan,
        total_fact=total_fact,
        overall_progress=overall_progress,
        total_objects=len(object_summaries),
        done_objects=done_objects,
        behind_objects=behind_objects,
        total_workers=total_workers,
        behind_workers=behind_workers_total,
        objects=object_summaries,
    )


@router.get("/cleaner", response_model=CleanerDashboardOut)
def cleaner_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("cleaner")),
) -> CleanerDashboardOut:
    active_count = (
        db.query(ActiveChecklist)
        .filter(ActiveChecklist.assigned_to == current_user.id, ActiveChecklist.status != "completed")
        .count()
    )
    today_completed = (
        db.query(ActiveChecklist)
        .filter(
            ActiveChecklist.assigned_to == current_user.id,
            ActiveChecklist.status == "completed",
            ActiveChecklist.completed_at.is_not(None),
        )
        .all()
    )
    completed_today = sum(1 for row in today_completed if row.completed_at and row.completed_at.date() == datetime.utcnow().date())
    remembered_browser = (
        db.query(BrowserFingerprint)
        .filter(BrowserFingerprint.user_id == current_user.id)
        .count()
        > 0
    )
    return CleanerDashboardOut(
        user_name=current_user.name,
        role=current_user.role,
        active_checklists=active_count,
        completed_today=completed_today,
        remembered_browser=remembered_browser,
        stats=[
            DashboardStatCard(label="Смена", value=str(active_count), sub="активные зоны"),
            DashboardStatCard(label="Статус", value=f"{completed_today}", sub="выполнено сегодня"),
            DashboardStatCard(label="Браузер", value="OK" if remembered_browser else "NEW", sub="запомнен ли вход"),
        ],
    )


@router.get("/curator-detailed")
def curator_dashboard_detailed(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> dict:
    query = db.query(Object)
    if current_user.role == "partner":
        query = query.filter(Object.partner_id == current_user.id)
    elif current_user.role == "curator":
        query = query.filter((Object.curator_id == current_user.id) | (Object.partner_id == current_user.parent_id))
    objects = query.order_by(Object.name.asc()).all()

    detailed_objects: list[dict] = []
    map_pins: list[dict] = []

    for obj in objects:
        active = (
            db.query(ActiveChecklist)
            .filter(ActiveChecklist.object_id == obj.id)
            .order_by(ActiveChecklist.created_at.desc())
            .all()
        )
        workers: list[dict] = []
        plan = 0
        fact = 0

        for checklist in active:
            worker = db.get(User, checklist.assigned_to)
            if not worker:
                continue
            latest_location = (
                db.query(UserLocation)
                .filter(UserLocation.user_id == worker.id)
                .order_by(UserLocation.created_at.desc())
                .first()
            )
            template_items = (
                db.query(TemplateItem)
                .filter(TemplateItem.template_id == checklist.template_id)
                .order_by(TemplateItem.order_index.asc())
                .all()
            )
            progress_rows = (
                db.query(ChecklistProgress)
                .filter(ChecklistProgress.checklist_id == checklist.id)
                .all()
            )
            progress_map = {row.item_id: row for row in progress_rows}
            tasks = []
            done_count = 0
            photo_urls: list[str] = []
            for item in template_items:
                progress = progress_map.get(item.id)
                completed = bool(progress and progress.completed)
                if completed:
                    done_count += 1
                if progress and progress.photo_url and progress.photo_url not in photo_urls:
                    photo_urls.append(progress.photo_url)
                tasks.append(
                    {
                        "title": item.title,
                        "zone": item.zone or "Другое",
                        "done": completed,
                        "photoUrl": progress.photo_url if progress else None,
                        "completedAt": progress.completed_at.isoformat() if progress and progress.completed_at else None,
                    }
                )

            worker_status = "done" if done_count == len(template_items) and template_items else "behind" if checklist.status != "completed" and done_count < len(template_items) else "ok"
            workers.append(
                {
                    "id": checklist.id,
                    "userId": worker.id,
                    "checklistId": checklist.id,
                    "name": worker.name,
                    "plan": len(template_items),
                    "fact": done_count,
                    "lastSeen": format_last_seen(checklist.completed_at or checklist.started_at or checklist.created_at),
                    "status": worker_status,
                    "checklistStatus": checklist.status,
                    "startedAt": checklist.started_at.isoformat() if checklist.started_at else None,
                    "completedAt": checklist.completed_at.isoformat() if checklist.completed_at else None,
                    "dueDate": checklist.due_date.isoformat() if checklist.due_date else None,
                    "notes": checklist.notes,
                    "photoUrls": photo_urls,
                    "location": {
                        "lat": latest_location.latitude,
                        "lng": latest_location.longitude,
                        "accuracy": latest_location.accuracy,
                        "createdAt": latest_location.created_at.isoformat(),
                    }
                    if latest_location
                    else None,
                    "tasks": tasks,
                }
            )
            plan += len(template_items)
            fact += done_count

        status = "done" if plan and fact >= plan else "behind" if any(w["status"] == "behind" for w in workers) else "ok"
        lat, lng = (
            (obj.latitude, obj.longitude)
            if obj.latitude is not None and obj.longitude is not None
            else fallback_object_coords(obj.id)
        )

        detailed_objects.append(
            {
                "id": obj.id,
                "name": obj.name,
                "district": obj.district or obj.city or "Без района",
                "plan": plan,
                "fact": fact,
                "status": status,
                "lat": lat,
                "lng": lng,
                "workers": workers,
            }
        )
        map_pins.append(
            {
                "lat": lat,
                "lng": lng,
                "label": obj.name,
                "color": "#FF6B6B" if status == "behind" else "#F59E0B" if status == "ok" else "#7EC850",
            }
        )

    return {"objects": detailed_objects, "mapPins": map_pins}


@router.get("/work")
def work_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("cleaner")),
) -> dict:
    checklist = ensure_cleaner_active_checklist(db, current_user)

    if not checklist:
        return {
            "objectName": "Объект не назначен",
            "address": "",
            "lat": 43.2550,
            "lng": 76.9126,
            "geofenceRadiusMeters": CLEANER_GEOFENCE_RADIUS_METERS,
            "zones": [],
            "checklistId": None,
        }

    items = (
        db.query(TemplateItem)
        .filter(TemplateItem.template_id == checklist.template_id)
        .order_by(TemplateItem.order_index.asc())
        .all()
    )
    progress_rows = (
        db.query(ChecklistProgress)
        .filter(ChecklistProgress.checklist_id == checklist.id)
        .all()
    )
    progress_map = {row.item_id: row for row in progress_rows}
    grouped: dict[str, list[dict]] = {}
    for item in items:
        zone = item.zone or "Другое"
        grouped.setdefault(zone, []).append(
            {
                "id": item.id,
                "title": item.title,
                "done": bool(progress_map.get(item.id) and progress_map[item.id].completed),
            }
        )

    zones = []
    for idx, (zone_name, tasks) in enumerate(grouped.items(), start=1):
        zones.append(
            {
                "id": idx,
                "title": zone_name,
                "subtitle": checklist.object.name,
                "tasks": tasks,
            }
        )

    return {
        "objectName": checklist.object.name,
        "address": checklist.object.address,
        "lat": checklist.object.latitude or 43.2550,
        "lng": checklist.object.longitude or 76.9126,
        "geofenceRadiusMeters": CLEANER_GEOFENCE_RADIUS_METERS,
        "zones": zones,
        "checklistId": checklist.id,
    }

from datetime import datetime
from math import asin, cos, radians, sin, sqrt

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.db import get_db
from app.models import (
    ActiveChecklist,
    ChecklistAssignment,
    ChecklistProgress,
    ChecklistTemplate,
    Notification,
    PersonalChecklistItem,
    ShiftSession,
    TemplateItem,
    User,
)
from app.schemas.checklist import (
    ActiveChecklistOut,
    AssignmentCreate,
    ChecklistCompleteRequest,
    ChecklistItemOut,
    ChecklistItemProgressUpdate,
    ChecklistStartRequest,
    CleanerAssignmentCreate,
    PersonalChecklistItemCreate,
    PersonalChecklistItemOut,
    PersonalChecklistItemUpdate,
    TemplateCreate,
    TemplateItemCreate,
    TemplateOut,
    TemplateUpdate,
)
from app.schemas.common import MessageResponse


router = APIRouter(prefix="/checklists", tags=["checklists"])
CHECKLIST_START_GEOFENCE_RADIUS_METERS = 200.0


def distance_meters(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    earth_radius_m = 6371000.0
    d_lat = radians(lat2 - lat1)
    d_lng = radians(lng2 - lng1)
    a = (
        sin(d_lat / 2) ** 2
        + cos(radians(lat1)) * cos(radians(lat2)) * sin(d_lng / 2) ** 2
    )
    return 2 * earth_radius_m * asin(sqrt(a))


def normalize_template_items(raw_items: list[str | TemplateItemCreate]) -> list[TemplateItemCreate]:
    normalized: list[TemplateItemCreate] = []
    for item in raw_items:
        if isinstance(item, str):
            title = item.strip()
            if title:
                normalized.append(TemplateItemCreate(title=title))
        else:
            title = item.title.strip()
            if title:
                normalized.append(
                    TemplateItemCreate(
                        title=title,
                        zone=item.zone,
                        icon=item.icon,
                        duration_minutes=item.duration_minutes,
                        requires_photo=item.requires_photo,
                    )
                )
    return normalized


def template_to_out(template: ChecklistTemplate) -> TemplateOut:
    return TemplateOut(
        id=template.id,
        name=template.name,
        description=template.description,
        is_active=template.is_active,
        items=[item for item in template.items],
    )


def resolve_object_assignment(db: Session, object_id: int) -> tuple[ChecklistAssignment, ChecklistTemplate]:
    assignment = (
        db.query(ChecklistAssignment)
        .filter(ChecklistAssignment.object_id == object_id)
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist assignment not found")

    template = db.get(ChecklistTemplate, assignment.template_id)
    if not template or not template.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    return assignment, template


def build_active_checklist_out(db: Session, checklist: ActiveChecklist) -> ActiveChecklistOut:
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
    serialized_items: list[ChecklistItemOut] = []
    completed_count = 0
    for item in items:
        progress = progress_map.get(item.id)
        completed = bool(progress.completed) if progress else False
        if completed:
            completed_count += 1
        serialized_items.append(
            ChecklistItemOut(
                id=item.id,
                title=item.title,
                zone=item.zone,
                icon=item.icon,
                duration_minutes=item.duration_minutes,
                requires_photo=item.requires_photo,
                order_index=item.order_index,
                completed=completed,
                note=progress.note if progress else None,
                photo_url=progress.photo_url if progress else None,
                completed_at=progress.completed_at if progress else None,
            )
        )
    total_count = len(serialized_items)
    progress_pct = int((completed_count / total_count) * 100) if total_count else 0
    return ActiveChecklistOut(
        id=checklist.id,
        template_id=checklist.template_id,
        template_name=checklist.template.name,
        description=checklist.template.description,
        object_id=checklist.object_id,
        object_name=checklist.object.name,
        address=checklist.object.address,
        status=checklist.status,
        due_date=checklist.due_date,
        shift_date=checklist.shift_date,
        priority=checklist.priority,
        progress=progress_pct,
        completed_count=completed_count,
        total_count=total_count,
        started_at=checklist.started_at,
        completed_at=checklist.completed_at,
        assigned_to=checklist.assigned_to,
        items=serialized_items,
    )


@router.get("/templates")
def list_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    templates = db.query(ChecklistTemplate).order_by(ChecklistTemplate.name.asc()).all()
    return {"templates": [template_to_out(template) for template in templates]}


@router.get("/templates/{template_id}", response_model=TemplateOut)
def get_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TemplateOut:
    template = db.get(ChecklistTemplate, template_id)
    if not template:
      raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    return template_to_out(template)


@router.post("/templates")
def create_template(
    payload: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> dict:
    template = ChecklistTemplate(
        name=payload.name,
        description=payload.description,
        created_by=current_user.id,
    )
    db.add(template)
    db.flush()
    items = normalize_template_items(payload.items)
    for index, item in enumerate(items):
        db.add(
            TemplateItem(
                template_id=template.id,
                title=item.title,
                zone=item.zone,
                icon=item.icon,
                duration_minutes=item.duration_minutes,
                requires_photo=item.requires_photo,
                order_index=index,
            )
        )
    db.commit()
    db.refresh(template)
    return {"template": template_to_out(template)}


@router.put("/templates/{template_id}", response_model=TemplateOut)
def update_template(
    template_id: int,
    payload: TemplateUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> TemplateOut:
    template = db.get(ChecklistTemplate, template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    for key, value in payload.model_dump(exclude_unset=True, exclude={"items"}).items():
        setattr(template, key, value)

    if payload.items is not None:
        db.query(TemplateItem).filter(TemplateItem.template_id == template.id).delete()
        items = normalize_template_items(payload.items)
        for index, item in enumerate(items):
            db.add(
                TemplateItem(
                    template_id=template.id,
                    title=item.title,
                    zone=item.zone,
                    icon=item.icon,
                    duration_minutes=item.duration_minutes,
                    requires_photo=item.requires_photo,
                    order_index=index,
                )
            )

    db.commit()
    db.refresh(template)
    return template_to_out(template)


@router.delete("/templates/{template_id}", response_model=MessageResponse)
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> MessageResponse:
    template = db.get(ChecklistTemplate, template_id)
    if not template:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")
    db.delete(template)
    db.commit()
    return MessageResponse(message="Template deleted")


@router.get("/assignments")
def list_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> dict:
    assignments = (
        db.query(ChecklistAssignment, ChecklistTemplate)
        .join(ChecklistTemplate, ChecklistTemplate.id == ChecklistAssignment.template_id)
        .order_by(ChecklistAssignment.created_at.desc())
        .all()
    )
    return {
        "assignments": [
            {
                "id": assignment.id,
                "template_id": assignment.template_id,
                "object_id": assignment.object_id,
                "is_default": assignment.is_default,
                "assigned_by": assignment.assigned_by,
                "template_name": template.name,
                "description": template.description,
                "created_at": assignment.created_at,
            }
            for assignment, template in assignments
        ]
    }


@router.post("/assign")
def assign_template(
    payload: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> dict:
    assignment = None
    if payload.object_id is not None:
        assignment = (
            db.query(ChecklistAssignment)
            .filter(ChecklistAssignment.object_id == payload.object_id)
            .order_by(ChecklistAssignment.created_at.desc())
            .first()
        )
    elif payload.is_default:
        assignment = (
            db.query(ChecklistAssignment)
            .filter(ChecklistAssignment.is_default.is_(True), ChecklistAssignment.object_id.is_(None))
            .order_by(ChecklistAssignment.created_at.desc())
            .first()
        )

    if assignment:
        assignment.template_id = payload.template_id
        assignment.is_default = payload.is_default
        assignment.assigned_by = current_user.id
    else:
        assignment = ChecklistAssignment(
            template_id=payload.template_id,
            object_id=payload.object_id,
            is_default=payload.is_default,
            assigned_by=current_user.id,
        )
        db.add(assignment)
    db.commit()
    db.refresh(assignment)
    return {
        "assignment": {
            "id": assignment.id,
            "template_id": assignment.template_id,
            "object_id": assignment.object_id,
            "is_default": assignment.is_default,
            "assigned_by": assignment.assigned_by,
            "created_at": assignment.created_at,
        }
    }


@router.delete("/assignments/{assignment_id}", response_model=MessageResponse)
def delete_assignment(
    assignment_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> MessageResponse:
    assignment = db.get(ChecklistAssignment, assignment_id)
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Assignment not found")
    db.delete(assignment)
    db.commit()
    return MessageResponse(message="Assignment deleted")


@router.get("/assignments/{object_id}")
def get_assignments(
    object_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> dict:
    assignments = (
        db.query(ChecklistAssignment, ChecklistTemplate)
        .join(ChecklistTemplate, ChecklistTemplate.id == ChecklistAssignment.template_id)
        .filter(
            (ChecklistAssignment.object_id == object_id)
            | (ChecklistAssignment.is_default.is_(True))
        )
        .all()
    )
    return {
        "assignments": [
            {
                "id": assignment.id,
                "template_id": assignment.template_id,
                "object_id": assignment.object_id,
                "is_default": assignment.is_default,
                "template_name": template.name,
                "description": template.description,
            }
            for assignment, template in assignments
        ]
    }


@router.get("/active")
def active_checklists(
    userId: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    target_user_id = current_user.id if current_user.role == "cleaner" or userId is None else userId
    query = db.query(ActiveChecklist).filter(ActiveChecklist.assigned_to == target_user_id)
    if current_user.role == "cleaner" and current_user.assigned_object_id:
        query = query.filter(ActiveChecklist.object_id == current_user.assigned_object_id)
    rows = query.order_by(ActiveChecklist.created_at.desc()).all()
    return {"checklists": [build_active_checklist_out(db, row) for row in rows]}


@router.get("/active/{checklist_id}", response_model=ActiveChecklistOut)
def get_active_checklist(
    checklist_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ActiveChecklistOut:
    checklist = db.get(ActiveChecklist, checklist_id)
    if not checklist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist not found")
    if current_user.role == "cleaner" and checklist.assigned_to != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    return build_active_checklist_out(db, checklist)


@router.post("/assign-to-cleaner")
def assign_to_cleaner(
    payload: CleanerAssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> dict:
    user = db.get(User, payload.assigned_to)
    if not user or user.role != "cleaner":
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cleaner not found")

    obj = db.get(Object, payload.object_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Object not found")

    assignment, template = resolve_object_assignment(db, payload.object_id)
    user.assigned_object_id = payload.object_id
    user.assigned_by_id = current_user.id
    user.assigned_at = datetime.utcnow()

    existing = (
        db.query(ActiveChecklist)
        .filter(
            ActiveChecklist.assigned_to == user.id,
            ActiveChecklist.object_id == payload.object_id,
            ActiveChecklist.status != "completed",
        )
        .order_by(ActiveChecklist.created_at.desc())
        .first()
    )

    checklist = existing
    if not checklist:
        checklist = ActiveChecklist(
            template_id=template.id,
            object_id=payload.object_id,
            assigned_to=user.id,
            assigned_by=current_user.id,
            due_date=payload.due_date,
            shift_date=payload.shift_date,
            priority=payload.priority,
            status="pending",
        )
        db.add(checklist)
        db.flush()
        db.add(
            ShiftSession(
                user_id=user.id,
                object_id=payload.object_id,
                active_checklist_id=checklist.id,
                status="planned",
            )
        )

    db.add(
        Notification(
            user_id=user.id,
            checklist_id=checklist.id if checklist else None,
            title="Назначен объект",
            message=f"За вами закреплен объект {obj.name}. Чек-лист будет доступен по этой локации.",
            notification_type="assignment",
            sent=False,
            metadata_json={
                "source": "assignment",
                "object_id": obj.id,
                "assignment_id": assignment.id,
                "template_id": template.id,
            },
        )
    )
    db.commit()
    db.refresh(checklist)
    return {"checklist": build_active_checklist_out(db, checklist)}


@router.post("/active/{checklist_id}/start", response_model=MessageResponse)
def start_checklist(
    checklist_id: int,
    payload: ChecklistStartRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    checklist = db.get(ActiveChecklist, checklist_id)
    if not checklist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist not found")
    if current_user.role == "cleaner" and checklist.assigned_to != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    object_lat = checklist.object.latitude if checklist.object else None
    object_lng = checklist.object.longitude if checklist.object else None
    if object_lat is not None and object_lng is not None:
        if payload.latitude is None or payload.longitude is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Geolocation is required to start the checklist",
            )

        distance = distance_meters(payload.latitude, payload.longitude, object_lat, object_lng)
        accuracy = max(float(payload.accuracy or 0), 0.0)
        effective_radius = CHECKLIST_START_GEOFENCE_RADIUS_METERS + min(accuracy, 75.0)
        if distance > effective_radius:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=(
                    f"You are outside the work zone. Distance to object: {round(distance)} m, "
                    f"allowed radius: {round(effective_radius)} m"
                ),
            )

    checklist.status = "in_progress"
    checklist.started_at = checklist.started_at or datetime.utcnow()
    if payload.notes:
        checklist.notes = payload.notes

    session = (
        db.query(ShiftSession)
        .filter(ShiftSession.active_checklist_id == checklist.id)
        .order_by(ShiftSession.created_at.desc())
        .first()
    )
    if session:
        session.status = "active"
        session.start_time = session.start_time or datetime.utcnow()

    db.commit()
    return MessageResponse(message="Checklist started")


@router.post("/{checklist_id}/items/{item_id}", response_model=MessageResponse)
def update_item_progress(
    checklist_id: int,
    item_id: int,
    payload: ChecklistItemProgressUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    checklist = db.get(ActiveChecklist, checklist_id)
    if not checklist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist not found")
    if current_user.role == "cleaner" and checklist.assigned_to != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    progress = (
        db.query(ChecklistProgress)
        .filter(ChecklistProgress.checklist_id == checklist_id, ChecklistProgress.item_id == item_id)
        .first()
    )
    if not progress:
        progress = ChecklistProgress(checklist_id=checklist_id, item_id=item_id)
        db.add(progress)
    progress.completed = payload.completed
    progress.note = payload.note
    progress.photo_url = payload.photo_url
    progress.completed_at = datetime.utcnow() if payload.completed else None
    checklist.status = "in_progress"
    checklist.started_at = checklist.started_at or datetime.utcnow()
    db.commit()
    return MessageResponse(message="Progress updated")


@router.post("/{checklist_id}/complete")
def complete_checklist(
    checklist_id: int,
    payload: ChecklistCompleteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    checklist = db.get(ActiveChecklist, checklist_id)
    if not checklist:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist not found")
    if current_user.role == "cleaner" and checklist.assigned_to != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")

    total_items = db.query(TemplateItem).filter(TemplateItem.template_id == checklist.template_id).count()
    completed_items = (
        db.query(ChecklistProgress)
        .filter(
            ChecklistProgress.checklist_id == checklist.id,
            ChecklistProgress.completed.is_(True),
        )
        .count()
    )
    if total_items and completed_items < total_items:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="All checklist items must be completed before finishing",
        )

    checklist.status = "completed"
    checklist.completed_at = datetime.utcnow()
    checklist.notes = payload.notes

    session = (
        db.query(ShiftSession)
        .filter(ShiftSession.active_checklist_id == checklist.id)
        .order_by(ShiftSession.created_at.desc())
        .first()
    )
    if session:
        session.status = "completed"
        session.end_time = datetime.utcnow()

    db.commit()
    db.refresh(checklist)
    return {"message": "Checklist completed", "checklist": build_active_checklist_out(db, checklist)}


@router.get("/personal")
def list_personal_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    rows = (
        db.query(PersonalChecklistItem)
        .filter(PersonalChecklistItem.user_id == current_user.id)
        .order_by(PersonalChecklistItem.sort_order.asc(), PersonalChecklistItem.id.asc())
        .all()
    )
    return {"items": [PersonalChecklistItemOut.model_validate(row) for row in rows]}


@router.post("/personal", response_model=PersonalChecklistItemOut)
def create_personal_item(
    payload: PersonalChecklistItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PersonalChecklistItemOut:
    last_item = (
        db.query(PersonalChecklistItem)
        .filter(PersonalChecklistItem.user_id == current_user.id)
        .order_by(PersonalChecklistItem.sort_order.desc())
        .first()
    )
    row = PersonalChecklistItem(
        user_id=current_user.id,
        title=payload.title,
        sort_order=(last_item.sort_order + 1) if last_item else 1,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return PersonalChecklistItemOut.model_validate(row)


@router.put("/personal/{item_id}", response_model=PersonalChecklistItemOut)
def update_personal_item(
    item_id: int,
    payload: PersonalChecklistItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> PersonalChecklistItemOut:
    row = db.get(PersonalChecklistItem, item_id)
    if not row or row.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Personal item not found")

    if payload.title is not None:
        row.title = payload.title
    if payload.completed is not None:
        row.completed = payload.completed
        row.completed_at = datetime.utcnow() if payload.completed else None
    db.commit()
    db.refresh(row)
    return PersonalChecklistItemOut.model_validate(row)


@router.delete("/personal/{item_id}", response_model=MessageResponse)
def delete_personal_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    row = db.get(PersonalChecklistItem, item_id)
    if not row or row.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Personal item not found")
    db.delete(row)
    db.commit()
    return MessageResponse(message="Personal item deleted")

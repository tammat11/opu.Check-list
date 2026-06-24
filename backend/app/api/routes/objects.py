from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.core.db import get_db
from app.models import ActiveChecklist, ChecklistAssignment, ChecklistTemplate, Object, User
from app.schemas.common import MessageResponse, UserSummary
from app.schemas.object import ObjectCreate, ObjectOut, ObjectUpdate


router = APIRouter(prefix="/objects", tags=["objects"])


def object_to_out(db: Session, row: Object) -> ObjectOut:
    partner = db.get(User, row.partner_id) if row.partner_id else None
    curator = db.get(User, row.curator_id) if row.curator_id else None
    return ObjectOut(
        id=row.id,
        name=row.name,
        address=row.address,
        city=row.city,
        district=row.district,
        latitude=row.latitude,
        longitude=row.longitude,
        workers_count=row.workers_count,
        status=row.status,
        partner_id=row.partner_id,
        partner_name=partner.name if partner else None,
        curator_id=row.curator_id,
        curator_name=curator.name if curator else None,
    )


@router.get("")
def list_objects(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> dict:
    query = db.query(Object).order_by(Object.name.asc())
    if current_user.role == "partner":
        query = query.filter(Object.partner_id == current_user.id)
    elif current_user.role == "curator":
        query = query.filter((Object.curator_id == current_user.id) | (Object.partner_id == current_user.parent_id))
    objects = query.all()
    return {"objects": [object_to_out(db, row) for row in objects]}


@router.get("/{object_id}", response_model=ObjectOut)
def get_object(
    object_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> ObjectOut:
    row = db.get(Object, object_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Object not found")
    return object_to_out(db, row)


@router.get("/{object_id}/workers")
def get_object_workers(
    object_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> dict:
    row = db.get(Object, object_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Object not found")

    users = db.query(User).filter(User.role == "cleaner", User.status == "active").order_by(User.name.asc()).all()
    if row.curator_id:
        users = [user for user in users if user.parent_id == row.curator_id]
    return {"workers": [UserSummary.model_validate(user) for user in users]}


@router.get("/{object_id}/checklists")
def get_object_checklists(
    object_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> dict:
    row = db.get(Object, object_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Object not found")

    assignments = (
        db.query(ChecklistAssignment, ChecklistTemplate)
        .join(ChecklistTemplate, ChecklistTemplate.id == ChecklistAssignment.template_id)
        .filter(
            (ChecklistAssignment.object_id == object_id)
            | (ChecklistAssignment.is_default.is_(True))
        )
        .all()
    )
    active = (
        db.query(ActiveChecklist)
        .filter(ActiveChecklist.object_id == object_id)
        .order_by(ActiveChecklist.created_at.desc())
        .all()
    )
    return {
        "assignments": [
            {
                "id": assignment.id,
                "template_id": template.id,
                "template_name": template.name,
                "description": template.description,
                "is_default": assignment.is_default,
            }
            for assignment, template in assignments
        ],
        "active": [
            {
                "id": checklist.id,
                "template_id": checklist.template_id,
                "assigned_to": checklist.assigned_to,
                "status": checklist.status,
                "due_date": checklist.due_date,
                "shift_date": checklist.shift_date,
            }
            for checklist in active
        ],
    }


@router.post("", response_model=ObjectOut)
def create_object(
    payload: ObjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> ObjectOut:
    row = Object(
        name=payload.name,
        address=payload.address,
        city=payload.city,
        district=payload.district,
        latitude=payload.latitude,
        longitude=payload.longitude,
        workers_count=payload.workers_count,
        status=payload.status,
        partner_id=payload.partner_id,
        curator_id=payload.curator_id,
        created_by=current_user.id,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return object_to_out(db, row)


@router.put("/{object_id}", response_model=ObjectOut)
def update_object(
    object_id: int,
    payload: ObjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> ObjectOut:
    row = db.get(Object, object_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Object not found")
    for key, value in payload.model_dump(exclude_unset=True).items():
        setattr(row, key, value)
    db.commit()
    db.refresh(row)
    return object_to_out(db, row)


@router.delete("/{object_id}", response_model=MessageResponse)
def delete_object(
    object_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> MessageResponse:
    row = db.get(Object, object_id)
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Object not found")
    db.delete(row)
    db.commit()
    return MessageResponse(message="Object deleted")

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.db import get_db
from app.models import Notification, User
from app.schemas.common import MessageResponse
from app.schemas.notification import NotificationCreate, NotificationOut


router = APIRouter(prefix="/notifications", tags=["notifications"])


@router.get("")
def list_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    rows = (
        db.query(Notification)
        .filter((Notification.user_id == current_user.id) | (Notification.user_id.is_(None)))
        .order_by(Notification.created_at.desc())
        .all()
    )
    return {"notifications": [NotificationOut.model_validate(row) for row in rows]}


@router.get("/unread-count")
def unread_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    count = (
        db.query(Notification)
        .filter(
            (Notification.user_id == current_user.id) | (Notification.user_id.is_(None)),
            Notification.read_at.is_(None),
        )
        .count()
    )
    return {"count": count}


@router.post("", response_model=NotificationOut)
def create_notification(
    payload: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> NotificationOut:
    row = Notification(
        user_id=payload.user_id,
        title=payload.title,
        message=payload.message,
        notification_type=payload.notification_type,
        sent=True,
        sent_at=datetime.utcnow(),
        metadata_json={"source": "manual"},
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return NotificationOut.model_validate(row)


@router.post("/{notification_id}/read", response_model=MessageResponse)
def mark_read(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    row = db.get(Notification, notification_id)
    if not row or (row.user_id not in (None, current_user.id)):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found")
    row.read_at = datetime.utcnow()
    db.commit()
    return MessageResponse(message="Notification marked as read")


@router.post("/read-all", response_model=MessageResponse)
def mark_all_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    rows = (
        db.query(Notification)
        .filter((Notification.user_id == current_user.id) | (Notification.user_id.is_(None)))
        .all()
    )
    now = datetime.utcnow()
    for row in rows:
        row.read_at = row.read_at or now
    db.commit()
    return MessageResponse(message="All notifications marked as read")

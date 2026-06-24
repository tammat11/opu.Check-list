from datetime import datetime
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_optional_user
from app.core.config import settings
from app.core.db import get_db
from app.models import ActiveChecklist, Notification, PushSubscription, User, UserLocation
from app.schemas.common import MessageResponse, StatsResponse


router = APIRouter(tags=["system"])

ALLOWED_IMAGE_TYPES = {"image/jpeg", "image/png", "image/webp"}
MAX_UPLOAD_BYTES = 8 * 1024 * 1024


@router.get("/health")
def healthcheck() -> dict[str, str]:
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@router.get("/admin/stats", response_model=StatsResponse)
def admin_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> StatsResponse:
    active_users = db.query(User).filter(User.status == "active").count()
    notifications_sent = db.query(Notification).filter(Notification.sent.is_(True)).count()
    completed = db.query(ActiveChecklist).filter(ActiveChecklist.status == "completed").count()
    total = db.query(ActiveChecklist).count()
    completion_rate = int((completed / total) * 100) if total else 0
    return StatsResponse(
        activeUsers=active_users,
        notificationsSent=notifications_sent,
        checklistsCompleted=completed,
        completionRate=completion_rate,
    )


@router.post("/location", response_model=MessageResponse)
def save_location(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    db.add(
        UserLocation(
            user_id=current_user.id,
            latitude=float(payload["latitude"]),
            longitude=float(payload["longitude"]),
            accuracy=float(payload.get("accuracy")) if payload.get("accuracy") is not None else None,
        )
    )
    db.commit()
    return MessageResponse(message="Location stored")


@router.post("/upload/checklist-photo")
async def upload_checklist_photo(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
) -> dict:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPEG, PNG or WEBP images are allowed")

    content = await file.read()
    if len(content) > MAX_UPLOAD_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File is too large")

    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".jpg", ".jpeg", ".png", ".webp"}:
        suffix = ".jpg" if file.content_type == "image/jpeg" else ".png"

    upload_dir = Path(settings.uploads_dir) / "checklists" / str(current_user.id)
    upload_dir.mkdir(parents=True, exist_ok=True)
    filename = f"{datetime.utcnow().strftime('%Y%m%d%H%M%S')}-{uuid4().hex}{suffix}"
    path = upload_dir / filename
    path.write_bytes(content)

    return {
        "url": f"/uploads/checklists/{current_user.id}/{filename}",
        "size": len(content),
        "content_type": file.content_type,
    }


@router.post("/subscribe", response_model=MessageResponse)
def subscribe(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
) -> MessageResponse:
    subscription = payload.get("subscription") or {}
    endpoint = subscription.get("endpoint")
    keys = subscription.get("keys") or {}

    target_user_id = current_user.id if current_user else int(payload.get("userId") or 0)
    if not target_user_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User id is required")
    if not endpoint:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Subscription endpoint is required")

    existing = db.query(PushSubscription).filter(PushSubscription.endpoint == endpoint).first()
    if existing:
        existing.user_id = target_user_id
        existing.auth_key = keys.get("auth", "")
        existing.p256dh_key = keys.get("p256dh", "")
    else:
        db.add(
            PushSubscription(
                user_id=target_user_id,
                endpoint=endpoint,
                auth_key=keys.get("auth", ""),
                p256dh_key=keys.get("p256dh", ""),
            )
        )
    db.commit()
    return MessageResponse(message="Subscription stored")


@router.post("/notify")
def notify(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    title = payload.get("title") or "OPU Checklist"
    message = payload.get("message") or ""
    recipients = db.query(func.count(PushSubscription.id)).scalar() or 0
    target_user_id = payload.get("user_id")
    db.add(
        Notification(
            user_id=target_user_id,
            title=title,
            message=message,
            notification_type="manual",
            sent=bool(recipients),
            sent_at=datetime.utcnow() if recipients else None,
            metadata_json={"source": "api", "recipients": recipients, "created_by": current_user.id},
        )
    )
    db.commit()
    return {"message": "Notification queued", "recipients": recipients, "sent": recipients, "failed": 0}

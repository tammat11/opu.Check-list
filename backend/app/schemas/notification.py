from datetime import datetime

from pydantic import BaseModel


class NotificationOut(BaseModel):
    id: int
    title: str
    message: str
    notification_type: str | None = None
    sent: bool
    sent_at: datetime | None = None
    read_at: datetime | None = None
    created_at: datetime
    metadata_json: dict = {}

    class Config:
        from_attributes = True


class NotificationCreate(BaseModel):
    title: str
    message: str
    user_id: int | None = None
    notification_type: str | None = "manual"

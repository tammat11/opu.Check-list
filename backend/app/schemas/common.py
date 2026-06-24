from datetime import datetime

from pydantic import BaseModel


class MessageResponse(BaseModel):
    message: str


class UserSummary(BaseModel):
    id: int
    phone: str
    name: str
    role: str
    parent_id: int | None = None
    status: str | None = None

    class Config:
        from_attributes = True


class ApprovalRequestOut(BaseModel):
    id: int
    requested_by_id: int | None
    requested_from_id: int
    request_type: str
    user_data: dict | None
    status: str
    rejection_reason: str | None
    responded_by_id: int | None = None
    approved_object_id: int | None = None
    created_user_id: int | None = None
    created_at: datetime
    responded_at: datetime | None

    class Config:
        from_attributes = True


class StatsResponse(BaseModel):
    activeUsers: int
    notificationsSent: int
    checklistsCompleted: int
    completionRate: int


class IdNamePair(BaseModel):
    id: int
    name: str

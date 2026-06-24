from datetime import date, datetime

from pydantic import BaseModel


class TemplateItemCreate(BaseModel):
    title: str
    zone: str | None = None
    icon: str | None = None
    duration_minutes: int | None = None
    requires_photo: bool = False


class TemplateItemOut(BaseModel):
    id: int
    title: str
    zone: str | None = None
    icon: str | None = None
    duration_minutes: int | None = None
    requires_photo: bool = False
    order_index: int

    class Config:
        from_attributes = True


class TemplateCreate(BaseModel):
    name: str
    description: str | None = None
    items: list[str | TemplateItemCreate] = []


class TemplateUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    is_active: bool | None = None
    items: list[str | TemplateItemCreate] | None = None


class TemplateOut(BaseModel):
    id: int
    name: str
    description: str | None = None
    is_active: bool = True
    items: list[TemplateItemOut]

    class Config:
        from_attributes = True


class AssignmentCreate(BaseModel):
    template_id: int
    object_id: int | None = None
    is_default: bool = False


class CleanerAssignmentCreate(BaseModel):
    object_id: int
    assigned_to: int
    due_date: datetime | None = None
    shift_date: date | None = None
    priority: str = "normal"


class ChecklistItemProgressUpdate(BaseModel):
    completed: bool
    note: str | None = None
    photo_url: str | None = None


class ChecklistStartRequest(BaseModel):
    notes: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    accuracy: float | None = None


class ChecklistCompleteRequest(BaseModel):
    notes: str | None = None


class ChecklistItemOut(BaseModel):
    id: int
    title: str
    zone: str | None = None
    icon: str | None = None
    duration_minutes: int | None = None
    requires_photo: bool = False
    order_index: int
    completed: bool = False
    note: str | None = None
    photo_url: str | None = None
    completed_at: datetime | None = None


class ActiveChecklistOut(BaseModel):
    id: int
    template_id: int
    template_name: str
    description: str | None = None
    object_id: int
    object_name: str
    address: str | None = None
    status: str
    due_date: datetime | None = None
    shift_date: date | None = None
    priority: str
    progress: int
    completed_count: int
    total_count: int
    started_at: datetime | None = None
    completed_at: datetime | None = None
    assigned_to: int
    items: list[ChecklistItemOut]


class PersonalChecklistItemCreate(BaseModel):
    title: str


class PersonalChecklistItemUpdate(BaseModel):
    title: str | None = None
    completed: bool | None = None


class PersonalChecklistItemOut(BaseModel):
    id: int
    title: str
    completed: bool
    completed_at: datetime | None = None
    sort_order: int

    class Config:
        from_attributes = True

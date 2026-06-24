from pydantic import BaseModel


class ObjectCreate(BaseModel):
    name: str
    address: str | None = None
    city: str | None = None
    district: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    workers_count: int = 1
    status: str = "active"
    partner_id: int | None = None
    curator_id: int | None = None


class ObjectUpdate(BaseModel):
    name: str | None = None
    address: str | None = None
    city: str | None = None
    district: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    workers_count: int | None = None
    status: str | None = None
    partner_id: int | None = None
    curator_id: int | None = None


class ObjectOut(BaseModel):
    id: int
    name: str
    address: str | None = None
    city: str | None = None
    district: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    workers_count: int = 1
    status: str
    partner_id: int | None = None
    partner_name: str | None = None
    curator_id: int | None = None
    curator_name: str | None = None

    class Config:
        from_attributes = True

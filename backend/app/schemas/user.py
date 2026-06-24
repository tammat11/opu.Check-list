from pydantic import BaseModel


class UserCreate(BaseModel):
    phone: str
    iin: str
    name: str
    role: str
    parent_id: int | None = None
    password: str | None = None


class UserUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    parent_id: int | None = None
    status: str | None = None
    password: str | None = None


class TeamUserOut(BaseModel):
    id: int
    name: str
    phone: str
    role: str
    status: str
    parent_id: int | None = None
    children_count: int = 0

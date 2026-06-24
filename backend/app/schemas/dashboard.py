from pydantic import BaseModel


class DashboardStatCard(BaseModel):
    label: str
    value: str
    sub: str | None = None


class CuratorObjectSummary(BaseModel):
    id: int
    name: str
    district: str | None = None
    plan: int
    fact: int
    workers_count: int
    behind_workers: int
    status: str
    latitude: float | None = None
    longitude: float | None = None


class CuratorDashboardOut(BaseModel):
    user_name: str
    total_plan: int
    total_fact: int
    overall_progress: int
    total_objects: int
    done_objects: int
    behind_objects: int
    total_workers: int
    behind_workers: int
    objects: list[CuratorObjectSummary]


class CleanerDashboardOut(BaseModel):
    user_name: str
    role: str
    active_checklists: int
    completed_today: int
    remembered_browser: bool
    stats: list[DashboardStatCard]

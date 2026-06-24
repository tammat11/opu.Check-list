from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes.auth import router as auth_router
from app.api.routes.checklists import router as checklist_router
from app.api.routes.dashboard import router as dashboard_router
from app.api.routes.notifications import router as notification_router
from app.api.routes.objects import router as object_router
from app.api.routes.system import router as system_router
from app.api.routes.users import router as user_router
from app.core.config import settings
from app.core.db import SessionLocal, engine
from app.models import Base
from app.services.seed import seed_database


app = FastAPI(title=settings.app_name, debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup() -> None:
    if settings.auto_create_schema:
        Base.metadata.create_all(bind=engine)
    Path(settings.uploads_dir).mkdir(parents=True, exist_ok=True)
    db = SessionLocal()
    try:
        seed_database(db)
    finally:
        db.close()


app.include_router(system_router, prefix=settings.api_prefix)
app.include_router(auth_router, prefix=settings.api_prefix)
app.include_router(user_router, prefix=settings.api_prefix)
app.include_router(object_router, prefix=settings.api_prefix)
app.include_router(checklist_router, prefix=settings.api_prefix)
app.include_router(dashboard_router, prefix=settings.api_prefix)
app.include_router(notification_router, prefix=settings.api_prefix)
app.mount("/uploads", StaticFiles(directory=settings.uploads_dir), name="uploads")

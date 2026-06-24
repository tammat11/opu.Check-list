from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.db import get_db
from app.core.security import get_password_hash
from app.models import User
from app.schemas.common import MessageResponse, UserSummary
from app.schemas.user import TeamUserOut, UserCreate, UserUpdate


router = APIRouter(prefix="/users", tags=["users"])

VALID_ROLES = {"admin", "partner", "curator", "cleaner"}
VALID_STATUSES = {"active", "inactive"}


def serialize_team_user(user: User) -> TeamUserOut:
    return TeamUserOut(
        id=user.id,
        name=user.name,
        phone=user.phone,
        role=user.role,
        status=user.status,
        parent_id=user.parent_id,
        children_count=len(user.children),
    )


def ensure_can_manage_user(current_user: User, target_user: User) -> None:
    if current_user.role == "admin":
        return
    if target_user.id == current_user.id:
        return
    if target_user.parent_id == current_user.id:
        return
    raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")


def normalize_new_user_scope(current_user: User, payload: UserCreate) -> tuple[str, int | None]:
    if payload.role not in VALID_ROLES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")

    if current_user.role == "admin":
        return payload.role, payload.parent_id

    if current_user.role == "partner":
        if payload.role not in {"curator", "cleaner"}:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
        return payload.role, payload.parent_id or current_user.id

    if payload.role != "cleaner":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Insufficient permissions")
    return "cleaner", current_user.id


@router.get("")
def list_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> dict:
    query = db.query(User).order_by(User.role.asc(), User.name.asc())
    if current_user.role == "partner":
        query = query.filter((User.parent_id == current_user.id) | (User.id == current_user.id))
    elif current_user.role == "curator":
        query = query.filter((User.parent_id == current_user.id) | (User.id == current_user.id))
    users = query.all()
    return {"users": [serialize_team_user(user) for user in users]}


@router.get("/me", response_model=UserSummary)
def me(current_user: User = Depends(get_current_user)) -> UserSummary:
    return UserSummary.model_validate(current_user)


@router.get("/cleaners")
def list_cleaners(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> dict:
    query = db.query(User).filter(User.role == "cleaner", User.status == "active").order_by(User.name.asc())
    if current_user.role == "curator":
        query = query.filter(User.parent_id == current_user.id)
    users = query.all()
    return {"users": [serialize_team_user(user) for user in users]}


@router.post("", response_model=UserSummary)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> UserSummary:
    existing = db.query(User).filter((User.phone == payload.phone) | (User.iin == payload.iin)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")
    role, parent_id = normalize_new_user_scope(current_user, payload)

    user = User(
        phone=payload.phone,
        iin=payload.iin,
        name=payload.name,
        role=role,
        parent_id=parent_id,
        password_hash=get_password_hash(payload.password) if payload.password else None,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return UserSummary.model_validate(user)


@router.put("/{user_id}", response_model=UserSummary)
def update_user(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> UserSummary:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    ensure_can_manage_user(current_user, user)

    data = payload.model_dump(exclude_unset=True)
    password = data.pop("password", None)
    if "role" in data and data["role"] not in VALID_ROLES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")
    if "status" in data and data["status"] not in VALID_STATUSES:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid status")
    if current_user.role != "admin":
        data.pop("role", None)
        if current_user.role == "curator":
            data["parent_id"] = current_user.id
    for key, value in data.items():
        setattr(user, key, value)
    if password:
        user.password_hash = get_password_hash(password)
    db.commit()
    db.refresh(user)
    return UserSummary.model_validate(user)


@router.delete("/{user_id}", response_model=MessageResponse)
def deactivate_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> MessageResponse:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    ensure_can_manage_user(current_user, user)
    user.status = "inactive"
    db.commit()
    return MessageResponse(message="User deactivated")

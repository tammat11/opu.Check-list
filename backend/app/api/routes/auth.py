from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_roles
from app.core.db import get_db
from app.core.security import create_access_token, get_password_hash, verify_password
from app.models import ApprovalRequest, BrowserFingerprint, ChecklistAssignment, ChecklistTemplate, Notification, Object, User
from app.schemas.auth import (
    ApprovalApproveRequest,
    AuthCheckRequest,
    AuthCheckResponse,
    ForgotPasswordRequest,
    LoginRequest,
    LoginResponse,
    LogoutRequest,
    RegisterRequest,
    RememberBrowserRequest,
    RememberedLoginRequest,
    SetPasswordRequest,
)
from app.schemas.common import ApprovalRequestOut, MessageResponse, UserSummary


router = APIRouter(prefix="/auth", tags=["auth"])


def find_registration_request(db: Session, phone: str, iin: str) -> ApprovalRequest | None:
    rows = (
        db.query(ApprovalRequest)
        .filter(ApprovalRequest.request_type == "new_user")
        .order_by(ApprovalRequest.created_at.desc())
        .all()
    )
    for row in rows:
        data = row.user_data or {}
        if data.get("phone") == phone and data.get("iin") == iin:
            return row
    return None


def has_pending_password_reset(db: Session, user_id: int) -> ApprovalRequest | None:
    rows = (
        db.query(ApprovalRequest)
        .filter(
            ApprovalRequest.request_type == "password_reset",
            ApprovalRequest.status == "pending",
        )
        .order_by(ApprovalRequest.created_at.desc())
        .all()
    )
    for row in rows:
        data = row.user_data or {}
        if data.get("userId") == user_id:
            return row
    return None


def create_user_notification(
    db: Session,
    *,
    user_id: int,
    title: str,
    message: str,
    notification_type: str,
    metadata: dict | None = None,
) -> None:
    db.add(
        Notification(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            sent=True,
            sent_at=datetime.utcnow(),
            metadata_json=metadata or {},
        )
    )


def resolve_object_template(db: Session, object_id: int) -> tuple[Object, ChecklistAssignment, ChecklistTemplate]:
    obj = db.get(Object, object_id)
    if not obj:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Object not found")

    assignment = (
        db.query(ChecklistAssignment)
        .filter(ChecklistAssignment.object_id == obj.id)
        .order_by(ChecklistAssignment.created_at.desc())
        .first()
    )
    if not assignment:
        assignment = (
            db.query(ChecklistAssignment)
            .filter(ChecklistAssignment.is_default.is_(True))
            .order_by(ChecklistAssignment.created_at.desc())
            .first()
        )
    if not assignment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Checklist assignment not found")

    template = db.get(ChecklistTemplate, assignment.template_id)
    if not template or not template.is_active:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Template not found")

    return obj, assignment, template


def serialize_login(user: User, remember: bool = False) -> LoginResponse:
    return LoginResponse(
        token=create_access_token(str(user.id)),
        user=UserSummary.model_validate(user),
        rememberBrowser=remember,
    )


def password_needs_setup(user: User) -> bool:
    if not user.password_hash:
        return True
    # Legacy MVP approvals used a shared temporary password. Force those users
    # to create their own password on the next login check.
    return verify_password("welcome123", user.password_hash)


@router.get("/approvers")
def get_approvers(db: Session = Depends(get_db)) -> dict:
    users = (
        db.query(User)
        .filter(User.role == "curator", User.status == "active")
        .order_by(User.role, User.name)
        .all()
    )
    return {"approvers": [UserSummary.model_validate(user) for user in users]}


@router.post("/check", response_model=AuthCheckResponse)
def check_user(payload: AuthCheckRequest, db: Session = Depends(get_db)) -> AuthCheckResponse:
    user = db.query(User).filter(User.phone == payload.phone, User.iin == payload.iin).first()
    if not user:
        approval = find_registration_request(db, payload.phone, payload.iin)
        return AuthCheckResponse(
            exists=False,
            approvalStatus=approval.status if approval else None,
            approvalRequestId=approval.id if approval else None,
            rejectionReason=approval.rejection_reason if approval else None,
        )
    assigned_object = db.get(Object, user.assigned_object_id) if user.assigned_object_id else None
    return AuthCheckResponse(
        exists=True,
        role=user.role,
        requiresPassword=not password_needs_setup(user),
        userId=user.id,
        name=user.name,
        approvalStatus="approved",
        assignedObjectId=user.assigned_object_id,
        assignedObjectName=assigned_object.name if assigned_object else None,
    )


@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    user = db.query(User).filter(User.phone == payload.phone, User.iin == payload.iin).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    if user.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")
    if password_needs_setup(user):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Password setup required")
    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if payload.browserFingerprint:
        fingerprint = (
            db.query(BrowserFingerprint)
            .filter(BrowserFingerprint.fingerprint_hash == payload.browserFingerprint)
            .first()
        )
        if fingerprint:
            fingerprint.user_id = user.id
            fingerprint.last_used = datetime.utcnow()
        else:
            db.add(
                BrowserFingerprint(
                    user_id=user.id,
                    fingerprint_hash=payload.browserFingerprint,
                    last_used=datetime.utcnow(),
                )
            )
        db.commit()

    return serialize_login(user, remember=bool(payload.browserFingerprint))


@router.post("/login-remembered", response_model=LoginResponse)
def login_remembered(payload: RememberedLoginRequest, db: Session = Depends(get_db)) -> LoginResponse:
    fingerprint = (
        db.query(BrowserFingerprint)
        .filter(BrowserFingerprint.fingerprint_hash == payload.browserFingerprint)
        .first()
    )
    if not fingerprint:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Browser not remembered")
    user = db.get(User, fingerprint.user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")
    fingerprint.last_used = datetime.utcnow()
    db.commit()
    return serialize_login(user, remember=True)


@router.post("/logout", response_model=MessageResponse)
def logout(
    payload: LogoutRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    if payload.browserFingerprint:
        (
            db.query(BrowserFingerprint)
            .filter(
                BrowserFingerprint.user_id == current_user.id,
                BrowserFingerprint.fingerprint_hash == payload.browserFingerprint,
            )
            .delete()
        )
        db.commit()
    return MessageResponse(message="Logged out")


@router.get("/me", response_model=UserSummary)
def me(current_user: User = Depends(get_current_user)) -> UserSummary:
    return UserSummary.model_validate(current_user)


@router.post("/register")
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    existing = db.query(User).filter(User.phone == payload.phone, User.iin == payload.iin).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="User already exists")

    existing_pending = find_registration_request(db, payload.phone, payload.iin)
    if existing_pending and existing_pending.status == "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Registration request is already pending",
        )

    approval = ApprovalRequest(
        requested_from_id=payload.selectedCuratorId,
        request_type="new_user",
        user_data={"phone": payload.phone, "iin": payload.iin, "name": payload.name},
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)
    return {
        "requestId": approval.id,
        "status": "pending_approval",
        "message": "Registration request sent for approval",
    }


@router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> dict:
    user = db.query(User).filter(User.phone == payload.phone, User.iin == payload.iin).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    existing_pending = has_pending_password_reset(db, user.id)
    if existing_pending:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Password reset request is already pending",
        )
    approval = ApprovalRequest(
        requested_from_id=user.parent_id or user.id,
        requested_by_id=user.id,
        request_type="password_reset",
        user_data={"userId": user.id, "phone": user.phone, "iin": user.iin},
    )
    db.add(approval)
    db.commit()
    db.refresh(approval)
    return {"approvalRequired": True, "requestId": approval.id, "message": "Reset request created"}


@router.post("/set-password", response_model=MessageResponse)
def set_password(payload: SetPasswordRequest, db: Session = Depends(get_db)) -> MessageResponse:
    user = db.query(User).filter(User.phone == payload.phone, User.iin == payload.iin).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if user.status != "active":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is inactive")
    if not password_needs_setup(user):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password is already set")
    user.password_hash = get_password_hash(payload.password)
    db.commit()
    return MessageResponse(message="Password updated")


@router.get("/approvals")
def approvals(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> dict:
    query = db.query(ApprovalRequest).order_by(ApprovalRequest.created_at.desc())
    if current_user.role != "admin":
        query = query.filter(ApprovalRequest.requested_from_id == current_user.id)
    rows = query.all()
    return {"requests": [ApprovalRequestOut.model_validate(row) for row in rows]}


@router.post("/approvals/{request_id}/approve", response_model=MessageResponse)
def approve_request(
    request_id: int,
    payload: ApprovalApproveRequest | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> MessageResponse:
    approval = db.get(ApprovalRequest, request_id)
    if not approval:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if current_user.role != "admin" and approval.requested_from_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if approval.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request already processed")

    if approval.request_type == "new_user":
        data = approval.user_data or {}
        if not payload or not payload.object_id:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Object is required",
            )
        obj, assignment, template = resolve_object_template(db, payload.object_id)
        existing_by_phone = db.query(User).filter(User.phone == data["phone"]).first()
        existing_by_iin = db.query(User).filter(User.iin == data["iin"]).first()
        if existing_by_phone:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Phone already exists")
        if existing_by_iin:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="IIN already exists")
        user = User(
            phone=data["phone"],
            iin=data["iin"],
            name=data["name"],
            role="cleaner",
            parent_id=approval.requested_from_id,
            password_hash=None,
            assigned_object_id=obj.id,
            assigned_by_id=current_user.id,
            assigned_at=datetime.utcnow(),
        )
        db.add(user)
        db.flush()
        create_user_notification(
            db,
            user_id=user.id,
            title="Заявка одобрена",
            message=(
                f"Доступ одобрен. Вы назначены на объект {obj.name}. "
                "При первом входе придумайте личный пароль."
            ),
            notification_type="approval",
            metadata={
                "source": "approval",
                "object_id": obj.id,
                "template_id": template.id,
                "assignment_id": assignment.id,
            },
        )
        approval.approved_object_id = obj.id
        approval.created_user_id = user.id
    elif approval.request_type == "password_reset":
        data = approval.user_data or {}
        user = db.get(User, data.get("userId"))
        if user:
            user.password_hash = None
            create_user_notification(
                db,
                user_id=user.id,
                title="Сброс пароля одобрен",
                message="Запрос на сброс пароля одобрен. При следующем входе задайте новый пароль.",
                notification_type="approval",
                metadata={"source": "password_reset_approval"},
            )

    approval.status = "approved"
    approval.responded_by_id = current_user.id
    approval.responded_at = datetime.utcnow()
    db.commit()
    return MessageResponse(message="Request approved")


@router.post("/approvals/{request_id}/reject", response_model=MessageResponse)
def reject_request(
    request_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles("admin", "partner", "curator")),
) -> MessageResponse:
    approval = db.get(ApprovalRequest, request_id)
    if not approval:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
    if current_user.role != "admin" and approval.requested_from_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    if approval.status != "pending":
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Request already processed")
    approval.status = "rejected"
    approval.rejection_reason = payload.get("reason")
    approval.responded_by_id = current_user.id
    approval.responded_at = datetime.utcnow()
    if approval.request_type == "password_reset" and approval.requested_by_id:
        create_user_notification(
            db,
            user_id=approval.requested_by_id,
            title="Запрос отклонён",
            message=approval.rejection_reason or "Запрос был отклонён куратором.",
            notification_type="approval",
            metadata={"source": "password_reset_rejection"},
        )
    db.commit()
    return MessageResponse(message="Request rejected")


@router.post("/remember-browser", response_model=MessageResponse)
def remember_browser(
    payload: RememberBrowserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MessageResponse:
    if current_user.id != payload.userId and current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
    fingerprint = db.query(BrowserFingerprint).filter(BrowserFingerprint.fingerprint_hash == payload.fingerprint).first()
    if fingerprint:
        fingerprint.user_id = payload.userId
        fingerprint.device_name = payload.deviceName
        fingerprint.last_used = datetime.utcnow()
    else:
        db.add(
            BrowserFingerprint(
                user_id=payload.userId,
                fingerprint_hash=payload.fingerprint,
                device_name=payload.deviceName,
                last_used=datetime.utcnow(),
            )
        )
    db.commit()
    return MessageResponse(message="Browser remembered")

from pydantic import BaseModel, Field

from app.schemas.common import UserSummary


class AuthCheckRequest(BaseModel):
    phone: str
    iin: str = Field(min_length=12, max_length=12)


class AuthCheckResponse(BaseModel):
    exists: bool
    role: str | None = None
    requiresPassword: bool = False
    userId: int | None = None
    name: str | None = None
    approvalStatus: str | None = None
    approvalRequestId: int | None = None
    rejectionReason: str | None = None
    assignedObjectId: int | None = None
    assignedObjectName: str | None = None


class LoginRequest(BaseModel):
    phone: str
    iin: str
    password: str
    browserFingerprint: str | None = None


class RememberedLoginRequest(BaseModel):
    browserFingerprint: str


class LogoutRequest(BaseModel):
    browserFingerprint: str | None = None


class LoginResponse(BaseModel):
    token: str
    user: UserSummary
    rememberBrowser: bool = False


class RegisterRequest(BaseModel):
    phone: str
    iin: str = Field(min_length=12, max_length=12)
    name: str
    selectedCuratorId: int


class ForgotPasswordRequest(BaseModel):
    phone: str
    iin: str


class SetPasswordRequest(BaseModel):
    phone: str
    iin: str
    password: str = Field(min_length=6)


class RememberBrowserRequest(BaseModel):
    userId: int
    fingerprint: str
    deviceName: str | None = None


class ApprovalApproveRequest(BaseModel):
    object_id: int | None = None

from __future__ import annotations

from datetime import date, datetime

from sqlalchemy import JSON, Boolean, Date, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )


class User(Base, TimestampMixin):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    phone: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    iin: Mapped[str] = mapped_column(String(12), index=True)
    name: Mapped[str] = mapped_column(String(255))
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    password_hash: Mapped[str | None] = mapped_column(String(255), nullable=True)
    role: Mapped[str] = mapped_column(String(50), default="cleaner", index=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active", index=True)
    assigned_object_id: Mapped[int | None] = mapped_column(ForeignKey("objects.id"), nullable=True)
    assigned_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    assigned_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    parent: Mapped["User | None"] = relationship("User", remote_side=[id], foreign_keys=[parent_id], backref="children")
    assigned_object: Mapped["Object | None"] = relationship("Object", foreign_keys=[assigned_object_id])
    assigned_by: Mapped["User | None"] = relationship("User", foreign_keys=[assigned_by_id])


class Object(Base, TimestampMixin):
    __tablename__ = "objects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str | None] = mapped_column(String(100), nullable=True)
    district: Mapped[str | None] = mapped_column(String(120), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    workers_count: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[str] = mapped_column(String(50), default="active", index=True)
    partner_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    curator_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_by: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)

    partner: Mapped["User | None"] = relationship("User", foreign_keys=[partner_id])
    curator: Mapped["User | None"] = relationship("User", foreign_keys=[curator_id])


class ChecklistTemplate(Base, TimestampMixin):
    __tablename__ = "checklist_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(255), index=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_by: Mapped[int] = mapped_column(ForeignKey("users.id"))

    items: Mapped[list["TemplateItem"]] = relationship(
        back_populates="template",
        cascade="all, delete-orphan",
        order_by="TemplateItem.order_index",
    )


class TemplateItem(Base):
    __tablename__ = "template_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    template_id: Mapped[int] = mapped_column(ForeignKey("checklist_templates.id"))
    title: Mapped[str] = mapped_column(String(255))
    zone: Mapped[str | None] = mapped_column(String(120), nullable=True)
    icon: Mapped[str | None] = mapped_column(String(60), nullable=True)
    duration_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    requires_photo: Mapped[bool] = mapped_column(Boolean, default=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    template: Mapped["ChecklistTemplate"] = relationship(back_populates="items")


class ChecklistAssignment(Base):
    __tablename__ = "checklist_assignments"
    __table_args__ = (
        UniqueConstraint("template_id", "object_id", name="uq_assignment_template_object"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    template_id: Mapped[int] = mapped_column(ForeignKey("checklist_templates.id"))
    object_id: Mapped[int | None] = mapped_column(ForeignKey("objects.id"), nullable=True)
    is_default: Mapped[bool] = mapped_column(Boolean, default=False)
    assigned_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ActiveChecklist(Base):
    __tablename__ = "active_checklists"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    template_id: Mapped[int] = mapped_column(ForeignKey("checklist_templates.id"))
    object_id: Mapped[int] = mapped_column(ForeignKey("objects.id"))
    assigned_to: Mapped[int] = mapped_column(ForeignKey("users.id"))
    assigned_by: Mapped[int] = mapped_column(ForeignKey("users.id"))
    status: Mapped[str] = mapped_column(String(50), default="pending", index=True)
    due_date: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    shift_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    priority: Mapped[str] = mapped_column(String(30), default="normal")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)

    template: Mapped["ChecklistTemplate"] = relationship()
    object: Mapped["Object"] = relationship()


class ChecklistProgress(Base):
    __tablename__ = "checklist_progress"
    __table_args__ = (
        UniqueConstraint("checklist_id", "item_id", name="uq_progress_checklist_item"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    checklist_id: Mapped[int] = mapped_column(ForeignKey("active_checklists.id"))
    item_id: Mapped[int] = mapped_column(ForeignKey("template_items.id"))
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    note: Mapped[str | None] = mapped_column(Text, nullable=True)
    photo_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow
    )


class ShiftSession(Base, TimestampMixin):
    __tablename__ = "shift_sessions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    object_id: Mapped[int | None] = mapped_column(ForeignKey("objects.id"), nullable=True)
    active_checklist_id: Mapped[int | None] = mapped_column(ForeignKey("active_checklists.id"), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="planned", index=True)
    start_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    end_time: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)


class PersonalChecklistItem(Base, TimestampMixin):
    __tablename__ = "personal_checklist_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    title: Mapped[str] = mapped_column(String(255))
    completed: Mapped[bool] = mapped_column(Boolean, default=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)


class PushSubscription(Base):
    __tablename__ = "push_subscriptions"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    endpoint: Mapped[str] = mapped_column(String(512), unique=True)
    auth_key: Mapped[str] = mapped_column(String(256))
    p256dh_key: Mapped[str] = mapped_column(String(256))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    checklist_id: Mapped[int | None] = mapped_column(ForeignKey("active_checklists.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(255))
    message: Mapped[str] = mapped_column(Text)
    notification_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    scheduled_for: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    sent: Mapped[bool] = mapped_column(Boolean, default=False)
    sent_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    read_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    metadata_json: Mapped[dict] = mapped_column("metadata", JSON, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class UserLocation(Base):
    __tablename__ = "user_locations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    latitude: Mapped[float] = mapped_column(Float)
    longitude: Mapped[float] = mapped_column(Float)
    accuracy: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class BrowserFingerprint(Base):
    __tablename__ = "browser_fingerprints"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    fingerprint_hash: Mapped[str] = mapped_column(String(256), unique=True)
    device_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    last_used: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class ApprovalRequest(Base):
    __tablename__ = "approval_requests"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    requested_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    requested_from_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    request_type: Mapped[str] = mapped_column(String(50))
    user_data: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="pending", index=True)
    rejection_reason: Mapped[str | None] = mapped_column(String(255), nullable=True)
    responded_by_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    approved_object_id: Mapped[int | None] = mapped_column(ForeignKey("objects.id"), nullable=True)
    created_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    responded_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

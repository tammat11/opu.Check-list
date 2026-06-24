"""initial schema

Revision ID: 20260612_000001
Revises:
Create Date: 2026-06-12 00:00:01
"""

from alembic import op
import sqlalchemy as sa


revision = "20260612_000001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("phone", sa.String(length=20), nullable=False),
        sa.Column("iin", sa.String(length=12), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("password_hash", sa.String(length=255), nullable=True),
        sa.Column("role", sa.String(length=50), nullable=False),
        sa.Column("parent_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["parent_id"], ["users.id"]),
        sa.UniqueConstraint("phone"),
    )
    op.create_index("ix_users_phone", "users", ["phone"], unique=False)
    op.create_index("ix_users_iin", "users", ["iin"], unique=False)
    op.create_index("ix_users_role", "users", ["role"], unique=False)
    op.create_index("ix_users_status", "users", ["status"], unique=False)

    op.create_table(
        "objects",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("address", sa.Text(), nullable=True),
        sa.Column("city", sa.String(length=100), nullable=True),
        sa.Column("district", sa.String(length=120), nullable=True),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("workers_count", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("partner_id", sa.Integer(), nullable=True),
        sa.Column("curator_id", sa.Integer(), nullable=True),
        sa.Column("created_by", sa.Integer(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["partner_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["curator_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
    )
    op.create_index("ix_objects_name", "objects", ["name"], unique=False)
    op.create_index("ix_objects_status", "objects", ["status"], unique=False)

    op.create_table(
        "checklist_templates",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["created_by"], ["users.id"]),
    )
    op.create_index("ix_checklist_templates_name", "checklist_templates", ["name"], unique=False)

    op.create_table(
        "template_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("template_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("zone", sa.String(length=120), nullable=True),
        sa.Column("icon", sa.String(length=60), nullable=True),
        sa.Column("duration_minutes", sa.Integer(), nullable=True),
        sa.Column("requires_photo", sa.Boolean(), nullable=False),
        sa.Column("order_index", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["template_id"], ["checklist_templates.id"]),
    )

    op.create_table(
        "checklist_assignments",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("template_id", sa.Integer(), nullable=False),
        sa.Column("object_id", sa.Integer(), nullable=True),
        sa.Column("is_default", sa.Boolean(), nullable=False),
        sa.Column("assigned_by", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["template_id"], ["checklist_templates.id"]),
        sa.ForeignKeyConstraint(["object_id"], ["objects.id"]),
        sa.ForeignKeyConstraint(["assigned_by"], ["users.id"]),
        sa.UniqueConstraint("template_id", "object_id", name="uq_assignment_template_object"),
    )

    op.create_table(
        "active_checklists",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("template_id", sa.Integer(), nullable=False),
        sa.Column("object_id", sa.Integer(), nullable=False),
        sa.Column("assigned_to", sa.Integer(), nullable=False),
        sa.Column("assigned_by", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("due_date", sa.DateTime(), nullable=True),
        sa.Column("shift_date", sa.Date(), nullable=True),
        sa.Column("priority", sa.String(length=30), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("started_at", sa.DateTime(), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.ForeignKeyConstraint(["template_id"], ["checklist_templates.id"]),
        sa.ForeignKeyConstraint(["object_id"], ["objects.id"]),
        sa.ForeignKeyConstraint(["assigned_to"], ["users.id"]),
        sa.ForeignKeyConstraint(["assigned_by"], ["users.id"]),
    )
    op.create_index("ix_active_checklists_status", "active_checklists", ["status"], unique=False)

    op.create_table(
        "checklist_progress",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("checklist_id", sa.Integer(), nullable=False),
        sa.Column("item_id", sa.Integer(), nullable=False),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.Column("note", sa.Text(), nullable=True),
        sa.Column("photo_url", sa.String(length=512), nullable=True),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["checklist_id"], ["active_checklists.id"]),
        sa.ForeignKeyConstraint(["item_id"], ["template_items.id"]),
        sa.UniqueConstraint("checklist_id", "item_id", name="uq_progress_checklist_item"),
    )

    op.create_table(
        "shift_sessions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("object_id", sa.Integer(), nullable=True),
        sa.Column("active_checklist_id", sa.Integer(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("start_time", sa.DateTime(), nullable=True),
        sa.Column("end_time", sa.DateTime(), nullable=True),
        sa.Column("notes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["object_id"], ["objects.id"]),
        sa.ForeignKeyConstraint(["active_checklist_id"], ["active_checklists.id"]),
    )
    op.create_index("ix_shift_sessions_status", "shift_sessions", ["status"], unique=False)

    op.create_table(
        "personal_checklist_items",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("completed", sa.Boolean(), nullable=False),
        sa.Column("completed_at", sa.DateTime(), nullable=True),
        sa.Column("sort_order", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("updated_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )

    op.create_table(
        "push_subscriptions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("endpoint", sa.String(length=512), nullable=False),
        sa.Column("auth_key", sa.String(length=256), nullable=False),
        sa.Column("p256dh_key", sa.String(length=256), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.UniqueConstraint("endpoint"),
    )
    op.create_index("ix_push_subscriptions_user_id", "push_subscriptions", ["user_id"], unique=False)

    op.create_table(
        "notifications",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("checklist_id", sa.Integer(), nullable=True),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("message", sa.Text(), nullable=False),
        sa.Column("notification_type", sa.String(length=50), nullable=True),
        sa.Column("scheduled_for", sa.DateTime(), nullable=True),
        sa.Column("sent", sa.Boolean(), nullable=False),
        sa.Column("sent_at", sa.DateTime(), nullable=True),
        sa.Column("read_at", sa.DateTime(), nullable=True),
        sa.Column("metadata", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["checklist_id"], ["active_checklists.id"]),
    )

    op.create_table(
        "user_locations",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=False),
        sa.Column("longitude", sa.Float(), nullable=False),
        sa.Column("accuracy", sa.Float(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
    )
    op.create_index("ix_user_locations_user_id", "user_locations", ["user_id"], unique=False)

    op.create_table(
        "browser_fingerprints",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("fingerprint_hash", sa.String(length=256), nullable=False),
        sa.Column("device_name", sa.String(length=255), nullable=True),
        sa.Column("last_used", sa.DateTime(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.UniqueConstraint("fingerprint_hash"),
    )
    op.create_index("ix_browser_fingerprints_user_id", "browser_fingerprints", ["user_id"], unique=False)

    op.create_table(
        "approval_requests",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("requested_by_id", sa.Integer(), nullable=True),
        sa.Column("requested_from_id", sa.Integer(), nullable=False),
        sa.Column("request_type", sa.String(length=50), nullable=False),
        sa.Column("user_data", sa.JSON(), nullable=True),
        sa.Column("status", sa.String(length=50), nullable=False),
        sa.Column("rejection_reason", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=False),
        sa.Column("responded_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["requested_by_id"], ["users.id"]),
        sa.ForeignKeyConstraint(["requested_from_id"], ["users.id"]),
    )
    op.create_index("ix_approval_requests_status", "approval_requests", ["status"], unique=False)


def downgrade() -> None:
    op.drop_index("ix_approval_requests_status", table_name="approval_requests")
    op.drop_table("approval_requests")

    op.drop_index("ix_browser_fingerprints_user_id", table_name="browser_fingerprints")
    op.drop_table("browser_fingerprints")

    op.drop_index("ix_user_locations_user_id", table_name="user_locations")
    op.drop_table("user_locations")

    op.drop_table("notifications")

    op.drop_index("ix_push_subscriptions_user_id", table_name="push_subscriptions")
    op.drop_table("push_subscriptions")

    op.drop_table("personal_checklist_items")

    op.drop_index("ix_shift_sessions_status", table_name="shift_sessions")
    op.drop_table("shift_sessions")

    op.drop_table("checklist_progress")

    op.drop_index("ix_active_checklists_status", table_name="active_checklists")
    op.drop_table("active_checklists")

    op.drop_table("checklist_assignments")
    op.drop_table("template_items")

    op.drop_index("ix_checklist_templates_name", table_name="checklist_templates")
    op.drop_table("checklist_templates")

    op.drop_index("ix_objects_status", table_name="objects")
    op.drop_index("ix_objects_name", table_name="objects")
    op.drop_table("objects")

    op.drop_index("ix_users_status", table_name="users")
    op.drop_index("ix_users_role", table_name="users")
    op.drop_index("ix_users_iin", table_name="users")
    op.drop_index("ix_users_phone", table_name="users")
    op.drop_table("users")

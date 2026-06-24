"""approval metadata and cleaner object assignment

Revision ID: 20260619_000002
Revises: 20260612_000001
Create Date: 2026-06-19 00:00:02
"""

from alembic import op
import sqlalchemy as sa


revision = "20260619_000002"
down_revision = "20260612_000001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("assigned_object_id", sa.Integer(), nullable=True))
    op.add_column("users", sa.Column("assigned_by_id", sa.Integer(), nullable=True))
    op.add_column("users", sa.Column("assigned_at", sa.DateTime(), nullable=True))
    op.create_foreign_key(
        "fk_users_assigned_object_id_objects",
        "users",
        "objects",
        ["assigned_object_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_users_assigned_by_id_users",
        "users",
        "users",
        ["assigned_by_id"],
        ["id"],
    )

    op.add_column("approval_requests", sa.Column("responded_by_id", sa.Integer(), nullable=True))
    op.add_column("approval_requests", sa.Column("approved_object_id", sa.Integer(), nullable=True))
    op.add_column("approval_requests", sa.Column("created_user_id", sa.Integer(), nullable=True))
    op.create_foreign_key(
        "fk_approval_requests_responded_by_id_users",
        "approval_requests",
        "users",
        ["responded_by_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_approval_requests_approved_object_id_objects",
        "approval_requests",
        "objects",
        ["approved_object_id"],
        ["id"],
    )
    op.create_foreign_key(
        "fk_approval_requests_created_user_id_users",
        "approval_requests",
        "users",
        ["created_user_id"],
        ["id"],
    )


def downgrade() -> None:
    op.drop_constraint("fk_approval_requests_created_user_id_users", "approval_requests", type_="foreignkey")
    op.drop_constraint("fk_approval_requests_approved_object_id_objects", "approval_requests", type_="foreignkey")
    op.drop_constraint("fk_approval_requests_responded_by_id_users", "approval_requests", type_="foreignkey")
    op.drop_column("approval_requests", "created_user_id")
    op.drop_column("approval_requests", "approved_object_id")
    op.drop_column("approval_requests", "responded_by_id")

    op.drop_constraint("fk_users_assigned_by_id_users", "users", type_="foreignkey")
    op.drop_constraint("fk_users_assigned_object_id_objects", "users", type_="foreignkey")
    op.drop_column("users", "assigned_at")
    op.drop_column("users", "assigned_by_id")
    op.drop_column("users", "assigned_object_id")

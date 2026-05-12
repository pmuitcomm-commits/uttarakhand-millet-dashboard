"""
Extend existing activity_logs for login and Excel upload events.

Revision ID: 20260512_0001
Revises: 20260508_0001
Create Date: 2026-05-12 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260512_0001"
down_revision: Union[str, None] = "20260508_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _inspector():
    return sa.inspect(op.get_bind())


def _table_exists(table_name: str) -> bool:
    return table_name in _inspector().get_table_names()


def _columns(table_name: str) -> set[str]:
    if not _table_exists(table_name):
        return set()
    return {column["name"] for column in _inspector().get_columns(table_name)}


def _has_any(existing_columns: set[str], candidates: tuple[str, ...]) -> bool:
    normalized = {column.lower() for column in existing_columns}
    return any(candidate.lower() in normalized for candidate in candidates)


def _add_column_if_missing(existing_columns: set[str], column: sa.Column) -> None:
    if column.name not in existing_columns:
        op.add_column("activity_logs", column)
        existing_columns.add(column.name)


def upgrade() -> None:
    if not _table_exists("activity_logs"):
        # The activity log table is owned by the existing database schema. This
        # migration must not create a replacement table.
        return

    existing_columns = _columns("activity_logs")

    if not _has_any(existing_columns, ("action_type", "action", "event_type", "activity_type")):
        _add_column_if_missing(existing_columns, sa.Column("action_type", sa.String(length=80), nullable=True))

    if not _has_any(existing_columns, ("user_id", "actor_id", "created_by")):
        _add_column_if_missing(existing_columns, sa.Column("user_id", sa.Integer(), nullable=True))

    if not _has_any(existing_columns, ("username", "user_name", "actor_name", "full_name")):
        _add_column_if_missing(existing_columns, sa.Column("username", sa.String(length=255), nullable=True))

    if not _has_any(existing_columns, ("user_email", "actor_email", "email")):
        _add_column_if_missing(existing_columns, sa.Column("user_email", sa.String(length=255), nullable=True))

    if not _has_any(existing_columns, ("status", "result", "outcome")):
        _add_column_if_missing(existing_columns, sa.Column("status", sa.String(length=40), nullable=True))

    if not _has_any(existing_columns, ("details", "metadata", "meta", "extra_data", "data")):
        _add_column_if_missing(
            existing_columns,
            sa.Column("details", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        )

    if not _has_any(existing_columns, ("created_at", "timestamp", "logged_at", "activity_time")):
        _add_column_if_missing(
            existing_columns,
            sa.Column(
                "created_at",
                sa.DateTime(timezone=True),
                server_default=sa.text("now()"),
                nullable=True,
            ),
        )


def downgrade() -> None:
    # Non-destructive on purpose: activity_logs is an existing production audit
    # table, and we cannot know which similarly named columns predated this
    # migration in each deployment.
    pass

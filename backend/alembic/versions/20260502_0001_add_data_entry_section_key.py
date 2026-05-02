"""
Add section key to district/block data entries.

Revision ID: 20260502_0001
Revises: 20260430_0001
Create Date: 2026-05-02 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260502_0001"
down_revision: Union[str, None] = "20260430_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _column_exists(table_name: str, column_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(column["name"] == column_name for column in inspector.get_columns(table_name))


def _index_exists(table_name: str, index_name: str) -> bool:
    inspector = sa.inspect(op.get_bind())
    return any(index["name"] == index_name for index in inspector.get_indexes(table_name))


def upgrade() -> None:
    if not _column_exists("district_block_data_entries", "section_key"):
        op.add_column(
            "district_block_data_entries",
            sa.Column("section_key", sa.String(length=120), nullable=True),
        )

    if not _index_exists(
        "district_block_data_entries",
        "ix_district_block_data_entries_section_key",
    ):
        op.create_index(
            "ix_district_block_data_entries_section_key",
            "district_block_data_entries",
            ["section_key"],
            unique=False,
        )


def downgrade() -> None:
    if _index_exists(
        "district_block_data_entries",
        "ix_district_block_data_entries_section_key",
    ):
        op.drop_index(
            "ix_district_block_data_entries_section_key",
            table_name="district_block_data_entries",
        )

    if _column_exists("district_block_data_entries", "section_key"):
        op.drop_column("district_block_data_entries", "section_key")

"""
Initial schema baseline for SQLAlchemy-managed tables.

This migration mirrors the current model metadata and is intentionally
non-destructive for an existing Supabase database: it creates a table only when
that table is missing, and it never drops or renames existing objects.

Revision ID: 20260430_0001
Revises:
Create Date: 2026-04-30 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "20260430_0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _existing_tables() -> set[str]:
    inspector = sa.inspect(op.get_bind())
    return set(inspector.get_table_names())


def _create_users() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("username", sa.String(), nullable=True),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("hashed_password", sa.String(), nullable=True),
        sa.Column("full_name", sa.String(), nullable=True),
        sa.Column("role", sa.String(), nullable=True),
        sa.Column("district", sa.String(), nullable=True),
        sa.Column("block", sa.String(), nullable=True),
        sa.Column("is_active", sa.Integer(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_users_id", "users", ["id"], unique=False)
    op.create_index("ix_users_username", "users", ["username"], unique=True)
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_index("ix_users_role", "users", ["role"], unique=False)


def _create_farmers() -> None:
    op.create_table(
        "farmers",
        sa.Column("farmer_id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=100), nullable=True),
        sa.Column("father_husband_name", sa.String(length=100), nullable=True),
        sa.Column("mobile", sa.String(length=10), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("address", sa.String(length=300), nullable=True),
        sa.Column("group_president_name", sa.String(length=100), nullable=True),
        sa.Column("bank_account_number", sa.String(length=18), nullable=True),
        sa.Column("bank_ifsc", sa.String(length=11), nullable=True),
        sa.Column("bank_name_address", sa.String(length=200), nullable=True),
        sa.Column("account_holder_name", sa.String(length=100), nullable=True),
        sa.Column("district_name", sa.String(length=100), nullable=True),
        sa.Column("block_name", sa.String(length=100), nullable=True),
        sa.Column("crops", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("estimated_seed_date", sa.Date(), nullable=True),
        sa.Column("estimated_yield", sa.String(length=50), nullable=True),
        sa.Column("consent_accepted", sa.Boolean(), nullable=False),
        sa.Column("consent_text_version", sa.String(length=50), nullable=True),
        sa.Column("consent_accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("farmer_id"),
    )
    op.create_index("ix_farmers_farmer_id", "farmers", ["farmer_id"], unique=False)
    op.create_index("ix_farmers_mobile", "farmers", ["mobile"], unique=True)
    op.create_index("ix_farmers_district_name", "farmers", ["district_name"], unique=False)
    op.create_index("ix_farmers_block_name", "farmers", ["block_name"], unique=False)


def _create_land_parcels() -> None:
    op.create_table(
        "land_parcels",
        sa.Column("land_id", sa.BigInteger(), autoincrement=True, nullable=False),
        sa.Column("farmer_id", sa.BigInteger(), nullable=True),
        sa.Column("khatauni_number", sa.String(length=50), nullable=True),
        sa.Column("khasra_number", sa.String(length=50), nullable=True),
        sa.Column("area_value", sa.Numeric(), nullable=True),
        sa.Column("area_unit", sa.String(length=20), nullable=True),
        sa.Column("ownership_type", sa.String(length=20), nullable=True),
        sa.Column("cultivator_name", sa.String(length=100), nullable=True),
        sa.Column("lease_period", sa.String(length=50), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("land_id"),
    )
    op.create_index("ix_land_parcels_land_id", "land_parcels", ["land_id"], unique=False)
    op.create_index("ix_land_parcels_farmer_id", "land_parcels", ["farmer_id"], unique=False)


def _create_production() -> None:
    op.create_table(
        "production",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("district_id", sa.BigInteger(), nullable=True),
        sa.Column("block_id", sa.BigInteger(), nullable=True),
        sa.Column("millet_id", sa.BigInteger(), nullable=True),
        sa.Column("season_id", sa.BigInteger(), nullable=True),
        sa.Column("year", sa.Integer(), nullable=True),
        sa.Column("area_hectare", sa.Numeric(), nullable=True),
        sa.Column("production_ton", sa.Numeric(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_production_id", "production", ["id"], unique=False)


def _create_procurement() -> None:
    op.create_table(
        "procurement",
        sa.Column("id", sa.BigInteger(), nullable=False),
        sa.Column("district", sa.String(), nullable=True),
        sa.Column("crop", sa.String(), nullable=True),
        sa.Column("centres", sa.Integer(), nullable=True),
        sa.Column("target_mt", sa.Float(), nullable=True),
        sa.Column("farmers_count", sa.Integer(), nullable=True),
        sa.Column("procurement_mt", sa.Float(), nullable=True),
        sa.Column("procurement_percent", sa.Float(), nullable=True),
        sa.Column("private_procurement_mt", sa.Float(), nullable=True),
        sa.Column("district_id", sa.BigInteger(), nullable=True),
        sa.Column("millet_id", sa.BigInteger(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_procurement_id", "procurement", ["id"], unique=False)


def _create_district_block_data_entries() -> None:
    op.create_table(
        "district_block_data_entries",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("scope_type", sa.String(length=20), nullable=False),
        sa.Column("section_key", sa.String(length=120), nullable=True),
        sa.Column("district", sa.String(length=120), nullable=False),
        sa.Column("block", sa.String(length=120), nullable=True),
        sa.Column("data_type", sa.String(length=120), nullable=True),
        sa.Column("metric_name", sa.String(length=240), nullable=False),
        sa.Column("value", sa.String(length=120), nullable=True),
        sa.Column("unit", sa.String(length=80), nullable=True),
        sa.Column("reporting_period", sa.String(length=120), nullable=True),
        sa.Column("remarks", sa.String(length=500), nullable=True),
        sa.Column("created_by", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_district_block_data_entries_id", "district_block_data_entries", ["id"], unique=False)
    op.create_index(
        "ix_district_block_data_entries_scope_type",
        "district_block_data_entries",
        ["scope_type"],
        unique=False,
    )
    op.create_index(
        "ix_district_block_data_entries_section_key",
        "district_block_data_entries",
        ["section_key"],
        unique=False,
    )
    op.create_index(
        "ix_district_block_data_entries_district",
        "district_block_data_entries",
        ["district"],
        unique=False,
    )
    op.create_index("ix_district_block_data_entries_block", "district_block_data_entries", ["block"], unique=False)
    op.create_index(
        "ix_district_block_data_entries_created_by",
        "district_block_data_entries",
        ["created_by"],
        unique=False,
    )


def upgrade() -> None:
    existing_tables = _existing_tables()
    create_table = {
        "users": _create_users,
        "farmers": _create_farmers,
        "land_parcels": _create_land_parcels,
        "production": _create_production,
        "procurement": _create_procurement,
        "district_block_data_entries": _create_district_block_data_entries,
    }

    for table_name, create_fn in create_table.items():
        if table_name not in existing_tables:
            create_fn()


def downgrade() -> None:
    # This baseline intentionally has no destructive downgrade. Future
    # migrations can include reversible operations where safe.
    pass

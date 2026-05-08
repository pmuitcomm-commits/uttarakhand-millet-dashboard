"""
Normalize farmer scheme data into farmers + farmer_scheme_transactions.

Revision ID: 20260508_0001
Revises: 20260502_0001
Create Date: 2026-05-08 00:00:00.000000
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "20260508_0001"
down_revision: Union[str, None] = "20260502_0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


SCHEME_TYPES = (
    "cultivation_input",
    "shg_intake",
    "transportation",
    "bukhari_storage",
    "sowing_incentive",
    "block_award",
)


LEGACY_TABLE_MAPPINGS = {
    "millet_cultivation_inputs": {
        "scheme_type": "cultivation_input",
        "area_ha": ("millet_area_ha", "millet_area", "area_ha", "area", "area_hectare"),
        "incentive": ("incentive", "incentive_amount", "amount"),
        "millet_type": ("millet_type", "millet", "crop"),
    },
    "millet_intake_shg_incentives": {
        "scheme_type": "shg_intake",
        "quantity": ("quantity_quintal", "quantity_qtl", "quantity", "quintal"),
        "incentive": ("incentive", "incentive_amount", "amount"),
        "millet_type": ("millet_type", "millet", "crop"),
    },
    "millet_transportation_expenditure": {
        "scheme_type": "transportation",
        "production": ("production", "production_qtl", "production_quintal"),
        "incentive": ("transportation_expenditure", "expenditure", "amount", "incentive"),
        "millet_type": ("millet_type", "millet", "crop"),
    },
    "bukhari_storage": {
        "scheme_type": "bukhari_storage",
        "no_of_items": ("no_of_items", "number_of_items", "items", "bukhari", "bukharis"),
        "incentive": ("incentive", "amount"),
    },
    "sowing_incentives": {
        "scheme_type": "sowing_incentive",
        "millet_type": ("millet", "millet_type", "crop"),
        "area_ha": ("area_ha", "area", "area_hectare"),
        "type_of_sowing": ("type_of_sowing", "sowing_type", "method_of_sowing"),
        "incentive": ("incentive", "incentive_amount", "amount"),
    },
    "block_level_awards": {
        "scheme_type": "block_award",
        "production": ("production", "production_qtl", "production_quintal"),
        "award": ("award", "award_amount", "amount"),
        "millet_type": ("millet_type", "millet", "crop"),
    },
}


def _inspector():
    return sa.inspect(op.get_bind())


def _table_exists(table_name: str) -> bool:
    return table_name in _inspector().get_table_names()


def _columns(table_name: str) -> set[str]:
    if not _table_exists(table_name):
        return set()
    return {column["name"] for column in _inspector().get_columns(table_name)}


def _column_exists(table_name: str, column_name: str) -> bool:
    return column_name in _columns(table_name)


def _index_exists(table_name: str, index_name: str) -> bool:
    if not _table_exists(table_name):
        return False
    return any(index["name"] == index_name for index in _inspector().get_indexes(table_name))


def _constraint_exists(table_name: str, constraint_name: str) -> bool:
    if not _table_exists(table_name):
        return False
    checks = _inspector().get_check_constraints(table_name)
    foreign_keys = _inspector().get_foreign_keys(table_name)
    unique_constraints = _inspector().get_unique_constraints(table_name)
    return any(
        constraint.get("name") == constraint_name
        for constraint in [*checks, *foreign_keys, *unique_constraints]
    )


def _quote(identifier: str) -> str:
    return op.get_bind().dialect.identifier_preparer.quote(identifier)


def _add_column_if_missing(table_name: str, column: sa.Column) -> None:
    if not _column_exists(table_name, column.name):
        op.add_column(table_name, column)


def _create_farmers_if_missing() -> None:
    if _table_exists("farmers"):
        return

    op.create_table(
        "farmers",
        sa.Column("id", sa.BigInteger(), sa.Identity(always=True), nullable=False),
        sa.Column("farmer_id", sa.BigInteger(), nullable=True),
        sa.Column("farmer_code", sa.Text(), nullable=True),
        sa.Column("name", sa.Text(), nullable=False),
        sa.Column("district", sa.Text(), nullable=True),
        sa.Column("block", sa.Text(), nullable=True),
        sa.Column("village", sa.Text(), nullable=True),
        sa.Column("mobile", sa.Text(), nullable=True),
        sa.Column("district_name", sa.Text(), nullable=True),
        sa.Column("block_name", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )


def _normalize_farmers_table() -> None:
    _create_farmers_if_missing()

    _add_column_if_missing("farmers", sa.Column("id", sa.BigInteger(), nullable=True))
    _add_column_if_missing("farmers", sa.Column("farmer_id", sa.BigInteger(), nullable=True))
    _add_column_if_missing("farmers", sa.Column("farmer_code", sa.Text(), nullable=True))
    _add_column_if_missing("farmers", sa.Column("district", sa.Text(), nullable=True))
    _add_column_if_missing("farmers", sa.Column("block", sa.Text(), nullable=True))
    _add_column_if_missing("farmers", sa.Column("village", sa.Text(), nullable=True))
    _add_column_if_missing("farmers", sa.Column("district_name", sa.Text(), nullable=True))
    _add_column_if_missing("farmers", sa.Column("block_name", sa.Text(), nullable=True))

    if _column_exists("farmers", "farmer_id"):
        op.execute("UPDATE farmers SET id = farmer_id WHERE id IS NULL AND farmer_id IS NOT NULL")
    op.execute(
        """
        CREATE SEQUENCE IF NOT EXISTS farmers_id_backfill_seq;
        SELECT setval(
            'farmers_id_backfill_seq',
            GREATEST(COALESCE((SELECT MAX(id) FROM farmers), 0), 1),
            true
        );
        UPDATE farmers
        SET id = nextval('farmers_id_backfill_seq')
        WHERE id IS NULL;
        """
    )
    op.execute("UPDATE farmers SET farmer_id = id WHERE farmer_id IS NULL AND id IS NOT NULL")
    op.execute("UPDATE farmers SET farmer_code = 'FARMER-' || id WHERE farmer_code IS NULL AND id IS NOT NULL")
    op.execute("UPDATE farmers SET district = district_name WHERE district IS NULL AND district_name IS NOT NULL")
    op.execute("UPDATE farmers SET block = block_name WHERE block IS NULL AND block_name IS NOT NULL")
    op.execute("UPDATE farmers SET district_name = district WHERE district_name IS NULL AND district IS NOT NULL")
    op.execute("UPDATE farmers SET block_name = block WHERE block_name IS NULL AND block IS NOT NULL")

    try:
        op.alter_column("farmers", "id", existing_type=sa.BigInteger(), nullable=False)
    except Exception:
        # Existing production tables may already have a different primary key.
        # The unique index below is enough for normalized transaction FKs.
        pass

    if not _index_exists("farmers", "ux_farmers_id"):
        op.create_index("ux_farmers_id", "farmers", ["id"], unique=True)
    if not _constraint_exists("farmers", "uq_farmers_id"):
        op.create_unique_constraint("uq_farmers_id", "farmers", ["id"])
    if not _index_exists("farmers", "ux_farmers_farmer_code"):
        op.create_index("ux_farmers_farmer_code", "farmers", ["farmer_code"], unique=True)
    if not _index_exists("farmers", "ix_farmers_district"):
        op.create_index("ix_farmers_district", "farmers", ["district"], unique=False)
    if not _index_exists("farmers", "ix_farmers_block"):
        op.create_index("ix_farmers_block", "farmers", ["block"], unique=False)

    op.execute(
        """
        CREATE OR REPLACE FUNCTION sync_farmers_normalized_fields()
        RETURNS trigger AS $$
        DECLARE
            legacy_sequence text;
        BEGIN
            IF NEW.farmer_id IS NOT NULL THEN
                NEW.id := NEW.farmer_id;
            END IF;

            IF NEW.id IS NULL THEN
                legacy_sequence := pg_get_serial_sequence('farmers', 'farmer_id');
                IF legacy_sequence IS NOT NULL THEN
                    NEW.id := nextval(legacy_sequence);
                END IF;
            END IF;

            IF NEW.farmer_id IS NULL AND NEW.id IS NOT NULL THEN
                NEW.farmer_id := NEW.id;
            END IF;

            IF NEW.farmer_code IS NULL AND NEW.id IS NOT NULL THEN
                NEW.farmer_code := 'FARMER-' || NEW.id;
            END IF;

            IF NEW.district IS NULL AND NEW.district_name IS NOT NULL THEN
                NEW.district := NEW.district_name;
            END IF;
            IF NEW.block IS NULL AND NEW.block_name IS NOT NULL THEN
                NEW.block := NEW.block_name;
            END IF;
            IF NEW.district_name IS NULL AND NEW.district IS NOT NULL THEN
                NEW.district_name := NEW.district;
            END IF;
            IF NEW.block_name IS NULL AND NEW.block IS NOT NULL THEN
                NEW.block_name := NEW.block;
            END IF;

            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;

        DROP TRIGGER IF EXISTS tr_sync_farmers_normalized_fields ON farmers;
        CREATE TRIGGER tr_sync_farmers_normalized_fields
        BEFORE INSERT OR UPDATE ON farmers
        FOR EACH ROW
        EXECUTE FUNCTION sync_farmers_normalized_fields();
        """
    )


def _create_farmer_scheme_transactions() -> None:
    if not _table_exists("farmer_scheme_transactions"):
        op.create_table(
            "farmer_scheme_transactions",
            sa.Column("id", sa.BigInteger(), sa.Identity(always=True), nullable=False),
            sa.Column("farmer_id", sa.BigInteger(), nullable=False),
            sa.Column("scheme_type", sa.Text(), nullable=False),
            sa.Column("millet_type", sa.Text(), nullable=True),
            sa.Column("quantity", sa.Numeric(), nullable=True),
            sa.Column("area_ha", sa.Numeric(), nullable=True),
            sa.Column("no_of_items", sa.Integer(), nullable=True),
            sa.Column("production", sa.Numeric(), nullable=True),
            sa.Column("type_of_sowing", sa.Text(), nullable=True),
            sa.Column("incentive", sa.Numeric(), nullable=True),
            sa.Column("award", sa.Numeric(), nullable=True),
            sa.Column("transaction_date", sa.Date(), nullable=True),
            sa.Column("remarks", sa.Text(), nullable=True),
            sa.Column("source_table", sa.Text(), nullable=True),
            sa.Column("source_record_key", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.ForeignKeyConstraint(["farmer_id"], ["farmers.id"], ondelete="RESTRICT"),
            sa.PrimaryKeyConstraint("id"),
        )
    else:
        _add_column_if_missing("farmer_scheme_transactions", sa.Column("source_table", sa.Text(), nullable=True))
        _add_column_if_missing("farmer_scheme_transactions", sa.Column("source_record_key", sa.Text(), nullable=True))

    for index_name, columns in (
        ("ix_farmer_scheme_transactions_farmer_id", ["farmer_id"]),
        ("ix_farmer_scheme_transactions_scheme_type", ["scheme_type"]),
        ("ix_farmer_scheme_transactions_transaction_date", ["transaction_date"]),
        ("ix_farmer_scheme_transactions_scheme_date", ["scheme_type", "transaction_date"]),
    ):
        if not _index_exists("farmer_scheme_transactions", index_name):
            op.create_index(index_name, "farmer_scheme_transactions", columns, unique=False)

    if not _index_exists("farmer_scheme_transactions", "ux_farmer_scheme_transactions_source"):
        op.create_index(
            "ux_farmer_scheme_transactions_source",
            "farmer_scheme_transactions",
            ["source_table", "source_record_key"],
            unique=True,
        )

    if not _constraint_exists("farmer_scheme_transactions", "ck_farmer_scheme_transactions_scheme_type"):
        allowed = ", ".join(f"'{scheme_type}'" for scheme_type in SCHEME_TYPES)
        op.create_check_constraint(
            "ck_farmer_scheme_transactions_scheme_type",
            "farmer_scheme_transactions",
            f"scheme_type IN ({allowed})",
        )


def _create_millet_production() -> None:
    if not _table_exists("millet_production"):
        op.create_table(
            "millet_production",
            sa.Column("id", sa.BigInteger(), sa.Identity(always=True), nullable=False),
            sa.Column("district_id", sa.BigInteger(), nullable=True),
            sa.Column("block_id", sa.BigInteger(), nullable=True),
            sa.Column("millet_id", sa.BigInteger(), nullable=True),
            sa.Column("season_id", sa.BigInteger(), nullable=True),
            sa.Column("year", sa.Integer(), nullable=True),
            sa.Column("area_hectare", sa.Numeric(), nullable=True),
            sa.Column("production_ton", sa.Numeric(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )

    if not _index_exists("millet_production", "ix_millet_production_id"):
        op.create_index("ix_millet_production_id", "millet_production", ["id"], unique=False)
    if not _index_exists("millet_production", "ix_millet_production_district_year"):
        op.create_index(
            "ix_millet_production_district_year",
            "millet_production",
            ["district_id", "year"],
            unique=False,
        )

    if _table_exists("production"):
        op.execute(
            """
            INSERT INTO millet_production (
                id,
                district_id,
                block_id,
                millet_id,
                season_id,
                year,
                area_hectare,
                production_ton,
                created_at
            )
            OVERRIDING SYSTEM VALUE
            SELECT
                p.id,
                p.district_id,
                p.block_id,
                p.millet_id,
                p.season_id,
                p.year,
                p.area_hectare,
                p.production_ton,
                p.created_at
            FROM production p
            WHERE NOT EXISTS (
                SELECT 1 FROM millet_production mp WHERE mp.id = p.id
            )
            """
        )


def _create_storage_processing() -> None:
    if not _table_exists("storage_processing"):
        op.create_table(
            "storage_processing",
            sa.Column("id", sa.BigInteger(), sa.Identity(always=True), nullable=False),
            sa.Column("district", sa.Text(), nullable=True),
            sa.Column("block", sa.Text(), nullable=True),
            sa.Column("facility_name", sa.Text(), nullable=False),
            sa.Column("facility_type", sa.Text(), nullable=True),
            sa.Column("capacity_mt", sa.Numeric(), nullable=True),
            sa.Column("operational_status", sa.Text(), nullable=True),
            sa.Column("remarks", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=True),
            sa.PrimaryKeyConstraint("id"),
        )

    for index_name, columns in (
        ("ix_storage_processing_district", ["district"]),
        ("ix_storage_processing_block", ["block"]),
        ("ix_storage_processing_facility_type", ["facility_type"]),
    ):
        if not _index_exists("storage_processing", index_name):
            op.create_index(index_name, "storage_processing", columns, unique=False)


def _text_expr(columns: set[str], candidates: tuple[str, ...]) -> str:
    for candidate in candidates:
        if candidate in columns:
            return f"NULLIF(t.{_quote(candidate)}::text, '')"
    return "NULL::text"


def _numeric_expr(columns: set[str], candidates: tuple[str, ...]) -> str:
    for candidate in candidates:
        if candidate in columns:
            return f"NULLIF(t.{_quote(candidate)}::text, '')::numeric"
    return "NULL::numeric"


def _integer_expr(columns: set[str], candidates: tuple[str, ...]) -> str:
    for candidate in candidates:
        if candidate in columns:
            return f"NULLIF(t.{_quote(candidate)}::text, '')::integer"
    return "NULL::integer"


def _date_expr(columns: set[str]) -> str:
    for candidate in ("transaction_date", "date", "created_at"):
        if candidate in columns:
            return f"NULLIF(t.{_quote(candidate)}::text, '')::date"
    return "NULL::date"


def _migrate_legacy_table(table_name: str, mapping: dict[str, object]) -> None:
    if not _table_exists(table_name):
        return

    columns = _columns(table_name)
    legacy_farmer_id = _text_expr(columns, ("farmer_id", "beneficiary_id"))
    name = _text_expr(columns, ("name", "farmer_name", "beneficiary_name", "beneficiary"))
    district = _text_expr(columns, ("district", "district_name"))
    block = _text_expr(columns, ("block", "block_name"))
    village = _text_expr(columns, ("village", "village_name"))
    mobile = _text_expr(columns, ("mobile", "mobile_number", "phone"))
    millet_type = _text_expr(columns, tuple(mapping.get("millet_type", ())))
    quantity = _numeric_expr(columns, tuple(mapping.get("quantity", ())))
    area_ha = _numeric_expr(columns, tuple(mapping.get("area_ha", ())))
    no_of_items = _integer_expr(columns, tuple(mapping.get("no_of_items", ())))
    production = _numeric_expr(columns, tuple(mapping.get("production", ())))
    type_of_sowing = _text_expr(columns, tuple(mapping.get("type_of_sowing", ())))
    incentive = _numeric_expr(columns, tuple(mapping.get("incentive", ())))
    award = _numeric_expr(columns, tuple(mapping.get("award", ())))
    transaction_date = _date_expr(columns)
    scheme_type = mapping["scheme_type"]

    op.execute(
        f"""
        WITH src AS (
            SELECT
                {legacy_farmer_id} AS legacy_farmer_id,
                {name} AS name,
                {district} AS district,
                {block} AS block,
                {village} AS village,
                {mobile} AS mobile,
                {millet_type} AS millet_type,
                {quantity} AS quantity,
                {area_ha} AS area_ha,
                {no_of_items} AS no_of_items,
                {production} AS production,
                {type_of_sowing} AS type_of_sowing,
                {incentive} AS incentive,
                {award} AS award,
                {transaction_date} AS transaction_date,
                md5(row_to_json(t)::text) AS source_record_key
            FROM {_quote(table_name)} t
        ),
        normalized_src AS (
            SELECT
                *,
                CASE
                    WHEN legacy_farmer_id IS NOT NULL THEN 'LEGACY-' || legacy_farmer_id
                    ELSE 'LEGACY-' || md5(CONCAT_WS('|', COALESCE(name, ''), COALESCE(district, ''), COALESCE(block, '')))
                END AS farmer_code
            FROM src
        ),
        inserted_farmers AS (
            INSERT INTO farmers (
                farmer_code,
                name,
                district,
                block,
                village,
                mobile,
                district_name,
                block_name
            )
            SELECT DISTINCT
                s.farmer_code,
                COALESCE(s.name, 'Legacy farmer'),
                s.district,
                s.block,
                s.village,
                s.mobile,
                s.district,
                s.block
            FROM normalized_src s
            WHERE NOT EXISTS (
                SELECT 1
                FROM farmers f
                WHERE
                    (s.legacy_farmer_id ~ '^[0-9]+$' AND (f.id = s.legacy_farmer_id::bigint OR f.farmer_id = s.legacy_farmer_id::bigint))
                    OR f.farmer_code = s.farmer_code
                    OR (
                        f.name = s.name
                        AND COALESCE(NULLIF(f.district, ''), NULLIF(f.district_name, '')) = s.district
                        AND COALESCE(NULLIF(f.block, ''), NULLIF(f.block_name, '')) = s.block
                    )
            )
            ON CONFLICT (farmer_code) DO NOTHING
            RETURNING id, farmer_code
        ),
        resolved AS (
            SELECT
                s.*,
                COALESCE(f_by_id.id, f_by_code.id, f_by_demo.id, inserted_farmers.id) AS normalized_farmer_id
            FROM normalized_src s
            LEFT JOIN farmers f_by_id
                ON s.legacy_farmer_id ~ '^[0-9]+$'
               AND (f_by_id.id = s.legacy_farmer_id::bigint OR f_by_id.farmer_id = s.legacy_farmer_id::bigint)
            LEFT JOIN farmers f_by_code
                ON f_by_code.farmer_code = s.farmer_code
            LEFT JOIN farmers f_by_demo
                ON f_by_demo.name = s.name
               AND COALESCE(NULLIF(f_by_demo.district, ''), NULLIF(f_by_demo.district_name, '')) = s.district
               AND COALESCE(NULLIF(f_by_demo.block, ''), NULLIF(f_by_demo.block_name, '')) = s.block
            LEFT JOIN inserted_farmers
                ON inserted_farmers.farmer_code = s.farmer_code
        )
        INSERT INTO farmer_scheme_transactions (
            farmer_id,
            scheme_type,
            millet_type,
            quantity,
            area_ha,
            no_of_items,
            production,
            type_of_sowing,
            incentive,
            award,
            transaction_date,
            source_table,
            source_record_key
        )
        SELECT
            normalized_farmer_id,
            '{scheme_type}',
            millet_type,
            quantity,
            area_ha,
            no_of_items,
            production,
            type_of_sowing,
            incentive,
            award,
            transaction_date,
            '{table_name}',
            source_record_key
        FROM resolved
        WHERE normalized_farmer_id IS NOT NULL
        ON CONFLICT (source_table, source_record_key) DO NOTHING
        """
    )


def _migrate_legacy_scheme_tables() -> None:
    for table_name, mapping in LEGACY_TABLE_MAPPINGS.items():
        _migrate_legacy_table(table_name, mapping)


def upgrade() -> None:
    _normalize_farmers_table()
    _create_farmer_scheme_transactions()
    _create_millet_production()
    _create_storage_processing()
    _migrate_legacy_scheme_tables()


def downgrade() -> None:
    # Keep the migration non-destructive. Legacy tables are intentionally left
    # in place, and normalized rows may contain post-migration production data.
    pass

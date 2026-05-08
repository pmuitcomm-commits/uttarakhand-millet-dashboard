"""
Shared farmer master and scheme transaction services.

The legacy block-data screens still address the original farmer-level table
names. This module maps those table names to the normalized
``farmer_scheme_transactions`` table while resolving farmer master rows in one
place.
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from typing import Any, Optional

from fastapi import HTTPException, status
from sqlalchemy import inspect, text
from sqlalchemy.exc import NoSuchTableError
from sqlalchemy.orm import Session


FARMER_TABLE = "farmers"
TRANSACTION_TABLE = "farmer_scheme_transactions"

FARMER_COLUMNS = (
    "farmer_id",
    "farmer_code",
    "name",
    "district",
    "block",
    "village",
    "mobile",
)

TRANSACTION_COLUMNS = (
    "millet_type",
    "quantity",
    "area_ha",
    "no_of_items",
    "production",
    "type_of_sowing",
    "incentive",
    "award",
    "transaction_date",
    "remarks",
)

NUMERIC_COLUMNS = {"quantity", "area_ha", "production", "incentive", "award"}
INTEGER_COLUMNS = {"no_of_items"}

SCHEME_TYPES = (
    "cultivation_input",
    "shg_intake",
    "transportation",
    "bukhari_storage",
    "sowing_incentive",
    "block_award",
)


@dataclass(frozen=True)
class SchemeTableConfig:
    """Compatibility mapping for one legacy farmer-level scheme table."""

    scheme_type: str
    fields: tuple[str, ...]
    aliases: dict[str, str]


COMMON_ALIASES = {
    "farmer": "name",
    "farmername": "name",
    "nameoffarmer": "name",
    "nameofbeneficiary": "name",
    "beneficiary": "name",
    "beneficiaryname": "name",
    "districtname": "district",
    "blockname": "block",
    "villageName": "village",
    "mobilenumber": "mobile",
    "mobileNo": "mobile",
    "phoneno": "mobile",
    "phone": "mobile",
    "date": "transaction_date",
    "transactiondate": "transaction_date",
    "farmercode": "farmer_code",
    "farmerid": "farmer_id",
    "remarks": "remarks",
    "remark": "remarks",
}


LEGACY_SCHEME_TABLES: dict[str, SchemeTableConfig] = {
    "millet_cultivation_inputs": SchemeTableConfig(
        scheme_type="cultivation_input",
        fields=(
            "farmer_id",
            "farmer_code",
            "name",
            "district",
            "block",
            "village",
            "mobile",
            "millet_type",
            "area_ha",
            "incentive",
            "transaction_date",
            "remarks",
        ),
        aliases={
            "millet": "millet_type",
            "milletarea": "area_ha",
            "milletareaha": "area_ha",
            "milletareahectare": "area_ha",
            "area": "area_ha",
            "areahectare": "area_ha",
            "areahectares": "area_ha",
            "incentiveamount": "incentive",
            "amount": "incentive",
        },
    ),
    "millet_intake_shg_incentives": SchemeTableConfig(
        scheme_type="shg_intake",
        fields=(
            "farmer_id",
            "farmer_code",
            "name",
            "district",
            "block",
            "village",
            "mobile",
            "millet_type",
            "quantity",
            "incentive",
            "transaction_date",
            "remarks",
        ),
        aliases={
            "millet": "millet_type",
            "quantityquintal": "quantity",
            "quantityinqtl": "quantity",
            "quantityqtl": "quantity",
            "quintal": "quantity",
            "incentiveamount": "incentive",
            "amount": "incentive",
        },
    ),
    "millet_transportation_expenditure": SchemeTableConfig(
        scheme_type="transportation",
        fields=(
            "farmer_id",
            "farmer_code",
            "name",
            "district",
            "block",
            "village",
            "mobile",
            "millet_type",
            "production",
            "incentive",
            "transaction_date",
            "remarks",
        ),
        aliases={
            "millet": "millet_type",
            "productionquintal": "production",
            "productionqtl": "production",
            "transportationexpenditure": "incentive",
            "expenditure": "incentive",
            "amount": "incentive",
        },
    ),
    "bukhari_storage": SchemeTableConfig(
        scheme_type="bukhari_storage",
        fields=(
            "farmer_id",
            "farmer_code",
            "name",
            "district",
            "block",
            "village",
            "mobile",
            "no_of_items",
            "incentive",
            "transaction_date",
            "remarks",
        ),
        aliases={
            "numberofitems": "no_of_items",
            "noofitems": "no_of_items",
            "items": "no_of_items",
            "bukhari": "no_of_items",
            "bukharis": "no_of_items",
            "amount": "incentive",
        },
    ),
    "sowing_incentives": SchemeTableConfig(
        scheme_type="sowing_incentive",
        fields=(
            "farmer_id",
            "farmer_code",
            "name",
            "district",
            "block",
            "village",
            "mobile",
            "millet_type",
            "area_ha",
            "type_of_sowing",
            "incentive",
            "transaction_date",
            "remarks",
        ),
        aliases={
            "millet": "millet_type",
            "crop": "millet_type",
            "typeofsowing": "type_of_sowing",
            "sowingtype": "type_of_sowing",
            "methodofsowing": "type_of_sowing",
            "area": "area_ha",
            "amount": "incentive",
        },
    ),
    "block_level_awards": SchemeTableConfig(
        scheme_type="block_award",
        fields=(
            "farmer_id",
            "farmer_code",
            "name",
            "district",
            "block",
            "village",
            "mobile",
            "millet_type",
            "production",
            "award",
            "transaction_date",
            "remarks",
        ),
        aliases={
            "millet": "millet_type",
            "productionquintal": "production",
            "productionqtl": "production",
            "awardamount": "award",
            "amount": "award",
        },
    ),
}

SCHEME_TYPE_TO_TABLE = {
    config.scheme_type: table_name
    for table_name, config in LEGACY_SCHEME_TABLES.items()
}


def normalize_key(value: Any) -> str:
    """Normalize client, Excel, and database labels for loose matching."""
    return "".join(
        character.lower()
        for character in str(value or "").strip()
        if character.isalnum()
    )


def is_blank(value: Any) -> bool:
    """Return true for None and whitespace-only strings."""
    return value is None or (isinstance(value, str) and not value.strip())


def clean_text(value: Any, max_length: Optional[int] = None) -> Optional[str]:
    """Normalize an optional text field."""
    if is_blank(value):
        return None
    cleaned = str(value).strip()
    if max_length is not None:
        cleaned = cleaned[:max_length]
    return cleaned


def _normalize_role(role_value: Any) -> str:
    """Normalize app role values without importing route modules."""
    if role_value is None:
        return "farmer"
    if hasattr(role_value, "value"):
        role_value = role_value.value
    role = str(role_value).split(".")[-1].lower()
    return {
        "district_officer": "district",
        "block_officer": "block",
    }.get(role, role)


def is_legacy_scheme_table(table_name: str) -> bool:
    """Return true when a table name is handled by the normalized scheme store."""
    return table_name in LEGACY_SCHEME_TABLES


def is_transaction_table_ready(db: Session) -> bool:
    """Check whether the normalized transaction table exists."""
    try:
        return TRANSACTION_TABLE in inspect(db.bind).get_table_names()
    except Exception:
        return False


def get_scheme_config_for_table(table_name: str) -> SchemeTableConfig:
    """Return the compatibility mapping for a legacy table name."""
    try:
        return LEGACY_SCHEME_TABLES[table_name]
    except KeyError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid farmer scheme section",
        ) from exc


def get_scheme_config_for_type(scheme_type: str) -> SchemeTableConfig:
    """Return a scheme mapping by normalized scheme type."""
    table_name = SCHEME_TYPE_TO_TABLE.get(scheme_type)
    if not table_name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported scheme_type: {scheme_type}",
        )
    return LEGACY_SCHEME_TABLES[table_name]


def get_virtual_column_aliases(table_name: str) -> dict[str, str]:
    """Return normalized upload aliases for a legacy scheme table."""
    config = get_scheme_config_for_table(table_name)
    aliases = {normalize_key(key): value for key, value in COMMON_ALIASES.items()}
    aliases.update({normalize_key(key): value for key, value in config.aliases.items()})
    aliases.update({normalize_key(column): column for column in config.fields})
    return aliases


def get_virtual_column_metadata(table_name: str) -> list[dict[str, Any]]:
    """Return reflected-style metadata for a legacy scheme table alias."""
    config = get_scheme_config_for_table(table_name)
    required_columns = {"district", "block"}
    metadata = []
    for column_name in config.fields:
        column_type = "TEXT"
        if column_name in NUMERIC_COLUMNS:
            column_type = "NUMERIC"
        elif column_name in INTEGER_COLUMNS:
            column_type = "INTEGER"
        elif column_name == "transaction_date":
            column_type = "DATE"

        metadata.append(
            {
                "name": column_name,
                "type": column_type,
                "nullable": column_name not in required_columns,
                "primary_key": False,
                "has_default": False,
                "insertable": True,
                "required": column_name in required_columns,
            }
        )
    return metadata


def get_virtual_output_columns(table_name: str) -> list[str]:
    """Return display columns for monitoring output."""
    config = get_scheme_config_for_table(table_name)
    columns = ["id"]
    for column_name in config.fields:
        if column_name not in columns:
            columns.append(column_name)
    for column_name in ("scheme_type", "created_at"):
        if column_name not in columns:
            columns.append(column_name)
    return columns


def _table_columns(db: Session, table_name: str) -> set[str]:
    """Read live column names for a table."""
    try:
        return {column["name"] for column in inspect(db.bind).get_columns(table_name)}
    except NoSuchTableError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Required table is missing: {table_name}",
        ) from exc


def _quote(db: Session, identifier: str) -> str:
    """Quote an already validated or introspected SQL identifier."""
    return db.bind.dialect.identifier_preparer.quote(identifier)


def _coalesce_expr(alias: str, columns: set[str], candidates: tuple[str, ...]) -> Optional[str]:
    """Build a NULL/blank-aware COALESCE expression for available columns."""
    available = [candidate for candidate in candidates if candidate in columns]
    if not available:
        return None
    expressions = [f"NULLIF({alias}.{candidate}, '')" for candidate in available]
    return f"COALESCE({', '.join(expressions)})"


def _farmer_id_expr(columns: set[str], alias: str = "f") -> str:
    """Return the best normalized farmer id expression for the live schema."""
    if "id" in columns:
        return f"{alias}.id"
    if "farmer_id" in columns:
        return f"{alias}.farmer_id"
    raise HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail="Farmers table must have id or farmer_id",
    )


def _parse_decimal(value: Any, field_name: str) -> Optional[Decimal]:
    """Parse an optional numeric cell."""
    if is_blank(value):
        return None
    try:
        return Decimal(str(value).strip())
    except (InvalidOperation, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} must be a number",
        ) from exc


def _parse_integer(value: Any, field_name: str) -> Optional[int]:
    """Parse an optional integer cell."""
    if is_blank(value):
        return None
    try:
        parsed = int(Decimal(str(value).strip()))
    except (InvalidOperation, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{field_name} must be an integer",
        ) from exc
    return parsed


def _parse_date(value: Any) -> Optional[date]:
    """Parse an optional date from API or Excel values."""
    if is_blank(value):
        return None
    if isinstance(value, datetime):
        return value.date()
    if isinstance(value, date):
        return value

    cleaned = str(value).strip()
    for fmt in ("%Y-%m-%d", "%d-%m-%Y", "%d/%m/%Y", "%m/%d/%Y"):
        try:
            return datetime.strptime(cleaned, fmt).date()
        except ValueError:
            continue

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="transaction_date must be a valid date",
    )


def _normalize_row_keys(
    row: dict[str, Any],
    table_name: Optional[str] = None,
) -> dict[str, Any]:
    """Normalize submitted keys into farmer and transaction columns."""
    aliases = {normalize_key(key): value for key, value in COMMON_ALIASES.items()}
    if table_name and table_name in LEGACY_SCHEME_TABLES:
        aliases.update(get_virtual_column_aliases(table_name))
    aliases.update({normalize_key(column): column for column in FARMER_COLUMNS})
    aliases.update({normalize_key(column): column for column in TRANSACTION_COLUMNS})
    aliases[normalize_key("scheme_type")] = "scheme_type"

    normalized: dict[str, Any] = {}
    for raw_key, value in (row or {}).items():
        matched_key = aliases.get(normalize_key(raw_key))
        if matched_key and not is_blank(value):
            normalized[matched_key] = value
    return normalized


def _apply_scope_defaults(
    row: dict[str, Any],
    current_user: Optional[dict],
    district: Optional[str],
    block: Optional[str],
) -> dict[str, Any]:
    """Resolve district and block from officer scope or admin filters."""
    scoped = dict(row)
    selected_district = clean_text(district)
    selected_block = clean_text(block)
    role = _normalize_role((current_user or {}).get("role"))

    if role == "block":
        scoped["district"] = (current_user or {}).get("district")
        scoped["block"] = (current_user or {}).get("block")
    elif role == "district":
        scoped["district"] = (current_user or {}).get("district")
        if selected_block:
            scoped["block"] = selected_block
    else:
        if selected_district:
            scoped["district"] = selected_district
        if selected_block:
            scoped["block"] = selected_block

    return scoped


def _prepare_row(
    row: dict[str, Any],
    scheme_type: str,
    current_user: Optional[dict],
    district: Optional[str],
    block: Optional[str],
    table_name: Optional[str] = None,
) -> tuple[dict[str, Any], dict[str, Any]]:
    """Validate and split one submitted row into farmer and transaction data."""
    if scheme_type not in SCHEME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported scheme_type: {scheme_type}",
        )

    normalized = _apply_scope_defaults(
        _normalize_row_keys(row, table_name),
        current_user,
        district,
        block,
    )

    farmer_data = {
        "farmer_id": clean_text(normalized.get("farmer_id")),
        "farmer_code": clean_text(normalized.get("farmer_code"), 120),
        "name": clean_text(normalized.get("name"), 200),
        "district": clean_text(normalized.get("district"), 120),
        "block": clean_text(normalized.get("block"), 120),
        "village": clean_text(normalized.get("village"), 160),
        "mobile": clean_text(normalized.get("mobile"), 20),
    }

    if not farmer_data["farmer_id"] and not farmer_data["farmer_code"] and not farmer_data["name"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Each row must include farmer_id, farmer_code, or name",
        )

    if not farmer_data["farmer_id"] and not farmer_data["farmer_code"]:
        if not farmer_data["district"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="District is required when creating a farmer",
            )
        if not farmer_data["block"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Block is required when creating a farmer",
            )

    transaction_data = {"scheme_type": scheme_type}
    for column in TRANSACTION_COLUMNS:
        value = normalized.get(column)
        if column in NUMERIC_COLUMNS:
            parsed = _parse_decimal(value, column)
        elif column in INTEGER_COLUMNS:
            parsed = _parse_integer(value, column)
        elif column == "transaction_date":
            parsed = _parse_date(value)
        else:
            parsed = clean_text(value, 500 if column == "remarks" else 160)
        if parsed is not None:
            transaction_data[column] = parsed

    return farmer_data, transaction_data


def _select_existing_farmer(db: Session, farmer_data: dict[str, Any]) -> Optional[int]:
    """Find an existing farmer by id/code/mobile/name+location."""
    columns = _table_columns(db, FARMER_TABLE)
    id_expr = _farmer_id_expr(columns)

    farmer_id_value = clean_text(farmer_data.get("farmer_id"))
    if farmer_id_value:
        if not farmer_id_value.isdigit():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="farmer_id must be numeric",
            )
        conditions = []
        if "id" in columns:
            conditions.append("f.id = :farmer_id")
        if "farmer_id" in columns:
            conditions.append("f.farmer_id = :farmer_id")
        if conditions:
            found = db.execute(
                text(f"SELECT {id_expr} AS id FROM farmers f WHERE {' OR '.join(conditions)} LIMIT 1"),
                {"farmer_id": int(farmer_id_value)},
            ).mappings().first()
            if found:
                return int(found["id"])

    farmer_code = clean_text(farmer_data.get("farmer_code"))
    if farmer_code and "farmer_code" in columns:
        found = db.execute(
            text("SELECT {id_expr} AS id FROM farmers f WHERE farmer_code = :farmer_code LIMIT 1".format(id_expr=id_expr)),
            {"farmer_code": farmer_code},
        ).mappings().first()
        if found:
            return int(found["id"])

    mobile = clean_text(farmer_data.get("mobile"))
    if mobile and "mobile" in columns:
        found = db.execute(
            text("SELECT {id_expr} AS id FROM farmers f WHERE mobile = :mobile LIMIT 1".format(id_expr=id_expr)),
            {"mobile": mobile},
        ).mappings().first()
        if found:
            return int(found["id"])

    name = clean_text(farmer_data.get("name"))
    district = clean_text(farmer_data.get("district"))
    block = clean_text(farmer_data.get("block"))
    district_expr = _coalesce_expr("f", columns, ("district", "district_name"))
    block_expr = _coalesce_expr("f", columns, ("block", "block_name"))
    if name and district and block and district_expr and block_expr:
        found = db.execute(
            text(
                f"""
                SELECT {id_expr} AS id
                FROM farmers f
                WHERE f.name = :name
                  AND {district_expr} = :district
                  AND {block_expr} = :block
                LIMIT 1
                """
            ),
            {"name": name, "district": district, "block": block},
        ).mappings().first()
        if found:
            return int(found["id"])

    return None


def _update_farmer_if_missing(db: Session, farmer_id: int, farmer_data: dict[str, Any]) -> None:
    """Fill missing normalized farmer fields without overwriting existing data."""
    columns = _table_columns(db, FARMER_TABLE)
    assignments = []
    params: dict[str, Any] = {"id": farmer_id}

    update_map = {
        "farmer_id": farmer_id,
        "farmer_code": farmer_data.get("farmer_code"),
        "district": farmer_data.get("district"),
        "block": farmer_data.get("block"),
        "village": farmer_data.get("village"),
        "mobile": farmer_data.get("mobile"),
        "district_name": farmer_data.get("district"),
        "block_name": farmer_data.get("block"),
    }

    for column, value in update_map.items():
        if column in columns and not is_blank(value):
            assignments.append(f"{_quote(db, column)} = COALESCE({_quote(db, column)}, :{column})")
            params[column] = value

    if not assignments:
        return

    id_column = "id" if "id" in columns else "farmer_id"
    db.execute(
        text(
            f"""
            UPDATE farmers
            SET {', '.join(assignments)}
            WHERE {_quote(db, id_column)} = :id
            """
        ),
        params,
    )


def upsert_farmer(db: Session, farmer_data: dict[str, Any]) -> int:
    """Find or create a normalized farmer master row."""
    existing_id = _select_existing_farmer(db, farmer_data)
    if existing_id is not None:
        _update_farmer_if_missing(db, existing_id, farmer_data)
        return existing_id

    name = clean_text(farmer_data.get("name"), 200)
    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Farmer name is required when farmer_id or farmer_code is not found",
        )

    columns = _table_columns(db, FARMER_TABLE)
    insert_values: dict[str, Any] = {"name": name}

    optional_values = {
        "farmer_code": clean_text(farmer_data.get("farmer_code"), 120),
        "district": clean_text(farmer_data.get("district"), 120),
        "block": clean_text(farmer_data.get("block"), 120),
        "district_name": clean_text(farmer_data.get("district"), 120),
        "block_name": clean_text(farmer_data.get("block"), 120),
        "village": clean_text(farmer_data.get("village"), 160),
        "mobile": clean_text(farmer_data.get("mobile"), 20),
        "consent_accepted": False,
    }
    for column, value in optional_values.items():
        if column in columns and value is not None:
            insert_values[column] = value

    insert_columns = [column for column in insert_values if column in columns]
    if "name" not in insert_columns:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Farmers table must have a name column",
        )

    quoted_columns = ", ".join(_quote(db, column) for column in insert_columns)
    placeholders = ", ".join(f":{column}" for column in insert_columns)
    id_expr = _farmer_id_expr(columns)

    try:
        inserted = db.execute(
            text(
                f"""
                INSERT INTO farmers ({quoted_columns})
                VALUES ({placeholders})
                RETURNING {id_expr.replace('f.', '')} AS id
                """
            ),
            {column: insert_values[column] for column in insert_columns},
        ).mappings().first()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unable to create farmer master row",
        ) from exc

    if not inserted:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to resolve farmer master row",
        )
    new_farmer_id = int(inserted["id"])
    _update_farmer_if_missing(
        db,
        new_farmer_id,
        {
            **farmer_data,
            "farmer_code": farmer_data.get("farmer_code") or f"FARMER-{new_farmer_id}",
        },
    )
    return new_farmer_id


def _insert_transaction(
    db: Session,
    farmer_id: int,
    transaction_data: dict[str, Any],
    source_table: Optional[str] = None,
    source_record_key: Optional[str] = None,
) -> dict[str, Any]:
    """Insert one normalized transaction and return the inserted row."""
    table_columns = _table_columns(db, TRANSACTION_TABLE)
    insert_values = {
        "farmer_id": farmer_id,
        **transaction_data,
    }
    if source_table and "source_table" in table_columns:
        insert_values["source_table"] = source_table
    if source_record_key and "source_record_key" in table_columns:
        insert_values["source_record_key"] = source_record_key

    insert_columns = [
        column
        for column in ("farmer_id", "scheme_type", *TRANSACTION_COLUMNS, "source_table", "source_record_key")
        if column in table_columns and column in insert_values
    ]
    quoted_columns = ", ".join(_quote(db, column) for column in insert_columns)
    placeholders = ", ".join(f":{column}" for column in insert_columns)

    result = db.execute(
        text(
            f"""
            INSERT INTO {TRANSACTION_TABLE} ({quoted_columns})
            VALUES ({placeholders})
            RETURNING *
            """
        ),
        {column: insert_values[column] for column in insert_columns},
    ).mappings().first()
    return dict(result or insert_values)


def insert_transaction_rows(
    db: Session,
    rows: list[dict[str, Any]],
    *,
    table_name: Optional[str] = None,
    scheme_type: Optional[str] = None,
    current_user: Optional[dict] = None,
    district: Optional[str] = None,
    block: Optional[str] = None,
) -> list[dict[str, Any]]:
    """Insert multiple farmer scheme transaction rows."""
    if not is_transaction_table_ready(db):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="farmer_scheme_transactions table is not available",
        )

    if table_name:
        config = get_scheme_config_for_table(table_name)
        resolved_scheme_type = config.scheme_type
    else:
        resolved_scheme_type = scheme_type

    if not rows:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="At least one row is required",
        )

    inserted_rows = []
    for row in rows:
        row_scheme_type = clean_text(row.get("scheme_type")) if not resolved_scheme_type else resolved_scheme_type
        if not row_scheme_type:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="scheme_type is required",
            )

        source_table = table_name
        farmer_data, transaction_data = _prepare_row(
            row,
            row_scheme_type,
            current_user,
            district,
            block,
            table_name=table_name,
        )
        farmer_id = upsert_farmer(db, farmer_data)
        inserted_rows.append(
            _insert_transaction(
                db,
                farmer_id,
                transaction_data,
                source_table=source_table,
                source_record_key=clean_text(row.get("source_record_key")),
            )
        )

    return inserted_rows


def _select_column_expression(column_name: str, farmer_columns: set[str]) -> str:
    """Return SELECT expression for one monitoring column."""
    if column_name == "farmer_id":
        return "t.farmer_id AS farmer_id"
    if column_name == "farmer_code":
        return "f.farmer_code AS farmer_code" if "farmer_code" in farmer_columns else "NULL AS farmer_code"
    if column_name == "name":
        return "f.name AS name" if "name" in farmer_columns else "NULL AS name"
    if column_name == "district":
        district_expr = _coalesce_expr("f", farmer_columns, ("district", "district_name"))
        return f"{district_expr} AS district" if district_expr else "NULL AS district"
    if column_name == "block":
        block_expr = _coalesce_expr("f", farmer_columns, ("block", "block_name"))
        return f"{block_expr} AS block" if block_expr else "NULL AS block"
    if column_name == "village":
        return "f.village AS village" if "village" in farmer_columns else "NULL AS village"
    if column_name == "mobile":
        return "f.mobile AS mobile" if "mobile" in farmer_columns else "NULL AS mobile"
    return f"t.{column_name} AS {column_name}"


def _transaction_filter_sql(
    table_name: str,
    farmer_columns: set[str],
    district: Optional[str],
    block: Optional[str],
) -> tuple[str, dict[str, Any]]:
    """Build WHERE SQL for legacy table monitoring queries."""
    config = get_scheme_config_for_table(table_name)
    conditions = ["t.scheme_type = :scheme_type"]
    params: dict[str, Any] = {"scheme_type": config.scheme_type}

    if district:
        district_expr = _coalesce_expr("f", farmer_columns, ("district", "district_name"))
        if not district_expr:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Farmers table does not have a district column",
            )
        conditions.append(f"{district_expr} = :district")
        params["district"] = district

    if block:
        block_expr = _coalesce_expr("f", farmer_columns, ("block", "block_name"))
        if not block_expr:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Farmers table does not have a block column",
            )
        conditions.append(f"{block_expr} = :block")
        params["block"] = block

    return f"WHERE {' AND '.join(conditions)}", params


def count_transactions(
    db: Session,
    table_name: str,
    district: Optional[str],
    block: Optional[str],
) -> int:
    """Count normalized transactions for a legacy scheme table alias."""
    if not is_transaction_table_ready(db):
        return 0

    farmer_columns = _table_columns(db, FARMER_TABLE)
    where_clause, params = _transaction_filter_sql(table_name, farmer_columns, district, block)
    join_column = "id" if "id" in farmer_columns else "farmer_id"

    result = db.execute(
        text(
            f"""
            SELECT COUNT(*) AS row_count
            FROM {TRANSACTION_TABLE} t
            LEFT JOIN farmers f ON f.{join_column} = t.farmer_id
            {where_clause}
            """
        ),
        params,
    )
    return int(result.scalar() or 0)


def list_transactions(
    db: Session,
    table_name: str,
    district: Optional[str],
    block: Optional[str],
    *,
    limit: int,
    offset: int,
) -> list[dict[str, Any]]:
    """Return normalized transactions for monitoring pages."""
    if not is_transaction_table_ready(db):
        return []

    farmer_columns = _table_columns(db, FARMER_TABLE)
    output_columns = get_virtual_output_columns(table_name)
    select_columns = [
        _select_column_expression(column_name, farmer_columns)
        for column_name in output_columns
    ]
    where_clause, params = _transaction_filter_sql(table_name, farmer_columns, district, block)
    join_column = "id" if "id" in farmer_columns else "farmer_id"
    query_params = params | {"limit": limit, "offset": offset}

    rows = db.execute(
        text(
            f"""
            SELECT {', '.join(select_columns)}
            FROM {TRANSACTION_TABLE} t
            LEFT JOIN farmers f ON f.{join_column} = t.farmer_id
            {where_clause}
            ORDER BY t.id ASC
            LIMIT :limit OFFSET :offset
            """
        ),
        query_params,
    ).mappings().all()
    return [dict(row) for row in rows]


def scheme_summary(
    db: Session,
    *,
    district: Optional[str] = None,
    block: Optional[str] = None,
) -> list[dict[str, Any]]:
    """Return scheme-wise aggregate metrics for dashboards."""
    if not is_transaction_table_ready(db):
        return []

    farmer_columns = _table_columns(db, FARMER_TABLE)
    district_expr = _coalesce_expr("f", farmer_columns, ("district", "district_name")) or "NULL"
    block_expr = _coalesce_expr("f", farmer_columns, ("block", "block_name")) or "NULL"
    join_column = "id" if "id" in farmer_columns else "farmer_id"

    conditions = []
    params: dict[str, Any] = {}
    if district and district_expr != "NULL":
        conditions.append(f"{district_expr} = :district")
        params["district"] = district
    if block and block_expr != "NULL":
        conditions.append(f"{block_expr} = :block")
        params["block"] = block
    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    rows = db.execute(
        text(
            f"""
            SELECT
                {district_expr} AS district,
                {block_expr} AS block,
                t.scheme_type,
                COUNT(*) AS transaction_count,
                COUNT(DISTINCT t.farmer_id) AS beneficiary_count,
                COALESCE(SUM(t.incentive), 0) AS total_incentive,
                COALESCE(SUM(t.award), 0) AS total_award,
                COALESCE(SUM(t.quantity), 0) AS total_quantity,
                COALESCE(SUM(t.area_ha), 0) AS total_area_ha,
                COALESCE(SUM(t.production), 0) AS total_production
            FROM {TRANSACTION_TABLE} t
            LEFT JOIN farmers f ON f.{join_column} = t.farmer_id
            {where_clause}
            GROUP BY {district_expr}, {block_expr}, t.scheme_type
            ORDER BY {district_expr} NULLS LAST, {block_expr} NULLS LAST, t.scheme_type
            """
        ),
        params,
    ).mappings().all()
    return [dict(row) for row in rows]


def scheme_kpis(db: Session) -> dict[str, Any]:
    """Return state-level scheme transaction KPIs."""
    if not is_transaction_table_ready(db):
        return {
            "beneficiary_count": 0,
            "scheme_transaction_count": 0,
            "total_incentives": Decimal("0"),
        }

    row = db.execute(
        text(
            f"""
            SELECT
                COUNT(DISTINCT farmer_id) AS beneficiary_count,
                COUNT(*) AS scheme_transaction_count,
                COALESCE(SUM(incentive), 0) + COALESCE(SUM(award), 0) AS total_incentives
            FROM {TRANSACTION_TABLE}
            """
        )
    ).mappings().first()

    return dict(row or {})

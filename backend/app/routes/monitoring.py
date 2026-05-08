"""
Read-only district/block monitoring endpoints for scheme tables.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.encoders import jsonable_encoder
from sqlalchemy import inspect, text
from sqlalchemy.exc import NoSuchTableError, SQLAlchemyError
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.scheme_transactions import (
    count_transactions,
    get_virtual_output_columns,
    is_legacy_scheme_table,
    list_transactions,
)
from .auth import require_role
from .auth_roles import normalize_role

router = APIRouter(prefix="/monitoring", tags=["Monitoring"])

ALLOWED_MONITORING_TABLES = (
    "millet_cultivation_inputs",
    "sowing_incentives",
    "bukhari_storage",
    "millet_transportation_expenditure",
    "millet_intake_shg_incentives",
    "block_level_awards",
    "pmu_capacity_building",
    "administrative_expenses",
)

DISTRICT_COLUMN_CANDIDATES = ("district", "district_name")
BLOCK_COLUMN_CANDIDATES = ("block", "block_name")
PAGE_SIZE = 1000


def _validate_level(level: str) -> str:
    """Ensure the requested monitoring level is supported."""
    normalized_level = (level or "").strip().lower()
    if normalized_level not in {"district", "block"}:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid monitoring level",
        )
    return normalized_level


def _validate_table_name(table_name: str) -> str:
    """Allow dynamic table access only for approved scheme tables."""
    if table_name not in ALLOWED_MONITORING_TABLES:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Invalid section",
        )
    return table_name


def _clean_filter_value(value: Optional[str]) -> Optional[str]:
    """Normalize query-string filter values."""
    if value is None:
        return None
    cleaned = value.strip()
    return cleaned or None


def _resolve_scope(
    level: str,
    current_user,
    district: Optional[str],
    block: Optional[str],
) -> tuple[str, Optional[str]]:
    """Resolve geographic filters from role scope and optional admin filters."""
    current_role = normalize_role(current_user.get("role"))
    selected_district = _clean_filter_value(district)
    selected_block = _clean_filter_value(block)

    if current_role == "admin":
        if not selected_district:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="District is required for monitoring",
            )
        if level == "block" and not selected_block:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Block is required for block monitoring",
            )
        return selected_district, selected_block if level == "block" else None

    if level == "district" and current_role == "district":
        return current_user["district"], None

    if level == "block" and current_role == "block":
        return current_user["district"], current_user["block"]

    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Not authorized for this monitoring scope",
    )


def _get_table_columns(db: Session, table_name: str) -> list[str]:
    """Read column names in database order for one scheme table."""
    try:
        inspector = inspect(db.bind)
        return [column["name"] for column in inspector.get_columns(table_name)]
    except NoSuchTableError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Monitoring table not found: {table_name}",
        ) from exc


def _quote_identifier(db: Session, identifier: str) -> str:
    """Quote an identifier that has already been validated or introspected."""
    return db.bind.dialect.identifier_preparer.quote(identifier)


def _find_column(columns: list[str], candidates: tuple[str, ...]) -> Optional[str]:
    """Find a filter column by case-insensitive candidate names."""
    by_lower = {column.lower(): column for column in columns}
    for candidate in candidates:
        found = by_lower.get(candidate.lower())
        if found:
            return found
    return None


def _build_where_clause(
    db: Session,
    table_name: str,
    columns: list[str],
    district: str,
    block: Optional[str],
) -> tuple[str, dict]:
    """Build parameterized district/block filtering for an introspected table."""
    district_column = _find_column(columns, DISTRICT_COLUMN_CANDIDATES)
    if not district_column:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"{table_name} does not have a district column",
        )

    conditions = [f"{_quote_identifier(db, district_column)} = :district"]
    params = {"district": district}

    if block:
        block_column = _find_column(columns, BLOCK_COLUMN_CANDIDATES)
        if not block_column:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"{table_name} does not have a block column",
            )
        conditions.append(f"{_quote_identifier(db, block_column)} = :block")
        params["block"] = block

    return f" WHERE {' AND '.join(conditions)}", params


def _build_order_clause(db: Session, table_name: str, columns: list[str]) -> str:
    """Choose a stable order from primary key metadata, id, or first column."""
    if not columns:
        return ""

    inspector = inspect(db.bind)
    primary_key = inspector.get_pk_constraint(table_name).get("constrained_columns") or []
    order_columns = [column for column in primary_key if column in columns]
    if not order_columns:
        id_column = _find_column(columns, ("id",))
        order_columns = [id_column] if id_column else [columns[0]]

    quoted_columns = ", ".join(_quote_identifier(db, column) for column in order_columns)
    return f" ORDER BY {quoted_columns} ASC"


def _count_rows(
    db: Session,
    table_name: str,
    columns: list[str],
    district: str,
    block: Optional[str],
) -> int:
    """Count visible rows in one validated scheme table."""
    table_identifier = _quote_identifier(db, table_name)
    where_clause, params = _build_where_clause(db, table_name, columns, district, block)
    result = db.execute(
        text(f"SELECT COUNT(*) AS row_count FROM {table_identifier}{where_clause}"),
        params,
    )
    return int(result.scalar() or 0)


@router.get("/{level}/sections")
def get_monitoring_sections(
    level: str,
    district: Optional[str] = Query(default=None),
    block: Optional[str] = Query(default=None),
    current_user=Depends(require_role("admin", "district", "block")),
    db: Session = Depends(get_db),
):
    """
    Return row counts for all approved scheme tables in the selected scope.
    """
    normalized_level = _validate_level(level)
    selected_district, selected_block = _resolve_scope(
        normalized_level,
        current_user,
        district,
        block,
    )

    sections = []
    for table_name in ALLOWED_MONITORING_TABLES:
        if is_legacy_scheme_table(table_name):
            sections.append(
                {
                    "table_name": table_name,
                    "count": count_transactions(db, table_name, selected_district, selected_block),
                }
            )
            continue

        columns = _get_table_columns(db, table_name)
        sections.append(
            {
                "table_name": table_name,
                "count": _count_rows(db, table_name, columns, selected_district, selected_block),
            }
        )

    return {
        "level": normalized_level,
        "district": selected_district,
        "block": selected_block,
        "sections": sections,
    }


@router.get("/{level}/{table_name}")
def get_monitoring_table_rows(
    level: str,
    table_name: str,
    district: Optional[str] = Query(default=None),
    block: Optional[str] = Query(default=None),
    from_index: int = Query(default=0, ge=0, alias="from"),
    to_index: int = Query(default=PAGE_SIZE - 1, ge=0, alias="to"),
    current_user=Depends(require_role("admin", "district", "block")),
    db: Session = Depends(get_db),
):
    """
    Return paginated rows from one approved scheme table.
    """
    normalized_level = _validate_level(level)
    validated_table_name = _validate_table_name(table_name)
    selected_district, selected_block = _resolve_scope(
        normalized_level,
        current_user,
        district,
        block,
    )

    if to_index < from_index:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid pagination range",
        )

    limit = to_index - from_index + 1
    if limit != PAGE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Monitoring pages must request exactly {PAGE_SIZE} rows",
        )

    if is_legacy_scheme_table(validated_table_name):
        try:
            total_count = count_transactions(
                db,
                validated_table_name,
                selected_district,
                selected_block,
            )
            rows = list_transactions(
                db,
                validated_table_name,
                selected_district,
                selected_block,
                limit=limit,
                offset=from_index,
            )
        except SQLAlchemyError as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to fetch monitoring data",
            ) from exc

        return jsonable_encoder(
            {
                "level": normalized_level,
                "table_name": validated_table_name,
                "district": selected_district,
                "block": selected_block,
                "columns": get_virtual_output_columns(validated_table_name),
                "rows": rows,
                "total_count": total_count,
                "from": from_index,
                "to": to_index,
                "page_size": PAGE_SIZE,
                "has_next": to_index + 1 < total_count,
            }
        )

    columns = _get_table_columns(db, validated_table_name)
    table_identifier = _quote_identifier(db, validated_table_name)
    where_clause, params = _build_where_clause(
        db,
        validated_table_name,
        columns,
        selected_district,
        selected_block,
    )
    order_clause = _build_order_clause(db, validated_table_name, columns)
    query_params = params | {"limit": limit, "offset": from_index}

    try:
        total_count = _count_rows(
            db,
            validated_table_name,
            columns,
            selected_district,
            selected_block,
        )
        result = db.execute(
            text(
                f"""
                SELECT *
                FROM {table_identifier}
                {where_clause}
                {order_clause}
                LIMIT :limit OFFSET :offset
                """
            ),
            query_params,
        )
    except SQLAlchemyError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to fetch monitoring data",
        ) from exc

    rows = [dict(row) for row in result.mappings().all()]

    return jsonable_encoder(
        {
            "level": normalized_level,
            "table_name": validated_table_name,
            "district": selected_district,
            "block": selected_block,
            "columns": columns,
            "rows": rows,
            "total_count": total_count,
            "from": from_index,
            "to": to_index,
            "page_size": PAGE_SIZE,
            "has_next": to_index + 1 < total_count,
        }
    )

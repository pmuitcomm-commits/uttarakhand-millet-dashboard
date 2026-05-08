"""Standardized Excel import/export endpoints."""

from io import BytesIO
from typing import Any

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from fastapi.encoders import jsonable_encoder
from fastapi.responses import StreamingResponse
from sqlalchemy import MetaData, Table
from sqlalchemy.exc import NoSuchTableError, SQLAlchemyError
from sqlalchemy.orm import Session

from ..database import get_db
from ..services.excel_templates import (
    TEMPLATES,
    build_template_workbook,
    get_template,
    parse_workbook_rows,
)
from ..services.scheme_transactions import insert_transaction_rows, upsert_farmer
from .auth import require_role

router = APIRouter(prefix="/excel", tags=["Excel Import Export"])

MAX_STANDARD_UPLOAD_BYTES = 10 * 1024 * 1024


def _template_response(template_key: str) -> StreamingResponse:
    """Build a streaming response for a template workbook."""
    template = get_template(template_key)
    workbook_bytes = build_template_workbook(template)
    return StreamingResponse(
        BytesIO(workbook_bytes),
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{template.filename}"'},
    )


@router.get("/templates")
def list_excel_templates():
    """Return available standardized upload templates."""
    return {
        "templates": [
            {
                "key": template.key,
                "filename": template.filename,
                "columns": list(template.columns),
                "required_columns": list(template.required_columns),
            }
            for template in TEMPLATES.values()
        ]
    }


@router.get("/templates/{template_key}")
def download_excel_template(
    template_key: str,
    current_user=Depends(require_role("admin", "district", "block")),
):
    """Download one standardized Excel upload template."""
    return _template_response(template_key)


def _validate_required_rows(rows: list[dict[str, Any]], required_columns: tuple[str, ...]) -> None:
    """Ensure required columns are present in each row."""
    errors = []
    for row_index, row in enumerate(rows, start=2):
        missing = [
            column
            for column in required_columns
            if row.get(column) is None or (isinstance(row.get(column), str) and not row.get(column).strip())
        ]
        if missing:
            errors.append(f"Row {row_index}: missing {', '.join(missing)}")
    if errors:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="; ".join(errors[:5]),
        )


def _reflect_table(db: Session, table_name: str) -> Table:
    """Reflect one upload target table."""
    try:
        metadata = MetaData()
        return Table(table_name, metadata, autoload_with=db.bind)
    except NoSuchTableError as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Upload target table is missing: {table_name}",
        ) from exc


def _insert_reflected_rows(db: Session, table_name: str, rows: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Insert rows into a reflected table using only live insertable columns."""
    table = _reflect_table(db, table_name)
    live_columns = {
        column.name
        for column in table.columns
        if not column.primary_key and not column.computed
    }
    inserted_rows = []
    for row in rows:
        insert_row = {
            key: value
            for key, value in row.items()
            if key in live_columns and value is not None
        }
        if not insert_row:
            continue
        result = db.execute(table.insert().values(insert_row).returning(*table.columns))
        inserted = result.mappings().first()
        inserted_rows.append(dict(inserted) if inserted else insert_row)
    return inserted_rows


@router.post("/uploads/{template_key}")
async def upload_standard_excel(
    template_key: str,
    file: UploadFile = File(...),
    current_user=Depends(require_role("admin", "district", "block")),
    db: Session = Depends(get_db),
):
    """Upload a standardized Excel workbook into its normalized target table."""
    template = get_template(template_key)
    file_bytes = await file.read()
    if not file_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Excel file is empty",
        )
    if len(file_bytes) > MAX_STANDARD_UPLOAD_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Excel file is too large",
        )

    rows = parse_workbook_rows(file_bytes, file.filename or "", template.columns)
    _validate_required_rows(rows, template.required_columns)

    try:
        if template_key == "farmers_upload":
            inserted_rows = [{"id": upsert_farmer(db, row)} for row in rows]
        elif template_key == "farmer_scheme_transactions_upload":
            inserted_rows = insert_transaction_rows(
                db,
                rows,
                current_user=current_user,
            )
        elif template_key == "millet_production_upload":
            inserted_rows = _insert_reflected_rows(db, "millet_production", rows)
        elif template_key == "storage_processing_upload":
            inserted_rows = _insert_reflected_rows(db, "storage_processing", rows)
        else:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Unknown Excel template",
            )

        db.commit()
    except HTTPException:
        db.rollback()
        raise
    except SQLAlchemyError as exc:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to import Excel data",
        ) from exc

    return jsonable_encoder(
        {
            "template": template_key,
            "inserted_count": len(inserted_rows),
            "rows": inserted_rows,
        }
    )


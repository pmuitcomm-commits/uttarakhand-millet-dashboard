"""Activity log writer for existing database-managed audit rows."""

from __future__ import annotations

import json
import logging
from datetime import datetime, timezone
from typing import Any, Mapping, Optional

from fastapi import Request
from sqlalchemy import MetaData, Table
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.exc import NoSuchTableError, SQLAlchemyError
from sqlalchemy.sql.sqltypes import DateTime as DateTimeType
from sqlalchemy.sql.sqltypes import Integer as IntegerType
from sqlalchemy.sql.sqltypes import JSON as JSONType

from ..database import SessionLocal

logger = logging.getLogger(__name__)

ACTION_LOGIN = "LOGIN"
ACTION_EXCEL_UPLOAD = "EXCEL_UPLOAD"
STATUS_SUCCESS = "SUCCESS"
STATUS_FAILURE = "FAILURE"

_ACTIVITY_LOG_TABLE = "activity_logs"

_COLUMN_ALIASES: dict[str, tuple[str, ...]] = {
    "action_type": ("action_type", "action", "event_type", "activity_type"),
    "user_id": ("user_id", "actor_id", "created_by"),
    "username": ("username", "user_name", "actor_name", "full_name"),
    "user_email": ("user_email", "actor_email", "email"),
    "status": ("status", "result", "outcome"),
    "module": ("module", "entity_type", "resource_type"),
    "file_name": ("file_name", "filename"),
    "error_message": ("error_message", "error"),
    "ip_address": ("ip_address", "ip", "remote_addr"),
    "device_info": ("device_info", "user_agent", "device"),
    "details": ("details", "metadata", "meta", "extra_data", "data", "description"),
    "created_at": ("created_at", "timestamp", "logged_at", "activity_time"),
}


def _mapping_get(mapping: Optional[Mapping[str, Any]], key: str) -> Any:
    if not mapping:
        return None
    return mapping.get(key)


def _truncate(value: Any, max_length: int = 1000) -> Optional[str]:
    if value is None:
        return None
    text_value = str(value)
    if len(text_value) <= max_length:
        return text_value
    return text_value[: max_length - 3] + "..."


def _request_ip(request: Optional[Request]) -> Optional[str]:
    if request is None or request.client is None:
        return None
    return request.client.host


def _request_device(request: Optional[Request]) -> Optional[str]:
    if request is None:
        return None
    return _truncate(request.headers.get("user-agent"), 512)


def _find_columns(table: Table, logical_name: str):
    columns_by_name = {column.name.lower(): column for column in table.columns}
    for candidate in _COLUMN_ALIASES[logical_name]:
        column = columns_by_name.get(candidate.lower())
        if column is not None:
            yield column


def _is_json_column(column) -> bool:
    return isinstance(column.type, (JSONType, JSONB))


def _coerce_for_column(column, value: Any) -> Any:
    if value is None:
        return None
    if _is_json_column(column):
        return value
    if isinstance(column.type, DateTimeType):
        return value if isinstance(value, datetime) else datetime.now(timezone.utc)
    if isinstance(column.type, IntegerType):
        try:
            return int(value)
        except (TypeError, ValueError):
            return None
    if isinstance(value, (dict, list, tuple)):
        value = json.dumps(value, default=str)

    max_length = getattr(column.type, "length", None)
    return _truncate(value, max_length or 1000)


def _put_value(table: Table, values: dict[str, Any], logical_name: str, value: Any) -> None:
    for column in _find_columns(table, logical_name):
        if column.name in values:
            continue
        coerced = _coerce_for_column(column, value)
        if coerced is not None:
            values[column.name] = coerced


def _user_display_name(user: Optional[Mapping[str, Any]]) -> Optional[str]:
    return (
        _mapping_get(user, "full_name")
        or _mapping_get(user, "username")
        or _mapping_get(user, "email")
    )


def _activity_details(
    *,
    action_type: str,
    status: str,
    current_user: Optional[Mapping[str, Any]],
    module: Optional[str],
    file_name: Optional[str],
    error_message: Optional[str],
    ip_address: Optional[str],
    device_info: Optional[str],
    extra_details: Optional[dict[str, Any]],
) -> dict[str, Any]:
    details = {
        "action_type": action_type,
        "status": status,
        "module": module,
        "file_name": file_name,
        "error_message": error_message,
        "ip_address": ip_address,
        "device_info": device_info,
        "user": {
            "id": _mapping_get(current_user, "id"),
            "username": _mapping_get(current_user, "username"),
            "email": _mapping_get(current_user, "email"),
            "full_name": _mapping_get(current_user, "full_name"),
            "role": _mapping_get(current_user, "role"),
            "district": _mapping_get(current_user, "district"),
            "block": _mapping_get(current_user, "block"),
        },
    }
    if extra_details:
        details.update(extra_details)
    return {key: value for key, value in details.items() if value is not None}


def _reflect_activity_table(session) -> Optional[Table]:
    try:
        metadata = MetaData()
        return Table(_ACTIVITY_LOG_TABLE, metadata, autoload_with=session.bind)
    except NoSuchTableError:
        logger.warning("%s table is not available; activity was not logged", _ACTIVITY_LOG_TABLE)
    except SQLAlchemyError:
        logger.exception("Unable to inspect %s table for activity logging", _ACTIVITY_LOG_TABLE)
    return None


def log_activity(
    *,
    action_type: str,
    current_user: Optional[Mapping[str, Any]] = None,
    status: str = STATUS_SUCCESS,
    request: Optional[Request] = None,
    module: Optional[str] = None,
    file_name: Optional[str] = None,
    error_message: Optional[str] = None,
    details: Optional[dict[str, Any]] = None,
) -> None:
    """Insert one audit row into the existing activity_logs table.

    Logging is intentionally best-effort so audit writes do not change login or
    upload behavior when an older database has a different activity_logs shape.
    """
    session = SessionLocal()
    try:
        table = _reflect_activity_table(session)
        if table is None:
            return

        ip_address = _request_ip(request)
        device_info = _request_device(request)
        created_at = datetime.now(timezone.utc)
        detail_payload = _activity_details(
            action_type=action_type,
            status=status,
            current_user=current_user,
            module=module,
            file_name=file_name,
            error_message=error_message,
            ip_address=ip_address,
            device_info=device_info,
            extra_details=details,
        )

        values: dict[str, Any] = {}
        _put_value(table, values, "action_type", action_type)
        _put_value(table, values, "user_id", _mapping_get(current_user, "id"))
        _put_value(table, values, "username", _user_display_name(current_user))
        _put_value(table, values, "user_email", _mapping_get(current_user, "email"))
        _put_value(table, values, "status", status)
        _put_value(table, values, "module", module)
        _put_value(table, values, "file_name", file_name)
        _put_value(table, values, "error_message", error_message)
        _put_value(table, values, "ip_address", ip_address)
        _put_value(table, values, "device_info", device_info)
        _put_value(table, values, "details", detail_payload)
        _put_value(table, values, "created_at", created_at)

        if not values:
            logger.warning("%s has no recognized columns; activity was not logged", _ACTIVITY_LOG_TABLE)
            return

        session.execute(table.insert().values(values))
        session.commit()
    except SQLAlchemyError:
        session.rollback()
        logger.exception("Unable to write %s activity log", action_type)
    except Exception:
        session.rollback()
        logger.exception("Unexpected error while writing %s activity log", action_type)
    finally:
        session.close()


def log_login_success(*, current_user: Mapping[str, Any], request: Request) -> None:
    """Log one successful password login."""
    log_activity(
        action_type=ACTION_LOGIN,
        current_user=current_user,
        status=STATUS_SUCCESS,
        request=request,
        module="auth",
        details={"event": "successful_login"},
    )


def log_excel_upload(
    *,
    current_user: Mapping[str, Any],
    request: Request,
    status: str,
    file_name: Optional[str],
    module: str,
    error_message: Optional[str] = None,
    details: Optional[dict[str, Any]] = None,
) -> None:
    """Log one Excel upload attempt."""
    log_activity(
        action_type=ACTION_EXCEL_UPLOAD,
        current_user=current_user,
        status=status,
        request=request,
        module=module,
        file_name=file_name,
        error_message=error_message,
        details=details,
    )

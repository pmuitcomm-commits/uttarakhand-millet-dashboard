"""
Shared helpers for dashboard reporting route modules.
"""

import logging

from fastapi import HTTPException, status


def to_float(value) -> float:
    return float(value) if value is not None else 0


def query_failed(message: str) -> HTTPException:
    logging.error(message, exc_info=True)
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail=message,
    )

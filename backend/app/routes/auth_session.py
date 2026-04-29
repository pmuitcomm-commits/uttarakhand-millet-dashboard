"""
HttpOnly cookie session helpers for authentication routes.
"""

from fastapi import Response
from fastapi.responses import JSONResponse

AUTH_COOKIE_NAME = "access_token"
AUTH_COOKIE_SAMESITE = "none"


def set_auth_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key=AUTH_COOKIE_NAME,
        value=token,
        httponly=True,
        secure=True,
        samesite=AUTH_COOKIE_SAMESITE,
        path="/",
    )


def clear_auth_cookie(response: Response) -> None:
    response.delete_cookie(
        key=AUTH_COOKIE_NAME,
        secure=True,
        httponly=True,
        samesite=AUTH_COOKIE_SAMESITE,
        path="/",
    )


def make_auth_response(user_payload: dict, token: str) -> JSONResponse:
    response = JSONResponse(content={"user": user_payload})
    set_auth_cookie(response, token)
    return response


def make_logout_response() -> JSONResponse:
    response = JSONResponse(content={"message": "Logged out"})
    clear_auth_cookie(response)
    return response

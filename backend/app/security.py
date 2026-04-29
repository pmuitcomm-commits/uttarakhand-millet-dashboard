"""
Authentication security helpers for password hashing and JWT tokens.

This module contains security-sensitive code used by login, registration, and
protected API routes. It enforces explicit secret configuration, uses Argon2 for
password hashing, and returns ``None`` for invalid tokens so routes can respond
with consistent authorization errors.
"""

import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
from passlib.context import CryptContext
from dotenv import load_dotenv

load_dotenv()

# Security configuration must be supplied by deployment infrastructure. The
# explicit default check prevents predictable JWT signing keys in production.
SECRET_KEY = os.getenv("SECRET_KEY")
if not SECRET_KEY or SECRET_KEY == "your-secret-key-change-in-production":
    raise ValueError("SECRET_KEY environment variable must be set to a secure value. Do not use the default.")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

# Password hashing context. Argon2 is used for strong password storage and for
# forward compatibility with newer Python runtimes.
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a plain-text password for persistent storage.

    Args:
        password (str): Plain-text password submitted during registration or
            administrative user seeding.

    Returns:
        str: Argon2 password hash suitable for storing in the users table.
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a submitted password against the stored Argon2 hash.

    Args:
        plain_password (str): Password supplied by the user at login.
        hashed_password (str): Stored password hash from the database.

    Returns:
        bool: True when the password is valid, otherwise False.
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a signed JWT access token for authenticated dashboard sessions.

    Args:
        data (dict): Claims to encode, typically including the username under
            the ``sub`` claim.
        expires_delta (Optional[timedelta]): Optional custom token lifetime.

    Returns:
        str: Encoded JWT signed with the configured SECRET_KEY.
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def decode_token(token: str) -> Optional[dict]:
    """
    Decode and validate a JWT access token.

    Args:
        token (str): JWT received from an authenticated API request.

    Returns:
        Optional[dict]: Token payload when valid; None for expired, malformed,
            or otherwise invalid tokens.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError, jwt.DecodeError):
        return None

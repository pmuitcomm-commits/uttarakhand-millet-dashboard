"""
Shared rate limiter configuration for public and authentication endpoints.

The limiter keys requests by remote address to reduce brute-force login attempts
and abusive public enrollment lookups during security testing.
"""

from slowapi import Limiter
from slowapi.util import get_remote_address


limiter = Limiter(key_func=get_remote_address)

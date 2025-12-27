"""
Authentication middleware for admin backend.
Simple token-based authentication for admin endpoints.
"""
import os
from functools import wraps
from typing import Optional

from fastapi import HTTPException, Header, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

# Security scheme
security = HTTPBearer(auto_error=False)

# Get admin token from environment or use default
ADMIN_TOKEN = os.getenv("ADMIN_TOKEN", "dev-admin-token-change-in-production")


async def verify_token(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)
) -> bool:
    """Verify the admin token from Authorization header."""
    if credentials is None:
        raise HTTPException(
            status_code=401,
            detail="Missing authentication token",
            headers={"WWW-Authenticate": "Bearer"}
        )
    
    if credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(
            status_code=403,
            detail="Invalid authentication token"
        )
    
    return True


def require_auth(func):
    """Decorator to require authentication for admin endpoints."""
    @wraps(func)
    async def wrapper(*args, auth: bool = Depends(verify_token), **kwargs):
        return await func(*args, **kwargs)
    return wrapper


# For development: Simple login check
def check_login(username: str, password: str) -> Optional[str]:
    """
    Simple login check. In production, replace with proper authentication.
    Returns token if successful, None otherwise.
    """
    # Development credentials - replace with proper auth in production!
    if username == "admin" and password == os.getenv("ADMIN_PASSWORD", "admin123"):
        return ADMIN_TOKEN
    return None

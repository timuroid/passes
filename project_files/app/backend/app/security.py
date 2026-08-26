import asyncio
import hashlib
import secrets
import time
from collections import defaultdict, deque
from dataclasses import dataclass
from datetime import datetime, timezone

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy import select

from app.models import SessionToken

password_hasher = PasswordHasher(time_cost=2, memory_cost=19456, parallelism=1)
SESSION_COOKIE = "ztz_session"


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password_hash: str, password: str) -> bool:
    try:
        return password_hasher.verify(password_hash, password)
    except (VerificationError, InvalidHashError):
        return False


def hash_session_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def new_session_token() -> str:
    return secrets.token_urlsafe(32)


def new_csrf_token() -> str:
    return secrets.token_urlsafe(24)


@dataclass(frozen=True)
class AuthContext:
    user_id: int
    username: str
    role: str
    csrf_token: str


def get_current_user(request: Request) -> AuthContext:
    raw_token = request.cookies.get(SESSION_COOKIE)
    if not raw_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Требуется вход")

    session_factory = request.app.state.session_factory
    with session_factory() as db:
        session = db.scalar(
            select(SessionToken).where(SessionToken.token_hash == hash_session_token(raw_token))
        )
        now = datetime.now(timezone.utc)
        if session is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Сессия не найдена")
        expires_at = session.expires_at
        if expires_at.tzinfo is None:
            expires_at = expires_at.replace(tzinfo=timezone.utc)
        if expires_at <= now or not session.user.is_active:
            db.delete(session)
            db.commit()
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Сессия истекла")
        return AuthContext(
            user_id=session.user.id,
            username=session.user.username,
            role=session.user.role,
            csrf_token=session.csrf_token,
        )


def require_admin(current: AuthContext = Depends(get_current_user)) -> AuthContext:
    if current.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нужна роль администратора")
    return current


def require_csrf(request: Request, current: AuthContext = Depends(get_current_user)) -> AuthContext:
    supplied = request.headers.get("X-CSRF-Token", "")
    if not supplied or not secrets.compare_digest(supplied, current.csrf_token):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Некорректный CSRF-токен")
    return current


def require_admin_csrf(
    current: AuthContext = Depends(require_csrf),
) -> AuthContext:
    if current.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Нужна роль администратора")
    return current


class SlidingWindowLimiter:
    def __init__(self, limit: int, window_seconds: int) -> None:
        self.limit = limit
        self.window_seconds = window_seconds
        self._hits: dict[str, deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()

    async def allow(self, key: str) -> bool:
        now = time.monotonic()
        cutoff = now - self.window_seconds
        async with self._lock:
            hits = self._hits[key]
            while hits and hits[0] < cutoff:
                hits.popleft()
            if len(hits) >= self.limit:
                return False
            hits.append(now)
            return True


def request_client_key(request: Request) -> str:
    forwarded = request.headers.get("X-Forwarded-For", "").split(",", 1)[0].strip()
    if forwarded:
        return forwarded
    return request.client.host if request.client else "unknown"


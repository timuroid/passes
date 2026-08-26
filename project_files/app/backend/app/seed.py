from sqlalchemy import select

from app.config import get_settings
from app.database import build_engine, build_session_factory
from app.models import User
from app.security import hash_password


def ensure_user(db, username: str, password: str, role: str) -> None:
    existing = db.scalar(select(User).where(User.username == username))
    if existing is not None:
        return
    db.add(User(username=username, password_hash=hash_password(password), role=role, is_active=True))


def main() -> None:
    settings = get_settings()
    engine = build_engine(settings.database_url)
    session_factory = build_session_factory(engine)
    with session_factory() as db:
        ensure_user(db, settings.demo_logist_username, settings.demo_logist_password, "logist")
        ensure_user(db, settings.demo_admin_username, settings.demo_admin_password, "admin")
        db.commit()
    engine.dispose()


if __name__ == "__main__":
    main()


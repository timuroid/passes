import pytest
from fastapi.testclient import TestClient
from sqlalchemy import select

from app.config import Settings
from app.main import create_app
from app.models import Base, User
from app.security import hash_password


@pytest.fixture()
def app():
    settings = Settings(
        database_url="sqlite+pysqlite:///:memory:",
        demo_logist_username="logist",
        demo_logist_password="Logist-Local-2026!",
        demo_admin_username="admin",
        demo_admin_password="Admin-Local-2026!",
        cookie_secure=False,
    )
    application = create_app(settings)
    Base.metadata.create_all(application.state.engine)
    with application.state.session_factory() as db:
        db.add_all(
            [
                User(username="logist", password_hash=hash_password("Logist-Local-2026!"), role="logist"),
                User(username="admin", password_hash=hash_password("Admin-Local-2026!"), role="admin"),
            ]
        )
        db.commit()
        assert db.scalar(select(User).where(User.username == "admin")) is not None
    yield application
    application.state.engine.dispose()


@pytest.fixture()
def client(app):
    with TestClient(app) as test_client:
        yield test_client


def login(client: TestClient, username: str, password: str) -> str:
    response = client.post("/api/auth/login", json={"username": username, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["csrf_token"]


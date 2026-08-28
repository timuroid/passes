import io
from datetime import date

from fastapi.testclient import TestClient
from openpyxl import load_workbook

from .conftest import login


def test_health_and_auth_required(client: TestClient):
    assert client.get("/api/health").json() == {"status": "ok"}
    assert client.get("/api/passes").status_code == 401
    assert client.get("/api/users").status_code == 401


def test_login_rejects_bad_password(client: TestClient):
    response = client.post("/api/auth/login", json={"username": "logist", "password": "wrong"})
    assert response.status_code == 401


def test_public_submit_logist_visibility_and_filters(app):
    public_client = TestClient(app)
    logist_client = TestClient(app)
    response = public_client.post(
        "/api/public/passes", json={"vehicle_number": " а 123 вс-77 ", "phone_number": "+7 (999) 123-45-67"}
    )
    assert response.status_code == 201
    assert response.json()["vehicle_number"] == "A123BC77"
    assert response.json()["phone_number"] == "+79991234567"

    login(logist_client, "logist", "Logist-Local-2026!")
    today = date.today().isoformat()
    response = logist_client.get(
        "/api/passes",
        params={"date_from": today, "date_to": today, "sort": "desc", "page": 1, "page_size": 10},
    )
    assert response.status_code == 200
    assert response.json()["meta"]["total"] == 1
    assert response.json()["items"][0]["vehicle_number"] == "A123BC77"
    assert response.json()["items"][0]["phone_number"] == "+79991234567"


def test_public_submit_phone_validation(client: TestClient):
    assert client.post("/api/public/passes", json={"vehicle_number": "TEST 700"}).status_code == 422
    response = client.post("/api/public/passes", json={"vehicle_number": "TEST 701", "phone_number": "not-a-phone"})
    assert response.status_code == 422
    assert client.post(
        "/api/public/passes", json={"vehicle_number": "Ж 123", "phone_number": "+79990000123"}
    ).status_code == 422


def test_vehicle_search_matches_visual_cyrillic_and_latin_equivalents(app):
    public_client = TestClient(app)
    logist_client = TestClient(app)
    created = public_client.post(
        "/api/public/passes", json={"vehicle_number": "aa123c", "phone_number": "+79990000123"}
    )
    assert created.status_code == 201
    assert created.json()["vehicle_number"] == "AA123C"

    login(logist_client, "logist", "Logist-Local-2026!")
    response = logist_client.get("/api/passes", params={"search": "аа123с"})
    assert response.status_code == 200
    assert [item["id"] for item in response.json()["items"]] == [created.json()["id"]]


def test_export_xlsx_uses_filters_and_requires_auth(app):
    public_client = TestClient(app)
    logist_client = TestClient(app)
    public_client.post(
        "/api/public/passes", json={"vehicle_number": "EXPORT 101", "phone_number": "+79990000101"}
    )
    public_client.post(
        "/api/public/passes", json={"vehicle_number": "OTHER 202", "phone_number": "+79990000202"}
    )
    assert public_client.get("/api/passes/export.xlsx").status_code == 401

    login(logist_client, "logist", "Logist-Local-2026!")
    response = logist_client.get("/api/passes/export.xlsx", params={"search": "export"})
    assert response.status_code == 200
    assert response.headers["content-type"].startswith(
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
    workbook = load_workbook(io.BytesIO(response.content), read_only=True)
    rows = list(workbook.active.values)
    assert rows[0] == ("ID", "Номер автомобиля", "Телефон", "Получен", "Статус")
    assert len(rows) == 2
    assert rows[1][1:3] == ("EXPORT101", "+79990000101")


def test_admin_soft_hide_restore_and_users(app):
    public_client = TestClient(app)
    logist_client = TestClient(app)
    admin_client = TestClient(app)

    created = public_client.post(
        "/api/public/passes", json={"vehicle_number": "SMOKE 900", "phone_number": "+79990000001"}
    ).json()
    pass_id = created["id"]
    login(logist_client, "logist", "Logist-Local-2026!")
    admin_csrf = login(admin_client, "admin", "Admin-Local-2026!")

    hidden = admin_client.patch(
        f"/api/passes/{pass_id}/visibility",
        json={"hidden": True},
        headers={"X-CSRF-Token": admin_csrf},
    )
    assert hidden.status_code == 200
    assert hidden.json()["is_hidden"] is True
    assert logist_client.get("/api/passes", params={"search": "SMOKE 900"}).json()["meta"]["total"] == 0
    assert admin_client.get(
        "/api/passes", params={"search": "SMOKE 900", "visibility": "hidden"}
    ).json()["meta"]["total"] == 1

    restored = admin_client.patch(
        f"/api/passes/{pass_id}/visibility",
        json={"hidden": False},
        headers={"X-CSRF-Token": admin_csrf},
    )
    assert restored.status_code == 200
    assert restored.json()["is_hidden"] is False
    assert logist_client.get("/api/passes", params={"search": "SMOKE 900"}).json()["meta"]["total"] == 1

    users = admin_client.get("/api/users")
    assert users.status_code == 200
    assert {(item["username"], item["role"]) for item in users.json()} == {
        ("admin", "admin"),
        ("logist", "logist"),
    }


def test_logist_manages_pass_visibility_but_cannot_list_users(app):
    public_client = TestClient(app)
    logist_client = TestClient(app)
    item = public_client.post(
        "/api/public/passes", json={"vehicle_number": "TEST 101", "phone_number": "+79990000101"}
    ).json()
    csrf = login(logist_client, "logist", "Logist-Local-2026!")
    hidden = logist_client.patch(
        f"/api/passes/{item['id']}/visibility",
        json={"hidden": True},
        headers={"X-CSRF-Token": csrf},
    )
    assert hidden.status_code == 200
    assert hidden.json()["is_hidden"] is True
    assert logist_client.get("/api/passes", params={"search": "TEST 101"}).json()["meta"]["total"] == 0
    assert logist_client.get(
        "/api/passes", params={"search": "TEST 101", "visibility": "hidden"}
    ).json()["meta"]["total"] == 1
    restored = logist_client.patch(
        f"/api/passes/{item['id']}/visibility",
        json={"hidden": False},
        headers={"X-CSRF-Token": csrf},
    )
    assert restored.status_code == 200
    assert restored.json()["is_hidden"] is False
    assert logist_client.get("/api/users").status_code == 403


def test_admin_controls_public_driver_theme(app):
    public_client = TestClient(app)
    logist_client = TestClient(app)
    admin_client = TestClient(app)
    assert public_client.get("/api/public/settings").json() == {"driver_theme": "light"}

    logist_csrf = login(logist_client, "logist", "Logist-Local-2026!")
    denied = logist_client.patch(
        "/api/settings/driver-theme",
        json={"theme": "dark"},
        headers={"X-CSRF-Token": logist_csrf},
    )
    assert denied.status_code == 403

    admin_csrf = login(admin_client, "admin", "Admin-Local-2026!")
    updated = admin_client.patch(
        "/api/settings/driver-theme",
        json={"theme": "dark"},
        headers={"X-CSRF-Token": admin_csrf},
    )
    assert updated.status_code == 200
    assert updated.json() == {"driver_theme": "dark"}
    assert public_client.get("/api/public/settings").json() == {"driver_theme": "dark"}


def test_csrf_required_for_admin_change(app):
    public_client = TestClient(app)
    admin_client = TestClient(app)
    item = public_client.post(
        "/api/public/passes", json={"vehicle_number": "TEST 202", "phone_number": "+79990000202"}
    ).json()
    login(admin_client, "admin", "Admin-Local-2026!")
    response = admin_client.patch(f"/api/passes/{item['id']}/visibility", json={"hidden": True})
    assert response.status_code == 403


def test_admin_creates_user_and_new_user_can_login(app):
    admin_client = TestClient(app)
    new_user_client = TestClient(app)
    csrf = login(admin_client, "admin", "Admin-Local-2026!")
    created = admin_client.post(
        "/api/users",
        json={"username": "gate.logist", "password": "Gate-Local-2026!", "role": "logist"},
        headers={"X-CSRF-Token": csrf},
    )
    assert created.status_code == 201
    assert created.json()["username"] == "gate.logist"
    assert created.json()["role"] == "logist"
    assert "password" not in created.json() and "password_hash" not in created.json()

    assert login(new_user_client, "gate.logist", "Gate-Local-2026!")
    disabled = admin_client.patch(
        f"/api/users/{created.json()['id']}/active",
        json={"active": False},
        headers={"X-CSRF-Token": csrf},
    )
    assert disabled.status_code == 200
    assert disabled.json()["is_active"] is False
    assert new_user_client.get("/api/passes").status_code == 401
    assert new_user_client.post(
        "/api/auth/login", json={"username": "gate.logist", "password": "Gate-Local-2026!"}
    ).status_code == 401

    restored = admin_client.patch(
        f"/api/users/{created.json()['id']}/active",
        json={"active": True},
        headers={"X-CSRF-Token": csrf},
    )
    assert restored.status_code == 200
    assert restored.json()["is_active"] is True
    assert login(new_user_client, "gate.logist", "Gate-Local-2026!")
    duplicate = admin_client.post(
        "/api/users",
        json={"username": "gate.logist", "password": "Other-Local-2026!", "role": "admin"},
        headers={"X-CSRF-Token": csrf},
    )
    assert duplicate.status_code == 409


def test_user_creation_validates_password_and_role(app):
    admin_client = TestClient(app)
    logist_client = TestClient(app)
    admin_csrf = login(admin_client, "admin", "Admin-Local-2026!")
    logist_csrf = login(logist_client, "logist", "Logist-Local-2026!")

    weak = admin_client.post(
        "/api/users",
        json={"username": "weak-user", "password": "onlyletters", "role": "logist"},
        headers={"X-CSRF-Token": admin_csrf},
    )
    assert weak.status_code == 422
    short = admin_client.post(
        "/api/users",
        json={"username": "short-user", "password": "Ab1!xyz", "role": "logist"},
        headers={"X-CSRF-Token": admin_csrf},
    )
    assert short.status_code == 422
    accepted = admin_client.post(
        "/api/users",
        json={"username": "eight-user", "password": "Ab1!xyza", "role": "logist"},
        headers={"X-CSRF-Token": admin_csrf},
    )
    assert accepted.status_code == 201
    forbidden = logist_client.post(
        "/api/users",
        json={"username": "blocked-user", "password": "Blocked-Local-2026!", "role": "logist"},
        headers={"X-CSRF-Token": logist_csrf},
    )
    assert forbidden.status_code == 403


def test_admin_cannot_disable_self(app):
    admin_client = TestClient(app)
    csrf = login(admin_client, "admin", "Admin-Local-2026!")
    me = admin_client.get("/api/auth/me").json()
    response = admin_client.patch(
        f"/api/users/{me['user']['id']}/active",
        json={"active": False},
        headers={"X-CSRF-Token": csrf},
    )
    assert response.status_code == 409
    assert "собственную" in response.json()["detail"]


def test_admin_resets_user_password_and_revokes_sessions(app):
    admin_client = TestClient(app)
    user_client = TestClient(app)
    csrf = login(admin_client, "admin", "Admin-Local-2026!")
    created = admin_client.post(
        "/api/users",
        json={"username": "reset.logist", "password": "Before-Local-2026!", "role": "logist"},
        headers={"X-CSRF-Token": csrf},
    )
    assert created.status_code == 201
    assert login(user_client, "reset.logist", "Before-Local-2026!")

    changed = admin_client.patch(
        f"/api/users/{created.json()['id']}/password",
        json={"password": "After-Local-2026!"},
        headers={"X-CSRF-Token": csrf},
    )
    assert changed.status_code == 200
    assert "password" not in changed.json() and "password_hash" not in changed.json()
    assert user_client.get("/api/passes").status_code == 401
    assert user_client.post(
        "/api/auth/login", json={"username": "reset.logist", "password": "Before-Local-2026!"}
    ).status_code == 401
    assert login(user_client, "reset.logist", "After-Local-2026!")

    weak = admin_client.patch(
        f"/api/users/{created.json()['id']}/password",
        json={"password": "weakpass"},
        headers={"X-CSRF-Token": csrf},
    )
    assert weak.status_code == 422

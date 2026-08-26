#!/usr/bin/env python3
import http.cookiejar
import json
import sys
import time
import urllib.error
import urllib.parse
import urllib.request


class ApiClient:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip("/")
        self.jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(self.jar))
        self.csrf = ""

    def request(self, method: str, path: str, data=None, params=None):
        url = self.base_url + path
        if params:
            url += "?" + urllib.parse.urlencode(params)
        headers = {"Accept": "application/json"}
        body = None
        if data is not None:
            body = json.dumps(data).encode("utf-8")
            headers["Content-Type"] = "application/json"
        if self.csrf:
            headers["X-CSRF-Token"] = self.csrf
        request = urllib.request.Request(url, data=body, headers=headers, method=method)
        try:
            with self.opener.open(request, timeout=10) as response:
                payload = response.read()
                return response.status, json.loads(payload) if payload else None
        except urllib.error.HTTPError as error:
            payload = error.read()
            details = payload.decode("utf-8", errors="replace")
            raise RuntimeError(f"{method} {path}: HTTP {error.code}: {details}") from error

    def login(self, username: str, password: str):
        status, body = self.request("POST", "/api/auth/login", {"username": username, "password": password})
        assert status == 200
        self.csrf = body["csrf_token"]


def find(client: ApiClient, vehicle_number: str, visibility="visible"):
    _, page = client.request(
        "GET",
        "/api/passes",
        params={"search": vehicle_number, "visibility": visibility, "page": 1, "page_size": 10},
    )
    return page["items"]


def main():
    base_url = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:8000"
    suffix = str(int(time.time()))[-7:]
    vehicle_number = f"AA{suffix}C"
    visual_equivalent_search = f"АА{suffix}С"
    phone_number = f"+7999{suffix}"
    public = ApiClient(base_url)
    logist = ApiClient(base_url)
    admin = ApiClient(base_url)

    status, created = public.request(
        "POST", "/api/public/passes", {"vehicle_number": vehicle_number, "phone_number": phone_number}
    )
    assert status == 201 and created["vehicle_number"] == vehicle_number and created["phone_number"] == phone_number
    pass_id = created["id"]

    logist.login("logist", "Logist-Local-2026!")
    assert any(
        item["id"] == pass_id and item["phone_number"] == phone_number
        for item in find(logist, visual_equivalent_search)
    )

    admin.login("admin", "Admin-Local-2026!")
    _, hidden = admin.request("PATCH", f"/api/passes/{pass_id}/visibility", {"hidden": True})
    assert hidden["is_hidden"] is True
    assert find(logist, vehicle_number) == []
    assert any(item["id"] == pass_id for item in find(admin, vehicle_number, "hidden"))

    _, restored = admin.request("PATCH", f"/api/passes/{pass_id}/visibility", {"hidden": False})
    assert restored["is_hidden"] is False
    assert any(item["id"] == pass_id for item in find(logist, vehicle_number))

    _, users = admin.request("GET", "/api/users")
    roles = {(user["username"], user["role"]) for user in users}
    assert ("logist", "logist") in roles and ("admin", "admin") in roles
    new_username = f"smoke{suffix}"
    status, new_user = admin.request(
        "POST",
        "/api/users",
        {"username": new_username, "password": "Smoke-Local-2026!", "role": "logist"},
    )
    assert status == 201 and new_user["username"] == new_username
    created_user_client = ApiClient(base_url)
    created_user_client.login(new_username, "Smoke-Local-2026!")
    assert any(item["id"] == pass_id for item in find(created_user_client, vehicle_number))

    _, disabled_user = admin.request(
        "PATCH", f"/api/users/{new_user['id']}/active", {"active": False}
    )
    assert disabled_user["is_active"] is False
    try:
        find(created_user_client, vehicle_number)
        raise AssertionError("Disabled user's active session was not revoked")
    except RuntimeError as error:
        assert "HTTP 401" in str(error)
    denied_client = ApiClient(base_url)
    try:
        denied_client.login(new_username, "Smoke-Local-2026!")
        raise AssertionError("Disabled user could log in")
    except RuntimeError as error:
        assert "HTTP 401" in str(error)
    _, listed_users = admin.request("GET", "/api/users")
    assert any(user["id"] == new_user["id"] and not user["is_active"] for user in listed_users)

    _, restored_user = admin.request(
        "PATCH", f"/api/users/{new_user['id']}/active", {"active": True}
    )
    assert restored_user["is_active"] is True
    restored_client = ApiClient(base_url)
    restored_client.login(new_username, "Smoke-Local-2026!")
    assert any(item["id"] == pass_id for item in find(restored_client, vehicle_number))

    updated_password = "Smoke-Updated-2026!"
    _, changed_user = admin.request(
        "PATCH", f"/api/users/{new_user['id']}/password", {"password": updated_password}
    )
    assert changed_user["id"] == new_user["id"]
    try:
        find(restored_client, vehicle_number)
        raise AssertionError("Password reset did not revoke the user's active session")
    except RuntimeError as error:
        assert "HTTP 401" in str(error)
    reset_client = ApiClient(base_url)
    reset_client.login(new_username, updated_password)
    assert any(item["id"] == pass_id for item in find(reset_client, vehicle_number))
    print(
        f"SMOKE PASS: {vehicle_number}; public -> logist -> hide -> restore; "
        f"users={len(users)}; created -> disabled -> restored -> password reset={new_username}"
    )


if __name__ == "__main__":
    main()

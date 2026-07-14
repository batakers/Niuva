"""
NIUVA backend integration tests (pytest).
Covers: auth, materials, orders, payment, admin order flow,
portfolio, internship/contact, settings, users, stats, notifications.
"""
import os
import io
import uuid
import time
from pathlib import Path

import pytest
import requests

BASE_URL = os.environ["REACT_APP_BACKEND_URL"].rstrip("/") if os.environ.get("REACT_APP_BACKEND_URL") else None
if not BASE_URL:
    # fallback to read frontend .env
    frontend_env = Path(__file__).resolve().parents[2] / "frontend" / ".env"
    if frontend_env.exists():
        for line in frontend_env.read_text(encoding="utf-8").splitlines():
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")

if not BASE_URL:
    pytest.skip(
        "Integration backend URL is not configured; set REACT_APP_BACKEND_URL to run this suite.",
        allow_module_level=True,
    )

API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@niuva.com"
ADMIN_PASSWORD = "NiuvaAdmin2026"

# ---------- Helpers / fixtures ----------
@pytest.fixture(scope="session")
def admin_token():
    r = requests.post(f"{API}/auth/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=30)
    assert r.status_code == 200, f"admin login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["user"]["role"] == "super_admin"
    assert data["user"]["roles"] == ["super_admin"]
    assert "*" in data["user"]["permissions"]
    assert "password_hash" not in data["user"]
    return data["token"]

@pytest.fixture(scope="session")
def client_user(admin_token):
    suffix = uuid.uuid4().hex[:8]
    email = f"TEST_client_{suffix}@test.com"
    payload = {"name": "Test Client", "email": email, "password": "Client123"}
    provisioned = requests.post(
        f"{API}/admin/users",
        json=payload,
        headers=hh(admin_token),
        timeout=30,
    )
    assert provisioned.status_code == 201, f"provision failed: {provisioned.status_code} {provisioned.text}"
    login = requests.post(
        f"{API}/auth/login",
        json={"email": email, "password": "Client123"},
        timeout=30,
    )
    assert login.status_code == 200, f"client login failed: {login.status_code} {login.text}"
    return {
        "email": email,
        "password": "Client123",
        "token": login.json()["token"],
        "id": provisioned.json()["id"],
    }

def hh(token):
    return {"Authorization": f"Bearer {token}"}

# ---------- Health ----------
def test_root_ok():
    r = requests.get(f"{API}/", timeout=20)
    assert r.status_code == 200
    assert r.json().get("status") == "ok"

# ---------- Auth ----------
class TestAuth:
    def test_login_invalid(self):
        r = requests.post(f"{API}/auth/login", json={"email": "no@no.com", "password": "x"}, timeout=20)
        assert r.status_code == 401

    def test_admin_login(self, admin_token):
        assert isinstance(admin_token, str) and len(admin_token) > 20

    def test_me(self, admin_token):
        r = requests.get(f"{API}/auth/me", headers=hh(admin_token), timeout=20)
        assert r.status_code == 200
        assert r.json()["role"] == "super_admin"
        assert r.json()["roles"] == ["super_admin"]
        assert "*" in r.json()["permissions"]
        assert "password_hash" not in r.json()

    def test_public_registration_disabled(self):
        r = requests.post(
            f"{API}/auth/register",
            json={"name": "Blocked", "email": "blocked@test.com", "password": "Client123"},
            timeout=20,
        )
        assert r.status_code == 403
        assert "Public registration is disabled" in r.json()["detail"]

    def test_client_cannot_use_admin_login(self, client_user):
        r = requests.post(
            f"{API}/auth/admin/login",
            json={"email": client_user["email"], "password": client_user["password"]},
            timeout=20,
        )
        assert r.status_code == 403

    def test_no_auth_protected(self):
        r = requests.get(f"{API}/orders", timeout=20)
        assert r.status_code == 401

    def test_client_cannot_access_admin(self, client_user):
        r = requests.get(f"{API}/admin/stats", headers=hh(client_user["token"]), timeout=20)
        assert r.status_code == 403

# ---------- Materials (public + admin CRUD) ----------
class TestMaterials:
    def test_list_public(self):
        r = requests.get(f"{API}/materials", timeout=20)
        assert r.status_code == 200
        items = r.json()
        assert isinstance(items, list) and len(items) >= 1
        for it in items:
            assert it.get("active") is True

    def test_admin_crud(self, admin_token):
        # Create
        payload = {"name": f"TEST_MAT_{uuid.uuid4().hex[:6]}", "description": "d", "color": "Red", "active": True}
        r = requests.post(f"{API}/admin/materials", json=payload, headers=hh(admin_token), timeout=20)
        assert r.status_code == 200, r.text
        mat = r.json()
        assert mat["name"] == payload["name"]
        mid = mat["id"]
        # Update
        r2 = requests.put(f"{API}/admin/materials/{mid}",
                          json={**payload, "description": "updated"}, headers=hh(admin_token), timeout=20)
        assert r2.status_code == 200
        assert r2.json()["description"] == "updated"
        # Toggle off and verify not in public list
        requests.put(f"{API}/admin/materials/{mid}",
                     json={**payload, "active": False}, headers=hh(admin_token), timeout=20)
        pub = requests.get(f"{API}/materials", timeout=20).json()
        assert all(m["id"] != mid for m in pub)
        # Delete
        rd = requests.delete(f"{API}/admin/materials/{mid}", headers=hh(admin_token), timeout=20)
        assert rd.status_code == 200

# ---------- Orders flow ----------
@pytest.fixture(scope="session")
def active_material_id(admin_token):
    pub = requests.get(f"{API}/materials", timeout=20).json()
    assert pub, "no active materials"
    return pub[0]["id"]

def make_stl_bytes(n_kb=2):
    # Simple ASCII STL
    head = b"solid TEST\n"
    body = b"  facet normal 0 0 0\n    outer loop\n      vertex 0 0 0\n      vertex 1 0 0\n      vertex 0 1 0\n    endloop\n  endfacet\n" * (n_kb * 8)
    tail = b"endsolid TEST\n"
    return head + body + tail

class TestOrderFlow:
    order_id = None
    order_number = None

    def test_reject_bad_extension(self, client_user, active_material_id):
        files = {"file": ("evil.exe", b"MZ\x00\x00", "application/octet-stream")}
        data = {"material_id": active_material_id, "notes": "test"}
        r = requests.post(f"{API}/orders", files=files, data=data, headers=hh(client_user["token"]), timeout=30)
        assert r.status_code == 400

    def test_reject_invalid_material(self, client_user):
        files = {"file": ("x.stl", make_stl_bytes(), "application/octet-stream")}
        data = {"material_id": "not-a-material", "notes": ""}
        r = requests.post(f"{API}/orders", files=files, data=data, headers=hh(client_user["token"]), timeout=30)
        assert r.status_code == 400

    def test_create_order(self, client_user, active_material_id):
        files = {"file": ("part.stl", make_stl_bytes(4), "application/octet-stream")}
        data = {"material_id": active_material_id, "notes": "TEST order notes"}
        r = requests.post(f"{API}/orders", files=files, data=data, headers=hh(client_user["token"]), timeout=60)
        assert r.status_code == 200, r.text
        order = r.json()
        assert order["status"] == "pending_estimate"
        assert order["order_number"].startswith("NIV-")
        assert order["file"]["original_filename"] == "part.stl"
        TestOrderFlow.order_id = order["id"]
        TestOrderFlow.order_number = order["order_number"]

    def test_get_my_orders(self, client_user):
        r = requests.get(f"{API}/orders", headers=hh(client_user["token"]), timeout=20)
        assert r.status_code == 200
        ids = [o["id"] for o in r.json()]
        assert TestOrderFlow.order_id in ids

    def test_get_order_detail_ownership(self, client_user, admin_token):
        # owner ok
        r = requests.get(f"{API}/orders/{TestOrderFlow.order_id}", headers=hh(client_user["token"]), timeout=20)
        assert r.status_code == 200
        # admin can view
        r2 = requests.get(f"{API}/orders/{TestOrderFlow.order_id}", headers=hh(admin_token), timeout=20)
        assert r2.status_code == 200

    def test_other_client_cannot_view(self, admin_token):
        # create another client
        other_email = f"TEST_other_{uuid.uuid4().hex[:6]}@t.com"
        provisioned = requests.post(
            f"{API}/admin/users",
            json={"name": "Other", "email": other_email, "password": "Client123"},
            headers=hh(admin_token),
            timeout=20,
        )
        assert provisioned.status_code == 201
        lr = requests.post(f"{API}/auth/login",
                           json={"email": other_email, "password": "Client123"}, timeout=20).json()
        r = requests.get(f"{API}/orders/{TestOrderFlow.order_id}", headers=hh(lr["token"]), timeout=20)
        assert r.status_code == 403

    def test_admin_set_estimate(self, admin_token):
        r = requests.post(f"{API}/admin/orders/{TestOrderFlow.order_id}/estimate",
                          json={"amount": 250000, "note": "TEST estimate"}, headers=hh(admin_token), timeout=30)
        assert r.status_code == 200, r.text
        ord_ = r.json()
        assert ord_["status"] == "awaiting_payment"
        assert ord_["estimate"]["amount"] == 250000

    def test_client_upload_payment_proof(self, client_user):
        # tiny png header
        png = (b"\x89PNG\r\n\x1a\n" + b"\x00" * 200)
        files = {"file": ("proof.png", png, "image/png")}
        r = requests.post(f"{API}/orders/{TestOrderFlow.order_id}/payment-proof",
                          files=files, headers=hh(client_user["token"]), timeout=30)
        assert r.status_code == 200, r.text
        assert r.json()["payment"]["proof"]["original_filename"] == "proof.png"

    def test_admin_verify_payment(self, admin_token):
        r = requests.post(f"{API}/admin/orders/{TestOrderFlow.order_id}/verify-payment",
                          headers=hh(admin_token), timeout=30)
        assert r.status_code == 200
        assert r.json()["status"] == "in_process"

    def test_admin_mark_completed(self, admin_token):
        r = requests.post(f"{API}/admin/orders/{TestOrderFlow.order_id}/status",
                          json={"status": "completed", "note": "TEST done"}, headers=hh(admin_token), timeout=30)
        assert r.status_code == 200
        assert r.json()["status"] == "completed"

    def test_file_download_access_control(self, client_user, admin_token):
        # get path from order
        ord_ = requests.get(f"{API}/orders/{TestOrderFlow.order_id}", headers=hh(client_user["token"]), timeout=20).json()
        path = ord_["file"]["storage_path"]
        # owner with token in query
        r = requests.get(f"{API}/files/{path}?auth={client_user['token']}", timeout=30)
        assert r.status_code == 200
        # unauthenticated
        r2 = requests.get(f"{API}/files/{path}", timeout=20)
        assert r2.status_code == 401
        # admin via Bearer
        r3 = requests.get(f"{API}/files/{path}", headers=hh(admin_token), timeout=30)
        assert r3.status_code == 200

    def test_notifications_logged(self, client_user):
        r = requests.get(f"{API}/notifications", headers=hh(client_user["token"]), timeout=20)
        assert r.status_code == 200
        notifs = r.json()
        # at least order received + estimate + verified + completed
        assert isinstance(notifs, list) and len(notifs) >= 2

# ---------- Internship / Contact (public) ----------
class TestPublicForms:
    def test_internship_submit(self):
        payload = {
            "full_name": "TEST Pelamar", "email": "TEST_intern@t.com", "phone": "0800",
            "university": "ITB", "major": "ME", "semester": "5", "duration": "3 bulan",
            "motivation": "Belajar", "portfolio_url": "",
        }
        r = requests.post(f"{API}/internships", json=payload, timeout=20)
        assert r.status_code == 200
        assert r.json()["ok"] is True

    def test_admin_internships_list(self, admin_token):
        r = requests.get(f"{API}/admin/internships", headers=hh(admin_token), timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_contact_submit(self):
        r = requests.post(f"{API}/contact",
                          json={"name": "TEST", "email": "TEST_c@t.com",
                                "subject": "Hello", "message": "Hi"}, timeout=20)
        assert r.status_code == 200

    def test_admin_contacts(self, admin_token):
        r = requests.get(f"{API}/admin/contacts", headers=hh(admin_token), timeout=20)
        assert r.status_code == 200

# ---------- Portfolio ----------
class TestPortfolio:
    def test_public_list(self):
        r = requests.get(f"{API}/portfolio", timeout=20)
        assert r.status_code == 200
        assert isinstance(r.json(), list)

    def test_admin_crud(self, admin_token):
        payload = {
            "title_id": "TEST_proj", "title_en": "TEST_proj_en", "client": "X",
            "category": "Cat", "description_id": "desc", "description_en": "desc",
            "images": ["https://example.com/x.png"], "featured": False,
        }
        r = requests.post(f"{API}/admin/portfolio", json=payload, headers=hh(admin_token), timeout=20)
        assert r.status_code == 200
        pid = r.json()["id"]
        r2 = requests.put(f"{API}/admin/portfolio/{pid}",
                          json={**payload, "title_en": "TEST_proj_updated"}, headers=hh(admin_token), timeout=20)
        assert r2.status_code == 200
        assert r2.json()["title_en"] == "TEST_proj_updated"
        rd = requests.delete(f"{API}/admin/portfolio/{pid}", headers=hh(admin_token), timeout=20)
        assert rd.status_code == 200

# ---------- Settings + Users + Stats ----------
class TestSettingsUsersStats:
    def test_public_settings(self):
        r = requests.get(f"{API}/settings", timeout=20)
        assert r.status_code == 200
        d = r.json()
        for k in ("bank_name", "account_number", "account_holder"):
            assert k in d

    def test_admin_update_settings(self, admin_token):
        new = {"bank_name": "TEST Bank", "account_number": "999-9999", "account_holder": "TEST Holder"}
        r = requests.put(f"{API}/admin/settings", json=new, headers=hh(admin_token), timeout=20)
        assert r.status_code == 200
        d = r.json()
        assert d["bank_name"] == "TEST Bank"
        # restore reasonable default
        requests.put(f"{API}/admin/settings",
                     json={"bank_name": "Bank Mandiri (Placeholder)",
                           "account_number": "000-0000-0000",
                           "account_holder": "PT Niuva Inovasi Utama"},
                     headers=hh(admin_token), timeout=20)

    def test_admin_users_list(self, admin_token, client_user):
        r = requests.get(f"{API}/admin/users", headers=hh(admin_token), timeout=20)
        assert r.status_code == 200
        emails = [u["email"].lower() for u in r.json()]
        assert client_user["email"].lower() in emails

    def test_admin_stats(self, admin_token):
        r = requests.get(f"{API}/admin/stats", headers=hh(admin_token), timeout=20)
        assert r.status_code == 200
        d = r.json()
        for k in ("total_orders", "pending_estimate", "awaiting_payment", "in_process", "completed", "clients", "internships"):
            assert k in d

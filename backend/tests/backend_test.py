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
        # owner with Authorization header
        r = requests.get(f"{API}/files/{path}", headers={"Authorization": f"Bearer {client_user['token']}"}, timeout=30)
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

# ---------- Catalog / material pricing / inventory foundation ----------
def _provision_staff(admin_token, role):
    suffix = uuid.uuid4().hex[:8]
    email = f"TEST_{role}_{suffix}@test.com"
    password = "StaffTest123"
    created = requests.post(
        f"{API}/admin/users",
        json={"name": f"Test {role}", "email": email, "password": password},
        headers=hh(admin_token),
        timeout=30,
    )
    assert created.status_code == 201, created.text
    access = requests.put(
        f"{API}/admin/users/{created.json()['id']}/access",
        json={"roles": [role], "status": "active", "reason": "Foundation external API verification"},
        headers=hh(admin_token),
        timeout=30,
    )
    assert access.status_code == 200, access.text
    login = requests.post(
        f"{API}/auth/login",
        json={"email": email, "password": password},
        timeout=30,
    )
    assert login.status_code == 200, login.text
    return login.json()["token"]


def _all_keys(value):
    if isinstance(value, dict):
        return set(value) | set().union(*(_all_keys(item) for item in value.values()), set())
    if isinstance(value, list):
        return set().union(*(_all_keys(item) for item in value), set())
    return set()


def test_catalog_material_inventory_external_workflow(admin_token, client_user):
    health = requests.get(f"{API}/health", timeout=20)
    assert health.status_code == 200
    if not health.json().get("transactions"):
        pytest.skip("External foundation workflow requires MongoDB transaction capability")

    catalog_token = _provision_staff(admin_token, "catalog_manager")
    warehouse_token = _provision_staff(admin_token, "warehouse")
    manager_token = _provision_staff(admin_token, "manager_approver")
    suffix = uuid.uuid4().hex[:8]

    category = requests.post(
        f"{API}/admin/categories",
        json={
            "name": f"TEST Category {suffix}",
            "slug": f"test-category-{suffix}",
            "description": "External verification category",
            "sort_order": 999,
            "status": "active",
        },
        headers=hh(catalog_token),
        timeout=30,
    )
    assert category.status_code == 201, category.text
    product_slug = f"test-product-{suffix}"
    product = requests.post(
        f"{API}/admin/products",
        json={
            "category_id": category.json()["id"],
            "name": f"TEST Product {suffix}",
            "slug": product_slug,
            "short_description": "Safe public summary",
            "description": "Safe public catalog description",
            "media": [{"storage_path": f"tests/{suffix}.webp", "alt": "Test product preview"}],
            "pricing_mode": "fixed",
            "price_from": 150000,
            "currency": "IDR",
            "retail_cta_enabled": True,
            "b2b_cta_enabled": True,
            "stock_visibility": "status_only",
        },
        headers=hh(catalog_token),
        timeout=30,
    )
    assert product.status_code == 201, product.text
    product_id = product.json()["id"]
    variant = requests.put(
        f"{API}/admin/products/{product_id}/variants",
        json={"variants": [{
            "sku": f"TEST-VAR-{suffix}", "name": "Default", "option_values": {},
            "fixed_price": 150000, "currency": "IDR", "production_type": "ready_stock",
            "inventory_tracking_enabled": True, "reorder_point": "2", "status": "active",
        }]},
        headers=hh(catalog_token),
        timeout=30,
    )
    assert variant.status_code == 200, variant.text
    validation = requests.post(
        f"{API}/admin/products/{product_id}/validate",
        headers=hh(catalog_token),
        timeout=30,
    )
    assert validation.status_code == 200
    assert validation.json()["errors"] == []
    publication = requests.post(
        f"{API}/admin/products/{product_id}/publish",
        json={"reason": "External catalog publication verification"},
        headers=hh(catalog_token),
        timeout=30,
    )
    assert publication.status_code == 200, publication.text

    public_product = requests.get(f"{API}/catalog/products/{product_slug}", timeout=30)
    assert public_product.status_code == 200, public_product.text
    forbidden_public_keys = {
        "supplier_reference", "on_hand", "reserved", "available", "incoming",
        "planned_demand", "projected", "reorder_point", "published_by",
        "publish_reason", "created_by", "updated_by", "request_fingerprint",
        "pricing_rule_reference", "reason", "audit_events",
    }
    assert not (_all_keys(public_product.json()) & forbidden_public_keys)
    assert public_product.json()["variants"][0]["stock_status"] in {
        "out_of_stock", "low_stock", "in_stock", "made_to_order",
    }

    material = requests.post(
        f"{API}/admin/materials",
        json={"name": f"TEST Material {suffix}", "description": "Legacy compatible", "color": "Natural", "active": True},
        headers=hh(warehouse_token),
        timeout=30,
    )
    assert material.status_code == 200, material.text
    material_id = material.json()["id"]
    material_ready = requests.put(
        f"{API}/admin/materials/{material_id}",
        json={
            "sku": f"TEST-MAT-{suffix}", "name": material.json()["name"], "description": "Ready material",
            "color": "Natural", "base_unit": "kg", "supplier_reference": "INTERNAL-SUPPLIER-TEST",
            "waste_percentage": "2.5", "reorder_point": "5", "lead_time_days": 7,
            "inventory_tracking_enabled": True, "setup_status": "ready", "status": "active",
        },
        headers=hh(manager_token),
        timeout=30,
    )
    assert material_ready.status_code == 200, material_ready.text
    for amount, effective_from, reason in (
        (100000, "2020-01-01T00:00:00+00:00", "Initial external verification price"),
        (125000, "2999-01-01T00:00:00+00:00", "Future external verification price"),
    ):
        price = requests.post(
            f"{API}/admin/materials/{material_id}/price-versions",
            json={"amount": amount, "currency": "IDR", "price_unit": "kg", "effective_from": effective_from, "reason": reason},
            headers=hh(manager_token),
            timeout=30,
        )
        assert price.status_code == 201, price.text
    effective = requests.get(
        f"{API}/admin/materials/{material_id}/effective-price",
        headers=hh(manager_token), timeout=30,
    )
    assert effective.status_code == 200
    assert effective.json()["current"]["amount"] == 100000
    assert effective.json()["next_scheduled"]["amount"] == 125000
    public_materials = requests.get(f"{API}/materials", timeout=30).json()
    public_material = next(item for item in public_materials if item["id"] == material_id)
    assert "supplier_reference" not in public_material
    assert "price" not in public_material
    assert "reorder_point" not in public_material

    receive_payload = {
        "operation_id": str(uuid.uuid4()), "subject_type": "material", "subject_id": material_id,
        "movement_type": "receive", "quantity": "10", "reference_type": "external_test",
        "reference_id": f"receipt-{suffix}", "reason": "External warehouse receive verification",
    }
    received = requests.post(f"{API}/admin/inventory/movements", json=receive_payload, headers=hh(warehouse_token), timeout=30)
    assert received.status_code == 200, received.text
    replay = requests.post(f"{API}/admin/inventory/movements", json=receive_payload, headers=hh(warehouse_token), timeout=30)
    assert replay.status_code == 200
    assert replay.json()["replayed"] is True
    assert replay.json()["movement"]["id"] == received.json()["movement"]["id"]

    warehouse_damage = requests.post(
        f"{API}/admin/inventory/movements",
        json={**receive_payload, "operation_id": str(uuid.uuid4()), "movement_type": "damage", "quantity": "1"},
        headers=hh(warehouse_token), timeout=30,
    )
    assert warehouse_damage.status_code == 403
    adjustment = requests.post(
        f"{API}/admin/inventory/movements",
        json={
            **receive_payload, "operation_id": str(uuid.uuid4()), "movement_type": "adjustment",
            "quantity": None, "on_hand_delta": "-1", "reason": "Manager stock count correction",
        },
        headers=hh(manager_token), timeout=30,
    )
    assert adjustment.status_code == 200, adjustment.text
    customer_admin = requests.get(
        f"{API}/admin/inventory/balances",
        headers=hh(client_user["token"]), timeout=30,
    )
    assert customer_admin.status_code == 403

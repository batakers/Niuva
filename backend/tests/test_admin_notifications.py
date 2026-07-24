import os
import sys
import types
from pathlib import Path

import httpx


BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URL", "mongodb://notifications-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_notifications_test")
os.environ.setdefault("JWT_SECRET", "notifications-test-secret-at-least-32-characters")
os.environ.setdefault("ADMIN_EMAIL", "admin@niuva.com")
os.environ.setdefault("ADMIN_PASSWORD", "AdminPassword123")


class _BootstrapMongoClient:
    def __init__(self, *_args, **_kwargs):
        pass

    def __getitem__(self, _name):
        return object()


motor_package = types.ModuleType("motor")
motor_asyncio = types.ModuleType("motor.motor_asyncio")
motor_asyncio.AsyncIOMotorClient = _BootstrapMongoClient
motor_package.motor_asyncio = motor_asyncio
sys.modules.setdefault("motor", motor_package)
sys.modules.setdefault("motor.motor_asyncio", motor_asyncio)

resend_module = types.ModuleType("resend")
resend_module.api_key = ""
resend_module.Emails = types.SimpleNamespace(send=lambda _params: {"id": "test"})
sys.modules.setdefault("resend", resend_module)

import server  # noqa: E402


class FakeCollection:
    def __init__(self, items=None):
        self.items = [dict(item) for item in (items or [])]

    @staticmethod
    def _matches(item, query):
        for key, expected in query.items():
            if key == "$or":
                if not any(FakeCollection._matches(item, clause) for clause in expected):
                    return False
                continue
            actual = item.get(key)
            if isinstance(expected, dict) and "$in" in expected:
                actual_values = actual if isinstance(actual, list) else [actual]
                if not any(value in expected["$in"] for value in actual_values):
                    return False
            elif isinstance(actual, list):
                if expected not in actual:
                    return False
            elif actual != expected:
                return False
        return True

    @staticmethod
    def _project(item, projection):
        result = dict(item)
        if projection:
            for key, include in projection.items():
                if not include:
                    result.pop(key, None)
        return result

    async def find_one(self, query, projection=None):
        for item in self.items:
            if self._matches(item, query):
                return self._project(item, projection)
        return None

    async def insert_one(self, item):
        self.items.append(dict(item))
        return types.SimpleNamespace(inserted_id=item.get("id"))

    def find(self, query, projection=None):
        matched = [self._project(item, projection) for item in self.items if self._matches(item, query)]

        class _Cursor:
            def __init__(self, values):
                self.values = values

            def sort(self, *_args):
                return self

            def limit(self, _value):
                return self

            async def to_list(self, limit):
                return self.values[:limit]

        return _Cursor(matched)

    async def distinct(self, field, query):
        values = {item.get(field) for item in self.items if self._matches(item, query)}
        values.discard(None)
        return list(values)


class FakeDatabase:
    def __init__(self, users, orders=None):
        self.users = FakeCollection(users)
        self.orders = FakeCollection(orders or [])
        self.admin_notification_log = FakeCollection()
        self.notifications = FakeCollection()
        self.audit_events = FakeCollection()


def bearer(token):
    return {"Authorization": f"Bearer {token}"}


async def login(api, email, password):
    response = await api.post("/api/auth/admin/login", json={"email": email, "password": password})
    assert response.status_code == 200, response.text
    return response.json()["token"]


def build_users():
    admin = {
        "id": "admin-1", "name": "Notify Admin", "email": "admin@niuva.com",
        "password_hash": server.hash_password("AdminPassword123"),
        "phone": "", "company": "Niuva", "roles": ["commercial_finance"],
        "status": "active", "access_state": "approved", "created_at": server.now_iso(),
    }
    warehouse = {
        "id": "warehouse-1", "name": "Warehouse Staff", "email": "warehouse@niuva.com",
        "password_hash": server.hash_password("WarehousePassword123"),
        "phone": "", "company": "Niuva", "roles": ["operations"],
        "status": "active", "access_state": "approved", "created_at": server.now_iso(),
    }
    customer_a = {
        "id": "customer-a", "name": "Customer A", "email": "customer-a@example.com",
        "password_hash": server.hash_password("CustomerAPassword123"),
        "phone": "", "company": "", "role": "client", "created_at": server.now_iso(),
    }
    customer_b = {
        "id": "customer-b", "name": "Customer B", "email": "customer-b@example.com",
        "password_hash": server.hash_password("CustomerBPassword123"),
        "phone": "", "company": "", "role": "client", "created_at": server.now_iso(),
    }
    return admin, warehouse, customer_a, customer_b


async def run_admin_notifications_matrix():
    admin, warehouse, customer_a, customer_b = build_users()
    server.db = FakeDatabase(
        [admin, warehouse, customer_a, customer_b],
        orders=[
            {"id": "order-1", "user_id": customer_a["id"], "status": "in_process"},
            {"id": "order-2", "user_id": customer_b["id"], "status": "completed"},
        ],
    )
    server._rate_buckets.clear()

    transport = httpx.ASGITransport(app=server.app)
    async with httpx.AsyncClient(transport=transport, base_url="http://testserver") as api:
        admin_token = await login(api, admin["email"], "AdminPassword123")
        warehouse_token = await login(api, warehouse["email"], "WarehousePassword123")

        forbidden = await api.post(
            "/api/admin/notifications",
            json={"target": "user", "user_id": customer_a["id"], "subject": "Hi", "message": "Hello there"},
            headers=bearer(warehouse_token),
        )
        assert forbidden.status_code == 403

        to_user = await api.post(
            "/api/admin/notifications",
            json={"target": "user", "user_id": customer_a["id"], "subject": "Update pesanan", "message": "Pesanan Anda diperbarui."},
            headers=bearer(admin_token),
        )
        assert to_user.status_code == 200
        assert to_user.json()["recipient_count"] == 1

        missing_user = await api.post(
            "/api/admin/notifications",
            json={"target": "user", "user_id": "no-such-user", "subject": "Halo", "message": "Pesan uji"},
            headers=bearer(admin_token),
        )
        assert missing_user.status_code == 404

        to_segment = await api.post(
            "/api/admin/notifications",
            json={"target": "segment", "segment": "active_orders", "subject": "Info produksi", "message": "Produksi berjalan normal."},
            headers=bearer(admin_token),
        )
        assert to_segment.status_code == 200
        assert to_segment.json()["recipient_count"] == 1  # only customer_a has an active-status order

        to_broadcast = await api.post(
            "/api/admin/notifications",
            json={"target": "broadcast", "subject": "Pengumuman", "message": "Libur produksi minggu ini."},
            headers=bearer(admin_token),
        )
        assert to_broadcast.status_code == 200
        assert to_broadcast.json()["recipient_count"] == 2

        history = await api.get("/api/admin/notifications/sent", headers=bearer(admin_token))
        assert history.status_code == 200
        assert len(history.json()) == 3

        history_forbidden = await api.get("/api/admin/notifications/sent", headers=bearer(warehouse_token))
        assert history_forbidden.status_code == 403

        # Every successful send must also land in the shared audit_events log.
        sent_audit_events = [event for event in server.db.audit_events.items if event["action"] == "notifications.sent"]
        assert len(sent_audit_events) == 3
        assert sent_audit_events[-1]["after"]["target"] == "broadcast"
        assert sent_audit_events[-1]["after"]["recipient_count"] == 2


def test_admin_notifications_permission_targets_and_history():
    import asyncio
    asyncio.run(run_admin_notifications_matrix())

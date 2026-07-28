import os
import sys
import types
from datetime import datetime, timezone
from pathlib import Path

import httpx

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URL", "mongodb://notifications-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_notifications_test")
os.environ.setdefault("JWT_SECRET", "notifications-test-secret-at-least-32-characters")
os.environ.setdefault("ADMIN_EMAIL", "admin@niuva.com")
os.environ.setdefault("ADMIN_PASSWORD", "AdminPassword123")
os.environ.setdefault("PUBLIC_SITE_URL", "https://testserver")
os.environ.setdefault(
    "AUTH_SESSION_CSRF_KEY", "notifications-test-csrf-key-at-least-32-bytes"
)


resend_module = types.ModuleType("resend")
resend_module.api_key = ""
resend_module.Emails = types.SimpleNamespace(send=lambda _params: {"id": "test"})
sys.modules.setdefault("resend", resend_module)

import server  # noqa: E402

from tests.auth_support import AuthCollection  # noqa: E402

ORIGIN = {"Origin": "https://testserver"}


class FakeAdminSessionModule:
    def __init__(self):
        self.counter = 0
        self.sessions = {}

    async def create_admin_session(self, user, remember_me, _request_context):
        self.counter += 1
        now = datetime.now(timezone.utc)
        grant = types.SimpleNamespace(
            session_id=f"session-{self.counter}",
            user_id=user["id"],
            access_secret=f"access-{self.counter}",
            session_secret=f"session-secret-{self.counter}",
            csrf_token=f"csrf-{self.counter}",
            access_expires_at=now,
            idle_expires_at=now,
            absolute_expires_at=now,
            remember_me=remember_me,
        )
        self.sessions[grant.access_secret] = grant
        return grant

    async def authenticate_admin_session(self, request_context):
        grant = self.sessions.get(request_context.get("access_secret"))
        if not grant:
            raise server.SessionExpiredError()
        return types.SimpleNamespace(
            session_id=grant.session_id,
            user_id=grant.user_id,
            _csrf_token=grant.csrf_token,
        )

    def verify_csrf(self, session, candidate):
        if candidate != session._csrf_token:
            raise server.RequestVerificationError()


class AdminApi:
    def __init__(self, transport):
        self.api = httpx.AsyncClient(transport=transport, base_url="https://testserver")
        self.csrf = None

    async def login(self, email, password):
        response = await self.api.post(
            "/api/auth/admin/login",
            json={"email": email, "password": password},
            headers=ORIGIN,
        )
        assert response.status_code == 200, response.text
        self.csrf = response.json()["csrf_token"]

    async def request(self, method, path, **kwargs):
        headers = dict(kwargs.pop("headers", {}))
        if method.upper() not in {"GET", "HEAD", "OPTIONS"}:
            headers.update(ORIGIN)
            headers["X-CSRF-Token"] = self.csrf
        return await self.api.request(method, path, headers=headers, **kwargs)

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        await self.api.aclose()


class FakeCollection:
    def __init__(self, items=None):
        self.items = [dict(item) for item in (items or [])]

    @staticmethod
    def _matches(item, query):
        for key, expected in query.items():
            if key == "$or":
                if not any(
                    FakeCollection._matches(item, clause) for clause in expected
                ):
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

    async def find_one(self, query, projection=None, **_options):
        for item in self.items:
            if self._matches(item, query):
                return self._project(item, projection)
        return None

    async def insert_one(self, item, **_options):
        self.items.append(dict(item))
        return types.SimpleNamespace(inserted_id=item.get("id"))

    def find(self, query, projection=None):
        matched = [
            self._project(item, projection)
            for item in self.items
            if self._matches(item, query)
        ]

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
        for user in users:
            user.setdefault("role_policy_version", server.ROLE_POLICY_VERSION)
            user.setdefault("token_version", 0)
        self.users = FakeCollection(users)
        self.login_rate_limits = AuthCollection()
        self.public_rate_limits = AuthCollection()
        self.orders = FakeCollection(orders or [])
        self.admin_notification_log = FakeCollection()
        self.notifications = FakeCollection()
        self.notification_outbox = FakeCollection()
        self.audit_events = FakeCollection()
        self.admin_sessions = FakeCollection()


class PassthroughGuard:
    async def run(self, callback, **_options):
        return await callback(None)


def build_users():
    admin = {
        "id": "admin-1",
        "name": "Notify Admin",
        "email": "admin@niuva.com",
        "password_hash": server.hash_password("AdminPassword123"),
        "phone": "",
        "company": "Niuva",
        "roles": ["order_admin"],
        "status": "active",
        "access_state": "approved",
        "created_at": server.now_iso(),
    }
    warehouse = {
        "id": "warehouse-1",
        "name": "Warehouse Staff",
        "email": "warehouse@niuva.com",
        "password_hash": server.hash_password("WarehousePassword123"),
        "phone": "",
        "company": "Niuva",
        "roles": ["warehouse"],
        "status": "active",
        "access_state": "approved",
        "created_at": server.now_iso(),
    }
    customer_a = {
        "id": "customer-a",
        "name": "Customer A",
        "email": "customer-a@example.com",
        "password_hash": server.hash_password("CustomerAPassword123"),
        "phone": "",
        "company": "",
        "role": "client",
        "created_at": server.now_iso(),
    }
    customer_b = {
        "id": "customer-b",
        "name": "Customer B",
        "email": "customer-b@example.com",
        "password_hash": server.hash_password("CustomerBPassword123"),
        "phone": "",
        "company": "",
        "role": "client",
        "created_at": server.now_iso(),
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
    server.app.state.transaction_guard = PassthroughGuard()
    server.app.state.admin_session_module = FakeAdminSessionModule()

    transport = httpx.ASGITransport(app=server.app)
    async with (
        AdminApi(transport) as admin_api,
        AdminApi(transport) as warehouse_api,
    ):
        await admin_api.login(admin["email"], "AdminPassword123")
        await warehouse_api.login(warehouse["email"], "WarehousePassword123")

        forbidden = await warehouse_api.request(
            "POST",
            "/api/admin/notifications",
            json={
                "target": "user",
                "user_id": customer_a["id"],
                "subject": "Hi",
                "message": "Hello there",
            },
        )
        assert forbidden.status_code == 403

        to_user = await admin_api.request(
            "POST",
            "/api/admin/notifications",
            json={
                "target": "user",
                "user_id": customer_a["id"],
                "subject": "Update pesanan",
                "message": "Pesanan Anda diperbarui.",
            },
        )
        assert to_user.status_code == 200
        assert to_user.json()["recipient_count"] == 1

        missing_user = await admin_api.request(
            "POST",
            "/api/admin/notifications",
            json={
                "target": "user",
                "user_id": "no-such-user",
                "subject": "Halo",
                "message": "Pesan uji",
            },
        )
        assert missing_user.status_code == 404

        to_segment = await admin_api.request(
            "POST",
            "/api/admin/notifications",
            json={
                "target": "segment",
                "segment": "active_orders",
                "subject": "Info produksi",
                "message": "Produksi berjalan normal.",
            },
        )
        assert to_segment.status_code == 200
        assert (
            to_segment.json()["recipient_count"] == 1
        )  # only customer_a has an active-status order

        to_broadcast = await admin_api.request(
            "POST",
            "/api/admin/notifications",
            json={
                "target": "broadcast",
                "subject": "Pengumuman",
                "message": "Libur produksi minggu ini.",
            },
        )
        assert to_broadcast.status_code == 200
        assert to_broadcast.json()["recipient_count"] == 2

        history = await admin_api.request("GET", "/api/admin/notifications/sent")
        assert history.status_code == 200
        assert len(history.json()) == 3

        history_forbidden = await warehouse_api.request(
            "GET", "/api/admin/notifications/sent"
        )
        assert history_forbidden.status_code == 403

        # Every successful enqueue lands in the outbox and shared audit log.
        queued_audit_events = [
            event
            for event in server.db.audit_events.items
            if event["action"] == "notifications.queued"
        ]
        assert len(queued_audit_events) == 3
        assert len(server.db.notification_outbox.items) == 4
        assert queued_audit_events[-1]["after"]["target"] == "broadcast"
        assert queued_audit_events[-1]["after"]["recipient_count"] == 2


def test_admin_notifications_permission_targets_and_history():
    import asyncio

    asyncio.run(run_admin_notifications_matrix())


def test_operational_email_is_persisted_for_the_delivery_worker():
    async def scenario():
        server.db = FakeDatabase([])

        queued = await server.queue_operational_email(
            notification_id="inquiry:inquiry-1",
            recipient="operations@example.com",
            subject="Inquiry baru",
            title="Inquiry Proyek Baru",
            body_html="<p>Brief aman</p>",
        )

        assert queued["status"] == "pending"
        assert queued["attempts"] == 0
        assert queued["notification_id"] == "inquiry:inquiry-1"
        assert queued["recipient"] == "operations@example.com"
        assert queued["payload"]["body_html"] == "<p>Brief aman</p>"
        assert len(server.db.notification_outbox.items) == 1

    import asyncio

    asyncio.run(scenario())

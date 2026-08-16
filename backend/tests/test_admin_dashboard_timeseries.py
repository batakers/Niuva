import os
import sys
import types
from datetime import datetime, timezone
from pathlib import Path

import httpx

BACKEND_DIR = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_DIR))

os.environ.setdefault("MONGO_URL", "mongodb://dashboard-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_dashboard_test")
os.environ.setdefault("JWT_SECRET", "dashboard-test-secret-at-least-32-characters")
os.environ.setdefault("ADMIN_EMAIL", "admin@niuva.com")
os.environ.setdefault("ADMIN_PASSWORD", "AdminPassword123")
os.environ.setdefault("PUBLIC_SITE_URL", "https://testserver")
os.environ.setdefault(
    "AUTH_SESSION_CSRF_KEY", "dashboard-test-csrf-key-at-least-32-bytes"
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
            actual = item.get(key)
            if isinstance(expected, dict):
                if "$gte" in expected and not (
                    actual is not None and actual >= expected["$gte"]
                ):
                    return False
                if "$lte" in expected and not (
                    actual is not None and actual <= expected["$lte"]
                ):
                    return False
                if "$in" in expected:
                    actual_values = actual if isinstance(actual, list) else [actual]
                    if not any(value in expected["$in"] for value in actual_values):
                        return False
                continue
            if isinstance(actual, list):
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

    async def count_documents(self, query):
        return sum(1 for item in self.items if self._matches(item, query))


class FakeDatabase:
    def __init__(self, users, orders=None, stock_movements=None):
        for user in users:
            user.setdefault("role_policy_version", server.ROLE_POLICY_VERSION)
            user.setdefault("token_version", 0)
        self.users = FakeCollection(users)
        self.login_rate_limits = AuthCollection()
        self.orders = FakeCollection(orders or [])
        self.stock_movements = FakeCollection(stock_movements or [])
        self.notifications = FakeCollection()
        self.admin_sessions = FakeCollection()


def build_users():
    operations = {
        "id": "ops-1",
        "name": "Operations",
        "email": "operations@niuva.com",
        "password_hash": server.hash_password("OperationsPassword123"),
        "phone": "",
        "company": "Niuva",
        "roles": ["warehouse"],
        "status": "active",
        "access_state": "approved",
        "created_at": server.now_iso(),
    }
    commercial = {
        "id": "commercial-1",
        "name": "Commercial",
        "email": "commercial@niuva.com",
        "password_hash": server.hash_password("CommercialPassword123"),
        "phone": "",
        "company": "Niuva",
        "roles": ["finance"],
        "status": "active",
        "access_state": "approved",
        "created_at": server.now_iso(),
    }
    return operations, commercial


async def run_timeseries_role_based_series():
    operations, commercial = build_users()
    orders = [
        {
            "id": "order-1",
            "created_at": "2026-07-01T10:00:00+00:00",
            "status": "completed",
            "payment": {"verified": True, "verified_at": "2026-07-01T12:00:00+00:00"},
            "estimate": {"amount": 500000},
        },
        {
            "id": "order-2",
            "created_at": "2026-07-01T14:00:00+00:00",
            "status": "in_process",
            "payment": {"verified": False},
            "estimate": {"amount": 300000},
        },
        {
            "id": "order-3",
            "created_at": "2026-07-02T09:00:00+00:00",
            "status": "pending_estimate",
        },
    ]
    stock_movements = [
        {
            "id": "mv-1",
            "created_at": "2026-07-01T08:00:00+00:00",
            "movement_type": "receive",
            "deltas": {"on_hand": "10"},
        },
        {
            "id": "mv-2",
            "created_at": "2026-07-01T09:00:00+00:00",
            "movement_type": "consume",
            "deltas": {"on_hand": "-4"},
        },
    ]
    server.db = FakeDatabase(
        [operations, commercial], orders=orders, stock_movements=stock_movements
    )
    server.app.state.admin_session_module = FakeAdminSessionModule()

    transport = httpx.ASGITransport(app=server.app)
    async with (
        AdminApi(transport) as ops_api,
        AdminApi(transport) as commercial_api,
        httpx.AsyncClient(
            transport=transport, base_url="https://testserver"
        ) as anonymous_api,
    ):
        await ops_api.login(operations["email"], "OperationsPassword123")
        await commercial_api.login(commercial["email"], "CommercialPassword123")

        ops_response = await ops_api.request(
            "GET",
            "/api/admin/stats/timeseries?date_from=2026-07-01&date_to=2026-07-02",
        )
        assert ops_response.status_code == 200
        ops_series = ops_response.json()["series"]

        # Operations sees production/stock trends (DEC-OPS-001: role-appropriate
        # dashboards, not identical views for every role).
        assert "stock_movements" in ops_series
        day_one = next(
            row for row in ops_series["orders_by_status"] if row["date"] == "2026-07-01"
        )
        assert day_one["completed"] == 1
        assert day_one["in_process"] == 1
        day_one_stock = next(
            row for row in ops_series["stock_movements"] if row["date"] == "2026-07-01"
        )
        # Signed on-hand effect, not a count: +10 received and -4 consumed.
        assert day_one_stock["signed_quantity"] == "6"
        assert day_one_stock["movements"] == 2

        commercial_response = await commercial_api.request(
            "GET",
            "/api/admin/stats/timeseries?date_from=2026-07-01&date_to=2026-07-02",
        )
        assert commercial_response.status_code == 200
        commercial_series = commercial_response.json()["series"]

        # Revenue is withheld from every reader, payments.read included, until an
        # authoritative Payment aggregate exists. Serving it and hiding it in the
        # client would still put the figure on the wire.
        assert "stock_movements" not in commercial_series
        for series in (ops_series, commercial_series):
            assert series["revenue"] == {
                "available": False,
                "reason": "authoritative_payment_aggregate_unavailable",
            }

        unauthenticated = await anonymous_api.get("/api/admin/stats/timeseries")
        assert unauthenticated.status_code == 401

        bad_date = await ops_api.request(
            "GET",
            "/api/admin/stats/timeseries?date_from=not-a-date",
        )
        assert bad_date.status_code == 400


def test_dashboard_timeseries_is_role_aware_and_uses_real_data():
    import asyncio

    asyncio.run(run_timeseries_role_based_series())

import os
import re
import uuid

import pytest

os.environ.setdefault("NIUVA_TEST_BEARER_AUTH", "true")
os.environ.setdefault("AUTH_COOKIE_SECURE", "false")
os.environ["PUBLIC_SITE_URL"] = "https://testserver"
os.environ["CORS_ORIGINS"] = "https://testserver"
os.environ["AUTH_COOKIE_DOMAIN"] = ""

# Bootstrap-style suites (test_auth_security, test_identity_foundation, ...)
# register a stub motor module through sys.modules.setdefault so importing
# server never opens a real client. setdefault only wins when motor is absent,
# and the stub is never torn down, so an xdist worker that imports one of those
# suites first would resolve AsyncIOMotorClient to the stub for the real
# replica-set tests. Importing the real driver here — before any test module is
# collected — keeps those setdefault calls as no-ops and leaves the stubs
# scoped to the suites that build them.
import motor.motor_asyncio  # noqa: F401, E402


@pytest.fixture
def transaction_database_name(request):
    worker = os.environ.get("PYTEST_XDIST_WORKER", "gw0")
    safe_worker = re.sub(r"[^a-zA-Z0-9_]", "_", worker)[:8]
    safe_node = re.sub(r"[^a-zA-Z0-9_]", "_", request.node.name)[:10]
    return f"niuva_tx_{safe_worker}_{safe_node}_{uuid.uuid4().hex}"

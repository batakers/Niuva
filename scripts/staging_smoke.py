"""Post-deploy smoke checks for a running Niuva deployment.

Not a test suite. This answers one question after a deploy: is anything that
must never be true, true right now?

It runs unauthenticated on purpose. Every check here is about a boundary that
holds for a stranger, which is the reader most likely to find it broken.

Usage:
    python scripts/staging_smoke.py --base-url "$NIUVA_STAGING_API_ORIGIN"
    # PowerShell: python scripts/staging_smoke.py --base-url $env:NIUVA_STAGING_API_ORIGIN

Exit code 0 means every check passed. Non-zero means stop the rollout.
"""

import argparse
import json
import sys
import urllib.error
import urllib.request
from urllib.parse import urlsplit

TIMEOUT = 15
LOCAL_HOSTS = frozenset({"localhost", "127.0.0.1", "::1"})
PLACEHOLDER_HOSTS = frozenset(
    {"example", "invalid", "test", "example.com", "example.org", "example.net"}
)
PLACEHOLDER_SUFFIXES = (
    ".example",
    ".invalid",
    ".test",
    ".example.com",
    ".example.org",
    ".example.net",
)
EXPECTED_CAPABILITIES = {
    "retail_discovery": "active",
    "retail_create": "inactive",
    "legacy_order_create": "inactive",
    "checkout": "inactive",
    "payment": "inactive",
    "production_upload": "inactive",
    "organization_portal": "inactive",
}


def validate_origin(value, *, allow_http_local=False):
    """Validate and normalize a credential-free deployment origin."""
    if not isinstance(value, str) or not value or value.strip() != value:
        raise ValueError(
            "base URL must be a non-empty origin without surrounding whitespace"
        )

    try:
        parsed = urlsplit(value)
        hostname = parsed.hostname
        parsed.port  # Force malformed-port validation before the request.
    except ValueError as exc:
        raise ValueError("base URL is not a valid origin") from exc

    if not hostname or parsed.username or parsed.password:
        raise ValueError(
            "base URL must not contain credentials and must include a host"
        )
    if parsed.path not in ("", "/") or parsed.query or parsed.fragment:
        raise ValueError(
            "base URL must be an origin without a path, query, or fragment"
        )

    hostname = hostname.lower()
    is_local_http = (
        allow_http_local and parsed.scheme == "http" and hostname in LOCAL_HOSTS
    )
    if parsed.scheme != "https" and not is_local_http:
        raise ValueError(
            "base URL must use HTTPS; HTTP is allowed only for explicit local checks"
        )
    if hostname in LOCAL_HOSTS and not is_local_http:
        raise ValueError("local hosts are not valid external staging targets")
    if hostname in PLACEHOLDER_HOSTS or hostname.endswith(PLACEHOLDER_SUFFIXES):
        raise ValueError(
            "placeholder/test hosts are not valid external staging targets"
        )

    return f"{parsed.scheme}://{parsed.netloc}"


class NoRedirectHandler(urllib.request.HTTPRedirectHandler):
    """Treat an origin redirect as a failed deployment contract."""

    def redirect_request(self, request, file, code, msg, headers, newurl):
        raise urllib.error.HTTPError(
            request.full_url,
            code,
            "redirects are not accepted by the staging smoke check",
            headers,
            file,
        )


URL_OPENER = urllib.request.build_opener(NoRedirectHandler())


class Result:
    def __init__(self):
        self.checks = []

    def record(self, name, passed, detail=""):
        self.checks.append({"check": name, "passed": bool(passed), "detail": detail})
        return passed

    @property
    def failed(self):
        return [item for item in self.checks if not item["passed"]]


def fetch(base_url, path, *, method="GET"):
    """Return (status, body). A transport failure is a status of 0."""
    request = urllib.request.Request(
        f"{base_url.rstrip('/')}{path}",
        headers={"Accept": "application/json"},
        method=method,
    )
    try:
        with URL_OPENER.open(request, timeout=TIMEOUT) as response:
            return response.status, response.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        return exc.code, exc.read().decode("utf-8", "replace")
    except Exception as exc:  # noqa: BLE001 - any failure to reach is a failure
        return 0, str(exc)


def parse(body):
    try:
        return json.loads(body)
    except ValueError:
        return None


def check_readiness(base_url, result):
    status, body = fetch(base_url, "/api/health/ready")
    payload = parse(body) or {}
    result.record(
        "readiness responds",
        status == 200,
        f"status={status}",
    )
    result.record(
        "readiness payload is a JSON object",
        isinstance(payload, dict),
        "object" if isinstance(payload, dict) else "missing or invalid JSON",
    )
    result.record(
        "readiness reports ready",
        isinstance(payload, dict) and payload.get("status") == "ready",
        f"status={payload.get('status') if isinstance(payload, dict) else None}",
    )
    result.record(
        "database readiness is ready",
        isinstance(payload, dict) and payload.get("database") == "ready",
        f"database={payload.get('database') if isinstance(payload, dict) else None}",
    )
    schema = payload.get("schema") if isinstance(payload, dict) else None
    result.record(
        "schema readiness is ready",
        isinstance(schema, dict) and schema.get("ready") is True,
        f"schema_ready={schema.get('ready') if isinstance(schema, dict) else None}",
    )
    # Transactions carry every cross-collection guarantee in the system. A
    # deployment without them is one that fails closed on most writes.
    result.record(
        "transaction capability is ready",
        isinstance(payload, dict) and payload.get("transaction_mutations") == "ready",
        f"transaction_mutations={payload.get('transaction_mutations') if isinstance(payload, dict) else None}",
    )


def check_admin_requires_auth(base_url, result):
    """Every admin surface must refuse a stranger."""
    for path in (
        "/api/admin/inquiries",
        "/api/admin/b2b/quotes",
        "/api/admin/b2b/projects",
        "/api/admin/b2b/work-orders",
        "/api/admin/retail-orders",
        "/api/admin/portfolio",
        "/api/admin/settings",
        "/api/admin/users",
        "/api/admin/stats",
    ):
        status, _ = fetch(base_url, path)
        # 404 is not a pass: it usually means the route is missing from this
        # build, which is its own reason to stop.
        result.record(
            f"unauthenticated is refused at {path}",
            status in (401, 403),
            f"status={status}",
        )


def check_error_contract(base_url, result):
    """A representative unauthenticated failure must use the stable envelope."""
    status, body = fetch(base_url, "/api/orders", method="POST")
    payload = parse(body)
    error = payload.get("error") if isinstance(payload, dict) else None
    request_id = payload.get("request_id") if isinstance(payload, dict) else None
    result.record(
        "unauthenticated customer route returns 401",
        status == 401,
        f"status={status}",
    )
    result.record(
        "error response uses the frozen envelope",
        isinstance(payload, dict)
        and set(payload) == {"detail", "error", "request_id"}
        and isinstance(error, dict)
        and isinstance(request_id, str)
        and bool(request_id),
        "keys=detail,error,request_id" if isinstance(payload, dict) else "invalid JSON",
    )
    result.record(
        "unauthenticated error code is stable",
        isinstance(error, dict) and error.get("code") == "http_401",
        f"code={error.get('code') if isinstance(error, dict) else None}",
    )


def check_public_boundaries(base_url, result):
    """What the public reads must carry nothing internal."""
    status, body = fetch(base_url, "/api/settings")
    payload = parse(body) or {}
    result.record(
        "public settings responds with an object",
        status == 200 and isinstance(payload, dict),
        f"status={status}",
    )
    for forbidden in ("bank_name", "account_number", "account_holder"):
        result.record(
            f"public settings withholds {forbidden}",
            forbidden not in payload,
            "present" if forbidden in payload else "",
        )

    status, body = fetch(base_url, "/api/portfolio")
    entries = parse(body) or []
    result.record(
        "public portfolio responds with a list",
        status == 200 and isinstance(entries, list),
        f"status={status}",
    )
    leaked = sorted(
        {
            key
            for entry in entries
            if isinstance(entry, dict)
            for key in entry
            if key
            in {
                "status",
                "version",
                "history",
                "versions",
                "client",
                "source_project_id",
                "internal_notes",
            }
        }
    )
    result.record(
        "public portfolio withholds internal fields",
        status == 200 and isinstance(entries, list) and not leaked,
        f"leaked={leaked}" if leaked else "",
    )


def check_capability_boundary(base_url, result):
    """The public capability map keeps Wave 2 surfaces inactive."""
    status, body = fetch(base_url, "/api/capabilities")
    payload = parse(body)
    result.record(
        "capability contract responds with an object",
        status == 200 and isinstance(payload, dict),
        f"status={status}",
    )
    result.record(
        "capability contract has no unapproved keys",
        isinstance(payload, dict) and set(payload) == set(EXPECTED_CAPABILITIES),
        f"keys={sorted(payload) if isinstance(payload, dict) else None}",
    )
    for capability, expected in EXPECTED_CAPABILITIES.items():
        result.record(
            f"capability {capability} remains {expected}",
            isinstance(payload, dict) and payload.get(capability) == expected,
            f"value={payload.get(capability) if isinstance(payload, dict) else None}",
        )


def check_revenue_withheld(base_url, result):
    """Revenue must not be published before an authoritative Payment aggregate."""
    status, _ = fetch(base_url, "/api/admin/stats")
    result.record(
        "dashboard stats are not public",
        status in (401, 403),
        f"status={status}",
    )


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--base-url", required=True)
    parser.add_argument("--json", action="store_true", help="machine-readable output")
    parser.add_argument(
        "--allow-http-local",
        action="store_true",
        help="allow HTTP only for localhost/loopback development checks",
    )
    args = parser.parse_args()

    try:
        base_url = validate_origin(
            args.base_url,
            allow_http_local=args.allow_http_local,
        )
    except ValueError as exc:
        parser.error(str(exc))

    result = Result()
    check_readiness(base_url, result)
    check_admin_requires_auth(base_url, result)
    check_error_contract(base_url, result)
    check_public_boundaries(base_url, result)
    check_capability_boundary(base_url, result)
    check_revenue_withheld(base_url, result)

    if args.json:
        print(
            json.dumps({"checks": result.checks, "passed": not result.failed}, indent=2)
        )
    else:
        for item in result.checks:
            mark = "PASS" if item["passed"] else "FAIL"
            suffix = f"  ({item['detail']})" if item["detail"] else ""
            print(f"[{mark}] {item['check']}{suffix}")
        print()
        print(f"{len(result.checks) - len(result.failed)}/{len(result.checks)} passed")

    return 1 if result.failed else 0


if __name__ == "__main__":
    sys.exit(main())

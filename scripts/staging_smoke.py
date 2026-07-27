"""Post-deploy smoke checks for a running Niuva deployment.

Not a test suite. This answers one question after a deploy: is anything that
must never be true, true right now?

It runs unauthenticated on purpose. Every check here is about a boundary that
holds for a stranger, which is the reader most likely to find it broken.

Usage:
    python scripts/staging_smoke.py --base-url https://staging.example

Exit code 0 means every check passed. Non-zero means stop the rollout.
"""

import argparse
import json
import sys
import urllib.error
import urllib.request

TIMEOUT = 15


class Result:
    def __init__(self):
        self.checks = []

    def record(self, name, passed, detail=""):
        self.checks.append({"check": name, "passed": bool(passed), "detail": detail})
        return passed

    @property
    def failed(self):
        return [item for item in self.checks if not item["passed"]]


def fetch(base_url, path):
    """Return (status, body). A transport failure is a status of 0."""
    request = urllib.request.Request(
        f"{base_url.rstrip('/')}{path}",
        headers={"Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=TIMEOUT) as response:
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
    # Transactions carry every cross-collection guarantee in the system. A
    # deployment without them is one that fails closed on most writes.
    result.record(
        "transaction capability is ready",
        payload.get("transaction_mutations") == "ready",
        f"transaction_mutations={payload.get('transaction_mutations')}",
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


def check_public_boundaries(base_url, result):
    """What the public reads must carry nothing internal."""
    status, body = fetch(base_url, "/api/settings")
    payload = parse(body) or {}
    result.record("public settings responds", status == 200, f"status={status}")
    for forbidden in ("bank_name", "account_number", "account_holder"):
        result.record(
            f"public settings withholds {forbidden}",
            forbidden not in payload,
            "present" if forbidden in payload else "",
        )

    status, body = fetch(base_url, "/api/portfolio")
    entries = parse(body) or []
    result.record("public portfolio responds", status == 200, f"status={status}")
    if isinstance(entries, list):
        leaked = sorted(
            {
                key
                for entry in entries
                for key in entry
                if key in {"status", "version", "history", "versions", "client",
                           "source_project_id", "internal_notes"}
            }
        )
        result.record(
            "public portfolio withholds internal fields",
            not leaked,
            f"leaked={leaked}" if leaked else "",
        )


def check_disabled_surfaces(base_url, result):
    """Surfaces held closed on purpose must still be closed."""
    status, body = fetch(base_url, "/api/orders/smoke-probe/payment-proof")
    payload = parse(body) or {}
    detail = payload.get("detail") if isinstance(payload, dict) else None
    code = detail.get("code") if isinstance(detail, dict) else None
    # 410 with its reason, not 404: a missing route would mean the lockdown
    # was removed rather than enforced.
    result.record(
        "legacy payment proof upload stays disabled",
        status == 410 and code == "legacy_manual_transfer_disabled",
        f"status={status} code={code}",
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
    args = parser.parse_args()

    result = Result()
    check_readiness(args.base_url, result)
    check_admin_requires_auth(args.base_url, result)
    check_public_boundaries(args.base_url, result)
    check_disabled_surfaces(args.base_url, result)
    check_revenue_withheld(args.base_url, result)

    if args.json:
        print(json.dumps({"checks": result.checks, "passed": not result.failed}, indent=2))
    else:
        for item in result.checks:
            mark = "PASS" if item["passed"] else "FAIL"
            suffix = f"  ({item['detail']})" if item["detail"] else ""
            print(f"[{mark}] {item['check']}{suffix}")
        print()
        print(
            f"{len(result.checks) - len(result.failed)}/{len(result.checks)} passed"
        )

    return 1 if result.failed else 0


if __name__ == "__main__":
    sys.exit(main())

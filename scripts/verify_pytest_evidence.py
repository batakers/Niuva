#!/usr/bin/env python3
"""Validate pytest JUnit skip policy and emit provenance-safe evidence."""

from __future__ import annotations

import argparse
import hashlib
import json
import platform
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

REAL_TRANSACTION_SKIP_MODULES = {
    "tests.test_auth_recovery_transaction_integration",
    "tests.test_b2b_transaction_integration",
    "tests.test_commercial_transaction_integration",
    "tests.test_content_transaction_integration",
    "tests.test_inventory_transactions",
    "tests.test_migration_backup_restore",
    "tests.test_portfolio_transaction_integration",
    "tests.test_transaction_integration",
    "tests.test_work_order_allocation_integration",
}
REAL_TRANSACTION_SKIP_TESTS = {
    (
        "tests.test_auth_recovery_migration",
        "test_real_replica_set_apply_idempotency_and_rollback",
    ),
    (
        "tests.test_auth_session_migration",
        "test_real_replica_set_apply_cleanup_and_rollback",
    ),
    (
        "tests.test_auth_session_transaction_integration",
        "test_real_replica_set_rotates_once_and_revokes_replayed_family",
    ),
    (
        "tests.test_customer_session_integration",
        "test_real_mongo_customer_rotation_replay_and_logout_fallback",
    ),
    (
        "tests.test_granular_role_migration",
        "test_real_replica_set_applies_and_rolls_back_granular_roles_atomically",
    ),
    (
        "tests.test_identity_access_migration",
        "test_real_replica_set_migrates_user_and_audit_in_the_same_transaction",
    ),
}


def _totals(root: ET.Element) -> dict[str, int]:
    cases = list(root.iter("testcase"))
    return {
        "tests": len(cases),
        "failures": sum(case.find("failure") is not None for case in cases),
        "errors": sum(case.find("error") is not None for case in cases),
        "skipped": sum(case.find("skipped") is not None for case in cases),
    }


def _unexpected_skips(root: ET.Element, profile: str) -> list[str]:
    unexpected = []
    for case in root.iter("testcase"):
        if case.find("skipped") is None:
            continue
        identity = (case.get("classname", ""), case.get("name", ""))
        allowed = profile == "hermetic" and (
            (not identity[0] and identity[1] in REAL_TRANSACTION_SKIP_MODULES)
            or identity in REAL_TRANSACTION_SKIP_TESTS
        )
        if not allowed:
            unexpected.append("::".join(identity))
    return unexpected


def _git_sha() -> str:
    result = subprocess.run(
        ["git", "rev-parse", "HEAD"],
        check=True,
        capture_output=True,
        text=True,
    )
    return result.stdout.strip()


def _git_tree_clean() -> bool:
    result = subprocess.run(
        ["git", "status", "--porcelain"],
        check=True,
        capture_output=True,
        text=True,
    )
    return not result.stdout.strip()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--junit", required=True, type=Path)
    parser.add_argument(
        "--profile", required=True, choices=("hermetic", "transaction", "external")
    )
    parser.add_argument(
        "--command",
        required=True,
        help="Credential-free command label recorded in evidence",
    )
    parser.add_argument("--output", required=True, type=Path)
    args = parser.parse_args()

    raw = args.junit.read_bytes()
    root = ET.fromstring(raw)
    totals = _totals(root)
    unexpected = _unexpected_skips(root, args.profile)
    evidence = {
        "schema_version": 1,
        "profile": args.profile,
        "git_sha": _git_sha(),
        "git_tree_clean": _git_tree_clean(),
        "python": platform.python_version(),
        "platform": platform.platform(),
        "command": args.command,
        "junit_sha256": hashlib.sha256(raw).hexdigest(),
        "result": totals,
        "unexpected_skips": unexpected,
    }
    args.output.write_text(json.dumps(evidence, indent=2, sort_keys=True) + "\n")

    if totals["failures"] or totals["errors"]:
        print("JUnit contains failures or errors", file=sys.stderr)
        return 1
    if unexpected:
        print("Unexpected pytest skips: " + ", ".join(unexpected), file=sys.stderr)
        return 1
    print(json.dumps(evidence, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

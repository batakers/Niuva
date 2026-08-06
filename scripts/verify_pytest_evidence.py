#!/usr/bin/env python3
"""Validate pytest JUnit skip policy and emit provenance-safe evidence."""

from __future__ import annotations

import argparse
import hashlib
import json
import os
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
TRANSACTION_MODULES = {
    "tests.test_transaction_integration",
    "tests.test_commercial_transaction_integration",
    "tests.test_content_transaction_integration",
    "tests.test_portfolio_transaction_integration",
    "tests.test_b2b_transaction_integration",
    "tests.test_work_order_allocation_integration",
    "tests.test_inventory_transactions",
    "tests.test_identity_access_migration",
    "tests.test_granular_role_migration",
    "tests.test_auth_recovery_migration",
    "tests.test_auth_session_migration",
    "tests.test_auth_session_transaction_integration",
    "tests.test_customer_session_integration",
    "tests.test_auth_recovery_transaction_integration",
    "tests.test_migration_backup_restore",
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


def _observed_modules(root: ET.Element) -> set[str]:
    modules = set()
    for case in root.iter("testcase"):
        classname = case.get("classname", "")
        name = case.get("name", "")
        if classname:
            modules.add(classname)
        elif name.startswith("tests."):
            modules.add(name.split("::", 1)[0])
    return modules


def _expected_modules(profile: str) -> set[str]:
    if profile == "hermetic":
        return {
            f"tests.{path.stem}" for path in Path("backend/tests").glob("test_*.py")
        }
    if profile == "transaction":
        return TRANSACTION_MODULES
    return {"tests.external_smoke_test"}


def _git_sha() -> str:
    try:
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            check=True,
            capture_output=True,
            text=True,
            close_fds=False,
        )
        return result.stdout.strip()
    except OSError as exc:
        if os.name == "nt" and getattr(exc, "winerror", None) == 6:
            return _read_git_head()
        raise


def _git_tree_clean() -> bool:
    try:
        result = subprocess.run(
            ["git", "status", "--porcelain"],
            check=True,
            capture_output=True,
            text=True,
            close_fds=False,
        )
        return not result.stdout.strip()
    except OSError as exc:
        if os.name == "nt" and getattr(exc, "winerror", None) == 6:
            # Evidence must remain conservative when the host cannot expose
            # the status subprocess safely under test capture.
            return False
        raise


def _read_git_head() -> str:
    dot_git = Path(".git")
    if dot_git.is_file():
        marker, git_dir = dot_git.read_text(encoding="utf-8").strip().split(": ", 1)
        if marker != "gitdir":
            raise ValueError("unsupported .git file format")
        dot_git = Path(git_dir)
        if not dot_git.is_absolute():
            dot_git = Path(".git").parent / dot_git
    head = (dot_git / "HEAD").read_text(encoding="utf-8").strip()
    if head.startswith("ref: "):
        ref = head[5:]
        ref_path = dot_git / ref
        if ref_path.exists():
            return ref_path.read_text(encoding="utf-8").strip()
        for line in (dot_git / "packed-refs").read_text(encoding="utf-8").splitlines():
            if line and not line.startswith("#"):
                sha, packed_ref = line.split(" ", 1)
                if packed_ref == ref:
                    return sha
        raise ValueError("git HEAD ref is not available")
    return head


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
    parser.add_argument(
        "--expected-module",
        action="append",
        help="Override the profile module manifest; repeat for each required module",
    )
    args = parser.parse_args()

    raw = args.junit.read_bytes()
    root = ET.fromstring(raw)
    totals = _totals(root)
    unexpected = _unexpected_skips(root, args.profile)
    expected_modules = set(args.expected_module or _expected_modules(args.profile))
    observed_modules = _observed_modules(root)
    missing_modules = sorted(expected_modules - observed_modules)
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
        "expected_modules": sorted(expected_modules),
        "observed_modules": sorted(observed_modules),
        "missing_modules": missing_modules,
    }
    args.output.write_text(json.dumps(evidence, indent=2, sort_keys=True) + "\n")

    if totals["failures"] or totals["errors"]:
        print("JUnit contains failures or errors", file=sys.stderr)
        return 1
    if totals["tests"] == 0:
        print("JUnit contains zero tests", file=sys.stderr)
        return 1
    if unexpected:
        print("Unexpected pytest skips: " + ", ".join(unexpected), file=sys.stderr)
        return 1
    if missing_modules:
        print(
            "Missing expected pytest modules: " + ", ".join(missing_modules),
            file=sys.stderr,
        )
        return 1
    print(json.dumps(evidence, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

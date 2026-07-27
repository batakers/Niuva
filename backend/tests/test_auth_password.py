"""Gate G1 tests and redacted benchmark harness for the Argon2id candidate.

This module does not implement application password hashing. It verifies the
approved candidate dependency and produces environment-specific benchmark
evidence for the follow-up parameter acceptance required by AUTH-P1-03.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import platform
import time
from importlib import metadata

import bcrypt
import pytest
from argon2 import PasswordHasher, Type, extract_parameters
from argon2.exceptions import VerifyMismatchError
from auth_password import (
    AuthPassword,
    FilePasswordBlocklist,
    PasswordPolicyError,
    PasswordPolicyUnavailableError,
    PasswordWriteDisabledError,
    build_password_module,
)

ARGON2_MEMORY_COST_KIB = 19_456
ARGON2_TIME_COST = 2
ARGON2_PARALLELISM = 1
ARGON2_HASH_LENGTH = 32
ARGON2_SALT_LENGTH = 16

_BENCHMARK_FIXTURE = "Niuva Argon2 benchmark fixture — never a credential"


def build_candidate_hasher() -> PasswordHasher:
    """Build the exact G1 candidate without relying on library defaults."""

    return PasswordHasher(
        memory_cost=ARGON2_MEMORY_COST_KIB,
        time_cost=ARGON2_TIME_COST,
        parallelism=ARGON2_PARALLELISM,
        hash_len=ARGON2_HASH_LENGTH,
        salt_len=ARGON2_SALT_LENGTH,
        type=Type.ID,
    )


def _milliseconds(started_at: float) -> float:
    return (time.perf_counter() - started_at) * 1_000


def _nearest_rank(values: list[float], percentile: float) -> float:
    if not values:
        raise ValueError("at least one benchmark sample is required")
    ordered = sorted(values)
    rank = max(1, math.ceil(percentile * len(ordered)))
    return ordered[rank - 1]


def _summary(values: list[float]) -> dict[str, float]:
    return {
        "min": round(min(values), 3),
        "p50": round(_nearest_rank(values, 0.50), 3),
        "p95": round(_nearest_rank(values, 0.95), 3),
        "max": round(max(values), 3),
    }


def run_redacted_benchmark(*, samples: int = 7, warmups: int = 2) -> dict:
    """Return metrics without returning benchmark inputs or encoded hashes."""

    if samples < 1:
        raise ValueError("samples must be positive")
    if warmups < 0:
        raise ValueError("warmups cannot be negative")

    hasher = build_candidate_hasher()
    for _ in range(warmups):
        encoded = hasher.hash(_BENCHMARK_FIXTURE)
        assert hasher.verify(encoded, _BENCHMARK_FIXTURE) is True

    hash_durations: list[float] = []
    verify_durations: list[float] = []
    all_current = True

    for _ in range(samples):
        started_at = time.perf_counter()
        encoded = hasher.hash(_BENCHMARK_FIXTURE)
        hash_durations.append(_milliseconds(started_at))

        started_at = time.perf_counter()
        assert hasher.verify(encoded, _BENCHMARK_FIXTURE) is True
        verify_durations.append(_milliseconds(started_at))
        all_current = all_current and not hasher.check_needs_rehash(encoded)

    return {
        "schema_version": 1,
        "dependency": {
            "name": "argon2-cffi",
            "version": metadata.version("argon2-cffi"),
        },
        "runtime": {
            "python": platform.python_version(),
            "implementation": platform.python_implementation(),
            "machine": platform.machine(),
            "logical_cpus": os.cpu_count(),
        },
        "candidate": {
            "algorithm": "argon2id",
            "memory_cost_kib": ARGON2_MEMORY_COST_KIB,
            "time_cost": ARGON2_TIME_COST,
            "parallelism": ARGON2_PARALLELISM,
            "hash_length": ARGON2_HASH_LENGTH,
            "salt_length": ARGON2_SALT_LENGTH,
        },
        "sample_count": samples,
        "warmup_count": warmups,
        "hash_ms": _summary(hash_durations),
        "verify_ms": _summary(verify_durations),
        "all_samples_match_candidate": all_current,
    }


class _AllowingBlocklist:
    def contains(self, _candidate: str) -> bool:
        return False


def run_redacted_mixed_hash_timing(*, samples: int = 5, warmups: int = 1) -> dict:
    """Compare invalid verification work without exposing inputs or hashes."""

    if samples < 1 or warmups < 0:
        raise ValueError("invalid timing sample configuration")
    passwords = AuthPassword(
        blocklist=_AllowingBlocklist(),
        argon2_writes_enabled=True,
        argon2_hasher=build_candidate_hasher(),
    )
    valid_fixture = "Niuva mixed hash timing fixture 2026"
    invalid_fixture = "Niuva mixed hash timing invalid 2026"
    argon_hash = passwords.hash_new_password(valid_fixture)
    bcrypt_hash = bcrypt.hashpw(
        valid_fixture.encode("utf-8"),
        bcrypt.gensalt(rounds=12),
    ).decode()

    for _ in range(warmups):
        assert not passwords.verify_password(invalid_fixture, argon_hash).valid
        assert not passwords.verify_password(invalid_fixture, bcrypt_hash).valid

    durations = {"argon2id": [], "bcrypt": []}
    for _ in range(samples):
        for algorithm, encoded in (
            ("argon2id", argon_hash),
            ("bcrypt", bcrypt_hash),
        ):
            started_at = time.perf_counter()
            assert not passwords.verify_password(invalid_fixture, encoded).valid
            durations[algorithm].append(_milliseconds(started_at))

    summaries = {algorithm: _summary(values) for algorithm, values in durations.items()}
    p50_values = [summary["p50"] for summary in summaries.values()]
    p50_delta = abs(p50_values[0] - p50_values[1])
    p50_ratio = max(p50_values) / max(min(p50_values), 0.001)
    return {
        "schema_version": 1,
        "comparison": "invalid_known_account_verification",
        "sample_count": samples,
        "warmup_count": warmups,
        "algorithms": summaries,
        "p50_delta_ms": round(p50_delta, 3),
        "p50_ratio": round(p50_ratio, 3),
        "budget": {"max_p50_delta_ms": 150, "max_p50_ratio": 1.5},
        "within_local_comparison_budget": (p50_delta <= 150 and p50_ratio <= 1.5),
    }


def test_candidate_hasher_uses_approved_argon2id_minimum() -> None:
    hasher = build_candidate_hasher()
    encoded = hasher.hash(_BENCHMARK_FIXTURE)
    parameters = extract_parameters(encoded)

    assert parameters.type is Type.ID
    assert parameters.memory_cost == ARGON2_MEMORY_COST_KIB
    assert parameters.time_cost == ARGON2_TIME_COST
    assert parameters.parallelism == ARGON2_PARALLELISM
    assert parameters.hash_len == ARGON2_HASH_LENGTH
    assert parameters.salt_len == ARGON2_SALT_LENGTH
    assert hasher.check_needs_rehash(encoded) is False


def test_candidate_verification_rejects_mismatch() -> None:
    hasher = build_candidate_hasher()
    encoded = hasher.hash(_BENCHMARK_FIXTURE)

    assert hasher.verify(encoded, _BENCHMARK_FIXTURE) is True
    with pytest.raises(VerifyMismatchError):
        hasher.verify(encoded, _BENCHMARK_FIXTURE + " changed")


def test_legacy_bcrypt_fixture_remains_verifiable() -> None:
    encoded = bcrypt.hashpw(
        _BENCHMARK_FIXTURE.encode("utf-8"),
        bcrypt.gensalt(rounds=12),
    )

    assert bcrypt.checkpw(_BENCHMARK_FIXTURE.encode("utf-8"), encoded) is True
    assert bcrypt.checkpw(b"not-the-fixture", encoded) is False


def test_benchmark_report_is_redacted_and_machine_readable() -> None:
    report = run_redacted_benchmark(samples=1, warmups=0)
    serialized = json.dumps(report, sort_keys=True)

    assert report["candidate"]["algorithm"] == "argon2id"
    assert report["all_samples_match_candidate"] is True
    assert _BENCHMARK_FIXTURE not in serialized
    assert "$argon2" not in serialized
    assert "encoded_hash" not in serialized
    assert "raw_secret" not in serialized


def test_mixed_hash_invalid_verification_has_no_material_local_timing_split() -> None:
    report = run_redacted_mixed_hash_timing(samples=3, warmups=1)
    serialized = json.dumps(report, sort_keys=True)

    assert report["within_local_comparison_budget"] is True
    assert _BENCHMARK_FIXTURE not in serialized
    assert "$argon2" not in serialized
    assert "$2b$" not in serialized
    assert "encoded_hash" not in serialized


def test_public_policy_matches_the_approved_creation_contract(tmp_path) -> None:
    blocklist = tmp_path / "blocked.txt"
    blocklist.write_text("known compromised phrase\n", encoding="utf-8")
    passwords = build_password_module(
        blocklist_path=blocklist,
        argon2_writes_enabled=False,
    )

    assert passwords.public_policy() == {
        "min_code_points": 15,
        "max_code_points": 128,
        "max_utf8_bytes": 512,
        "spaces_allowed": True,
        "unicode_allowed": True,
        "composition_required": False,
        "blocklist_checked": True,
    }


@pytest.mark.parametrize(
    ("candidate", "expected_code"),
    [
        ("short password", "password_too_short"),
        ("x" * 129, "password_too_long"),
        ("😀" * 128, None),
    ],
)
def test_creation_policy_uses_code_points_and_utf8_byte_cap(
    tmp_path, candidate, expected_code
) -> None:
    blocklist = tmp_path / "blocked.txt"
    blocklist.write_text("known compromised phrase\n", encoding="utf-8")
    passwords = build_password_module(
        blocklist_path=blocklist,
        argon2_writes_enabled=True,
    )

    if expected_code is None:
        passwords.validate_new_password(candidate)
    else:
        with pytest.raises(PasswordPolicyError) as error:
            passwords.validate_new_password(candidate)
        assert error.value.code == expected_code

    if candidate == "😀" * 128:
        assert len(candidate) == 128
        assert len(candidate.encode("utf-8")) == 512


def test_creation_policy_rejects_more_than_512_utf8_bytes(tmp_path) -> None:
    blocklist = tmp_path / "blocked.txt"
    blocklist.write_text("known compromised phrase\n", encoding="utf-8")
    passwords = build_password_module(
        blocklist_path=blocklist,
        argon2_writes_enabled=True,
    )

    with pytest.raises(PasswordPolicyError) as error:
        passwords.validate_new_password(("😀" * 128) + "a")

    assert error.value.code == "password_too_long"


def test_blocklist_compares_the_whole_value_not_substrings(tmp_path) -> None:
    blocklist = tmp_path / "blocked.txt"
    blocklist.write_text("known compromised phrase\n", encoding="utf-8")
    passwords = build_password_module(
        blocklist_path=blocklist,
        argon2_writes_enabled=True,
    )

    with pytest.raises(PasswordPolicyError) as error:
        passwords.validate_new_password("KNOWN COMPROMISED PHRASE")
    assert error.value.code == "password_blocklisted"

    passwords.validate_new_password("prefix known compromised phrase suffix")


def test_context_terms_are_rejected_as_whole_password_values(tmp_path) -> None:
    blocklist = tmp_path / "blocked.txt"
    blocklist.write_text("known compromised phrase\n", encoding="utf-8")
    passwords = build_password_module(
        blocklist_path=blocklist,
        argon2_writes_enabled=True,
    )

    with pytest.raises(PasswordPolicyError) as error:
        passwords.validate_new_password(
            "administrator@niuva.com",
            context_terms=("administrator@niuva.com",),
        )
    assert error.value.code == "password_context_match"


def test_unavailable_blocklist_fails_creation_closed(tmp_path) -> None:
    passwords = build_password_module(
        blocklist_path=tmp_path / "missing.txt",
        argon2_writes_enabled=True,
    )

    with pytest.raises(PasswordPolicyUnavailableError) as error:
        passwords.validate_new_password("long enough unique password")

    assert error.value.code == "password_policy_unavailable"


def test_argon2_writes_stay_disabled_without_bcrypt_fallback(tmp_path) -> None:
    blocklist = tmp_path / "blocked.txt"
    blocklist.write_text("known compromised phrase\n", encoding="utf-8")
    passwords = build_password_module(
        blocklist_path=blocklist,
        argon2_writes_enabled=False,
    )

    with pytest.raises(PasswordWriteDisabledError) as error:
        passwords.hash_new_password("long enough unique password")

    assert error.value.code == "password_writes_disabled"


def test_enabled_new_hash_is_argon2id_and_verifies(tmp_path) -> None:
    blocklist = tmp_path / "blocked.txt"
    blocklist.write_text("known compromised phrase\n", encoding="utf-8")
    passwords = build_password_module(
        blocklist_path=blocklist,
        argon2_writes_enabled=True,
    )

    encoded = passwords.hash_new_password("long enough unique password")

    assert encoded.startswith("$argon2id$")
    assert passwords.verify_password("long enough unique password", encoded).valid
    assert not passwords.verify_password("wrong password value", encoded).valid


def test_legacy_bcrypt_verification_remains_available_when_writes_are_disabled(
    tmp_path,
) -> None:
    blocklist = tmp_path / "missing.txt"
    passwords = build_password_module(
        blocklist_path=blocklist,
        argon2_writes_enabled=False,
    )
    candidate = "legacy password fixture"
    encoded = bcrypt.hashpw(candidate.encode("utf-8"), bcrypt.gensalt()).decode()

    result = passwords.verify_password(candidate, encoded)

    assert result.valid is True
    assert result.algorithm == "bcrypt"
    assert result.needs_rehash is True


def test_malformed_and_oversized_login_values_fail_safely(tmp_path) -> None:
    passwords = build_password_module(
        blocklist_path=tmp_path / "missing.txt",
        argon2_writes_enabled=False,
    )

    assert not passwords.verify_password("candidate", "not-a-hash").valid
    assert not passwords.verify_password("😀" * 129, "$2b$12$invalid").valid


def test_file_blocklist_ignores_blank_and_comment_lines(tmp_path) -> None:
    path = tmp_path / "blocked.txt"
    path.write_text(
        "\n# fixture only\nKnown Blocked Password\n  leading spaces stay significant\n",
        encoding="utf-8",
    )
    blocklist = FilePasswordBlocklist(path)

    assert blocklist.contains("known blocked password") is True
    assert blocklist.contains("  leading spaces stay significant") is True
    assert blocklist.contains("leading spaces stay significant") is False
    assert blocklist.contains("a different password") is False


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Emit redacted Argon2id Gate G1 benchmark evidence."
    )
    parser.add_argument("--samples", type=int, default=7)
    parser.add_argument("--warmups", type=int, default=2)
    parser.add_argument("--mixed-hash-timing", action="store_true")
    args = parser.parse_args()
    report = run_redacted_benchmark(samples=args.samples, warmups=args.warmups)
    if args.mixed_hash_timing:
        report = run_redacted_mixed_hash_timing(
            samples=args.samples,
            warmups=args.warmups,
        )
    print(
        json.dumps(
            report,
            indent=2,
            sort_keys=True,
        )
    )


if __name__ == "__main__":
    main()

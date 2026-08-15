#!/usr/bin/env python3
"""Collect a reproducible, report-only backend quality baseline."""

from __future__ import annotations

import argparse
import hashlib
import json
import platform
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

REPOSITORY_ROOT = Path(__file__).resolve().parents[1]


def tracked_backend_python_files(repository_root: Path) -> list[str]:
    """Return the exact tracked Python input set for the quality baseline."""

    result = subprocess.run(
        ["git", "ls-files", "-z", "--", "backend"],
        cwd=repository_root,
        check=True,
        capture_output=True,
    )
    files = sorted(
        path.decode("utf-8")
        for path in result.stdout.split(b"\0")
        if path and path.endswith(b".py")
    )
    if not files:
        raise RuntimeError("No tracked backend Python files found")
    return files


def quality_commands(files: list[str]) -> dict[str, list[str]]:
    return {
        "flake8": [sys.executable, "-m", "flake8", *files],
        "mypy": [
            sys.executable,
            "-m",
            "mypy",
            "--explicit-package-bases",
            "--ignore-missing-imports",
            "--check-untyped-defs",
            "--show-error-codes",
            *files,
        ],
        "black": [sys.executable, "-m", "black", "--check", *files],
        "isort": [
            sys.executable,
            "-m",
            "isort",
            "--profile",
            "black",
            "--check-only",
            *files,
        ],
    }


def finding_count(tool: str, output: str) -> int:
    if tool == "flake8":
        return sum(
            bool(re.match(r"^.+:\d+:\d+: [A-Z]\d+", line))
            for line in output.splitlines()
        )
    if tool == "mypy":
        return sum(": error:" in line for line in output.splitlines())
    if tool == "black":
        return sum(line.startswith("would reformat ") for line in output.splitlines())
    return sum(line.startswith("ERROR: ") for line in output.splitlines())


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--output-dir", type=Path, required=True)
    args = parser.parse_args()
    args.output_dir.mkdir(parents=True, exist_ok=True)

    try:
        input_files = tracked_backend_python_files(REPOSITORY_ROOT)
    except (
        OSError,
        RuntimeError,
        UnicodeDecodeError,
        subprocess.CalledProcessError,
    ) as exc:
        print(f"Unable to select tracked backend Python inputs: {exc}", file=sys.stderr)
        return 2

    input_manifest = "\n".join(input_files) + "\n"
    commands = quality_commands(input_files)

    command_reports: dict[str, dict[str, object]] = {}
    report = {
        "schema": "backend-quality-baseline/v1",
        "policy": "report_only_pending_threshold_decision",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "python": sys.version,
        "platform": platform.platform(),
        "inputs": {
            "selection": "git ls-files -z -- backend | *.py",
            "count": len(input_files),
            "manifest_sha256": hashlib.sha256(
                input_manifest.encode("utf-8")
            ).hexdigest(),
            "files": input_files,
        },
        "commands": command_reports,
    }
    for tool, command in commands.items():
        try:
            result = subprocess.run(
                command,
                cwd=REPOSITORY_ROOT,
                capture_output=True,
                text=True,
                check=False,
            )
            output = result.stdout + result.stderr
            exit_code = result.returncode
        except OSError as exc:
            output = str(exc)
            exit_code = 127
        (args.output_dir / f"{tool}.txt").write_text(output, encoding="utf-8")
        command_reports[tool] = {
            "command": command,
            "exit_code": exit_code,
            "findings": finding_count(tool, output),
            "output_sha256": hashlib.sha256(output.encode("utf-8")).hexdigest(),
        }

    try:
        sha = subprocess.check_output(
            ["git", "rev-parse", "HEAD"],
            cwd=REPOSITORY_ROOT,
            text=True,
        ).strip()
    except (OSError, subprocess.CalledProcessError):
        sha = "unknown"
    report["git_sha"] = sha
    (args.output_dir / "summary.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

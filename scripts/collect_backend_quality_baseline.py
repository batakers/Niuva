#!/usr/bin/env python3
"""Collect a reproducible, report-only backend quality baseline."""

from __future__ import annotations

import argparse
import json
import platform
import re
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path


COMMANDS = {
    "flake8": [
        sys.executable,
        "-m",
        "flake8",
        "backend",
        "--exclude",
        "backend/.venv,__pycache__",
    ],
    "mypy": [
        sys.executable,
        "-m",
        "mypy",
        "backend",
        "--explicit-package-bases",
        "--ignore-missing-imports",
        "--check-untyped-defs",
        "--show-error-codes",
    ],
    "black": [sys.executable, "-m", "black", "--check", "backend"],
    "isort": [
        sys.executable,
        "-m",
        "isort",
        "--profile",
        "black",
        "--check-only",
        "backend",
    ],
}


def finding_count(tool: str, output: str) -> int:
    if tool == "flake8":
        return sum(bool(re.match(r"^.+:\d+:\d+: [A-Z]\d+", line)) for line in output.splitlines())
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

    report = {
        "schema": "backend-quality-baseline/v1",
        "policy": "report_only_pending_threshold_decision",
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "python": sys.version,
        "platform": platform.platform(),
        "commands": {},
    }
    for tool, command in COMMANDS.items():
        try:
            result = subprocess.run(command, capture_output=True, text=True, check=False)
            output = result.stdout + result.stderr
            exit_code = result.returncode
        except OSError as exc:
            output = str(exc)
            exit_code = 127
        (args.output_dir / f"{tool}.txt").write_text(output, encoding="utf-8")
        report["commands"][tool] = {
            "command": command,
            "exit_code": exit_code,
            "findings": finding_count(tool, output),
        }

    try:
        sha = subprocess.check_output(["git", "rev-parse", "HEAD"], text=True).strip()
    except (OSError, subprocess.CalledProcessError):
        sha = "unknown"
    report["git_sha"] = sha
    (args.output_dir / "summary.json").write_text(
        json.dumps(report, indent=2) + "\n", encoding="utf-8"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

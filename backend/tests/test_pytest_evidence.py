import json
import subprocess
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

from scripts.verify_pytest_evidence import unexpected_skips


def report(*cases):
    root = ET.Element("testsuites")
    suite = ET.SubElement(root, "testsuite")
    for classname, name, skipped in cases:
        case = ET.SubElement(suite, "testcase", classname=classname, name=name)
        if skipped:
            ET.SubElement(case, "skipped", message="reason")
    return root


def test_hermetic_profile_allows_only_declared_transaction_skips():
    allowed = report(("", "tests.test_transaction_integration", True))
    unexpected = report(("tests.test_other", "test_disappears", True))

    assert unexpected_skips(allowed, "hermetic") == []
    assert unexpected_skips(unexpected, "hermetic") == [
        "tests.test_other::test_disappears"
    ]


def test_required_profiles_reject_any_skip():
    skipped = report(("", "tests.test_transaction_integration", True))

    assert unexpected_skips(skipped, "transaction")
    assert unexpected_skips(skipped, "external")


def test_cli_writes_sha_and_runtime_evidence(tmp_path: Path):
    junit = tmp_path / "result.xml"
    output = tmp_path / "evidence.json"
    ET.ElementTree(report(("tests.test_unit", "test_passes", False))).write(junit)
    result = subprocess.run(
        [
            sys.executable,
            "scripts/verify_pytest_evidence.py",
            "--junit",
            str(junit),
            "--profile",
            "hermetic",
            "--command",
            "python -m pytest -q backend/tests",
            "--output",
            str(output),
        ],
        check=False,
        capture_output=True,
        text=True,
    )

    assert result.returncode == 0, result.stderr
    evidence = json.loads(output.read_text())
    assert evidence["result"] == {"errors": 0, "failures": 0, "skipped": 0, "tests": 1}
    assert len(evidence["git_sha"]) == 40
    assert len(evidence["junit_sha256"]) == 64

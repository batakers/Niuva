import hashlib
import json
import subprocess
import sys
from pathlib import Path

from scripts import collect_backend_quality_baseline as collector


def run_git(repository: Path, *args: str) -> None:
    subprocess.run(
        ["git", *args],
        cwd=repository,
        check=True,
        capture_output=True,
    )


def test_tracked_input_selection_excludes_untracked_virtualenv(tmp_path):
    run_git(tmp_path, "init", "--quiet")
    tracked = tmp_path / "backend" / "app.py"
    tracked.parent.mkdir()
    tracked.write_text("VALUE = 1\n", encoding="utf-8")
    untracked = tmp_path / "backend" / ".venv-python312-backup" / "lib.py"
    untracked.parent.mkdir()
    untracked.write_text("VALUE = 2\n", encoding="utf-8")
    non_python = tmp_path / "backend" / "requirements.lock"
    non_python.write_text("package==1\n", encoding="utf-8")
    run_git(tmp_path, "add", "backend/app.py", "backend/requirements.lock")

    assert collector.tracked_backend_python_files(tmp_path) == ["backend/app.py"]


def test_quality_commands_receive_only_the_explicit_manifest():
    files = ["backend/a.py", "backend/tests/test_a.py"]

    commands = collector.quality_commands(files)

    assert set(commands) == {"flake8", "mypy", "black", "isort"}
    for command in commands.values():
        assert command[-2:] == files
        assert "backend" not in command


def test_collector_records_input_and_output_checksums(tmp_path, monkeypatch):
    output_dir = tmp_path / "evidence"
    command = [
        sys.executable,
        "-c",
        "print('backend/app.py:1:1: E123 baseline finding')",
    ]
    monkeypatch.setattr(
        collector,
        "tracked_backend_python_files",
        lambda _repository: ["backend/app.py"],
    )
    monkeypatch.setattr(
        collector,
        "quality_commands",
        lambda _files: {"flake8": command},
    )
    monkeypatch.setattr(
        collector.subprocess,
        "check_output",
        lambda *_args, **_kwargs: "exact-head\n",
    )
    monkeypatch.setattr(collector.platform, "platform", lambda: "test-platform")
    monkeypatch.setattr(
        sys,
        "argv",
        ["collect_backend_quality_baseline.py", "--output-dir", str(output_dir)],
    )

    assert collector.main() == 0
    summary = json.loads((output_dir / "summary.json").read_text(encoding="utf-8"))
    raw_output = (output_dir / "flake8.txt").read_text(encoding="utf-8")

    assert summary["git_sha"] == "exact-head"
    assert summary["inputs"] == {
        "selection": "git ls-files -z -- backend | *.py",
        "count": 1,
        "manifest_sha256": hashlib.sha256(b"backend/app.py\n").hexdigest(),
        "files": ["backend/app.py"],
    }
    assert summary["commands"]["flake8"]["findings"] == 1
    assert (
        summary["commands"]["flake8"]["output_sha256"]
        == hashlib.sha256(raw_output.encode("utf-8")).hexdigest()
    )

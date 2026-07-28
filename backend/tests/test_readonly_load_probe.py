import importlib.util
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "load_readonly_api.py"
SPEC = importlib.util.spec_from_file_location("load_readonly_api", SCRIPT)
assert SPEC and SPEC.loader
load_probe = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(load_probe)


def test_percentile_uses_nearest_rank():
    assert load_probe.percentile([30, 10, 20, 40], 50) == 20
    assert load_probe.percentile([30, 10, 20, 40], 95) == 40
    assert load_probe.percentile([], 95) == 0


def test_target_origin_must_be_credential_free_https():
    assert (
        load_probe.validate_origin(
            "https://staging.example/",
            allow_http_local=False,
        )
        == "https://staging.example"
    )
    with pytest.raises(ValueError):
        load_probe.validate_origin(
            "https://user:secret@staging.example/",
            allow_http_local=False,
        )
    with pytest.raises(ValueError):
        load_probe.validate_origin(
            "http://staging.example/",
            allow_http_local=True,
        )


def test_local_http_requires_explicit_opt_in():
    with pytest.raises(ValueError):
        load_probe.validate_origin(
            "http://127.0.0.1:8000",
            allow_http_local=False,
        )
    assert (
        load_probe.validate_origin(
            "http://127.0.0.1:8000",
            allow_http_local=True,
        )
        == "http://127.0.0.1:8000"
    )

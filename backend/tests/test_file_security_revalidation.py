import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
os.environ.setdefault("MONGO_URL", "mongodb://file-security-test.invalid")
os.environ.setdefault("DB_NAME", "niuva_file_security_test")
os.environ.setdefault("JWT_SECRET", "file-security-test-secret-at-least-32-characters")
os.environ.setdefault("ADMIN_EMAIL", "admin@niuva.com")
os.environ.setdefault("ADMIN_PASSWORD", "AdminPassword123")

import server  # noqa: E402


def test_unknown_file_scope_fails_closed_for_non_owner():
    customer = {"id": "customer-1", "role": "client"}
    metadata = {
        "owner_id": "customer-2",
        "object_type": "unregistered_private_object",
    }
    assert server._file_scope_permissions(metadata) == ()
    assert server._can_download_file(customer, metadata) is False


def test_file_scope_permissions_are_explicit_for_linked_records():
    assert server._file_scope_permissions({"linked_type": "order"}) == ("orders.read",)
    assert server._file_scope_permissions({"linked_type": "project"}) == (
        "projects.read",
    )
    assert server._file_scope_permissions({"linked_type": "unknown"}) == ()


def test_unsafe_extension_uses_binary_download_content_type():
    assert (
        server.safe_file_content_type("uploads/report.html")
        == "application/octet-stream"
    )
    assert server.safe_file_content_type("uploads/model.stl") == "model/stl"

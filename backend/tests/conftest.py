import os
import re
import uuid

import pytest


@pytest.fixture
def transaction_database_name(request):
    worker = os.environ.get("PYTEST_XDIST_WORKER", "gw0")
    safe_worker = re.sub(r"[^a-zA-Z0-9_]", "_", worker)[:8]
    safe_node = re.sub(r"[^a-zA-Z0-9_]", "_", request.node.name)[:10]
    return f"niuva_tx_{safe_worker}_{safe_node}_{uuid.uuid4().hex}"

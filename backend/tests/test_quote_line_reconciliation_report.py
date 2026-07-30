import asyncio
import json

from quote_line_reconciliation_report import (
    build_quote_line_reconciliation_report,
)


class Cursor:
    def __init__(self, items):
        self.items = [dict(item) for item in items]

    def limit(self, value):
        self.items = self.items[:value]
        return self

    async def to_list(self, length):
        return [dict(item) for item in self.items[:length]]


class ReadOnlyCollection:
    def __init__(self, items=()):
        self.items = [dict(item) for item in items]
        self.reads = 0

    def find(self, _query, _projection=None):
        self.reads += 1
        return Cursor(self.items)


class ReportDatabase:
    def __init__(self, *, versions=(), projects=(), work_orders=()):
        self.b2b_quote_versions = ReadOnlyCollection(versions)
        self.b2b_projects = ReadOnlyCollection(projects)
        self.work_orders = ReadOnlyCollection(work_orders)


def version(**overrides):
    value = {
        "id": "version-secret-1",
        "quote_id": "quote-secret-1",
        "revision": 1,
        "items": [
            {
                "quote_line_id": "line-secret-1",
                "description": "Customer secret scope",
                "quantity": 3,
            }
        ],
    }
    value.update(overrides)
    return value


def project(**overrides):
    value = {
        "id": "project-secret-1",
        "quote_id": "quote-secret-1",
        "source_quote_version_id": "version-secret-1",
        "quote_snapshot": {"id": "version-secret-1"},
    }
    value.update(overrides)
    return value


def work_order(**overrides):
    value = {
        "id": "work-order-secret-1",
        "project_id": "project-secret-1",
        "quote_id": "quote-secret-1",
        "source_quote_version_id": "version-secret-1",
        "quote_line_id": "line-secret-1",
        "quantity": 2,
        "status": "planned",
    }
    value.update(overrides)
    return value


def run_report(database, **overrides):
    return asyncio.run(
        build_quote_line_reconciliation_report(
            database,
            target_label="isolated-quote-fixture",
            target_scope="isolated",
            **overrides,
        )
    )


def test_report_is_aggregate_only_and_ready_for_exact_references():
    database = ReportDatabase(
        versions=[version()],
        projects=[project()],
        work_orders=[work_order()],
    )

    report = run_report(database)

    assert report["disposition"] == "ready_for_review"
    assert report["issues"] == {}
    assert report["collections"]["work_orders"]["shape_counts"] == {"canonical": 1}
    rendered = json.dumps(report)
    for secret in (
        "version-secret-1",
        "quote-secret-1",
        "line-secret-1",
        "project-secret-1",
        "work-order-secret-1",
        "Customer secret scope",
    ):
        assert secret not in rendered


def test_report_blocks_missing_and_duplicate_historical_line_identity():
    missing = version(
        id="version-missing",
        items=[{"description": "Legacy", "quantity": 1}],
    )
    duplicate = version(
        id="version-duplicate",
        items=[
            {"quote_line_id": "duplicate-line", "quantity": 1},
            {"quote_line_id": "duplicate-line", "quantity": 1},
        ],
    )
    database = ReportDatabase(versions=[missing, duplicate])

    report = run_report(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["issues"]["missing_quote_line_identity"] == 1
    assert report["issues"]["duplicate_quote_line_identity"] == 1
    assert report["collections"]["b2b_quote_versions"]["shape_counts"] == {
        "ambiguous_historical": 2
    }


def test_report_blocks_reference_mismatch_orphan_and_overcommit():
    database = ReportDatabase(
        versions=[version()],
        projects=[
            project(),
            project(
                id="project-mismatch",
                quote_snapshot={"id": "different-version"},
            ),
        ],
        work_orders=[
            work_order(quantity=2),
            work_order(id="work-order-2", quantity=2),
            work_order(id="work-order-orphan", project_id="missing-project"),
            work_order(
                id="work-order-wrong-line",
                quote_line_id="line-not-in-version",
            ),
        ],
    )

    report = run_report(database)

    assert report["disposition"] == "blocked_ambiguity"
    assert report["issues"]["project_source_quote_version_mismatch"] == 1
    assert report["issues"]["orphan_work_order_project"] == 1
    assert report["issues"]["orphan_work_order_quote_line"] == 1
    assert report["issues"]["quote_line_quantity_overcommitted"] == 1


def test_report_blocks_non_isolated_target_before_reading():
    database = ReportDatabase(versions=[version()])

    report = asyncio.run(
        build_quote_line_reconciliation_report(
            database,
            target_label="shared-environment",
            target_scope="shared",
        )
    )

    assert report == {
        "report_version": 1,
        "target_label": "shared-environment",
        "disposition": "blocked_ambiguity",
        "collections": {},
        "issues": {"unsafe_target": 1},
    }
    assert database.b2b_quote_versions.reads == 0
    assert database.b2b_projects.reads == 0
    assert database.work_orders.reads == 0

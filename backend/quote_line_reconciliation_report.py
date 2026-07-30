"""Aggregate-only preflight for historical Quote-line identity.

This is deliberately not a migration or repair utility. It reads bounded
collections, reports category counts only, and stops on every ambiguity so a
later separately approved reconciliation cannot infer or backfill identities.
"""

from collections import Counter, defaultdict
from typing import Any, TypeGuard

REPORT_VERSION = 1
SCAN_LIMIT = 10_000


def _identity(value: Any) -> TypeGuard[str]:
    return isinstance(value, str) and bool(value.strip())


def _duplicate_groups(values) -> int:
    counts = Counter(value for value in values if _identity(value))
    return sum(1 for count in counts.values() if count > 1)


async def _read_documents(database, collection_name: str) -> tuple[list[dict], bool]:
    cursor = getattr(database, collection_name).find({}, {"_id": 0})
    if hasattr(cursor, "limit"):
        cursor = cursor.limit(SCAN_LIMIT + 1)
    documents = await cursor.to_list(SCAN_LIMIT + 1)
    return [dict(document) for document in documents[:SCAN_LIMIT]], (
        len(documents) > SCAN_LIMIT
    )


async def build_quote_line_reconciliation_report(
    database,
    *,
    target_label: str,
    target_scope: str,
) -> dict:
    """Return aggregate reconciliation evidence without exposing or writing rows."""
    if target_scope != "isolated" or not _identity(target_label):
        return {
            "report_version": REPORT_VERSION,
            "target_label": target_label,
            "disposition": "blocked_ambiguity",
            "collections": {},
            "issues": {"unsafe_target": 1},
        }

    issues: Counter[str] = Counter()
    collections: dict[str, dict] = {}

    versions, versions_truncated = await _read_documents(database, "b2b_quote_versions")
    versions_by_id = {
        document["id"]: document
        for document in versions
        if _identity(document.get("id"))
    }
    duplicate_version_ids = _duplicate_groups(
        document.get("id") for document in versions
    )
    if duplicate_version_ids:
        issues["duplicate_quote_version_id"] += duplicate_version_ids
    version_line_ids: dict[str, set[str]] = {}
    accepted_quantities: dict[tuple[str, str], int] = {}
    all_line_ids = []
    version_shapes: Counter[str] = Counter()
    for version in versions:
        version_id = version.get("id")
        if not _identity(version_id):
            issues["missing_quote_version_id"] += 1
            version_shapes["invalid_version_identity"] += 1
            continue
        items = version.get("items")
        if not isinstance(items, list):
            issues["invalid_quote_items_shape"] += 1
            version_shapes["invalid_items_shape"] += 1
            continue
        candidate_identities = [
            item.get("quote_line_id") for item in items if isinstance(item, dict)
        ]
        if len(candidate_identities) != len(items):
            issues["invalid_quote_line_shape"] += len(items) - len(candidate_identities)
        missing = sum(1 for identity in candidate_identities if not _identity(identity))
        duplicate = _duplicate_groups(candidate_identities)
        if missing:
            issues["missing_quote_line_identity"] += missing
        if duplicate:
            issues["duplicate_quote_line_identity"] += duplicate
        if missing or duplicate or len(candidate_identities) != len(items):
            version_shapes["ambiguous_historical"] += 1
            continue
        identities = [
            identity for identity in candidate_identities if _identity(identity)
        ]
        version_shapes["canonical"] += 1
        line_ids = set(identities)
        version_line_ids[version_id] = line_ids
        all_line_ids.extend(identities)
        for item in items:
            quantity = item.get("quantity")
            if not isinstance(quantity, int) or quantity < 1:
                issues["invalid_quote_line_quantity"] += 1
                continue
            quote_line_id = item.get("quote_line_id")
            if _identity(quote_line_id):
                accepted_quantities[(version_id, quote_line_id)] = quantity
    duplicate_global_line_ids = _duplicate_groups(all_line_ids)
    if duplicate_global_line_ids:
        issues["duplicate_global_quote_line_identity"] += duplicate_global_line_ids
    if versions_truncated:
        issues["quote_version_scan_limit_exceeded"] += 1
    collections["b2b_quote_versions"] = {
        "total": len(versions),
        "shape_counts": dict(sorted(version_shapes.items())),
    }

    projects, projects_truncated = await _read_documents(database, "b2b_projects")
    projects_by_id = {
        document["id"]: document
        for document in projects
        if _identity(document.get("id"))
    }
    duplicate_project_ids = _duplicate_groups(
        document.get("id") for document in projects
    )
    if duplicate_project_ids:
        issues["duplicate_project_id"] += duplicate_project_ids
    project_shapes: Counter[str] = Counter()
    for project in projects:
        if not _identity(project.get("id")):
            issues["missing_project_id"] += 1
        source_version_id = project.get("source_quote_version_id")
        if not _identity(source_version_id):
            issues["missing_project_source_quote_version"] += 1
            project_shapes["missing_source_version"] += 1
            continue
        if source_version_id not in versions_by_id:
            issues["orphan_project_source_quote_version"] += 1
            project_shapes["orphan_source_version"] += 1
            continue
        if versions_by_id[source_version_id].get("quote_id") != project.get("quote_id"):
            issues["project_source_quote_mismatch"] += 1
            project_shapes["source_quote_mismatch"] += 1
            continue
        snapshot = project.get("quote_snapshot")
        if isinstance(snapshot, dict) and snapshot.get("id") != source_version_id:
            issues["project_source_quote_version_mismatch"] += 1
            project_shapes["source_version_mismatch"] += 1
            continue
        if source_version_id not in version_line_ids:
            issues["project_references_ambiguous_quote_version"] += 1
            project_shapes["ambiguous_source_version"] += 1
            continue
        project_shapes["canonical"] += 1
    if projects_truncated:
        issues["project_scan_limit_exceeded"] += 1
    collections["b2b_projects"] = {
        "total": len(projects),
        "shape_counts": dict(sorted(project_shapes.items())),
    }

    work_orders, work_orders_truncated = await _read_documents(database, "work_orders")
    duplicate_work_order_ids = _duplicate_groups(
        document.get("id") for document in work_orders
    )
    if duplicate_work_order_ids:
        issues["duplicate_work_order_id"] += duplicate_work_order_ids
    committed_quantities: defaultdict[tuple[str, str], int] = defaultdict(int)
    work_order_shapes: Counter[str] = Counter()
    for work_order in work_orders:
        if not _identity(work_order.get("id")):
            issues["missing_work_order_id"] += 1
        project_id = work_order.get("project_id")
        referenced_project = (
            projects_by_id.get(project_id) if _identity(project_id) else None
        )
        if referenced_project is None:
            issues["orphan_work_order_project"] += 1
            work_order_shapes["orphan_project"] += 1
            continue
        source_version_id = work_order.get("source_quote_version_id")
        quote_line_id = work_order.get("quote_line_id")
        if not _identity(source_version_id) or not _identity(quote_line_id):
            issues["missing_work_order_quote_reference"] += 1
            work_order_shapes["missing_quote_reference"] += 1
            continue
        if source_version_id != referenced_project.get("source_quote_version_id"):
            issues["work_order_source_quote_version_mismatch"] += 1
            work_order_shapes["source_version_mismatch"] += 1
            continue
        if work_order.get("quote_id") != referenced_project.get("quote_id"):
            issues["work_order_source_quote_mismatch"] += 1
            work_order_shapes["source_quote_mismatch"] += 1
            continue
        referenced_line_ids = version_line_ids.get(source_version_id)
        if referenced_line_ids is None:
            issues["work_order_references_ambiguous_quote_version"] += 1
            work_order_shapes["ambiguous_quote_version"] += 1
            continue
        if quote_line_id not in referenced_line_ids:
            issues["orphan_work_order_quote_line"] += 1
            work_order_shapes["orphan_quote_line"] += 1
            continue
        quantity = work_order.get("quantity")
        if not isinstance(quantity, int) or quantity < 1:
            issues["invalid_work_order_quantity"] += 1
            work_order_shapes["invalid_quantity"] += 1
            continue
        work_order_shapes["canonical"] += 1
        if work_order.get("status") != "cancelled":
            committed_quantities[(source_version_id, quote_line_id)] += quantity
    for reference, committed in committed_quantities.items():
        accepted = accepted_quantities.get(reference)
        if accepted is None:
            issues["missing_accepted_quote_line_quantity"] += 1
        elif committed > accepted:
            issues["quote_line_quantity_overcommitted"] += 1
    if work_orders_truncated:
        issues["work_order_scan_limit_exceeded"] += 1
    collections["work_orders"] = {
        "total": len(work_orders),
        "shape_counts": dict(sorted(work_order_shapes.items())),
    }

    return {
        "report_version": REPORT_VERSION,
        "target_label": target_label,
        "disposition": "blocked_ambiguity" if issues else "ready_for_review",
        "collections": collections,
        "issues": dict(sorted(issues.items())),
    }

"""Pure, inactive Retail Order lifecycle and audit contract.

The module contains no HTTP, database, inventory, reservation, payment,
provider, or environment integration. Persistence adapters may consume this
contract only after their transaction, uniqueness, and capability gates are
separately authorized.
"""

from __future__ import annotations

import hashlib
import json
from collections.abc import Mapping
from copy import deepcopy
from datetime import datetime
from typing import Any

from retail_domain import RETAIL_TRANSITIONS


class RetailOrderContractError(ValueError):
    """A safe, transport-neutral Retail Order contract failure."""

    def __init__(
        self,
        code: str,
        message: str,
        *,
        details: Mapping[str, Any] | None = None,
    ) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.details = dict(details or {})

    def payload(self) -> dict[str, Any]:
        return {
            "code": self.code,
            "message": self.message,
            **({"details": deepcopy(self.details)} if self.details else {}),
        }


def _require_text(value: Any, *, field: str, maximum: int = 500) -> str:
    if not isinstance(value, str) or not value.strip() or len(value) > maximum:
        raise RetailOrderContractError(
            "retail_order_field_invalid",
            f"{field} harus berupa teks yang valid.",
            details={"field": field},
        )
    return value.strip()


def _require_timestamp(value: Any, *, field: str) -> tuple[str, datetime]:
    timestamp = _require_text(value, field=field, maximum=100)
    try:
        parsed = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))
    except ValueError as exc:
        raise RetailOrderContractError(
            "retail_order_timestamp_invalid",
            f"{field} harus memakai ISO 8601 bertimezone.",
            details={"field": field},
        ) from exc
    if parsed.tzinfo is None or parsed.utcoffset() is None:
        raise RetailOrderContractError(
            "retail_order_timestamp_invalid",
            f"{field} harus memakai ISO 8601 bertimezone.",
            details={"field": field},
        )
    return timestamp, parsed


def retail_transition_command_fingerprint(
    *,
    target_status: str,
    expected_version: int,
    operation_id: str,
    actor_id: str,
    reason: str,
) -> str:
    """Bind an operation ID to the exact semantic transition command."""

    command = {
        "actor_id": _require_text(actor_id, field="actor_id", maximum=200),
        "expected_version": expected_version,
        "operation_id": _require_text(operation_id, field="operation_id", maximum=200),
        "reason": _require_text(reason, field="reason"),
        "target_status": _require_text(
            target_status, field="target_status", maximum=100
        ),
    }
    if isinstance(expected_version, bool) or not isinstance(expected_version, int):
        raise RetailOrderContractError(
            "retail_order_version_invalid",
            "Expected version Retail Order tidak valid.",
        )
    encoded = json.dumps(
        command, ensure_ascii=True, separators=(",", ":"), sort_keys=True
    ).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def build_initial_retail_order(
    checkout_snapshot: Mapping[str, Any],
    *,
    order_id: str,
    order_number: str,
    actor_id: str,
    occurred_at: str,
) -> dict[str, Any]:
    """Create a detached initial aggregate from an authoritative snapshot."""

    if not isinstance(checkout_snapshot, Mapping):
        raise RetailOrderContractError(
            "retail_order_snapshot_invalid",
            "Snapshot checkout Retail Order tidak valid.",
        )
    required_snapshot_fields = (
        "customer_id",
        "operation_id",
        "request_fingerprint",
        "fulfilment_method",
        "currency",
        "tax_profile_version",
        "fulfilment_policy_version",
    )
    for field in required_snapshot_fields:
        _require_text(checkout_snapshot.get(field), field=f"snapshot.{field}")
    items = checkout_snapshot.get("items")
    total_minor = checkout_snapshot.get("total_minor")
    if not isinstance(items, list) or not items:
        raise RetailOrderContractError(
            "retail_order_snapshot_invalid",
            "Snapshot checkout harus memiliki line item.",
        )
    if (
        isinstance(total_minor, bool)
        or not isinstance(total_minor, int)
        or total_minor <= 0
    ):
        raise RetailOrderContractError(
            "retail_order_snapshot_invalid",
            "Total snapshot checkout tidak valid.",
        )

    order_id = _require_text(order_id, field="order_id", maximum=200)
    order_number = _require_text(order_number, field="order_number", maximum=100)
    actor_id = _require_text(actor_id, field="actor_id", maximum=200)
    occurred_at, _ = _require_timestamp(occurred_at, field="occurred_at")
    operation_id = str(checkout_snapshot["operation_id"]).strip()
    event = {
        "event": "order_created",
        "sequence": 1,
        "from_status": None,
        "to_status": "created",
        "actor_id": actor_id,
        "reason": "Retail Order dibuat dari snapshot checkout authoritative.",
        "operation_id": operation_id,
        "request_fingerprint": checkout_snapshot["request_fingerprint"],
        "occurred_at": occurred_at,
    }
    order = {
        "id": order_id,
        "order_number": order_number,
        "customer_id": checkout_snapshot["customer_id"],
        "creation_operation_id": operation_id,
        "request_fingerprint": checkout_snapshot["request_fingerprint"],
        "checkout_snapshot": deepcopy(dict(checkout_snapshot)),
        "status": "created",
        "version": 1,
        "history": [event],
        "created_at": occurred_at,
        "updated_at": occurred_at,
    }
    validate_retail_order_history(order)
    return order


def validate_retail_order_history(order: Mapping[str, Any]) -> None:
    """Fail closed when lifecycle history is incomplete or discontinuous."""

    if not isinstance(order, Mapping):
        raise RetailOrderContractError(
            "retail_order_invalid", "Retail Order harus berupa object."
        )
    _require_text(order.get("id"), field="order.id", maximum=200)
    _require_text(order.get("order_number"), field="order.order_number", maximum=100)
    _require_text(order.get("customer_id"), field="order.customer_id", maximum=200)
    _require_text(
        order.get("creation_operation_id"),
        field="order.creation_operation_id",
        maximum=200,
    )
    _require_text(
        order.get("request_fingerprint"),
        field="order.request_fingerprint",
        maximum=200,
    )
    checkout_snapshot = order.get("checkout_snapshot")
    if (
        not isinstance(checkout_snapshot, Mapping)
        or checkout_snapshot.get("customer_id") != order.get("customer_id")
        or checkout_snapshot.get("operation_id") != order.get("creation_operation_id")
        or checkout_snapshot.get("request_fingerprint")
        != order.get("request_fingerprint")
    ):
        raise RetailOrderContractError(
            "retail_order_snapshot_invalid",
            "Snapshot checkout tidak selaras dengan Retail Order.",
        )
    created_at, created_time = _require_timestamp(
        order.get("created_at"), field="order.created_at"
    )
    updated_at, updated_time = _require_timestamp(
        order.get("updated_at"), field="order.updated_at"
    )
    if updated_time < created_time:
        raise RetailOrderContractError(
            "retail_order_history_invalid",
            "updated_at Retail Order tidak boleh sebelum created_at.",
        )
    version = order.get("version")
    history = order.get("history")
    if (
        isinstance(version, bool)
        or not isinstance(version, int)
        or version < 1
        or not isinstance(history, list)
        or len(history) != version
    ):
        raise RetailOrderContractError(
            "retail_order_history_invalid",
            "History Retail Order tidak sesuai version aggregate.",
        )

    current_status: str | None = None
    previous_occurred_at: datetime | None = None
    operation_ids: set[str] = set()
    for sequence, raw_event in enumerate(history, start=1):
        if not isinstance(raw_event, Mapping) or raw_event.get("sequence") != sequence:
            raise RetailOrderContractError(
                "retail_order_history_invalid",
                "Sequence history Retail Order tidak berurutan.",
            )
        operation_id = _require_text(
            raw_event.get("operation_id"), field="history.operation_id", maximum=200
        )
        if operation_id in operation_ids:
            raise RetailOrderContractError(
                "retail_order_history_invalid",
                "Operation ID history Retail Order harus unik.",
            )
        operation_ids.add(operation_id)
        actor_id = _require_text(
            raw_event.get("actor_id"), field="history.actor_id", maximum=200
        )
        event_reason = _require_text(raw_event.get("reason"), field="history.reason")
        _, event_occurred_at = _require_timestamp(
            raw_event.get("occurred_at"), field="history.occurred_at"
        )
        if (
            previous_occurred_at is not None
            and event_occurred_at < previous_occurred_at
        ):
            raise RetailOrderContractError(
                "retail_order_history_invalid",
                "Waktu history Retail Order tidak boleh mundur.",
            )
        previous_occurred_at = event_occurred_at
        target_status = raw_event.get("to_status")

        if sequence == 1:
            if (
                raw_event.get("event") != "order_created"
                or raw_event.get("from_status") is not None
                or target_status != "created"
                or raw_event.get("operation_id") != order.get("creation_operation_id")
                or raw_event.get("request_fingerprint")
                != order.get("request_fingerprint")
            ):
                raise RetailOrderContractError(
                    "retail_order_history_invalid",
                    "History Retail Order harus dimulai oleh order_created.",
                )
        else:
            expected_command_fingerprint = (
                retail_transition_command_fingerprint(
                    target_status=target_status,
                    expected_version=sequence - 1,
                    operation_id=operation_id,
                    actor_id=actor_id,
                    reason=event_reason,
                )
                if isinstance(target_status, str)
                else None
            )
            if (
                raw_event.get("event") != "status_transitioned"
                or raw_event.get("from_status") != current_status
                or not isinstance(target_status, str)
                or target_status
                not in RETAIL_TRANSITIONS.get(current_status or "", set())
                or raw_event.get("command_fingerprint") != expected_command_fingerprint
            ):
                raise RetailOrderContractError(
                    "retail_order_history_invalid",
                    "History transisi Retail Order terputus atau tidak valid.",
                )
        current_status = target_status if isinstance(target_status, str) else None

    if current_status != order.get("status"):
        raise RetailOrderContractError(
            "retail_order_history_invalid",
            "Status Retail Order tidak sama dengan event terakhir.",
        )
    if (
        history[0].get("occurred_at") != created_at
        or history[-1].get("occurred_at") != updated_at
    ):
        raise RetailOrderContractError(
            "retail_order_history_invalid",
            "Timestamp aggregate tidak selaras dengan history Retail Order.",
        )


def apply_retail_order_transition(
    order: Mapping[str, Any],
    *,
    target_status: str,
    expected_version: int,
    operation_id: str,
    actor_id: str,
    reason: str,
    occurred_at: str,
) -> dict[str, Any]:
    """Return an updated aggregate, an exact replay, or a named conflict."""

    validate_retail_order_history(order)
    occurred_at, _ = _require_timestamp(occurred_at, field="occurred_at")
    command_fingerprint = retail_transition_command_fingerprint(
        target_status=target_status,
        expected_version=expected_version,
        operation_id=operation_id,
        actor_id=actor_id,
        reason=reason,
    )

    for event in order["history"]:
        if event.get("operation_id") == operation_id.strip():
            if event.get("command_fingerprint") != command_fingerprint:
                raise RetailOrderContractError(
                    "retail_order_operation_id_conflict",
                    "Operation ID Retail Order sudah digunakan untuk command berbeda.",
                )
            return deepcopy(dict(order))

    if order["version"] != expected_version:
        raise RetailOrderContractError(
            "retail_order_version_conflict",
            "Retail Order telah berubah; gunakan version terbaru.",
            details={"current_version": order["version"]},
        )
    current_status = order["status"]
    fulfilment_method = order["checkout_snapshot"].get("fulfilment_method")
    if (target_status == "ready_to_ship" and fulfilment_method != "ship") or (
        target_status == "ready_to_pickup" and fulfilment_method != "pickup"
    ):
        raise RetailOrderContractError(
            "retail_order_fulfilment_transition_invalid",
            "Transisi fulfilment tidak sesuai snapshot checkout.",
            details={
                "fulfilment_method": fulfilment_method,
                "target_status": target_status,
            },
        )
    if target_status not in RETAIL_TRANSITIONS.get(current_status, set()):
        code = (
            "retail_order_terminal"
            if current_status in RETAIL_TRANSITIONS
            and not RETAIL_TRANSITIONS[current_status]
            else "retail_order_transition_invalid"
        )
        raise RetailOrderContractError(
            code,
            "Transisi Retail Order tidak diizinkan.",
            details={"current_status": current_status, "target_status": target_status},
        )

    updated = deepcopy(dict(order))
    updated["version"] = expected_version + 1
    updated["status"] = target_status
    updated["updated_at"] = occurred_at
    updated["history"].append(
        {
            "event": "status_transitioned",
            "sequence": expected_version + 1,
            "from_status": current_status,
            "to_status": target_status,
            "actor_id": actor_id.strip(),
            "reason": reason.strip(),
            "operation_id": operation_id.strip(),
            "command_fingerprint": command_fingerprint,
            "occurred_at": occurred_at,
        }
    )
    validate_retail_order_history(updated)
    return updated


def retail_order_compare_and_swap_filter(
    original: Mapping[str, Any], updated: Mapping[str, Any]
) -> dict[str, Any]:
    """Return the persistence precondition that permits only one stale writer."""

    validate_retail_order_history(original)
    validate_retail_order_history(updated)
    immutable_fields = (
        "id",
        "order_number",
        "customer_id",
        "creation_operation_id",
        "request_fingerprint",
        "checkout_snapshot",
        "created_at",
    )
    if (
        updated.get("id") != original.get("id")
        or updated["version"] != original["version"] + 1
        or updated["history"][:-1] != original["history"]
        or any(updated.get(field) != original.get(field) for field in immutable_fields)
    ):
        raise RetailOrderContractError(
            "retail_order_mutation_invalid",
            "Mutation Retail Order bukan satu transisi version.",
        )
    return {
        "id": original.get("id"),
        "version": original["version"],
        "status": original["status"],
    }

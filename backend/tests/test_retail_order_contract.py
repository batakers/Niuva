import copy

import pytest
from retail_checkout_domain import build_fixed_price_snapshot
from retail_order_contract import (
    RetailOrderContractError,
    apply_retail_order_transition,
    build_initial_retail_order,
    retail_order_compare_and_swap_filter,
    validate_retail_order_history,
)

from tests.test_retail_checkout_domain import (
    CAPTURED_AT,
    FULFILMENT_POLICY,
    INTENT,
    TAX_PROFILE,
    catalog,
)


def checkout_snapshot():
    return build_fixed_price_snapshot(
        INTENT,
        catalog(),
        tax_profile_version=TAX_PROFILE,
        fulfilment_policy_version=FULFILMENT_POLICY,
        captured_at=CAPTURED_AT,
    )


def initial_order():
    return build_initial_retail_order(
        checkout_snapshot(),
        order_id="retail-order-1",
        order_number="NIV-R-2608-0001",
        actor_id="customer-1",
        occurred_at=CAPTURED_AT,
    )


def transition(order, **overrides):
    options = {
        "target_status": "awaiting_payment",
        "expected_version": 1,
        "operation_id": "transition-1",
        "actor_id": "order-admin-1",
        "reason": "Checkout authoritative diterima.",
        "occurred_at": "2026-08-04T12:01:00+00:00",
    }
    options.update(overrides)
    return apply_retail_order_transition(order, **options)


def assert_contract_error(code, callback):
    with pytest.raises(RetailOrderContractError) as caught:
        callback()
    assert caught.value.code == code


def test_initial_order_detaches_snapshot_and_starts_append_only_history():
    snapshot = checkout_snapshot()
    order = build_initial_retail_order(
        snapshot,
        order_id="retail-order-1",
        order_number="NIV-R-2608-0001",
        actor_id="customer-1",
        occurred_at=CAPTURED_AT,
    )
    snapshot["items"][0]["variant_snapshot"]["name"] = "Changed later"

    assert order["status"] == "created"
    assert order["version"] == 1
    assert order["checkout_snapshot"]["items"][0]["variant_snapshot"]["name"] == "Blue"
    assert order["history"] == [
        {
            "event": "order_created",
            "sequence": 1,
            "from_status": None,
            "to_status": "created",
            "actor_id": "customer-1",
            "reason": "Retail Order dibuat dari snapshot checkout authoritative.",
            "operation_id": "checkout-operation-1",
            "request_fingerprint": order["request_fingerprint"],
            "occurred_at": CAPTURED_AT,
        }
    ]


def test_transition_appends_a_version_bound_audit_event_without_mutating_source():
    source = initial_order()
    before = copy.deepcopy(source)

    updated = transition(source)

    assert source == before
    assert updated["status"] == "awaiting_payment"
    assert updated["version"] == 2
    assert len(updated["history"]) == 2
    assert updated["history"][-1]["sequence"] == 2
    assert updated["history"][-1]["from_status"] == "created"
    assert updated["history"][-1]["actor_id"] == "order-admin-1"
    assert updated["history"][-1]["command_fingerprint"]


def test_exact_transition_replay_is_read_only_but_changed_reuse_conflicts():
    updated = transition(initial_order())
    replay = transition(updated, occurred_at="2026-08-04T12:05:00+00:00")

    assert replay == updated
    assert len(replay["history"]) == 2

    assert_contract_error(
        "retail_order_operation_id_conflict",
        lambda: transition(updated, reason="A different command"),
    )
    assert_contract_error(
        "retail_order_operation_id_conflict",
        lambda: transition(updated, actor_id="order-admin-2"),
    )


def test_creation_operation_id_cannot_be_reused_for_a_transition():
    assert_contract_error(
        "retail_order_operation_id_conflict",
        lambda: transition(initial_order(), operation_id=INTENT["operation_id"]),
    )


def test_invalid_skip_terminal_and_stale_version_fail_closed():
    assert_contract_error(
        "retail_order_transition_invalid",
        lambda: transition(initial_order(), target_status="paid"),
    )
    assert_contract_error(
        "retail_order_version_conflict",
        lambda: transition(initial_order(), expected_version=2),
    )

    order = initial_order()
    sequence = [
        "awaiting_payment",
        "paid",
        "file_review",
        "queued",
        "in_production",
        "quality_control",
        "ready_to_pickup",
        "picked_up",
        "completed",
    ]
    for index, target in enumerate(sequence, start=1):
        order = transition(
            order,
            target_status=target,
            expected_version=index,
            operation_id=f"transition-{index}",
        )
    assert_contract_error(
        "retail_order_terminal",
        lambda: transition(
            order,
            target_status="created",
            expected_version=order["version"],
            operation_id="after-terminal",
        ),
    )


def test_fulfilment_tail_must_match_the_committed_checkout_snapshot():
    order = initial_order()
    for index, target in enumerate(
        [
            "awaiting_payment",
            "paid",
            "file_review",
            "queued",
            "in_production",
            "quality_control",
        ],
        start=1,
    ):
        order = transition(
            order,
            target_status=target,
            expected_version=index,
            operation_id=f"fulfilment-{index}",
        )

    assert_contract_error(
        "retail_order_fulfilment_transition_invalid",
        lambda: transition(
            order,
            target_status="ready_to_ship",
            expected_version=order["version"],
            operation_id="wrong-fulfilment-tail",
        ),
    )


@pytest.mark.parametrize("occurred_at", ["not-a-time", "2026-08-04T12:01:00"])
def test_audit_time_must_be_timezone_aware(occurred_at):
    assert_contract_error(
        "retail_order_timestamp_invalid",
        lambda: transition(initial_order(), occurred_at=occurred_at),
    )


def test_history_validation_rejects_rewrite_gap_and_duplicate_operation():
    valid = transition(initial_order())

    rewritten = copy.deepcopy(valid)
    rewritten["history"][0]["to_status"] = "paid"
    assert_contract_error(
        "retail_order_history_invalid",
        lambda: validate_retail_order_history(rewritten),
    )

    sequence_gap = copy.deepcopy(valid)
    sequence_gap["history"][1]["sequence"] = 3
    assert_contract_error(
        "retail_order_history_invalid",
        lambda: validate_retail_order_history(sequence_gap),
    )

    duplicate = copy.deepcopy(valid)
    duplicate["history"][1]["operation_id"] = INTENT["operation_id"]
    assert_contract_error(
        "retail_order_history_invalid",
        lambda: validate_retail_order_history(duplicate),
    )

    time_reversal = copy.deepcopy(valid)
    time_reversal["history"][1]["occurred_at"] = "2026-08-04T11:59:00+00:00"
    assert_contract_error(
        "retail_order_history_invalid",
        lambda: validate_retail_order_history(time_reversal),
    )


def test_concurrent_commands_share_one_compare_and_swap_precondition():
    source = initial_order()
    first = transition(source, operation_id="concurrent-1")
    second = transition(source, operation_id="concurrent-2")

    first_filter = retail_order_compare_and_swap_filter(source, first)
    second_filter = retail_order_compare_and_swap_filter(source, second)
    assert (
        first_filter
        == second_filter
        == {
            "id": "retail-order-1",
            "version": 1,
            "status": "created",
        }
    )

    # Once one compare-and-swap wins, the other command is stale and must be
    # rebuilt from the winner rather than overwriting it.
    assert_contract_error(
        "retail_order_version_conflict",
        lambda: transition(first, operation_id="concurrent-2"),
    )


def test_compare_and_swap_rejects_rewritten_immutable_snapshot():
    source = initial_order()
    updated = transition(source)
    updated["checkout_snapshot"]["total_minor"] = 1

    assert_contract_error(
        "retail_order_mutation_invalid",
        lambda: retail_order_compare_and_swap_filter(source, updated),
    )

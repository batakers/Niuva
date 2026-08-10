import copy

import pytest
from retail_checkout_domain import (
    RetailCheckoutContractError,
    build_fixed_price_snapshot,
    checkout_request_fingerprint,
    classify_checkout_operation,
    normalize_checkout_intent,
)

CAPTURED_AT = "2026-08-04T12:00:00+00:00"
TAX_PROFILE = "tax-profile-approved-fixture"
FULFILMENT_POLICY = "fulfilment-policy-approved-fixture"

INTENT = {
    "customer_id": "customer-1",
    "operation_id": "checkout-operation-1",
    "fulfilment_method": "pickup",
    "items": [{"variant_id": "variant-1", "quantity": 2}],
}

AUTHORITATIVE_VARIANT = {
    "publication_status": "published",
    "is_active": True,
    "pricing_mode": "fixed",
    "fulfilment_mode": "ready_stock",
    "allowed_fulfilment_methods": ["ship", "pickup"],
    "currency": "IDR",
    "unit_price_minor": 150000,
    "product_id": "product-1",
    "product_name": "Desk Sign",
    "product_slug": "desk-sign",
    "sku": "SIGN-BLUE",
    "variant_name": "Blue",
    "option_values": {"finish": "matte"},
    "publication_revision": 3,
    "internal_cost_minor": 100,
    "supplier": "private-supplier",
}


def catalog():
    return {"variant-1": copy.deepcopy(AUTHORITATIVE_VARIANT)}


def build_snapshot(**kwargs):
    options = {
        "tax_profile_version": TAX_PROFILE,
        "fulfilment_policy_version": FULFILMENT_POLICY,
        "captured_at": CAPTURED_AT,
    }
    options.update(kwargs)
    return build_fixed_price_snapshot(INTENT, catalog(), **options)


def assert_contract_error(code, callback):
    with pytest.raises(RetailCheckoutContractError) as caught:
        callback()
    assert caught.value.code == code


def test_normalization_accepts_only_authenticated_client_intent_fields():
    normalized = normalize_checkout_intent(INTENT)

    assert normalized == INTENT
    assert "total_minor" not in normalized
    assert "unit_price_minor" not in normalized["items"][0]


@pytest.mark.parametrize(
    ("field", "value", "code"),
    [
        ("customer_id", None, "checkout_customer_required"),
        ("customer_id", "", "checkout_customer_required"),
        ("items", [], "checkout_items_required"),
        ("fulfilment_method", "courier-default", "checkout_fulfilment_invalid"),
    ],
)
def test_invalid_intent_is_rejected(field, value, code):
    payload = copy.deepcopy(INTENT)
    payload[field] = value
    assert_contract_error(code, lambda: normalize_checkout_intent(payload))


def test_guest_and_client_authoritative_fields_cannot_enter_the_contract():
    guest = copy.deepcopy(INTENT)
    guest.pop("customer_id")
    assert_contract_error(
        "checkout_customer_required", lambda: normalize_checkout_intent(guest)
    )

    client_price = copy.deepcopy(INTENT)
    client_price["total_minor"] = 1
    assert_contract_error(
        "checkout_unknown_field", lambda: normalize_checkout_intent(client_price)
    )

    item_price = copy.deepcopy(INTENT)
    item_price["items"][0]["unit_price_minor"] = 1
    assert_contract_error(
        "checkout_unknown_field", lambda: normalize_checkout_intent(item_price)
    )


def test_duplicate_variant_is_rejected_instead_of_creating_ambiguous_lines():
    payload = copy.deepcopy(INTENT)
    payload["items"].append({"variant_id": "variant-1", "quantity": 1})

    assert_contract_error(
        "checkout_duplicate_variant", lambda: normalize_checkout_intent(payload)
    )


def test_fingerprint_is_deterministic_and_excludes_operation_id():
    first = checkout_request_fingerprint(INTENT)
    replay_with_new_key = copy.deepcopy(INTENT)
    replay_with_new_key["operation_id"] = "another-operation"
    changed_quantity = copy.deepcopy(INTENT)
    changed_quantity["items"][0]["quantity"] = 3

    assert first == checkout_request_fingerprint(replay_with_new_key)
    assert first != checkout_request_fingerprint(changed_quantity)


def test_fingerprint_is_stable_when_equivalent_cart_lines_are_reordered():
    source = copy.deepcopy(INTENT)
    source["items"] = [
        {"variant_id": "variant-2", "quantity": 1},
        {"variant_id": "variant-1", "quantity": 2},
    ]
    reordered = copy.deepcopy(source)
    reordered["items"].reverse()

    assert checkout_request_fingerprint(source) == checkout_request_fingerprint(
        reordered
    )
    assert normalize_checkout_intent(source)["items"] == [
        {"variant_id": "variant-1", "quantity": 2},
        {"variant_id": "variant-2", "quantity": 1},
    ]


def test_operation_id_accepts_only_an_exact_semantic_replay():
    existing = {
        "operation_id": INTENT["operation_id"],
        "request_fingerprint": checkout_request_fingerprint(INTENT),
    }

    assert classify_checkout_operation(INTENT, None) == "new"
    assert classify_checkout_operation(INTENT, existing) == "replay"

    changed = copy.deepcopy(INTENT)
    changed["items"][0]["quantity"] = 3
    assert_contract_error(
        "checkout_operation_id_conflict",
        lambda: classify_checkout_operation(changed, existing),
    )


@pytest.mark.parametrize(
    "existing_operation",
    [
        "not-a-mapping",
        {"operation_id": "other-operation", "request_fingerprint": "abc"},
        {"operation_id": INTENT["operation_id"], "request_fingerprint": ""},
        {"operation_id": INTENT["operation_id"]},
    ],
)
def test_operation_record_must_match_the_contract(existing_operation):
    assert_contract_error(
        "checkout_operation_record_invalid",
        lambda: classify_checkout_operation(INTENT, existing_operation),
    )


@pytest.mark.parametrize("quantity", [0, 1001, True, 1.5])
def test_quantity_is_positive_bounded_and_integer(quantity):
    payload = copy.deepcopy(INTENT)
    payload["items"][0]["quantity"] = quantity

    assert_contract_error(
        "checkout_quantity_invalid", lambda: normalize_checkout_intent(payload)
    )


def test_cart_has_a_bounded_number_of_distinct_lines():
    payload = copy.deepcopy(INTENT)
    payload["items"] = [
        {"variant_id": f"variant-{index}", "quantity": 1} for index in range(101)
    ]

    assert_contract_error(
        "checkout_items_limit_exceeded", lambda: normalize_checkout_intent(payload)
    )


def test_snapshot_uses_authoritative_catalog_and_detaches_nested_values():
    source = catalog()
    snapshot = build_fixed_price_snapshot(
        INTENT,
        source,
        tax_profile_version=TAX_PROFILE,
        fulfilment_policy_version=FULFILMENT_POLICY,
        captured_at=CAPTURED_AT,
    )

    source["variant-1"]["option_values"]["finish"] = "gloss"
    line = snapshot["items"][0]

    assert snapshot["customer_id"] == "customer-1"
    assert snapshot["currency"] == "IDR"
    assert snapshot["total_minor"] == 300000
    assert snapshot["tax_profile_version"] == TAX_PROFILE
    assert snapshot["fulfilment_policy_version"] == FULFILMENT_POLICY
    assert line["price_snapshot"]["unit_price_minor"] == 150000
    assert line["variant_snapshot"]["option_values"] == {"finish": "matte"}
    assert "internal_cost_minor" not in line
    assert "supplier" not in line


def test_snapshot_requires_versioned_tax_and_fulfilment_context():
    assert_contract_error(
        "checkout_tax_profile_required",
        lambda: build_snapshot(tax_profile_version=None),
    )
    assert_contract_error(
        "checkout_fulfilment_policy_required",
        lambda: build_snapshot(fulfilment_policy_version=None),
    )


@pytest.mark.parametrize("captured_at", ["not-a-time", "2026-08-04T12:00:00"])
def test_snapshot_capture_time_must_be_timezone_aware(captured_at):
    assert_contract_error(
        "checkout_capture_time_invalid",
        lambda: build_snapshot(captured_at=captured_at),
    )


@pytest.mark.parametrize(
    ("field", "value", "code"),
    [
        ("pricing_mode", "quote_required", "checkout_quote_required"),
        ("pricing_mode", "calculated", "checkout_pricing_mode_unavailable"),
        ("fulfilment_mode", "made_to_order", "checkout_fulfilment_mode_unavailable"),
        ("unit_price_minor", 0, "checkout_authoritative_price_invalid"),
        ("publication_revision", 0, "checkout_publication_revision_invalid"),
        ("publication_status", "draft", "checkout_catalog_inactive"),
        ("is_active", False, "checkout_catalog_inactive"),
        (
            "allowed_fulfilment_methods",
            ["ship"],
            "checkout_fulfilment_method_unavailable",
        ),
        ("currency", "idr", "checkout_currency_invalid"),
    ],
)
def test_unsupported_or_incomplete_authoritative_catalog_cannot_become_order(
    field, value, code
):
    source = catalog()
    source["variant-1"][field] = value
    assert_contract_error(
        code,
        lambda: build_fixed_price_snapshot(
            INTENT,
            source,
            tax_profile_version=TAX_PROFILE,
            fulfilment_policy_version=FULFILMENT_POLICY,
            captured_at=CAPTURED_AT,
        ),
    )


def test_snapshot_rejects_non_text_option_values():
    source = catalog()
    source["variant-1"]["option_values"] = {"finish": {"internal": "matte"}}

    assert_contract_error(
        "checkout_variant_snapshot_invalid",
        lambda: build_fixed_price_snapshot(
            INTENT,
            source,
            tax_profile_version=TAX_PROFILE,
            fulfilment_policy_version=FULFILMENT_POLICY,
            captured_at=CAPTURED_AT,
        ),
    )


def test_mixed_currency_is_rejected_before_a_total_is_built():
    source = catalog()
    source["variant-2"] = copy.deepcopy(AUTHORITATIVE_VARIANT)
    source["variant-2"]["currency"] = "USD"
    payload = copy.deepcopy(INTENT)
    payload["items"].append({"variant_id": "variant-2", "quantity": 1})

    assert_contract_error(
        "checkout_currency_mismatch",
        lambda: build_fixed_price_snapshot(
            payload,
            source,
            tax_profile_version=TAX_PROFILE,
            fulfilment_policy_version=FULFILMENT_POLICY,
            captured_at=CAPTURED_AT,
        ),
    )

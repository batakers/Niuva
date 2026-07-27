"""Settings is the company profile, and nothing a public reader should not see.

The public settings read used to serve whatever the document held, which was
bank account details for the manual-transfer flow disabled in an earlier
phase: a payment instruction published to anyone, for a payment nobody can
make.
"""

from settings_domain import (
    INTEGRATION_CAPABILITIES,
    LEGACY_PAYMENT_FIELDS,
    PUBLIC_PROFILE_FIELDS,
    default_settings,
    integration_status,
    merge_profile,
    project_admin_settings,
    project_public_settings,
)

STORED = {
    "_id": "mongo-oid",
    "key": "site",
    "legal_name": "PT Niuva Inovasi Utama",
    "tagline": "Indie R&D studio",
    "address": "Bandung Techno Park",
    "email": "halo@niuva.test",
    "phone": "022-000",
    "whatsapp": "08511767",
    "maps_url": "https://maps.example/niuva",
    "instagram_url": "",
    "linkedin_url": "",
    # Retained from before the manual-transfer flow was disabled.
    "bank_name": "Bank Mandiri",
    "account_number": "000-0000-0000",
    "account_holder": "PT Niuva Inovasi Utama",
}


def test_the_public_read_carries_the_profile_only():
    public = project_public_settings(STORED)

    assert public["legal_name"] == "PT Niuva Inovasi Utama"
    assert public["whatsapp"] == "08511767"
    assert set(public) == set(PUBLIC_PROFILE_FIELDS)


def test_the_public_read_never_carries_bank_details():
    public = project_public_settings(STORED)

    for field in LEGACY_PAYMENT_FIELDS:
        assert field not in public
    assert "000-0000-0000" not in repr(public)
    assert "key" not in public
    assert "_id" not in public


def test_a_field_added_to_the_document_stays_internal():
    """The public projection is an allowlist, so new keys do not leak."""
    public = project_public_settings({**STORED, "internal_note": "jangan tayang"})

    assert "internal_note" not in public


def test_a_missing_profile_field_reads_as_empty_not_absent():
    public = project_public_settings({"legal_name": "PT Niuva"})

    assert public["email"] == ""
    assert set(public) == set(PUBLIC_PROFILE_FIELDS)


def test_the_default_document_seeds_no_bank_account():
    """Seeding a placeholder account publishes an instruction to pay it."""
    defaults = default_settings()

    for field in LEGACY_PAYMENT_FIELDS:
        assert field not in defaults
    assert defaults["legal_name"]


def test_staff_keep_legacy_payment_data_readable_but_separated():
    admin = project_admin_settings(STORED)

    assert admin["legacy_payment_readonly"]["account_number"] == "000-0000-0000"
    # Not mixed in with the editable profile, so it cannot be saved back.
    for field in LEGACY_PAYMENT_FIELDS:
        assert field not in admin


def test_integration_cards_name_no_vendor_and_hold_no_secret():
    cards = integration_status()

    assert {card["capability"] for card in cards} == set(INTEGRATION_CAPABILITIES)
    for card in cards:
        assert card["status"] == "inactive"
        assert card["holds_credentials"] is False
        # Provider-neutral: no vendor name, no endpoint, no key.
        assert "provider" not in card
        assert "api_key" not in card
        assert "://" not in repr(card)


def test_an_update_cannot_write_outside_the_profile():
    merged = merge_profile(
        STORED,
        {
            "legal_name": "PT Niuva Baru",
            "account_number": "999-9999-9999",
            "internal_note": "smuggled",
        },
    )

    assert merged["legal_name"] == "PT Niuva Baru"
    # The stored legacy value is untouched, and nothing new was introduced.
    assert merged["account_number"] == "000-0000-0000"
    assert "internal_note" not in merged


def test_an_update_trims_what_it_stores():
    merged = merge_profile(STORED, {"email": "  halo@niuva.test  "})

    assert merged["email"] == "halo@niuva.test"

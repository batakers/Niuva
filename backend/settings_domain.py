"""Company settings: one source for the public profile, and nothing more.

Two rules.

The public projection is an allowlist of company profile fields. It previously
served whatever the settings document held, which was bank account details for
the manual-transfer flow that has since been disabled: a payment instruction
published to anyone, for a payment nobody can make.

Integration cards report status only. They never hold a secret and never
activate a provider; a settings screen that stores credentials becomes the
place credentials leak from.
"""

from copy import deepcopy

# The single source for the public site and its footer.
PUBLIC_PROFILE_FIELDS = (
    "legal_name",
    "tagline",
    "address",
    "email",
    "phone",
    "whatsapp",
    "maps_url",
    "instagram_url",
    "linkedin_url",
)

# Retained so historical payment records stay readable to staff. Never public,
# and never an instruction to pay: the manual-transfer flow is disabled.
LEGACY_PAYMENT_FIELDS = ("bank_name", "account_number", "account_holder")

# Provider-neutral. A card says whether a capability is available, never which
# vendor would serve it and never how to reach them.
INTEGRATION_CAPABILITIES = ("payment", "messaging", "email")


def default_settings() -> dict:
    return {
        "key": "site",
        "legal_name": "PT Niuva Inovasi Utama",
        "tagline": "",
        "address": "",
        "email": "",
        "phone": "",
        "whatsapp": "",
        "maps_url": "",
        "instagram_url": "",
        "linkedin_url": "",
    }


def project_public_settings(document: dict) -> dict:
    """Company profile only. Bank details are not a public fact."""
    return {
        field: document.get(field, "")
        for field in PUBLIC_PROFILE_FIELDS
    }


def project_admin_settings(document: dict) -> dict:
    value = {key: item for key, item in document.items() if key not in {"_id", "key"}}
    value["integrations"] = integration_status()
    value["legacy_payment_readonly"] = {
        field: document.get(field, "") for field in LEGACY_PAYMENT_FIELDS
    }
    for field in LEGACY_PAYMENT_FIELDS:
        value.pop(field, None)
    return value


def integration_status() -> list[dict]:
    """Availability per capability, with no vendor and no credential.

    Every capability is inactive until its provider contract is approved.
    Reporting it here keeps the screen honest instead of implying a working
    integration that does not exist.
    """
    return [
        {
            "capability": capability,
            "status": "inactive",
            "reason": "provider_contract_not_approved",
            "holds_credentials": False,
        }
        for capability in INTEGRATION_CAPABILITIES
    ]


def merge_profile(current: dict, payload: dict) -> dict:
    """Apply a profile update without letting anything else through."""
    merged = deepcopy(current)
    for field in PUBLIC_PROFILE_FIELDS:
        if field in payload:
            merged[field] = str(payload[field] or "").strip()
    return merged

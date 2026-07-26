"""System notification rules: where a notification may point, and when it repeats.

The bell is a feed of things the system did. Two properties matter most here.

A deep link is *derived* from an allowlisted reference, never taken from the
caller. A stored link would let whoever writes a notification choose where a
reader lands, including somewhere off-site, and every reader would follow it.

A deduplication key makes repetition idempotent. The same condition observed
twice is one notification with a later timestamp, not two identical rows the
reader has to dismiss one at a time.
"""

import hashlib

# Every reference a notification may point at, and the admin route that shows
# it. A reference type absent from this table yields no link at all: an
# unlinked notification is a smaller failure than one pointing anywhere.
NOTIFICATION_REFERENCE_ROUTES = {
    "inquiry": "/admin/inquiries/{id}",
    "b2b_quote": "/admin/b2b/quotes/{id}",
    "b2b_project": "/admin/b2b/projects/{id}",
    "work_order": "/admin/b2b/work-orders/{id}",
    "retail_order": "/admin/retail-orders/{id}",
    "restock_alert": "/admin/restock-alerts",
    "material": "/admin/stock-movements?subject_type=material&subject_id={id}",
    "product_variant": (
        "/admin/stock-movements?subject_type=product_variant&subject_id={id}"
    ),
}

NOTIFICATION_STATUSES = ("unread", "read")


def is_allowlisted_reference(reference_type: str | None) -> bool:
    return reference_type in NOTIFICATION_REFERENCE_ROUTES


def deep_link_for(reference_type: str | None, reference_id: str | None) -> str | None:
    """Build the in-app path for a reference, or nothing if it is not allowed."""
    template = NOTIFICATION_REFERENCE_ROUTES.get(reference_type)
    if template is None:
        return None
    if "{id}" not in template:
        return template
    if not reference_id:
        return None
    # Only the identifier is interpolated, and only into a fixed template, so a
    # reference id cannot introduce a host, a scheme, or another path.
    safe_id = str(reference_id).strip()
    if not safe_id or any(character in safe_id for character in "/?#&:"):
        return None
    return template.replace("{id}", safe_id)


def deduplication_key(
    *,
    user_id: str,
    event: str,
    reference_type: str | None,
    reference_id: str | None,
) -> str:
    """Identify one notifiable condition for one reader.

    Keyed on the reader too: the same condition still deserves to reach every
    person who needs to act on it.
    """
    canonical = "|".join(
        [
            str(user_id),
            str(event),
            str(reference_type or ""),
            str(reference_id or ""),
        ]
    )
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest()


def project_notification(document: dict) -> dict:
    """Present a notification with its derived link and read state.

    Any stored link is dropped rather than trusted: the link a reader follows
    is always recomputed from the reference.
    """
    value = {
        key: item
        for key, item in document.items()
        if key not in {"_id", "deep_link", "link", "url"}
    }
    value["deep_link"] = deep_link_for(
        value.get("reference_type"), value.get("reference_id")
    )
    value["is_read"] = bool(value.get("read_at"))
    return value

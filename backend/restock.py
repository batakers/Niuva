from inventory_domain import as_decimal


def shortage_triggers(balance: dict, reorder_point) -> set[str]:
    triggers = set()
    if as_decimal(balance.get("available", 0)) <= as_decimal(reorder_point or 0):
        triggers.add("reorder_point")
    if as_decimal(balance.get("projected", 0)) < 0:
        triggers.add("projected_shortage")
    return triggers


def active_alert_key(subject_type: str, subject_id: str, trigger_type: str) -> str:
    return f"{subject_type}:{subject_id}:{trigger_type}:active"

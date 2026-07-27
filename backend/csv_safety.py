"""Safe spreadsheet serialization helpers."""

FORMULA_PREFIXES = ("=", "+", "-", "@", "\t", "\r")


def safe_csv_cell(value):
    """Prevent spreadsheet formula execution while preserving displayed text."""
    if value is None:
        return ""
    if not isinstance(value, str):
        return value
    if value.startswith(FORMULA_PREFIXES):
        return f"'{value}"
    return value


def safe_csv_row(row: dict, fieldnames: list[str]) -> dict:
    return {key: safe_csv_cell(row.get(key, "")) for key in fieldnames}

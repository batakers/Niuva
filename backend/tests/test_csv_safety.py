import csv
import io

from csv_safety import safe_csv_cell, safe_csv_row


def test_formula_prefixes_are_neutralized_without_changing_normal_values():
    for hostile in (
        '=HYPERLINK("https://evil.test")',
        "+1+1",
        "-2+3",
        "@SUM(A1:A2)",
        "\t=cmd",
        "\r=cmd",
    ):
        assert safe_csv_cell(hostile).startswith("'")
    assert safe_csv_cell("normal@example.com") == "normal@example.com"
    assert safe_csv_cell(42) == 42


def test_safe_rows_remain_valid_csv():
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["name", "email"])
    writer.writeheader()
    writer.writerow(
        safe_csv_row(
            {"name": "=1+1", "email": "person@example.com"},
            ["name", "email"],
        )
    )
    parsed = list(csv.DictReader(io.StringIO(output.getvalue())))
    assert parsed == [{"name": "'=1+1", "email": "person@example.com"}]

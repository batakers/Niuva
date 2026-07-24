import {
  SUPPORTED_MATERIAL_UNITS,
  formatIdr,
  materialFormFromRecord,
  priceVersionPayload,
  validReason,
  visibleMaterialActions,
} from "./materials";


test("legacy material receives safe setup defaults without changing its id", () => {
  expect(materialFormFromRecord({ id: "legacy-1", name: "PLA", active: true })).toEqual({
    id: "legacy-1",
    sku: "",
    name: "PLA",
    description: "",
    color: "",
    base_unit: "",
    supplier_reference: "",
    waste_percentage: "0",
    reorder_point: "0",
    lead_time_days: "0",
    inventory_tracking_enabled: false,
    setup_status: "needs_review",
    status: "active",
  });
});


test("material price helpers preserve integer IDR and supported units", () => {
  expect(SUPPORTED_MATERIAL_UNITS).toContain("kg");
  expect(formatIdr(125000)).toContain("125.000");
  expect(
    priceVersionPayload({ amount: "125000", price_unit: "kg", effective_from: "2026-08-01T00:00", reason: "Supplier update" }),
  ).toEqual({
    amount: 125000,
    currency: "IDR",
    price_unit: "kg",
    effective_from: new Date("2026-08-01T00:00").toISOString(),
    reason: "Supplier update",
  });
});


test("reason and material actions follow exact rules", () => {
  expect(validReason("ok")).toBe(false);
  expect(validReason("Stock supplier dihentikan")).toBe(true);
  expect(visibleMaterialActions(["pricing.read"])).toEqual(["price_history"]);
  expect(visibleMaterialActions(["materials.write", "materials.archive", "pricing.write"])).toEqual([
    "create",
    "edit",
    "archive",
    "append_price",
  ]);
});

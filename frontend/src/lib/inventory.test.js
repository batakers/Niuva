import {
  alertActions,
  buildOperationPayload,
  movementTypesForSubject,
  operationDefaults,
  parseInventoryConflict,
  statusTone,
  validInventoryReason,
  visibleMovementTypes,
} from "./inventory";


test("operation defaults use a UUID and preserve Decimal strings", () => {
  const value = operationDefaults("material", "mat-1", "receive");
  expect(value.subject_type).toBe("material");
  expect(value.subject_id).toBe("mat-1");
  expect(value.operation_id).toMatch(/^[0-9a-f-]{36}$/);
  expect(value.quantity).toBe("");

  expect(buildOperationPayload({ ...value, quantity: "1.250", reason: "Warehouse receipt" }).quantity).toBe("1.250");
});


test("movement types follow subject and adjustment permission", () => {
  expect(movementTypesForSubject("material")).toContain("receive");
  expect(movementTypesForSubject("material")).not.toContain("ship");
  expect(movementTypesForSubject("product_variant")).toContain("produce");
  expect(visibleMovementTypes("material", ["inventory.write"])).not.toContain("damage");
  expect(visibleMovementTypes("material", ["inventory.write", "inventory.adjust"])).toEqual(
    expect.arrayContaining(["damage", "adjustment"]),
  );
});


test("inventory conflicts and status tones are stable", () => {
  expect(parseInventoryConflict({ code: "stale_balance" })).toBe(
    "Data stok berubah. Muat ulang sebelum mencoba lagi.",
  );
  expect(parseInventoryConflict({ code: "operation_id_conflict" })).toContain("Operation ID");
  expect(statusTone("active")).toBe("warning");
  expect(statusTone("resolved")).toBe("success");
});


test("reason and alert actions follow permissions", () => {
  expect(validInventoryReason("no")).toBe(false);
  expect(validInventoryReason("Stock count verified")).toBe(true);
  expect(alertActions(["restock_alerts.read"])).toEqual([]);
  expect(alertActions(["restock_alerts.manage"])).toEqual(["resolve"]);
});

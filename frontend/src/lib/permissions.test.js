import { hasPermission } from "./permissions";


test("allows an explicit permission", () => {
  expect(hasPermission({ permissions: ["users.read"] }, "users.read")).toBe(true);
});


test("allows the super-admin wildcard", () => {
  expect(hasPermission({ permissions: ["*"] }, "roles.manage")).toBe(true);
});


test("denies missing users and permissions", () => {
  expect(hasPermission(null, "users.read")).toBe(false);
  expect(hasPermission({ permissions: [] }, "users.read")).toBe(false);
});

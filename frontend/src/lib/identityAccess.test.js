import { accountStatusLabel } from "./identityAccess";

test("exposes account status labels", () => {
  expect(accountStatusLabel("active")).toBe("Active");
  expect(accountStatusLabel("disabled")).toBe("Disabled");
});

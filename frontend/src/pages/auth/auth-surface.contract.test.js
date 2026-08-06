const fs = require("fs");
const path = require("path");

const read = (...segments) =>
  fs.readFileSync(path.resolve(__dirname, ...segments), "utf8");

const migratedSources = [
  ["AuthShell.jsx", read("..", "..", "components", "auth", "AuthShell.jsx")],
  ["CustomerLogin.jsx", read("CustomerLogin.jsx")],
  ["AdminLogin.jsx", read("..", "admin", "AdminLogin.jsx")],
  ["ForgotPassword.jsx", read("ForgotPassword.jsx")],
  ["ResetPassword.jsx", read("ResetPassword.jsx")],
  ["ResetPasswordState.jsx", read("ResetPasswordState.jsx")],
  ["StaffInvitationAccept.jsx", read("StaffInvitationAccept.jsx")],
];

test.each(migratedSources)(
  "%s avoids pseudo-terminal and square-control presentation",
  (_name, source) => {
    expect(source).not.toMatch(/font-mono(?:-tech)?|rounded-none/);
  }
);

test.each(migratedSources)(
  "%s does not duplicate the primary button palette",
  (_name, source) => {
    expect(source).not.toMatch(/bg-action-primary|hover:bg-action-primary-hover/);
  }
);

test("customer and staff entry points declare separate presentation audiences", () => {
  const customer = read("CustomerLogin.jsx");
  const staff = read("..", "admin", "AdminLogin.jsx");

  expect(customer).toContain('<AuthShell audience="customer">');
  expect(customer).toContain('/forgot-password?audience=customer');
  expect(staff).toContain('<AuthShell audience="staff">');
  expect(staff).toContain('/forgot-password?audience=staff');
});
test("recovery keeps the approved shared API paths", () => {
  const forgot = read("ForgotPassword.jsx");
  const reset = read("ResetPassword.jsx");

  expect(forgot).toContain('api.post("/auth/forgot-password", { email })');
  expect(reset).toContain('api.post("/auth/reset-password/validate", { token })');
  expect(reset).toContain(
    'api.post("/auth/reset-password", { token, new_password: newPassword })'
  );
});

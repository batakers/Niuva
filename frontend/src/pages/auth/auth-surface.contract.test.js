const fs = require("fs");
const path = require("path");

const read = (...segments) =>
  fs.readFileSync(path.resolve(__dirname, ...segments), "utf8");

const migratedSources = [
  ["AuthShell.jsx", read("..", "..", "components", "auth", "AuthShell.jsx")],
  ["CustomerLogin.jsx", read("CustomerLogin.jsx")],
  ["CustomerRegistration.jsx", read("CustomerRegistration.jsx")],
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

test("customer registration keeps identity creation separate from transaction routes", () => {
  const registration = read("CustomerRegistration.jsx");

  expect(registration).toContain('api.post("/auth/register"');
  expect(registration).toContain('api.post("/auth/register/verify"');
  expect(registration).toContain('api.post("/auth/google/start"');
  expect(registration).toContain('privacy_consent: true');
  expect(registration).not.toContain('api.post("/orders"');
  expect(registration).not.toContain('api.post("/checkout"');
  expect(registration).not.toContain('api.post("/payments"');
});

test("staff invitation keeps acceptance localized and outcome-safe", () => {
  const invitation = read("StaffInvitationAccept.jsx");

  expect(invitation).toContain('useI18n');
  expect(invitation).toContain('response?.status !== 201');
  expect(invitation).toContain('data-testid="staff-invitation-uncertain"');
  expect(invitation).toContain('t("auth.staffInvitation.uncertainDescription")');
  expect(invitation).not.toContain('Token undangan tidak tersedia.');
  expect(invitation).not.toContain('Konfirmasi password tidak sama.');
});

test("Admin Login uses an exact owned return boundary and persisted invite state", () => {
  const adminLogin = read("..", "admin", "AdminLogin.jsx");

  expect(adminLogin).toContain("export function getAdminDestination");
  expect(adminLogin).toContain('location.state?.invitationAccepted === true');
  expect(adminLogin).toContain('t("auth.invitationAccepted")');
  expect(adminLogin).not.toContain('startsWith("/admin") &&');
  expect(adminLogin).not.toContain("Ingat saya");
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

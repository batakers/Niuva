import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";

import { I18nProvider } from "@/i18n";
import { api } from "@/lib/api";
import { hasPermission } from "@/lib/permissions";
import { useAuth } from "@/context/AuthContext";
import AdminLogin, { getAdminDestination } from "./AdminLogin";

jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/lib/api", () => ({
  api: { post: jest.fn() },
  formatApiError: jest.fn(() => "Login belum berhasil. Coba lagi."),
}));

jest.mock("@/lib/permissions", () => ({
  hasPermission: jest.fn(),
}));

function LocationProbe() {
  const location = useLocation();
  return (
    <p data-testid="location">
      {`${location.pathname}${location.search}${location.hash}`}
    </p>
  );
}

function renderPage(entry = "/admin/login") {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[entry]}>
        <Routes>
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<LocationProbe />} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );
}

beforeEach(() => {
  useAuth.mockReturnValue({ user: null, loading: false, login: jest.fn() });
  hasPermission.mockReturnValue(false);
});

afterEach(() => jest.resetAllMocks());

test.each([
  ["/admin", "/admin"],
  ["/admin/orders?tab=open#queue", "/admin/orders?tab=open#queue"],
  ["/administrator", "/admin"],
  ["https://evil.example/admin", "/admin"],
  ["/admin/..%2Fevil", "/admin"],
  ["/admin/login", "/admin"],
])("keeps the Admin return target inside the owned boundary: %s", (input, expected) => {
  expect(getAdminDestination(input)).toBe(expected);
});

test("shows the persisted invitation acknowledgement on Admin Login", () => {
  renderPage({ pathname: "/admin/login", state: { invitationAccepted: true } });

  expect(screen.getByTestId("admin-login-invitation-success")).toHaveTextContent(
    "Undangan diterima. Silakan masuk melalui login Admin.",
  );
  expect(screen.getByLabelText("Ingat saya")).toBeInTheDocument();
});

test("returns to a nested Admin destination after login", async () => {
  const login = jest.fn();
  useAuth.mockReturnValue({ user: null, loading: false, login });
  api.post.mockResolvedValue({ data: { user: { id: "staff-1" } } });
  renderPage({ pathname: "/admin/login", state: { from: "/admin/orders?tab=open#queue" } });

  fireEvent.change(screen.getByTestId("admin-login-email"), {
    target: { value: "staff@example.com" },
  });
  fireEvent.change(screen.getByTestId("admin-login-password"), {
    target: { value: "password" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Masuk" }));

  expect(await screen.findByTestId("location")).toHaveTextContent(
    "/admin/orders?tab=open#queue",
  );
  expect(login).toHaveBeenCalledWith(
    { id: "staff-1" },
    undefined,
    undefined,
  );
});

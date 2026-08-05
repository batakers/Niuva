import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { I18nProvider } from "../../i18n";
import { ADMIN_ROUTE_PERMISSIONS } from "../../lib/permissions";

jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

function CustomerLoginProbe() {
  const location = useLocation();

  return (
    <div>
      <span>customer login page</span>
      <span data-testid="customer-login-from">{location.state?.from}</span>
    </div>
  );
}

function renderProtected({ initialPath = "/admin", permission } = {}) {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <ProtectedRoute permission={permission}>
                <div>protected content</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/notifications"
            element={
              <ProtectedRoute permission={permission}>
                <div>protected content</div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute permission={permission}>
                <div>protected content</div>
              </ProtectedRoute>
            }
          />
          <Route path="/admin/login" element={<div>login page</div>} />
          <Route path="/login" element={<CustomerLoginProbe />} />
        </Routes>
      </MemoryRouter>
    </I18nProvider>,
  );
}

afterEach(() => {
  jest.resetAllMocks();
});

test("shows a loading state and renders nothing else while auth is resolving", () => {
  useAuth.mockReturnValue({ user: null, loading: true });
  renderProtected();
  expect(screen.queryByText("protected content")).not.toBeInTheDocument();
  expect(screen.queryByText("login page")).not.toBeInTheDocument();
});

test("redirects an unauthenticated visitor to the admin login route", () => {
  useAuth.mockReturnValue({ user: null, loading: false });
  renderProtected();
  expect(screen.getByText("login page")).toBeInTheDocument();
  expect(screen.queryByText("protected content")).not.toBeInTheDocument();
});

test("redirects an unauthenticated customer surface to customer login and preserves origin", () => {
  useAuth.mockReturnValue({ user: null, loading: false });
  renderProtected({ initialPath: "/dashboard" });

  expect(screen.getByText("customer login page")).toBeInTheDocument();
  expect(screen.getByTestId("customer-login-from").textContent).toBe("/dashboard");
  expect(screen.queryByText("login page")).not.toBeInTheDocument();
  expect(screen.queryByText("protected content")).not.toBeInTheDocument();
});

test("renders children for an authenticated user when no permission is required", () => {
  useAuth.mockReturnValue({ user: { id: "user-1", permissions: [] }, loading: false });
  renderProtected();
  expect(screen.getByText("protected content")).toBeInTheDocument();
});

test("renders children when the user holds the required permission", () => {
  useAuth.mockReturnValue({
    user: { id: "user-1", permissions: ["orders.read"] },
    loading: false,
  });
  renderProtected({ permission: "orders.read" });
  expect(screen.getByText("protected content")).toBeInTheDocument();
});

test("renders children when the user holds the super-admin wildcard permission", () => {
  useAuth.mockReturnValue({
    user: { id: "user-1", permissions: ["*"] },
    loading: false,
  });
  renderProtected({ permission: "orders.read" });
  expect(screen.getByText("protected content")).toBeInTheDocument();
});

test("renders a dedicated 403 page when the user lacks the required permission", () => {
  useAuth.mockReturnValue({
    user: { id: "user-1", permissions: [] },
    loading: false,
  });
  renderProtected({ permission: "orders.read" });
  expect(screen.getByText(/403/)).toBeInTheDocument();
  expect(screen.getByText("/admin")).toBeInTheDocument();
  expect(screen.queryByText("protected content")).not.toBeInTheDocument();
});

test("denies a customer on the Admin notification feed", () => {
  useAuth.mockReturnValue({
    user: { id: "customer-1", role: "customer", permissions: [] },
    loading: false,
  });
  renderProtected({
    initialPath: "/admin/notifications",
    permission: ADMIN_ROUTE_PERMISSIONS["/admin/notifications"],
  });

  expect(screen.getByText(/403/)).toBeInTheDocument();
  expect(screen.queryByText("protected content")).not.toBeInTheDocument();
});

import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../../context/AuthContext";

jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

function renderProtected({ initialPath = "/admin", permission } = {}) {
  return render(
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
        <Route path="/admin/login" element={<div>login page</div>} />
        <Route path="/dashboard" element={<div>dashboard page</div>} />
      </Routes>
    </MemoryRouter>,
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

test("redirects to the customer dashboard when the user lacks the required permission", () => {
  useAuth.mockReturnValue({
    user: { id: "user-1", permissions: [] },
    loading: false,
  });
  renderProtected({ permission: "orders.read" });
  expect(screen.getByText("dashboard page")).toBeInTheDocument();
  expect(screen.queryByText("protected content")).not.toBeInTheDocument();
});

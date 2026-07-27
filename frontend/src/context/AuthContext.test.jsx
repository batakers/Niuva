import { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import {
  api,
  clearAdminCsrfToken,
  clearStoredToken,
  getStoredToken,
  setAdminCsrfToken,
} from "../lib/api";

jest.mock("../lib/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
    interceptors: {
      response: {
        use: jest.fn(),
        eject: jest.fn(),
      },
    },
  },
  clearStoredToken: jest.fn(),
  getStoredToken: jest.fn(),
  setAdminCsrfToken: jest.fn(),
  clearAdminCsrfToken: jest.fn(),
}));

function Probe() {
  const { user, loading, login, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.name : "none"}</span>
      <button onClick={() => login({ name: "Logged In User" }, "csrf-login")}>login</button>
      <button onClick={() => logout()}>logout</button>
      <button onClick={() => navigate("/admin")}>admin</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </BrowserRouter>,
  );
}

function setPath(path) {
  window.history.replaceState({}, "", path);
}

beforeEach(() => {
  jest.resetAllMocks();
  api.interceptors.response.use.mockReturnValue("interceptor-id");
  setPath("/");
});

afterEach(() => {
  setPath("/");
});

test("deletes the legacy token and bootstraps the Admin cookie session", async () => {
  setPath("/admin");
  api.post.mockResolvedValue({
    data: { user: { id: "user-1", name: "Existing User" }, csrf_token: "csrf-bootstrap" },
  });
  renderProbe();

  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
  expect(clearStoredToken).toHaveBeenCalledTimes(1);
  expect(api.post).toHaveBeenCalledWith("/auth/admin/session/refresh");
  expect(api.get).not.toHaveBeenCalled();
  expect(setAdminCsrfToken).toHaveBeenCalledWith("csrf-bootstrap");
  expect(screen.getByTestId("user")).toHaveTextContent("Existing User");
});

test("clears in-memory Admin state when bootstrap fails", async () => {
  setPath("/admin/login");
  api.post.mockRejectedValue(new Error("unauthorized"));
  renderProbe();

  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
  expect(api.post).toHaveBeenCalledWith("/auth/admin/session/refresh");
  expect(clearAdminCsrfToken).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("user")).toHaveTextContent("none");
});

test("login stores only the in-memory CSRF token and user", async () => {
  setPath("/admin/login");
  api.post.mockRejectedValue(new Error("unauthorized"));
  renderProbe();
  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
  api.post.mockClear();

  await act(async () => {
    screen.getByText("login").click();
  });

  expect(setAdminCsrfToken).toHaveBeenCalledWith("csrf-login");
  expect(clearStoredToken).toHaveBeenCalledTimes(1);
  expect(api.get).not.toHaveBeenCalled();
  expect(api.post).not.toHaveBeenCalled();
  expect(screen.getByTestId("user")).toHaveTextContent("Logged In User");
});

test("logout revokes the server session then clears client state", async () => {
  setPath("/admin");
  api.post.mockResolvedValueOnce({
    data: { user: { id: "user-1", name: "Existing User" }, csrf_token: "csrf-bootstrap" },
  });
  api.post.mockResolvedValueOnce({ data: {} });
  renderProbe();
  await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Existing User"));

  await act(async () => {
    screen.getByText("logout").click();
  });

  expect(api.post).toHaveBeenCalledWith("/auth/admin/logout");
  expect(clearAdminCsrfToken).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("user")).toHaveTextContent("none");
});

test("customer logout deletes the bearer token without calling the Admin endpoint", async () => {
  setPath("/account");
  getStoredToken.mockReturnValue("customer-token");
  api.get.mockResolvedValue({ data: { id: "customer-1", name: "Customer" } });
  renderProbe();
  await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Customer"));

  await act(async () => {
    screen.getByText("logout").click();
  });

  expect(clearStoredToken).toHaveBeenCalledTimes(1);
  expect(api.post).not.toHaveBeenCalled();
  expect(screen.getByTestId("user")).toHaveTextContent("none");
});

test("switching to the Admin surface clears customer auth and bootstraps Admin", async () => {
  setPath("/account");
  getStoredToken.mockReturnValue("customer-token");
  api.get.mockResolvedValue({ data: { id: "customer-1", name: "Customer" } });
  api.post.mockResolvedValue({
    data: { user: { id: "admin-1", name: "Admin" }, csrf_token: "csrf-admin" },
  });
  renderProbe();
  await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Customer"));

  await act(async () => {
    screen.getByText("admin").click();
  });

  await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Admin"));
  expect(clearStoredToken).toHaveBeenCalledTimes(1);
  expect(api.post).toHaveBeenCalledWith("/auth/admin/session/refresh");
});

test("refreshes an Admin session one minute before access expiry", async () => {
  jest.useFakeTimers();
  jest.setSystemTime(new Date("2026-07-28T08:00:00Z"));
  setPath("/admin");
  api.post
    .mockResolvedValueOnce({
      data: {
        user: { id: "user-1", name: "Existing User" },
        csrf_token: "csrf-bootstrap",
        access_expires_at: "2026-07-28T08:02:00Z",
      },
    })
    .mockResolvedValueOnce({
      data: {
        user: { id: "user-1", name: "Existing User" },
        csrf_token: "csrf-rotated",
        access_expires_at: "2026-07-28T08:17:00Z",
      },
    });
  renderProbe();
  await act(async () => { await Promise.resolve(); });

  await act(async () => {
    jest.advanceTimersByTime(60_000);
    await Promise.resolve();
  });

  expect(api.post).toHaveBeenNthCalledWith(2, "/auth/admin/session/refresh");
  expect(setAdminCsrfToken).toHaveBeenCalledWith("csrf-rotated");
  jest.useRealTimers();
});

test("customer bootstrap preserves a bearer token and loads the current user", async () => {
  setPath("/account");
  getStoredToken.mockReturnValue("customer-token");
  api.get.mockResolvedValue({ data: { id: "customer-1", name: "Customer" } });
  renderProbe();

  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
  expect(api.get).toHaveBeenCalledWith("/auth/me");
  expect(api.post).not.toHaveBeenCalled();
  expect(clearStoredToken).not.toHaveBeenCalled();
  expect(screen.getByTestId("user")).toHaveTextContent("Customer");
});

test("public bootstrap makes no API call without a bearer token", async () => {
  setPath("/");
  getStoredToken.mockReturnValue(null);
  renderProbe();

  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
  expect(api.get).not.toHaveBeenCalled();
  expect(api.post).not.toHaveBeenCalled();
  expect(clearStoredToken).not.toHaveBeenCalled();
  expect(screen.getByTestId("user")).toHaveTextContent("none");
});

test("response interceptor clears only an expired Admin session", async () => {
  setPath("/admin");
  api.post.mockRejectedValue(new Error("unauthorized"));
  renderProbe();
  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

  expect(api.interceptors.response.use).toHaveBeenCalledTimes(1);
  const [, onRejected] = api.interceptors.response.use.mock.calls[0];

  await act(async () => {
    await expect(
      onRejected({
        response: { status: 401, data: { detail: { code: "admin_session_expired" } } },
      }),
    ).rejects.toBeDefined();
  });

  expect(clearAdminCsrfToken).toHaveBeenCalledTimes(2);
  expect(screen.getByTestId("user")).toHaveTextContent("none");
});

test("the response interceptor leaves the session untouched for other 401 errors", async () => {
  setPath("/admin");
  api.post.mockResolvedValue({
    data: { user: { id: "user-1", name: "Existing User" }, csrf_token: "csrf-bootstrap" },
  });
  renderProbe();
  await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Existing User"));

  clearAdminCsrfToken.mockClear();
  const [, onRejected] = api.interceptors.response.use.mock.calls[0];

  await act(async () => {
    await expect(
      onRejected({ response: { status: 401, data: { detail: { code: "other" } } } }),
    ).rejects.toBeDefined();
  });

  expect(clearAdminCsrfToken).not.toHaveBeenCalled();
  expect(screen.getByTestId("user")).toHaveTextContent("Existing User");
});

test("useAuth returns null outside of an AuthProvider", () => {
  setPath("/");
  function Standalone() {
    const auth = useAuth();
    return <span data-testid="standalone">{String(auth)}</span>;
  }
  render(<Standalone />);
  expect(screen.getByTestId("standalone")).toHaveTextContent("null");
});

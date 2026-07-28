import { act, StrictMode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import { api } from "../lib/api";

jest.mock("../lib/api", () => ({
  clearAdminCsrfToken: jest.fn(),
  setAdminCsrfToken: jest.fn(),
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
}));

function Probe() {
  const { user, loading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.name : "none"}</span>
      <button onClick={() => login({ name: "Logged In User" })}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

function renderProbe() {
  return render(
    <AuthProvider>
      <Probe />
    </AuthProvider>,
  );
}

afterEach(() => {
  window.history.pushState({}, "", "/");
  jest.resetAllMocks();
  api.interceptors.response.use.mockReturnValue("interceptor-id");
});

beforeEach(() => {
  api.interceptors.response.use.mockReturnValue("interceptor-id");
});

test("resolves unauthenticated when the cookie session is absent", async () => {
  api.get.mockRejectedValue({ response: { status: 401 } });
  renderProbe();

  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
  expect(screen.getByTestId("user")).toHaveTextContent("none");
  expect(api.get).toHaveBeenCalledWith("/auth/me");
});

test("bootstraps the current user from the cookie session", async () => {
  api.get.mockResolvedValue({ data: { id: "user-1", name: "Existing User" } });
  renderProbe();

  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
  expect(api.get).toHaveBeenCalledWith("/auth/me");
  expect(screen.getByTestId("user")).toHaveTextContent("Existing User");
});

test("deduplicates the Admin bootstrap refresh under StrictMode", async () => {
  window.history.pushState({}, "", "/admin");
  api.post.mockResolvedValue({
    data: {
      csrf_token: "csrf-token",
      access_expires_at: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
      user: { id: "admin-1", name: "Admin User" },
    },
  });

  render(
    <StrictMode>
      <AuthProvider>
        <Probe />
      </AuthProvider>
    </StrictMode>,
  );

  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
  expect(api.post).toHaveBeenCalledTimes(1);
  expect(api.post).toHaveBeenCalledWith("/auth/admin/session/refresh");
  expect(screen.getByTestId("user")).toHaveTextContent("Admin User");
});

test("login sets the user without writing a browser token", async () => {
  api.get.mockRejectedValue({ response: { status: 401 } });
  renderProbe();
  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

  await act(async () => {
    screen.getByText("login").click();
  });

  expect(screen.getByTestId("user")).toHaveTextContent("Logged In User");
});

test("logout revokes the server session and clears the user", async () => {
  api.get.mockResolvedValue({ data: { id: "user-1", name: "Existing User" } });
  api.post.mockResolvedValue({ data: { ok: true } });
  renderProbe();
  await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Existing User"));

  await act(async () => {
    screen.getByText("logout").click();
  });

  expect(api.post).toHaveBeenCalledWith("/auth/logout");
  expect(screen.getByTestId("user")).toHaveTextContent("none");
});

test("a terminal 401 clears the in-memory session", async () => {
  api.get.mockRejectedValue({ response: { status: 401 } });
  renderProbe();
  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

  expect(api.interceptors.response.use).toHaveBeenCalledTimes(1);
  const [, onRejected] = api.interceptors.response.use.mock.calls[0];
  await act(async () => {
    await expect(onRejected({ response: { status: 401 } })).rejects.toBeDefined();
  });
  expect(screen.getByTestId("user")).toHaveTextContent("none");
});

test("the response interceptor leaves the session untouched for non-401 errors", async () => {
  api.get.mockResolvedValue({ data: { id: "user-1", name: "Existing User" } });
  renderProbe();
  await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Existing User"));

  const [, onRejected] = api.interceptors.response.use.mock.calls[0];
  await act(async () => {
    await expect(onRejected({ response: { status: 500 } })).rejects.toBeDefined();
  });
  expect(screen.getByTestId("user")).toHaveTextContent("Existing User");
});

test("useAuth returns null outside of an AuthProvider", () => {
  function Standalone() {
    const auth = useAuth();
    return <span data-testid="standalone">{String(auth)}</span>;
  }
  render(<Standalone />);
  expect(screen.getByTestId("standalone")).toHaveTextContent("null");
});

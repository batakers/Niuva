import { act } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import { api, clearStoredToken, getStoredToken, setStoredToken } from "../lib/api";

jest.mock("../lib/api", () => ({
  api: {
    get: jest.fn(),
    interceptors: {
      response: {
        use: jest.fn(),
        eject: jest.fn(),
      },
    },
  },
  getStoredToken: jest.fn(),
  setStoredToken: jest.fn(),
  clearStoredToken: jest.fn(),
}));

function Probe() {
  const { user, loading, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="loading">{String(loading)}</span>
      <span data-testid="user">{user ? user.name : "none"}</span>
      <button onClick={() => login("new-token", { name: "Logged In User" })}>login</button>
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
  jest.resetAllMocks();
  api.interceptors.response.use.mockReturnValue("interceptor-id");
});

beforeEach(() => {
  api.interceptors.response.use.mockReturnValue("interceptor-id");
});

test("resolves to an unauthenticated state without calling the API when no token is stored", async () => {
  getStoredToken.mockReturnValue(null);
  renderProbe();

  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
  expect(screen.getByTestId("user")).toHaveTextContent("none");
  expect(api.get).not.toHaveBeenCalled();
});

test("bootstraps the current user from /auth/me when a token is stored", async () => {
  getStoredToken.mockReturnValue("existing-token");
  api.get.mockResolvedValue({ data: { id: "user-1", name: "Existing User" } });
  renderProbe();

  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
  expect(api.get).toHaveBeenCalledWith("/auth/me");
  expect(screen.getByTestId("user")).toHaveTextContent("Existing User");
});

test("clears the stored token and stays unauthenticated when bootstrap fails", async () => {
  getStoredToken.mockReturnValue("stale-token");
  api.get.mockRejectedValue(new Error("unauthorized"));
  renderProbe();

  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));
  expect(clearStoredToken).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("user")).toHaveTextContent("none");
});

test("login stores the token and sets the user", async () => {
  getStoredToken.mockReturnValue(null);
  renderProbe();
  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

  await act(async () => {
    screen.getByText("login").click();
  });

  expect(setStoredToken).toHaveBeenCalledWith("new-token");
  expect(screen.getByTestId("user")).toHaveTextContent("Logged In User");
});

test("logout clears the token and the user", async () => {
  getStoredToken.mockReturnValue("existing-token");
  api.get.mockResolvedValue({ data: { id: "user-1", name: "Existing User" } });
  renderProbe();
  await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Existing User"));

  await act(async () => {
    screen.getByText("logout").click();
  });

  expect(clearStoredToken).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("user")).toHaveTextContent("none");
});

test("registers a response interceptor that clears the session on a 401", async () => {
  getStoredToken.mockReturnValue(null);
  renderProbe();
  await waitFor(() => expect(screen.getByTestId("loading")).toHaveTextContent("false"));

  expect(api.interceptors.response.use).toHaveBeenCalledTimes(1);
  const [, onRejected] = api.interceptors.response.use.mock.calls[0];

  await act(async () => {
    await expect(
      onRejected({ response: { status: 401 } }),
    ).rejects.toBeDefined();
  });

  expect(clearStoredToken).toHaveBeenCalledTimes(1);
  expect(screen.getByTestId("user")).toHaveTextContent("none");
});

test("the response interceptor leaves the session untouched for non-401 errors", async () => {
  getStoredToken.mockReturnValue("existing-token");
  api.get.mockResolvedValue({ data: { id: "user-1", name: "Existing User" } });
  renderProbe();
  await waitFor(() => expect(screen.getByTestId("user")).toHaveTextContent("Existing User"));

  clearStoredToken.mockClear();
  const [, onRejected] = api.interceptors.response.use.mock.calls[0];

  await act(async () => {
    await expect(
      onRejected({ response: { status: 500 } }),
    ).rejects.toBeDefined();
  });

  expect(clearStoredToken).not.toHaveBeenCalled();
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

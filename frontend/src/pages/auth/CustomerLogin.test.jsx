import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import CustomerLogin from "./CustomerLogin";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";

jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/lib/api", () => ({
  api: { post: jest.fn() },
}));

function renderPage(entry = "/login") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/login" element={<CustomerLogin />} />
        <Route path="/dashboard" element={<p>dashboard destination</p>} />
        <Route path="/order" element={<p>order destination</p>} />
        <Route path="/orders/:id" element={<p>order detail destination</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  useAuth.mockReturnValue({ user: null, loading: false, login: jest.fn() });
});

afterEach(() => jest.resetAllMocks());

test("renders customer-only login copy and recovery destination", () => {
  renderPage();

  expect(screen.getByRole("heading", { name: "Masuk ke akun Anda" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Lupa password?" })).toHaveAttribute(
    "href",
    "/forgot-password?audience=customer",
  );
});

test("returns to an allowlisted order destination after login", async () => {
  const login = jest.fn();
  useAuth.mockReturnValue({ user: null, loading: false, login });
  api.post.mockResolvedValue({ data: { user: { id: "customer-1" } } });
  renderPage({ pathname: "/login", state: { from: "/orders/order-1?tab=history" } });

  fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "person@example.com" } });
  fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "password" } });
  fireEvent.click(screen.getByRole("button", { name: "Masuk" }));

  await screen.findByText("order detail destination");
  expect(api.post).toHaveBeenCalledWith("/auth/login", {
    email: "person@example.com",
    password: "password",
  });
  expect(login).toHaveBeenCalledWith({ id: "customer-1" });
});

test("rejects an external return target and uses the customer dashboard", async () => {
  api.post.mockResolvedValue({ data: { user: { id: "customer-1" } } });
  renderPage({ pathname: "/login", state: { from: "https://evil.example/steal" } });

  fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "person@example.com" } });
  fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "password" } });
  fireEvent.click(screen.getByRole("button", { name: "Masuk" }));

  await screen.findByText("dashboard destination");
});

test("uses a generic localized failure and keeps the form available", async () => {
  api.post.mockRejectedValue({ response: { status: 401 } });
  renderPage();

  fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "person@example.com" } });
  fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "wrong" } });
  fireEvent.click(screen.getByRole("button", { name: "Masuk" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Email atau password tidak valid.");
  expect(screen.getByTestId("customer-login-form")).toBeInTheDocument();
});

test("prevents duplicate login submission while the request is pending", async () => {
  let resolveRequest;
  api.post.mockImplementation(
    () => new Promise((resolve) => {
      resolveRequest = resolve;
    }),
  );
  renderPage();

  fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "person@example.com" } });
  fireEvent.change(screen.getByLabelText(/Password/), { target: { value: "password" } });
  const submit = screen.getByRole("button", { name: "Masuk" });
  fireEvent.click(submit);
  fireEvent.click(submit);

  expect(api.post).toHaveBeenCalledTimes(1);
  expect(submit).toBeDisabled();
  resolveRequest({ data: { user: { id: "customer-1" } } });
  await waitFor(() => expect(submit).not.toBeInTheDocument());
});

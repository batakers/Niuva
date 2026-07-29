import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";

import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import Customers from "./Customers";

jest.mock("@/context/AuthContext", () => ({
  useAuth: jest.fn(),
}));

jest.mock("@/lib/api", () => ({
  api: { get: jest.fn(), post: jest.fn() },
  formatApiError: jest.fn(() => "Terjadi kesalahan. Coba lagi."),
}));

jest.mock("./AdminLayout", () => ({
  AdminLayout: ({ children }) => <div>{children}</div>,
}));

const POLICY = {
  min_code_points: 15,
  max_code_points: 128,
  max_utf8_bytes: 512,
};

beforeEach(() => {
  useAuth.mockReturnValue({
    user: {
      permissions: ["customers.read", "customers.manage"],
    },
  });
  api.get.mockImplementation((path) => {
    if (path === "/admin/customers") {
      return Promise.resolve({ data: [] });
    }
    if (path === "/auth/password-policy") {
      return Promise.resolve({ data: POLICY });
    }
    return Promise.reject(new Error(`Unexpected path: ${path}`));
  });
  api.post.mockResolvedValue({ data: { id: "customer-1" } });
});

afterEach(() => jest.resetAllMocks());

test("customer creation accepts a policy-valid password beyond 72 bytes", async () => {
  render(<Customers />);
  fireEvent.click(await screen.findByRole("button", { name: "Tambah customer" }));
  await screen.findByText(/15–128 karakter Unicode/);

  const inputs = screen.getAllByRole("textbox");
  const name = inputs.find((input) => input.getAttribute("type") !== "email");
  const email = inputs.find((input) => input.getAttribute("type") === "email");
  const password = "x".repeat(73);

  fireEvent.change(name, { target: { value: "Boundary Customer" } });
  fireEvent.change(email, { target: { value: "boundary@example.com" } });
  fireEvent.change(screen.getByTestId("customer-create-password"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByTestId("customer-create-submit"));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith("/admin/customers", {
      name: "Boundary Customer",
      email: "boundary@example.com",
      password,
      phone: null,
      company: null,
    });
  });
});

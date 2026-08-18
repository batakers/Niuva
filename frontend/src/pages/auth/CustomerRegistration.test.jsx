import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import CustomerRegistration from "./CustomerRegistration";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: { post: jest.fn() },
}));

function renderPage(entry = "/register") {
  return render(
    <MemoryRouter initialEntries={[entry]}>
      <Routes>
        <Route path="/register" element={<CustomerRegistration />} />
        <Route path="/register/verify" element={<CustomerRegistration />} />
        <Route path="/login" element={<p>login destination</p>} />
        <Route path="/privasi" element={<p>privacy destination</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(() => jest.resetAllMocks());

test("renders the customer registration fields, consent, and Google entry", () => {
  renderPage();

  expect(screen.getByRole("heading", { name: "Buat akun pelanggan" })).toBeInTheDocument();
  expect(screen.getByLabelText(/Nama lengkap/)).toBeInTheDocument();
  expect(screen.getByLabelText(/Email/)).toBeInTheDocument();
  expect(screen.getByLabelText(/^Password/)).toBeInTheDocument();
  expect(screen.getByLabelText(/Konfirmasi password/)).toBeInTheDocument();
  expect(screen.getByRole("checkbox", { name: /Saya setuju/ })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Daftar dengan Google" })).toBeInTheDocument();
});

test("keeps the form local when password confirmation does not match", () => {
  renderPage();
  fireEvent.change(screen.getByLabelText(/Nama lengkap/), { target: { value: "Test Customer" } });
  fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "test@example.com" } });
  fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: "a".repeat(15) } });
  fireEvent.change(screen.getByLabelText(/Konfirmasi password/), { target: { value: "b".repeat(15) } });
  fireEvent.click(screen.getByRole("checkbox", { name: /Saya setuju/ }));
  fireEvent.click(screen.getByRole("button", { name: "Buat akun" }));

  expect(screen.getByRole("alert")).toHaveTextContent("Password tidak cocok.");
  expect(api.post).not.toHaveBeenCalled();
  expect(screen.getByDisplayValue("test@example.com")).toBeInTheDocument();
});

test("submits the approved registration payload and shows generic verification state", async () => {
  api.post.mockResolvedValue({ data: { status: "verification_pending" } });
  renderPage();
  fireEvent.change(screen.getByLabelText(/Nama lengkap/), { target: { value: " Test Customer " } });
  fireEvent.change(screen.getByLabelText(/Email/), { target: { value: "Test@example.com" } });
  fireEvent.change(screen.getByLabelText(/^Password/), { target: { value: "a".repeat(15) } });
  fireEvent.change(screen.getByLabelText(/Konfirmasi password/), { target: { value: "a".repeat(15) } });
  fireEvent.click(screen.getByRole("checkbox", { name: /Saya setuju/ }));
  fireEvent.click(screen.getByRole("button", { name: "Buat akun" }));

  await screen.findByTestId("customer-registration-pending");
  expect(api.post).toHaveBeenCalledWith("/auth/register", {
    name: "Test Customer",
    email: "test@example.com",
    password: "a".repeat(15),
    privacy_consent: true,
    return_to: "/dashboard",
  });
  expect(api.post.mock.calls[0][0]).not.toContain("login");
});

test("shows a provider-unavailable state without claiming Google success", async () => {
  api.post.mockRejectedValue({
    response: {
      status: 503,
      data: { detail: { code: "google_provider_unavailable" } },
    },
  });
  renderPage();
  fireEvent.click(screen.getByRole("checkbox", { name: /Saya setuju/ }));
  fireEvent.click(screen.getByRole("button", { name: "Daftar dengan Google" }));

  expect(await screen.findByRole("alert")).toHaveTextContent("Login Google belum tersedia");
  expect(screen.getByTestId("customer-registration-form")).toBeInTheDocument();
});

test("verifies a token without creating a session and exposes the login next step", async () => {
  api.post.mockResolvedValue({ data: { status: "verified", return_to: "/orders/order-1" } });
  renderPage("/register/verify?token=registration-token");

  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/auth/register/verify", {
    token: "registration-token",
  }));
  expect(await screen.findByTestId("customer-registration-verified")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Masuk" })).toHaveAttribute("href", "/login");
  expect(api.post).toHaveBeenCalledTimes(1);
});

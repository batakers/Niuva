import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ForgotPassword from "./ForgotPassword";
import { api, formatApiError } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: { post: jest.fn() },
  formatApiError: jest.fn(() => "Terjadi kesalahan. Coba lagi."),
}));

function renderPage(path = "/forgot-password") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/forgot-password/check-email" element={<ForgotPassword />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => formatApiError.mockReturnValue("Terjadi kesalahan. Coba lagi."));

afterEach(() => jest.resetAllMocks());

test("masks the submitted email locally and starts resend cooldown", async () => {
  api.post.mockResolvedValue({ data: { ok: true } });
  renderPage();

  fireEvent.change(screen.getByTestId("forgot-password-email"), { target: { value: "person@example.com" } });
  fireEvent.click(screen.getByTestId("forgot-password-submit"));

  await screen.findByTestId("forgot-password-sent");
  expect(screen.getByText(/pe\*+@example\.com/)).toBeInTheDocument();
  expect(screen.queryByText("person@example.com")).not.toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Kirim ulang (60)" })).toBeDisabled();
  expect(api.post).toHaveBeenCalledWith("/auth/forgot-password", { email: "person@example.com" });
});

test("can return from check-email state to the request form", async () => {
  api.post.mockResolvedValue({ data: { ok: true } });
  renderPage();

  fireEvent.change(screen.getByTestId("forgot-password-email"), {
    target: { value: "person@example.com" },
  });
  fireEvent.click(screen.getByTestId("forgot-password-submit"));
  await screen.findByTestId("forgot-password-sent");

  fireEvent.click(screen.getByRole("button", { name: "Gunakan email lain" }));

  expect(screen.getByTestId("forgot-password-form")).toBeInTheDocument();
  expect(screen.getByTestId("forgot-password-email")).toHaveValue("");
});

test("direct check-email visits use generic fallback copy", () => {
  renderPage("/forgot-password/check-email");
  expect(screen.getByText(/email yang Anda masukkan/)).toBeInTheDocument();
  expect(screen.queryByRole("button", { name: /Kirim ulang/ })).not.toBeInTheDocument();
});

test("keeps the form available after a request error", async () => {
  api.post.mockRejectedValue({ response: { data: { detail: "unavailable" } } });
  renderPage();
  fireEvent.change(screen.getByTestId("forgot-password-email"), { target: { value: "person@example.com" } });
  fireEvent.click(screen.getByTestId("forgot-password-submit"));
  await waitFor(() => expect(screen.getByRole("alert")).toBeInTheDocument());
  expect(screen.getByTestId("forgot-password-form")).toBeInTheDocument();
});

test("returns customer-origin recovery to customer login", () => {
  renderPage("/forgot-password?audience=customer");

  expect(
    screen.getByRole("link", { name: "Kembali ke login pelanggan" })
  ).toHaveAttribute("href", "/login");
  expect(
    screen.queryByRole("link", { name: "Kembali ke login admin" })
  ).not.toBeInTheDocument();
});

test("returns staff-origin recovery to admin login", () => {
  renderPage("/forgot-password?audience=staff");

  expect(
    screen.getByRole("link", { name: "Kembali ke login admin" })
  ).toHaveAttribute("href", "/admin/login");
  expect(
    screen.queryByRole("link", { name: "Kembali ke login pelanggan" })
  ).not.toBeInTheDocument();
});

test("direct recovery visits offer both known login destinations", () => {
  renderPage();

  expect(screen.getByRole("link", { name: "Login pelanggan" })).toHaveAttribute(
    "href",
    "/login"
  );
  expect(screen.getByRole("link", { name: "Login admin" })).toHaveAttribute(
    "href",
    "/admin/login"
  );
});

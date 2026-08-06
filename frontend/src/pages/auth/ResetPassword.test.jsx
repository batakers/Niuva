import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ResetPassword from "./ResetPassword";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: { get: jest.fn(), post: jest.fn() },
  formatApiError: jest.fn(() => "Terjadi kesalahan. Coba lagi."),
}));

const policy = {
  min_code_points: 15,
  max_code_points: 128,
  max_utf8_bytes: 512,
};

function renderPage(path = "/reset-password?token=secret-token") {
  window.history.replaceState({}, "", path);
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/error" element={<p>invalid reset</p>} />
        <Route path="/reset-password/success" element={<p>reset complete</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  api.post.mockImplementation((path) => {
    if (path === "/auth/reset-password/validate") return Promise.resolve({ data: { valid: true } });
    return Promise.resolve({ data: { ok: true } });
  });
  api.get.mockResolvedValue({ data: policy });
});

afterEach(() => jest.resetAllMocks());

test("removes the token from browser history before showing the form", async () => {
  renderPage();
  expect(window.location.search).toBe("");
  expect(screen.queryByTestId("reset-password-form")).not.toBeInTheDocument();

  await screen.findByTestId("reset-password-form");
  expect(api.post).toHaveBeenCalledWith("/auth/reset-password/validate", { token: "secret-token" });
});

test("uses backend policy and submits the in-memory token", async () => {
  renderPage();
  await screen.findByTestId("reset-password-form");

  fireEvent.change(screen.getByTestId("reset-password-new"), { target: { value: "correct horse battery" } });
  fireEvent.change(screen.getByTestId("reset-password-confirm"), { target: { value: "correct horse battery" } });
  fireEvent.click(screen.getByTestId("reset-password-submit"));

  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/auth/reset-password", {
    token: "secret-token",
    new_password: "correct horse battery",
  }));
  expect(await screen.findByText("reset complete")).toBeInTheDocument();
});

test("associates password validation messages with their inputs", async () => {
  renderPage();
  await screen.findByTestId("reset-password-form");

  const newPassword = screen.getByTestId("reset-password-new");
  const confirmPassword = screen.getByTestId("reset-password-confirm");
  fireEvent.change(newPassword, { target: { value: "short" } });
  fireEvent.change(confirmPassword, { target: { value: "different" } });

  const lengthError = await screen.findByText(
    "Password belum memenuhi panjang yang diperlukan."
  );
  const mismatchError = await screen.findByText("Password tidak cocok.");

  expect(newPassword).toHaveAttribute("aria-invalid", "true");
  expect(newPassword.getAttribute("aria-describedby")).toContain(
    lengthError.id
  );
  expect(confirmPassword).toHaveAttribute("aria-invalid", "true");
  expect(confirmPassword.getAttribute("aria-describedby")).toContain(
    mismatchError.id
  );
});

test("routes invalid tokens to the generic error state", async () => {
  api.post.mockResolvedValue({ data: { valid: false, code: "invalid_reset_token" } });
  renderPage();
  expect(await screen.findByText("invalid reset")).toBeInTheDocument();
  expect(api.get).not.toHaveBeenCalled();
});

test("offers retry when token validation is temporarily unavailable", async () => {
  api.post.mockRejectedValueOnce(new Error("offline"));
  renderPage();
  expect(await screen.findByRole("button", { name: "Coba Lagi" })).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Coba Lagi" }));
  expect(await screen.findByTestId("reset-password-form")).toBeInTheDocument();
});

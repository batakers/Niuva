import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { api } from "@/lib/api";
import StaffInvitationAccept from "./StaffInvitationAccept";

jest.mock("@/lib/api", () => ({
  api: { get: jest.fn(), post: jest.fn() },
  formatApiError: jest.fn(() => "Terjadi kesalahan. Coba lagi."),
}));

const POLICY = {
  min_code_points: 15,
  max_code_points: 128,
  max_utf8_bytes: 512,
};

function renderPage() {
  return render(
    <MemoryRouter initialEntries={["/staff-invitation?token=invitation-token"]}>
      <Routes>
        <Route
          path="/staff-invitation"
          element={<StaffInvitationAccept />}
        />
        <Route path="/admin/login" element={<p>admin login</p>} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  api.get.mockResolvedValue({ data: POLICY });
  api.post.mockResolvedValue({ data: { ok: true } });
});

afterEach(() => jest.resetAllMocks());

test("accepts a valid password beyond the legacy bcrypt byte boundary", async () => {
  renderPage();
  await screen.findByText(/15–128 karakter Unicode/);
  const password = "x".repeat(73);

  fireEvent.change(screen.getByTestId("staff-invitation-password"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByTestId("staff-invitation-confirmation"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByTestId("staff-invitation-submit"));

  await waitFor(() => {
    expect(api.post).toHaveBeenCalledWith(
      "/auth/staff-invitations/accept",
      { token: "invitation-token", password },
    );
  });
  expect(await screen.findByText("admin login")).toBeInTheDocument();
});

test("fails closed and offers retry while policy is unavailable", async () => {
  api.get
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce({ data: POLICY });
  renderPage();

  expect(await screen.findByRole("alert")).toHaveTextContent(
    "Aturan password belum dapat dimuat.",
  );
  expect(screen.getByTestId("staff-invitation-submit")).toBeDisabled();

  fireEvent.click(screen.getByRole("button", { name: "Coba Lagi" }));

  expect(await screen.findByText(/15–128 karakter Unicode/)).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledTimes(2);
});

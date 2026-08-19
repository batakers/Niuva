import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";

import { I18nProvider, useI18n } from "@/i18n";
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

function LocaleBridge({ language, children }) {
  const { setLang } = useI18n();

  React.useEffect(() => {
    if (language) setLang(language);
  }, [language, setLang]);

  return children;
}

function renderPage(language) {
  return render(
    <I18nProvider>
      <LocaleBridge language={language}>
        <MemoryRouter initialEntries={["/staff-invitation?token=invitation-token"]}>
          <Routes>
            <Route
              path="/staff-invitation"
              element={<StaffInvitationAccept />}
            />
            <Route path="/admin/login" element={<p>admin login</p>} />
          </Routes>
        </MemoryRouter>
      </LocaleBridge>
    </I18nProvider>,
  );
}

beforeEach(() => {
  api.get.mockResolvedValue({ data: POLICY });
  api.post.mockResolvedValue({ status: 201, data: { ok: true } });
});

afterEach(() => {
  jest.resetAllMocks();
  window.localStorage.removeItem("niuva_lang");
});

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

test("maps an expired invitation without exposing backend details", async () => {
  api.post.mockRejectedValueOnce({
    response: {
      status: 410,
      data: { error: { code: "invitation_expired" } },
    },
  });
  renderPage();
  const password = "x".repeat(73);

  await screen.findByText(/15–128 karakter Unicode/);
  fireEvent.change(screen.getByTestId("staff-invitation-password"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByTestId("staff-invitation-confirmation"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByTestId("staff-invitation-submit"));

  expect(await screen.findByTestId("staff-invitation-error")).toHaveTextContent(
    "Undangan ini sudah kedaluwarsa.",
  );
  expect(screen.queryByTestId("staff-invitation-uncertain")).not.toBeInTheDocument();
});

test("keeps an unavailable invitation message non-disclosing", async () => {
  api.post.mockRejectedValueOnce({
    response: {
      status: 410,
      data: { error: { code: "invitation_unavailable" } },
    },
  });
  renderPage();
  const password = "x".repeat(73);

  await screen.findByText(/15–128 karakter Unicode/);
  fireEvent.change(screen.getByTestId("staff-invitation-password"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByTestId("staff-invitation-confirmation"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByTestId("staff-invitation-submit"));

  const alert = await screen.findByTestId("staff-invitation-error");
  expect(alert).toHaveTextContent("Undangan ini tidak tersedia.");
  expect(alert).not.toHaveTextContent(/digunakan|token|email/i);
});

test("blocks replay when the invitation outcome is uncertain", async () => {
  api.post.mockRejectedValueOnce(new Error("timeout"));
  renderPage();
  const password = "x".repeat(73);

  await screen.findByText(/15–128 karakter Unicode/);
  fireEvent.change(screen.getByTestId("staff-invitation-password"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByTestId("staff-invitation-confirmation"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByTestId("staff-invitation-submit"));

  expect(await screen.findByTestId("staff-invitation-uncertain")).toHaveTextContent(
    "Jangan kirim ulang formulir.",
  );
  expect(screen.getByTestId("staff-invitation-submit")).toBeDisabled();
  expect(screen.getByRole("link", { name: "Buka login admin" })).toHaveAttribute(
    "href",
    "/admin/login",
  );
  expect(api.post).toHaveBeenCalledTimes(1);
});

test("treats a non-201 response as an uncertain invitation outcome", async () => {
  api.post.mockResolvedValueOnce({ status: 200, data: { ok: true } });
  renderPage();
  const password = "x".repeat(73);

  await screen.findByText(/15–128 karakter Unicode/);
  fireEvent.change(screen.getByTestId("staff-invitation-password"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByTestId("staff-invitation-confirmation"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByTestId("staff-invitation-submit"));

  expect(await screen.findByTestId("staff-invitation-uncertain")).toBeInTheDocument();
  expect(screen.queryByText("admin login")).not.toBeInTheDocument();
});

test("offers one explicit retry for a known pre-mutation dependency failure", async () => {
  const password = "x".repeat(73);
  api.post
    .mockRejectedValueOnce({
      response: {
        status: 503,
        data: { error: { code: "transaction_unavailable" } },
      },
    })
    .mockResolvedValueOnce({ status: 201, data: { ok: true } });
  renderPage();

  await screen.findByText(/15–128 karakter Unicode/);
  fireEvent.change(screen.getByTestId("staff-invitation-password"), {
    target: { value: password },
  });
  fireEvent.change(screen.getByTestId("staff-invitation-confirmation"), {
    target: { value: password },
  });
  fireEvent.click(screen.getByTestId("staff-invitation-submit"));

  expect(await screen.findByRole("button", { name: "Coba lagi sekali" })).toBeInTheDocument();
  expect(screen.getByTestId("staff-invitation-submit")).toBeDisabled();
  fireEvent.click(screen.getByRole("button", { name: "Coba lagi sekali" }));

  expect(await screen.findByText("admin login")).toBeInTheDocument();
  expect(api.post).toHaveBeenCalledTimes(2);
});

test("renders the invitation contract in English", async () => {
  renderPage("en");

  expect(await screen.findByRole("heading", { name: "Complete your staff invitation" }))
    .toBeInTheDocument();
  expect(await screen.findByText(/Unicode characters/)).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Activate staff account" })).toBeDisabled();
});

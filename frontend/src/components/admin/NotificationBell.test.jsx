import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { NotificationBell } from "./NotificationBell";
import { api, formatApiError } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: {
    get: jest.fn(),
    post: jest.fn(),
  },
  formatApiError: jest.fn(() => "Layanan notifikasi tidak tersedia."),
}));

jest.mock("@/i18n", () => ({
  useI18n: () => ({
    t: (key) =>
      ({
        "common.loading": "Memuat...",
        "common.retry": "Coba lagi",
        "notifications.allRead": "Semua notifikasi sudah dibaca",
        "notifications.bellEmpty": "Tidak ada notifikasi.",
        "notifications.bellLabel": "Notifikasi",
        "notifications.bellTitle": "Notifikasi",
        "notifications.loadFailed": "Notifikasi tidak berhasil dimuat.",
        "notifications.viewAll": "Lihat semua notifikasi",
      })[key] || key,
  }),
}));

afterEach(() => {
  jest.clearAllMocks();
});

test("announces notification load failures and retries without showing an empty state", async () => {
  let shouldFail = true;
  formatApiError.mockReturnValue("Layanan notifikasi tidak tersedia.");
  api.get.mockImplementation(() => {
    return shouldFail
      ? Promise.reject({ response: { data: { detail: "offline" } } })
      : Promise.resolve({ data: [] });
  });

  render(
    <MemoryRouter>
      <NotificationBell />
    </MemoryRouter>,
  );

  fireEvent.click(await screen.findByRole("button", { name: "Notifikasi" }));

  const alert = await screen.findByRole("alert");
  expect(alert).toHaveTextContent("Notifikasi tidak berhasil dimuat.");
  expect(alert).toHaveTextContent("Layanan notifikasi tidak tersedia.");
  expect(screen.queryByText("Tidak ada notifikasi.")).not.toBeInTheDocument();

  shouldFail = false;
  fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));

  await waitFor(() => {
    expect(screen.getByText("Tidak ada notifikasi.")).toBeInTheDocument();
  });
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import ClientDashboard from "./ClientDashboard";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: { get: jest.fn() },
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "customer-12345678", name: "Nadia" },
  }),
}));

jest.mock("@/components/layout/Layout", () => ({
  OperationalLayout: ({ children }) => <main>{children}</main>,
}));

jest.mock("@/i18n", () => {
  const copy = {
    "common.actions": "Aksi",
    "common.loading": "Memuat...",
    "common.retry": "Coba lagi",
    "dash.colDetails": "Detail",
    "dash.date": "Tanggal",
    "dash.errorDescription":
      "Periksa koneksi Anda, lalu coba muat kembali riwayat pesanan.",
    "dash.errorTitle": "Riwayat pesanan belum dapat dimuat",
    "dash.emptyTitle": "Belum ada riwayat pesanan",
    "dash.headerLabel": "Dasbor",
    "dash.historyCaption": "Riwayat pesanan akun",
    "dash.historyTitle": "Riwayat pesanan",
    "dash.legacyDescription": "Pesanan lama hanya dapat dibaca.",
    "dash.legacyTitle": "Riwayat pesanan lama tetap tersedia",
    "dash.loadingDescription": "Mohon tunggu.",
    "dash.loadingTitle": "Memuat riwayat pesanan",
    "dash.material": "Material",
    "dash.noOrders": "Belum ada pesanan.",
    "dash.openRetail": "Lihat katalog Retail",
    "dash.orderNo": "No. Pesanan",
    "dash.ordersTotal": "Pesanan",
    "dash.portalLabel": "Portal pelanggan",
    "dash.status": "Status",
    "dash.subtitle": "Lihat status dan riwayat.",
    "dash.systemActive": "Aktif",
    "dash.title": "Pesanan Saya",
    "dash.welcomeBack": "Selamat datang",
    "status.pending_estimate": "Menunggu estimasi",
  };

  return {
    useI18n: () => ({
      t: (key) => copy[key] || key,
    }),
  };
});

function renderDashboard({ strict = false } = {}) {
  const dashboard = (
    <MemoryRouter>
      <ClientDashboard />
    </MemoryRouter>
  );

  return render(
    strict ? <React.StrictMode>{dashboard}</React.StrictMode> : dashboard
  );
}

afterEach(() => {
  jest.resetAllMocks();
});

test("shows a customer-safe recoverable state instead of an empty account when orders fail", async () => {
  api.get.mockRejectedValueOnce({
    response: {
      data: {
        detail: "supplier_timeout: internal queue unavailable",
      },
    },
  });

  renderDashboard();

  const errorState = await screen.findByTestId("operational-state-error");

  expect(errorState).toHaveAttribute("aria-live", "assertive");
  expect(
    screen.getByRole("heading", {
      name: "Riwayat pesanan belum dapat dimuat",
    })
  ).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Coba lagi" })).toBeInTheDocument();
  expect(screen.queryByTestId("no-orders")).not.toBeInTheDocument();
  expect(
    screen.queryByText(/supplier_timeout|internal queue/i)
  ).not.toBeInTheDocument();
});

test("retries the same read and restores the orders list after recovery", async () => {
  api.get
    .mockRejectedValueOnce(new Error("offline"))
    .mockResolvedValueOnce({
      data: [
        {
          id: "order-1",
          order_number: "ORD-2026-001",
          material_name: "PLA",
          created_at: "2026-07-29T08:00:00Z",
          status: "pending_estimate",
          file: { original_filename: "housing.stl" },
        },
      ],
    });

  renderDashboard();

  fireEvent.click(
    await screen.findByRole("button", {
      name: "Coba lagi",
    })
  );

  expect(await screen.findByTestId("orders-list")).toBeInTheDocument();
  expect(screen.getAllByText("ORD-2026-001")).toHaveLength(2);
  expect(screen.getByTestId("orders-table")).toBeInTheDocument();
  expect(screen.getByTestId("orders-mobile-list")).toBeInTheDocument();
  expect(screen.queryByTestId("operational-state-error")).not.toBeInTheDocument();
  expect(api.get).toHaveBeenCalledTimes(2);
  expect(api.get).toHaveBeenNthCalledWith(1, "/orders");
  expect(api.get).toHaveBeenNthCalledWith(2, "/orders");
});

test("deduplicates the initial StrictMode read so failure and success cannot race", async () => {
  api.get.mockRejectedValue(new Error("offline"));

  renderDashboard({ strict: true });

  await screen.findByTestId("operational-state-error");
  expect(api.get).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Pesanan · 0")).toBeInTheDocument();
});

test("fails closed when the order projection is not a collection", async () => {
  api.get.mockResolvedValueOnce({ data: { orders: [] } });

  renderDashboard();

  expect(
    await screen.findByTestId("operational-state-error"),
  ).toBeInTheDocument();
  expect(screen.queryByTestId("no-orders")).not.toBeInTheDocument();
  expect(screen.queryByTestId("orders-list")).not.toBeInTheDocument();
});

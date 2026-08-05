import React from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useNavigate } from "react-router-dom";

import OrderDetail from "./OrderDetail";
import { api, downloadApiFile } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: { get: jest.fn() },
  downloadApiFile: jest.fn(),
}));

jest.mock("@/components/layout/Layout", () => ({
  OperationalLayout: ({ children }) => <main>{children}</main>,
}));

jest.mock("sonner", () => ({
  toast: { error: jest.fn() },
}));

jest.mock("@/i18n", () => ({
  useI18n: () => ({
    t: (key) =>
      ({
        "common.actions": "Aksi",
        "common.back": "Kembali",
        "common.retry": "Coba lagi",
        "dash.material": "Material",
        "detail.backToOrders": "Kembali ke pesanan",
        "detail.costEstimate": "Estimasi biaya",
        "detail.dateLogged": "Tanggal",
        "detail.designFile": "File desain",
        "detail.download": "Unduh",
        "detail.errorDescription": "Periksa koneksi lalu coba lagi.",
        "detail.errorTitle": "Detail pesanan belum dapat dimuat",
        "detail.estimatedAt": "Dicatat pada",
        "detail.eventLog": "Riwayat",
        "detail.historyDescription": "Pembaruan terbaru lebih dulu.",
        "detail.loadingDescription": "Mohon tunggu.",
        "detail.loadingTitle": "Memuat detail pesanan",
        "detail.paymentHistory": "Riwayat pembayaran",
        "detail.productionStatus": "Status produksi",
        "detail.readOnlyDescription": "Tidak ada mutasi dari halaman ini.",
        "detail.readOnlyTitle": "Pesanan historis · hanya baca",
        "detail.specifications": "Spesifikasi",
        "detail.stepNumber": "Tahap",
        "detail.subtitle": "Rincian aman untuk pelanggan.",
        "detail.title": "Detail Pesanan",
        "detail.verified": "Pembayaran terverifikasi",
        "payment.legacyReadOnly": "Data historis · hanya baca",
        "status.awaiting_payment": "Menunggu pembayaran",
        "status.completed": "Selesai",
        "status.in_process": "Diproses",
        "status.pending_estimate": "Menunggu estimasi",
      })[key] || key,
  }),
}));

const order = {
  id: "order-abcdef123456",
  order_number: "NV-2026-0042",
  material_name: "PLA Hitam",
  status: "awaiting_payment",
  created_at: "2026-07-15T09:30:00Z",
  record_class: "legacy_order",
  creation_enabled: false,
  mutations_enabled: false,
  file: { original_filename: "prototype-bracket-v3.stl" },
  estimate: {
    amount: 1850000,
    currency: "IDR",
    estimated_at: "2026-07-15T14:12:00Z",
  },
  payment: { verified: true },
  status_history: [
    { status: "pending_estimate", at: "2026-07-15T09:30:00Z" },
    { status: "awaiting_payment", at: "2026-07-15T14:12:00Z" },
  ],
  internal_notes: "supplier and margin must never render",
};

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={["/orders/order-abcdef123456"]}>
      <Routes>
        <Route path="/orders/:id" element={<OrderDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

function deferred() {
  let resolve;
  const promise = new Promise((nextResolve) => {
    resolve = nextResolve;
  });
  return { promise, resolve };
}

function OrderRouteWithSwitcher() {
  const navigate = useNavigate();
  return (
    <>
      <button type="button" onClick={() => navigate("/orders/order-second")}>
        Buka pesanan kedua
      </button>
      <OrderDetail />
    </>
  );
}

afterEach(() => jest.resetAllMocks());

test("renders a customer-safe read-only order and preserves controlled file download", async () => {
  api.get.mockResolvedValue({ data: order });
  downloadApiFile.mockResolvedValue();

  renderDetail();

  expect(
    await screen.findByRole("heading", { name: "Detail Pesanan" }),
  ).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith("/orders/order-abcdef123456");
  expect(screen.getByText("Pesanan historis · hanya baca")).toBeInTheDocument();
  expect(screen.getByText("PLA Hitam")).toBeInTheDocument();
  expect(screen.getByText("prototype-bracket-v3.stl")).toBeInTheDocument();
  expect(screen.queryByText(/supplier and margin/i)).not.toBeInTheDocument();
  expect(screen.getByTestId("order-history")).toBeInTheDocument();

  fireEvent.click(screen.getByTestId("download-design"));

  await waitFor(() => {
    expect(downloadApiFile).toHaveBeenCalledWith(
      "/orders/order-abcdef123456/design-file",
      "prototype-bracket-v3.stl",
    );
  });
});
test("keeps a failed detail read generic and recoverable", async () => {
  api.get
    .mockRejectedValueOnce({
      response: { data: { detail: "supplier_timeout: private queue" } },
    })
    .mockResolvedValueOnce({ data: order });

  renderDetail();

  expect(
    await screen.findByRole("heading", {
      name: "Detail pesanan belum dapat dimuat",
    }),
  ).toBeInTheDocument();
  expect(screen.queryByText(/supplier_timeout|private queue/i)).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Coba lagi" }));

  expect(
    await screen.findByRole("heading", { name: "Detail Pesanan" }),
  ).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledTimes(2);
});

test("ignores an older response after the order route id changes", async () => {
  const first = deferred();
  const second = deferred();
  const secondOrder = {
    ...order,
    id: "order-second",
    order_number: "NV-SECOND",
    material_name: "PLA Putih",
  };

  api.get.mockImplementation((path) =>
    path.endsWith("order-abcdef123456") ? first.promise : second.promise,
  );

  render(
    <MemoryRouter initialEntries={["/orders/order-abcdef123456"]}>
      <Routes>
        <Route path="/orders/:id" element={<OrderRouteWithSwitcher />} />
      </Routes>
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Buka pesanan kedua" }));
  await waitFor(() => {
    expect(api.get).toHaveBeenCalledWith("/orders/order-second");
  });

  await act(async () => {
    second.resolve({ data: secondOrder });
    await second.promise;
  });
  expect(await screen.findByText("NV-SECOND")).toBeInTheDocument();

  await act(async () => {
    first.resolve({ data: order });
    await first.promise;
  });
  expect(screen.getByText("NV-SECOND")).toBeInTheDocument();
  expect(screen.queryByText("NV-2026-0042")).not.toBeInTheDocument();
});

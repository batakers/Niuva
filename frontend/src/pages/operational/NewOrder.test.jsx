import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import NewOrder from "./NewOrder";

jest.mock("@/components/layout/Layout", () => ({
  OperationalLayout: ({ children }) => <main>{children}</main>,
}));

jest.mock("@/i18n", () => ({
  useI18n: () => ({
    t: (key) =>
      ({
        "dash.openRetail": "Lihat katalog Retail",
        "detail.backToOrders": "Kembali ke pesanan",
        "order.compatibilityLabel": "Tautan pesanan lama",
        "order.inactiveDescription": "Form lama tidak membuat transaksi.",
        "order.inactiveTitle": "Pembuatan pesanan telah dipindahkan",
      })[key] || key,
  }),
}));

test("keeps the old order bookmark informational and command-free", () => {
  render(
    <MemoryRouter>
      <NewOrder />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("heading", {
      name: "Pembuatan pesanan telah dipindahkan",
    }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Lihat katalog Retail/ })).toHaveAttribute(
    "href",
    "/retail",
  );
  expect(screen.getByRole("link", { name: "Kembali ke pesanan" })).toHaveAttribute(
    "href",
    "/dashboard",
  );
  expect(screen.queryByRole("form")).not.toBeInTheDocument();
  expect(screen.queryByLabelText(/file/i)).not.toBeInTheDocument();
});

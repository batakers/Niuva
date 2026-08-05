import React from "react";
import { render, screen } from "@testing-library/react";

import { LegacyOrderStatusBadge } from "./LegacyOrderStatusBadge";
import { StatusStepper } from "./StatusStepper";

jest.mock("@/i18n", () => ({
  useI18n: () => ({
    t: (key) =>
      ({
        "detail.cancelledStatus": "Pesanan ini dibatalkan.",
        "detail.productionStatus": "Status produksi",
        "detail.stepNumber": "Tahap",
        "status.pending_estimate": "Menunggu estimasi",
        "status.awaiting_payment": "Menunggu pembayaran",
        "status.in_process": "Diproses",
        "status.completed": "Selesai",
        "status.cancelled": "Dibatalkan",
      })[key] || key,
  }),
}));

test("announces the current legacy order stage without percentage progress", () => {
  render(<StatusStepper status="awaiting_payment" />);

  const progress = screen.getByRole("list", { name: "Status produksi" });
  const stages = screen.getAllByRole("listitem");

  expect(progress).toBeInTheDocument();
  expect(stages).toHaveLength(4);
  expect(stages[1]).toHaveAttribute("aria-current", "step");
  expect(screen.queryByText(/%/)).not.toBeInTheDocument();
});
test("presents cancellation as an explicit state instead of fake progress", () => {
  render(<StatusStepper status="cancelled" />);

  expect(screen.getByRole("status")).toHaveTextContent("Dibatalkan");
  expect(screen.getByRole("status")).toHaveTextContent(
    "Pesanan ini dibatalkan.",
  );
  expect(screen.queryByRole("list")).not.toBeInTheDocument();
});
test("uses the semantic state radius for status badges", () => {
  render(<LegacyOrderStatusBadge status="completed" />);

  expect(screen.getByText("Selesai")).toHaveClass("rounded-full");
});

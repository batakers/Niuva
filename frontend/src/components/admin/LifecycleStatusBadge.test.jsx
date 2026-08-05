import React from "react";
import { render, screen } from "@testing-library/react";

import { B2BStatusBadge } from "./B2BStatusBadge";
import { PortfolioStatusBadge } from "./PortfolioStatusBadge";
import { RetailOrderStatusBadge } from "./RetailOrderStatusBadge";
import { WorkOrderStatusBadge } from "./WorkOrderStatusBadge";
import { LegacyOrderStatusBadge } from "../operational/LegacyOrderStatusBadge";

jest.mock("@/i18n", () => ({
  useI18n: () => ({ t: (key) => key.replace("status.", "") }),
}));

test.each([
  [<LegacyOrderStatusBadge status="awaiting_payment" />, "awaiting_payment", "primary"],
  [<B2BStatusBadge kind="inquiry" status="converted" />, "converted", "success"],
  [<B2BStatusBadge kind="quote" status="draft" />, "draft", "muted"],
  [<B2BStatusBadge kind="project" status="on_hold" />, "on_hold", "warning"],
  [<PortfolioStatusBadge status="published" />, "published", "success"],
  [<RetailOrderStatusBadge status="ready_to_ship" />, "ready_to_ship", "info"],
  [<WorkOrderStatusBadge status="cancelled" />, "cancelled", "danger"],
])("keeps %s tone inside its lifecycle owner", (component, label, tone) => {
  render(component);

  expect(screen.getByText(label)).toHaveAttribute("data-tone", tone);
});

test("falls back to the neutral presentation tone without inventing a status", () => {
  render(<RetailOrderStatusBadge status="unrecognized" />);

  expect(screen.getByText("unrecognized")).toHaveAttribute("data-tone", "muted");
});

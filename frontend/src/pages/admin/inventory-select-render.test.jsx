import React, { Component } from "react";
import { act, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import Inventory from "./Inventory";
import StockMovements from "./StockMovements";
import { inventoryApi } from "@/lib/inventory";

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { permissions: ["inventory.read"] },
  }),
}));

jest.mock("@/i18n", () => ({
  useI18n: () => ({ t: (key) => key }),
}));

jest.mock("@/lib/inventory", () => {
  const actual = jest.requireActual("@/lib/inventory");
  return {
    ...actual,
    inventoryApi: {
      balances: jest.fn(() => Promise.resolve([])),
      reservations: jest.fn(() => Promise.resolve([])),
      adjustmentRequests: jest.fn(() => Promise.resolve([])),
      movements: jest.fn(() => Promise.resolve([])),
    },
  };
});

jest.mock("./AdminLayout", () => ({
  AdminLayout: ({ children }) => <>{children}</>,
}));

class RenderErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return <div role="alert">{this.state.error.message}</div>;
    }
    return this.props.children;
  }
}

beforeEach(() => {
  inventoryApi.balances.mockResolvedValue([]);
  inventoryApi.reservations.mockResolvedValue([]);
  inventoryApi.adjustmentRequests.mockResolvedValue([]);
  inventoryApi.movements.mockResolvedValue([]);
});

test.each([
  ["inventory", <Inventory />],
  ["stock movements", <StockMovements />],
])("renders the %s subject filter without a component crash", async (_name, page) => {
  render(
    <MemoryRouter>
      <RenderErrorBoundary>{page}</RenderErrorBoundary>
    </MemoryRouter>,
  );

  await act(async () => {
    await Promise.resolve();
  });

  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
});

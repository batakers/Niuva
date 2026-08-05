import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AdminDashboard, { queueCount } from "./AdminDashboard";
import { api } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  api: { get: jest.fn() },
  formatApiError: jest.fn(() => "Tidak dapat memuat data."),
}));

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { roles: ["quality_control"], permissions: ["*"] },
  }),
}));

jest.mock("@/i18n", () => ({
  useI18n: () => ({
    t: (key) =>
      ({
        "admin.queueLive": "Status dari metrik antrean yang tersedia",
        "admin.queueReviewRequired": "Buka antrean untuk memeriksa status terkini",
      })[key] || key,
  }),
}));

jest.mock("@/lib/permissions", () => ({
  ...jest.requireActual("@/lib/permissions"),
  hasPermission: () => true,
}));

jest.mock("./AdminLayout", () => ({
  AdminLayout: ({ children, title, subtitle }) => (
    <main>
      <h1>{title}</h1>
      <p>{subtitle}</p>
      {children}
    </main>
  ),
}));

jest.mock("@/components/ui/empty-state", () => ({
  EmptyState: ({ children }) => <div>{children}</div>,
}));
jest.mock("@/components/ui/error-state", () => ({
  ErrorState: ({ children }) => <div role="alert">{children}</div>,
}));
jest.mock("@/components/ui/form-field", () => ({
  FormField: ({ children }) => <div>{children}</div>,
}));
jest.mock("@/components/ui/input", () => ({
  Input: (props) => <input {...props} />,
}));
jest.mock("@/components/ui/skeleton", () => ({
  Skeleton: (props) => <div {...props} />,
}));
jest.mock("@/components/ui/surface-panel", () => ({
  SurfacePanel: ({ children }) => <section>{children}</section>,
}));
jest.mock("recharts", () => ({
  Line: () => null,
  LineChart: ({ children }) => <div>{children}</div>,
  ResponsiveContainer: ({ children }) => <div>{children}</div>,
  Tooltip: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

afterEach(() => jest.resetAllMocks());

test("keeps absent queue metrics unknown while preserving explicit zero", () => {
  expect(
    queueCount("/admin/retail-orders", {
      pending_estimate: 0,
      awaiting_payment: 0,
    }),
  ).toBeNull();
  expect(
    queueCount("/admin/retail-orders", {
      pending_estimate: 0,
      awaiting_payment: 0,
      in_process: 0,
    }),
  ).toBe(0);
  expect(queueCount("/admin/inquiries", {})).toBeNull();
  expect(queueCount("/admin/inquiries", { inquiries: 0 })).toBe(0);
});

test("does not report live coverage when a role queue is only partially measured", async () => {
  api.get.mockImplementation((path) =>
    path === "/admin/stats"
      ? Promise.resolve({
          data: {
            pending_estimate: 0,
            awaiting_payment: 0,
            in_process: 0,
          },
        })
      : Promise.resolve({ data: { series: [] } }),
  );

  render(
    <MemoryRouter>
      <AdminDashboard />
    </MemoryRouter>,
  );

  await waitFor(() => {
    expect(
      screen.getByText("Buka antrean untuk memeriksa status terkini"),
    ).toBeInTheDocument();
  });
  expect(
    screen.queryByText("Status dari metrik antrean yang tersedia"),
  ).not.toBeInTheDocument();
});

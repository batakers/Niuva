import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import HomePage from "../HomePage";
import { HomeFdmContour } from "./HomePageVisuals";

let mockPublicSettings = {
  status: "ready",
  contact: { email: "niuva@example.com" },
};

jest.mock("@/components/layout/Layout", () => ({
  MarketingLayout: ({ children }) => <div data-testid="marketing-layout">{children}</div>,
}));

jest.mock("@/lib/publicSettings", () => ({
  usePublicSettings: () => mockPublicSettings,
}));

function renderHome() {
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );
}

beforeEach(() => {
  mockPublicSettings = {
    status: "ready",
    contact: { email: "niuva@example.com" },
  };
});

test("renders the centered R4 story and the five-stage process", () => {
  const { container } = renderHome();

  expect(
    screen.getByRole("heading", { level: 1, name: /Dari ide menuju produk yang dapat diuji/i }),
  ).toBeInTheDocument();
  const process = screen.getByRole("list", { name: "Alur pengembangan Niuva" });
  expect(within(process).getAllByRole("listitem")).toHaveLength(5);
  expect(container.querySelectorAll("[data-testid^='home-fdm-contour-']")).toHaveLength(2);
});

test("keeps all four primary services equal and uses one shared action", () => {
  const { container } = renderHome();
  const services = [...container.querySelectorAll('[data-service-rank="primary"]')];

  expect(services).toHaveLength(4);
  expect(services.map((service) => within(service).getByRole("heading").textContent)).toEqual([
    "Research & Development",
    "Consultant & Workshop",
    "Design & Prototyping",
    "Apparel & Merchandise",
  ]);
  for (const service of services) {
    expect(within(service).getByRole("link", { name: /Lihat layanan/i })).toHaveAttribute(
      "href",
      "/capabilities",
    );
  }
});

test("keeps Retail secondary and states the quote boundary", () => {
  renderHome();

  expect(screen.getAllByRole("link", { name: /Jelajahi Retail/i })[0]).toHaveAttribute(
    "href",
    "/retail",
  );
  expect(
    screen.getByText(/dialihkan ke inquiry tanpa membuat Order, reservasi, atau pembayaran/i),
  ).toBeInTheDocument();
});

test("shows public-settings loading and recoverable error states without hiding Contact", () => {
  mockPublicSettings = { status: "loading", contact: {} };
  const { rerender } = renderHome();

  expect(screen.getByRole("status")).toHaveTextContent("Memuat detail kontak publik");
  expect(screen.getByRole("link", { name: /Buka halaman Kontak/i })).toHaveAttribute(
    "href",
    "/contact",
  );

  mockPublicSettings = { status: "error", contact: {} };
  rerender(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

  expect(screen.getByRole("alert")).toHaveTextContent(
    "Detail terbaru belum dapat dimuat",
  );
  expect(screen.getByRole("link", { name: /Buka halaman Kontak/i })).toBeInTheDocument();

  mockPublicSettings = { status: "disabled", contact: {} };
  rerender(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>,
  );

  expect(screen.queryByRole("status")).not.toBeInTheDocument();
  expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  expect(screen.getByRole("link", { name: /Buka halaman Kontak/i })).toBeInTheDocument();
});

test("cancels a pending contour pointer frame before resetting its offset", () => {
  const originalMatchMedia = window.matchMedia;
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  const originalCancelAnimationFrame = window.cancelAnimationFrame;
  const requestAnimationFrame = jest.fn(() => 41);
  const cancelAnimationFrame = jest.fn();

  window.matchMedia = jest.fn((query) => ({
    matches: query.includes("pointer: fine"),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  }));
  window.requestAnimationFrame = requestAnimationFrame;
  window.cancelAnimationFrame = cancelAnimationFrame;

  try {
    render(<HomeFdmContour />);
    const contour = screen.getByTestId("home-fdm-contour-light");

    fireEvent.pointerMove(contour, { clientX: 120, clientY: 80 });
    expect(requestAnimationFrame).toHaveBeenCalledTimes(1);

    fireEvent.pointerLeave(contour);
    expect(cancelAnimationFrame).toHaveBeenCalledWith(41);
  } finally {
    window.matchMedia = originalMatchMedia;
    window.requestAnimationFrame = originalRequestAnimationFrame;
    window.cancelAnimationFrame = originalCancelAnimationFrame;
  }
});

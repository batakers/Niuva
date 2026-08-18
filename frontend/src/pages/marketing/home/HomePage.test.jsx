import React from "react";
import { act, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import HomePage from "../HomePage";

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
  expect(process).toHaveAttribute("data-motion-ready", "true");
  expect(container.querySelectorAll(".home-r4-hero-enter")).toHaveLength(4);
  expect(process.closest("section")?.nextElementSibling).toHaveClass("home-r4-projects");
  expect(screen.queryByText("Memahami. Membentuk. Membuktikan.")).not.toBeInTheDocument();
  expect(screen.getByText("Satu partner, dua cara memulai")).toBeInTheDocument();
  expect(screen.getByText("Cara kerja")).toBeInTheDocument();
  expect(screen.getByText("Layanan Niuva")).toBeInTheDocument();

  const discussionLinks = screen.getAllByRole("link", { name: /Diskusikan project/i });
  expect(discussionLinks).toHaveLength(2);
  for (const link of discussionLinks) {
    expect(link).toHaveAttribute("href", "/kontak#form-konsultasi");
  }
  expect(screen.getByRole("link", { name: /Mulai partnership/i })).toHaveAttribute(
    "href",
    "/kontak#form-konsultasi",
  );

  const editorialIntros = [...container.querySelectorAll(".home-r4-editorial-intro")];
  expect(editorialIntros).toHaveLength(4);
  expect(editorialIntros.map((intro) => intro.parentElement?.closest("section")?.className)).toEqual(
    expect.arrayContaining([
      expect.stringContaining("home-r4-orientation"),
      expect.stringContaining("home-r4-process"),
      expect.stringContaining("home-r4-services"),
      expect.stringContaining("home-r4-retail"),
    ]),
  );

  expect(container.querySelectorAll("[data-testid^='home-fdm-contour-']")).toHaveLength(0);

  expect(screen.queryByText(/Ilustrasi konseptual:/i)).not.toBeInTheDocument();
});

test("uses a deliberate, keyboard-operable Niuva project gallery", () => {
  const { container } = renderHome();

  const gallery = screen.getByRole("list", { name: "Pilihan project Niuva" });
  const projects = within(gallery).getAllByRole("listitem");
  const triggers = within(gallery).getAllByRole("button", {
    name: /Tampilkan project:/i,
  });

  expect(projects).toHaveLength(3);
  expect(gallery).toHaveAttribute("data-active-index", "0");
  expect(projects[0]).toHaveAttribute("data-active", "true");
  const compactLabels = container.querySelectorAll(".home-r4-project-compact-label");
  const expandedContents = container.querySelectorAll(".home-r4-project-expanded");
  expect([...compactLabels].map((label) => label.textContent)).toEqual([
    "Pindad EV",
    "Xeon",
    "Agate Simulator",
  ]);
  expect(compactLabels[0]).toHaveAttribute("aria-hidden", "true");
  expect(compactLabels[1]).toHaveAttribute("aria-hidden", "false");
  expect(expandedContents[0]).toHaveAttribute("aria-hidden", "false");
  expect(expandedContents[1]).toHaveAttribute("aria-hidden", "true");
  expect(within(gallery).getByRole("link", { name: /Baca project/i })).toHaveAttribute(
    "href",
    "/proyek",
  );
  expect(
    within(gallery).getByText(
      "Kolaborasi pengembangan motor listrik taktis bersama PT Pindad untuk kebutuhan operasional TNI.",
    ),
  ).toBeInTheDocument();
  expect(within(gallery).queryByText(/Kendaraan taktis membutuhkan desain adaptif/i)).not.toBeInTheDocument();

  fireEvent.click(triggers[1]);
  expect(gallery).toHaveAttribute("data-active-index", "1");
  expect(projects[1]).toHaveAttribute("data-active", "true");
  expect(triggers[1]).toHaveAttribute("aria-expanded", "true");
  expect(compactLabels[0]).toHaveAttribute("aria-hidden", "false");
  expect(compactLabels[1]).toHaveAttribute("aria-hidden", "true");
  expect(expandedContents[0]).toHaveAttribute("aria-hidden", "true");
  expect(expandedContents[1]).toHaveAttribute("aria-hidden", "false");

  fireEvent.focus(triggers[1]);
  fireEvent.keyDown(triggers[1], { key: "ArrowRight" });
  expect(triggers[2]).toHaveFocus();
  expect(projects[2]).toHaveAttribute("data-active", "true");
});

test("draws the process rail once when it enters the viewport", async () => {
  const originalIntersectionObserver = window.IntersectionObserver;
  const observers = [];

  window.IntersectionObserver = class IntersectionObserver {
    constructor(callback) {
      this.callback = callback;
      this.observe = jest.fn((target) => {
        this.target = target;
      });
      this.disconnect = jest.fn();
      observers.push(this);
    }
  };

  try {
    renderHome();
    const process = screen.getByRole("list", { name: "Alur pengembangan Niuva" });
    const processObserver = observers.find((observer) => observer.target === process);

    expect(process).toHaveAttribute("data-motion-ready", "false");
    expect(processObserver).toBeDefined();
    expect(processObserver.observe).toHaveBeenCalledWith(process);

    act(() => {
      processObserver.callback([{ isIntersecting: true }]);
    });

    await waitFor(() => {
      expect(process).toHaveAttribute("data-motion-ready", "true");
    });
    expect(processObserver.disconnect).toHaveBeenCalled();
  } finally {
    window.IntersectionObserver = originalIntersectionObserver;
  }
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
      `/layanan#${service.getAttribute("data-service-slug") || ""}`,
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
    "/kontak#form-konsultasi",
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

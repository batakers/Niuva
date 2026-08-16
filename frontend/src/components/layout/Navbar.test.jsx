import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";

import { Navbar } from "./Navbar";

const mockLogout = jest.fn(() => Promise.resolve());
const mockSetLang = jest.fn();

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "customer-1", name: "Nadia" },
    logout: mockLogout,
  }),
}));

jest.mock("@/i18n", () => ({
  useI18n: () => ({
    lang: "id",
    setLang: mockSetLang,
    t: (key) =>
      ({
        "nav.adminStudio": "Admin Studio",
        "nav.customerOrders": "Pesanan saya",
        "nav.dashboard": "Dashboard",
        "nav.logout": "Keluar",
        "nav.site": "Situs utama",
        "nav.home": "Beranda",
        "nav.about": "Tentang",
        "nav.services": "Layanan",
        "nav.portfolio": "Proyek",
        "nav.contact": "Kontak",
        "nav.retail": "Retail",
        "nav.primary": "Navigasi utama",
        "nav.mobile": "Menu navigasi",
        "nav.openMenu": "Buka menu",
        "nav.closeMenu": "Tutup menu",
        "nav.developIdeas": "Kembangkan ide",
        "nav.printAndProducts": "Cetak & pilih produk",
        "nav.allServices": "Lihat semua layanan",
        "nav.exploreRetail": "Jelajahi Retail",
        "nav.changeLanguage": "Ubah bahasa",
        "nav.signIn": "Masuk",
        "nav.discussProject": "Diskusikan project",
      })[key] || key,
  }),
}));

jest.mock("@/lib/permissions", () => ({
  hasPermission: () => false,
}));

afterEach(() => jest.clearAllMocks());

function LocationProbe() {
  const location = useLocation();
  return (
    <output data-testid="location">
      {location.pathname}{location.search}{location.hash}
    </output>
  );
}

test("keeps customer operational navigation task-focused on desktop and mobile", async () => {
  render(
    <MemoryRouter initialEntries={["/orders/order-1"]}>
      <Navbar />
    </MemoryRouter>,
  );

  expect(
    screen.queryByRole("navigation", { name: "Primary navigation" }),
  ).not.toBeInTheDocument();
  const desktopHeader = document.querySelector("header > div");
  expect(within(desktopHeader).getByRole("button", { name: "Pesanan saya" })).toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Buka menu" }));
  const mobilePanel = document.getElementById("mobile-navigation-panel");

  expect(within(mobilePanel).getByRole("button", { name: "Pesanan saya" })).toBeInTheDocument();
  expect(within(mobilePanel).getByRole("link", { name: "Situs utama" })).toHaveAttribute(
    "href",
    "/",
  );
  expect(within(mobilePanel).getByRole("button", { name: "Keluar" })).toBeInTheDocument();
  expect(within(mobilePanel).queryByRole("link", { name: "About" })).not.toBeInTheDocument();
  await waitFor(() => {
    expect(
      within(mobilePanel).getByRole("button", { name: "Pesanan saya" }),
    ).toHaveFocus();
  });
});
test("keeps canonical Public navigation available outside operational routes", () => {
  render(
    <MemoryRouter initialEntries={["/tentang"]}>
      <Navbar />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("navigation", { name: "Navigasi utama" }),
  ).toBeInTheDocument();
  const primaryNavigation = screen.getByRole("navigation", { name: "Navigasi utama" });
  expect(within(primaryNavigation).getByRole("link", { name: "Tentang" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("exposes four equal Services separately from the two Retail destinations", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Navbar />
    </MemoryRouter>,
  );

  const servicesButton = document.querySelector(
    '[aria-controls="desktop-services-panel"]',
  );
  fireEvent.click(servicesButton);

  const panel = document.getElementById("desktop-services-panel");
  expect(panel).toBeInTheDocument();
  for (const [label, hash] of [
    ["Research & Development", "research-development"],
    ["Consultant & Workshop", "consultant-workshop"],
    ["Design & Prototyping", "design-prototyping"],
    ["Apparel & Merchandise", "apparel-merchandise"],
  ]) {
    expect(within(panel).getByRole("link", { name: new RegExp(`^${label}`) })).toHaveAttribute(
      "href",
      `/layanan#${hash}`,
    );
  }
  expect(within(panel).getByRole("link", { name: /^Custom 3D Print/ })).toHaveAttribute(
    "href",
    "/retail#custom-3d-print",
  );
  expect(within(panel).getByRole("link", { name: /^Ready Products/ })).toHaveAttribute(
    "href",
    "/retail#ready-products",
  );

  servicesButton.focus();
  fireEvent.keyDown(document, { key: "Escape" });
  await waitFor(() => {
    expect(document.getElementById("desktop-services-panel")).not.toBeInTheDocument();
    expect(servicesButton).toHaveFocus();
  });
});

test("closes the desktop mega-menu on an outside pointer action", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Navbar />
    </MemoryRouter>,
  );

  fireEvent.click(document.querySelector('[aria-controls="desktop-services-panel"]'));
  expect(document.getElementById("desktop-services-panel")).toBeInTheDocument();

  fireEvent.pointerDown(document.body);
  expect(document.getElementById("desktop-services-panel")).not.toBeInTheDocument();
});

test("switches a registered Public route while preserving query and hash", async () => {
  render(
    <MemoryRouter initialEntries={["/tentang?source=nav#team"]}>
      <Navbar />
      <LocationProbe />
    </MemoryRouter>,
  );

  fireEvent.click(document.querySelector('[aria-controls="desktop-language-panel"]'));
  fireEvent.click(
    within(document.getElementById("desktop-language-panel")).getByRole("button", {
      name: "English",
    }),
  );

  await waitFor(() => {
    expect(mockSetLang).toHaveBeenCalledWith("en");
    expect(screen.getByTestId("location")).toHaveTextContent(
      "/en/about?source=nav#team",
    );
  });
});

test("blocks the page behind an open mobile menu and closes from the backdrop", () => {
  render(
    <MemoryRouter initialEntries={["/tentang"]}>
      <Navbar />
    </MemoryRouter>,
  );

  fireEvent.click(screen.getByRole("button", { name: "Buka menu" }));

  const backdrop = screen.getByTestId("mobile-navigation-backdrop");
  expect(backdrop).toHaveAttribute("aria-hidden", "true");
  expect(screen.getByRole("dialog", { name: "Menu navigasi" })).toBeInTheDocument();

  fireEvent.click(backdrop);

  expect(screen.getByRole("button", { name: "Buka menu" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
  expect(screen.queryByRole("dialog", { name: "Menu navigasi" })).not.toBeInTheDocument();
});

test("contains keyboard focus and restores it when the mobile menu closes", async () => {
  render(
    <MemoryRouter initialEntries={["/tentang"]}>
      <Navbar />
    </MemoryRouter>,
  );

  const menuButton = screen.getByRole("button", { name: "Buka menu" });
  menuButton.focus();
  fireEvent.click(menuButton);

  const mobilePanel = screen.getByRole("dialog", { name: "Menu navigasi" });
  const focusable = Array.from(
    mobilePanel.querySelectorAll('a[href], button:not([disabled])'),
  );
  const firstLink = focusable[0];
  const lastLink = focusable[focusable.length - 1];

  await waitFor(() => expect(firstLink).toHaveFocus());

  lastLink.focus();
  fireEvent.keyDown(document, { key: "Tab" });
  expect(firstLink).toHaveFocus();

  firstLink.focus();
  fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
  expect(lastLink).toHaveFocus();

  menuButton.focus();
  fireEvent.keyDown(document, { key: "Tab" });
  expect(firstLink).toHaveFocus();

  fireEvent.keyDown(document, { key: "Escape" });
  await waitFor(() => {
    expect(menuButton).toHaveAttribute("aria-expanded", "false");
    expect(menuButton).toHaveFocus();
  });
});

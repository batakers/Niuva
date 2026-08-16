import React from "react";
import {
  act,
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
let intersectionObservers = [];

class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
    this.active = true;
    this.target = null;
    intersectionObservers.push(this);
  }

  observe(target) {
    this.target = target;
  }

  disconnect() {
    this.active = false;
  }
}

function emitNavbarIntersection({ isIntersecting, top }) {
  act(() => {
    intersectionObservers
      .filter((observer) => observer.active && observer.target)
      .forEach((observer) => {
        observer.callback([
          {
            boundingClientRect: { top },
            isIntersecting,
            target: observer.target,
          },
        ]);
      });
  });
}

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
        "nav.changeLanguage": "Ubah bahasa",
        "nav.signIn": "Masuk",
        "nav.discussProject": "Diskusikan project",
      })[key] || key,
  }),
}));

jest.mock("@/lib/permissions", () => ({
  hasPermission: () => false,
}));

beforeEach(() => {
  intersectionObservers = [];
  window.IntersectionObserver = MockIntersectionObserver;
});

afterEach(() => {
  jest.clearAllMocks();
  delete window.IntersectionObserver;
  Object.defineProperty(window, "scrollY", {
    configurable: true,
    value: 0,
    writable: true,
  });
});

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
  expect(document.querySelector("header")).toHaveAttribute("data-compact", "false");
  expect(screen.queryByTestId("public-navbar-compact-sentinel")).not.toBeInTheDocument();
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

test("links directly to Services and keeps Retail as its own top-level destination", () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Navbar />
    </MemoryRouter>,
  );

  const primaryNavigation = screen.getByRole("navigation", {
    name: "Navigasi utama",
  });
  expect(
    within(primaryNavigation).getByRole("link", { name: "Layanan" }),
  ).toHaveAttribute("href", "/layanan");
  expect(
    within(primaryNavigation).getByRole("link", { name: "Retail" }),
  ).toHaveAttribute("href", "/retail");
  expect(
    within(primaryNavigation).queryByRole("button", { name: "Layanan" }),
  ).not.toBeInTheDocument();
  expect(document.getElementById("desktop-services-panel")).not.toBeInTheDocument();

  fireEvent.click(screen.getByRole("button", { name: "Buka menu" }));
  const mobilePanel = screen.getByRole("dialog", { name: "Menu navigasi" });
  expect(
    within(mobilePanel).getByRole("link", { name: "Layanan" }),
  ).toHaveAttribute("href", "/layanan");
  expect(
    within(mobilePanel).getByRole("link", { name: "Retail" }),
  ).toHaveAttribute("href", "/retail");
  expect(
    within(mobilePanel).queryByRole("button", { name: "Layanan" }),
  ).not.toBeInTheDocument();
  expect(document.getElementById("mobile-services-panel")).not.toBeInTheDocument();
});

test("compacts the Public Navbar after the scroll threshold and restores it at the top", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Navbar />
    </MemoryRouter>,
  );

  const header = document.querySelector("header");
  expect(header).toHaveAttribute("data-compact", "false");
  expect(screen.getByTestId("public-navbar-compact-sentinel")).toHaveStyle({
    top: "96px",
  });

  emitNavbarIntersection({ isIntersecting: false, top: -1 });
  await waitFor(() => {
    expect(header).toHaveAttribute("data-compact", "true");
  });

  emitNavbarIntersection({ isIntersecting: true, top: 96 });
  await waitFor(() => {
    expect(header).toHaveAttribute("data-compact", "false");
  });
});

test("freezes the compact state while the mobile menu owns focus", async () => {
  render(
    <MemoryRouter initialEntries={["/"]}>
      <Navbar />
    </MemoryRouter>,
  );

  const header = document.querySelector("header");
  emitNavbarIntersection({ isIntersecting: false, top: -1 });
  expect(header).toHaveAttribute("data-compact", "true");

  fireEvent.click(screen.getByRole("button", { name: "Buka menu" }));
  emitNavbarIntersection({ isIntersecting: true, top: 96 });
  expect(header).toHaveAttribute("data-compact", "true");

  fireEvent.click(screen.getByTestId("mobile-navigation-backdrop"));
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Buka menu" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
  });
  emitNavbarIntersection({ isIntersecting: true, top: 96 });
  expect(header).toHaveAttribute("data-compact", "false");
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

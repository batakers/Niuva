import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { Navbar } from "./Navbar";

const mockLogout = jest.fn(() => Promise.resolve());

jest.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "customer-1", name: "Nadia" },
    logout: mockLogout,
  }),
}));

jest.mock("@/i18n", () => ({
  useI18n: () => ({
    lang: "id",
    setLang: jest.fn(),
    t: (key) =>
      ({
        "nav.adminStudio": "Admin Studio",
        "nav.customerOrders": "Pesanan saya",
        "nav.dashboard": "Dashboard",
        "nav.logout": "Keluar",
        "nav.site": "Situs utama",
      })[key] || key,
  }),
}));

jest.mock("@/lib/permissions", () => ({
  hasPermission: () => false,
}));

afterEach(() => jest.clearAllMocks());

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
test("keeps the public navigation available outside operational routes", () => {
  render(
    <MemoryRouter initialEntries={["/about"]}>
      <Navbar />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("navigation", { name: "Primary navigation" }),
  ).toBeInTheDocument();
  const primaryNavigation = screen.getByRole("navigation", { name: "Primary navigation" });
  expect(within(primaryNavigation).getByRole("link", { name: "About" })).toHaveAttribute(
    "aria-current",
    "page",
  );
});

test("blocks the page behind an open mobile menu and closes from the backdrop", () => {
  render(
    <MemoryRouter initialEntries={["/about"]}>
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
    <MemoryRouter initialEntries={["/about"]}>
      <Navbar />
    </MemoryRouter>,
  );

  const menuButton = screen.getByRole("button", { name: "Buka menu" });
  menuButton.focus();
  fireEvent.click(menuButton);

  const mobilePanel = screen.getByRole("dialog", { name: "Menu navigasi" });
  const links = within(mobilePanel).getAllByRole("link");
  const firstLink = links[0];
  const lastLink = links[links.length - 1];

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

import React from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import NotFoundPage from "./NotFoundPage";

jest.mock("@/components/layout/Layout", () => ({
  MarketingLayout: ({ children }) => <>{children}</>,
}));
jest.mock("gsap", () => ({
  __esModule: true,
  default: {
    registerPlugin: jest.fn(),
    fromTo: jest.fn(),
    utils: { toArray: () => [] },
  },
}));
jest.mock("gsap/ScrollTrigger", () => ({ ScrollTrigger: { batch: jest.fn() } }));
jest.mock("@gsap/react", () => ({ useGSAP: jest.fn() }));

afterEach(() => {
  document.title = "";
  document.querySelector('meta[name="description"]')?.remove();
});

test("offers canonical Indonesian recovery paths for an unknown route", async () => {
  render(
    <MemoryRouter initialEntries={["/tidak-ada"]}>
      <NotFoundPage />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("heading", { name: "Halaman yang Anda cari tidak ditemukan." }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Kembali ke Beranda" })).toHaveAttribute(
    "href",
    "/",
  );
  expect(screen.getByRole("link", { name: "Hubungi Niuva" })).toHaveAttribute(
    "href",
    "/kontak",
  );
  await waitFor(() => {
    expect(document.title).toBe("Halaman tidak ditemukan - Niuva Inovasi Utama");
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      "Halaman Niuva yang diminta tidak tersedia. Kembali ke Beranda atau gunakan navigasi utama.",
    );
  });
});

test("keeps an unknown English URL in the English recovery journey", async () => {
  render(
    <MemoryRouter initialEntries={["/en/missing-page"]}>
      <NotFoundPage />
    </MemoryRouter>,
  );

  expect(
    screen.getByRole("heading", { name: "The page you are looking for was not found." }),
  ).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Return home" })).toHaveAttribute(
    "href",
    "/en",
  );
  expect(screen.getByRole("link", { name: "Contact Niuva" })).toHaveAttribute(
    "href",
    "/en/contact",
  );
  await waitFor(() => {
    expect(document.title).toBe("Page not found - Niuva Inovasi Utama");
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      "content",
      "The requested Niuva page is unavailable. Return home or use the main navigation.",
    );
  });
});

test("lists canonical Indonesian recovery links with accessible targets", () => {
  render(
    <MemoryRouter initialEntries={["/jalur-yang-tidak-ada"]}>
      <NotFoundPage />
    </MemoryRouter>,
  );

  const recovery = within(screen.getByRole("navigation", { name: "Tautan bantuan" }));
  expect(recovery.getByRole("link", { name: /Beranda/ })).toHaveAttribute("href", "/");
  expect(recovery.getByRole("link", { name: /Layanan/ })).toHaveAttribute("href", "/layanan");
  expect(recovery.getByRole("link", { name: /Proyek/ })).toHaveAttribute("href", "/proyek");
  const contact = recovery.getByRole("link", { name: /Kontak/ });
  expect(contact).toHaveAttribute("href", "/kontak");
  expect(contact).toHaveClass("min-h-12", "focus-visible:ring-2");
});

test("keeps a very long missing path readable in the visible explanation", () => {
  const longPath = `/en/${"unavailable-segment-".repeat(60)}`;
  render(
    <MemoryRouter initialEntries={[longPath]}>
      <NotFoundPage />
    </MemoryRouter>,
  );

  expect(screen.getByText((content) => content.includes(longPath))).toBeInTheDocument();
});

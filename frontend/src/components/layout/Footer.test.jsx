import React from "react";
import { render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { Footer } from "./Footer";

jest.mock("@/lib/publicSettings", () => ({
  usePublicSettings: () => ({
    contact: {
      email: "hello@example.test",
      location: "Bandung",
      whatsapp: "+62 812 0000 0000",
      whatsappHref: "https://wa.me/6281200000000",
    },
  }),
}));

function renderFooter(pathname) {
  return render(
    <MemoryRouter initialEntries={[pathname]}>
      <Footer />
    </MemoryRouter>,
  );
}

test("joins the Homepage closing canvas with a minimal terminal Footer", () => {
  renderFooter("/");

  const footer = screen.getByRole("contentinfo");
  const navigation = within(footer).getByRole("navigation", {
    name: "Navigasi footer Homepage",
  });

  expect(footer).toHaveAttribute("data-footer-variant", "homepage-terminal");
  expect(within(footer).getByRole("link", { name: "Niuva - Beranda" })).toHaveAttribute(
    "href",
    "/",
  );
  expect(within(navigation).getByRole("link", { name: "Layanan" })).toHaveAttribute(
    "href",
    "/capabilities",
  );
  expect(within(navigation).getByRole("link", { name: "Retail" })).toHaveAttribute(
    "href",
    "/retail",
  );
  expect(within(footer).queryByText("Navigasi")).not.toBeInTheDocument();
  expect(within(footer).queryByText("hello@example.test")).not.toBeInTheDocument();
});

test("preserves the existing Footer composition outside the Homepage", () => {
  renderFooter("/about");

  const footer = screen.getByRole("contentinfo");

  expect(footer).toHaveAttribute("data-footer-variant", "legacy");
  expect(within(footer).getByRole("heading", { name: "Navigasi" })).toBeInTheDocument();
  expect(within(footer).getByRole("heading", { name: "Kontak" })).toBeInTheDocument();
  expect(within(footer).getByRole("link", { name: "hello@example.test" })).toHaveAttribute(
    "href",
    "mailto:hello@example.test",
  );
});

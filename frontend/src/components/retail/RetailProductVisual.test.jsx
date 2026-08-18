import React from "react";
import { render, screen } from "@testing-library/react";

import { RetailProductVisual } from "./RetailProductVisual";
import { resolveMediaUrl } from "@/lib/api";

jest.mock("@/lib/api", () => ({
  resolveMediaUrl: jest.fn(),
}));

afterEach(() => jest.resetAllMocks());

test("renders published media with its customer-safe alt text", () => {
  resolveMediaUrl.mockReturnValue("https://cdn.example/product.webp");

  render(
    <RetailProductVisual
      eager
      product={{
        name: "Desk Sign",
        media: [{ storage_path: "catalog/desk.webp", alt: "Desk sign biru" }],
      }}
    />,
  );

  expect(screen.getByRole("img", { name: "Desk sign biru" })).toHaveAttribute(
    "src",
    "https://cdn.example/product.webp",
  );
  expect(screen.getByRole("img", { name: "Desk sign biru" })).toHaveAttribute(
    "loading",
    "eager",
  );
});
test("uses a calm labelled fallback when publication media is absent", () => {
  resolveMediaUrl.mockReturnValue("");

  render(<RetailProductVisual product={{ name: "Desk Sign", media: [] }} />);

  expect(screen.getByRole("img", { name: "Visual Desk Sign" })).toBeInTheDocument();
  expect(screen.getByText("Visual produk belum tersedia")).toBeInTheDocument();
});

test("accepts localized fallback labels from its surface owner", () => {
  resolveMediaUrl.mockReturnValue("");

  render(
    <RetailProductVisual
      product={{ media: [] }}
      fallbackProductName="Niuva product"
      visualAltPrefix="Product image"
      missingVisualLabel="Product visual is not available yet"
    />,
  );

  expect(
    screen.getByRole("img", { name: "Product image Niuva product" }),
  ).toBeInTheDocument();
  expect(
    screen.getByText("Product visual is not available yet"),
  ).toBeInTheDocument();
});

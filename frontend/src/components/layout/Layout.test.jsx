import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import { MarketingLayout, OperationalLayout, resolveCanonicalOrigin } from "./Layout";

jest.mock("./Navbar", () => ({
  Navbar: () => <nav aria-label="Primary navigation" />,
}));

jest.mock("./Footer", () => ({
  Footer: () => <footer />,
}));

describe("MarketingLayout public metadata", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    document.title = "";
    window.scrollTo = jest.fn();
    HTMLElement.prototype.scrollIntoView = jest.fn();
  });

  test("keeps privacy metadata aligned with the active scope", async () => {
    render(
      <MemoryRouter initialEntries={["/privasi"]}>
        <MarketingLayout hideFooter>
          <p>Privacy content</p>
        </MarketingLayout>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Kebijakan Privasi - PT Niuva Inovasi Utama");
    });

    const description = document.querySelector('meta[name="description"]');
    const canonical = document.querySelector('link[rel="canonical"]');

    expect(description).toHaveAttribute(
      "content",
      "Pelajari bagaimana Niuva menggunakan dan melindungi data yang dikirim melalui inquiry, akun, dan layanan Retail.",
    );
    expect(description).not.toHaveAttribute(
      "content",
      expect.stringMatching(/magang|internship/i),
    );
    expect(canonical).toHaveAttribute(
      "href",
      expect.stringMatching(/\/privasi$/),
    );
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "index, follow",
    );
    expect(
      document.querySelector('link[rel="alternate"][hreflang="en"]'),
    ).toHaveAttribute("href", expect.stringMatching(/\/en\/privacy$/));
    expect(screen.getByRole("link", { name: "Lewati ke konten" })).toHaveAttribute(
      "href",
      "#main-content",
    );
  });

  test("marks untranslated English CMS content as fallback without reciprocal hreflang", async () => {
    render(
      <MemoryRouter initialEntries={["/en/about"]}>
        <MarketingLayout hideFooter>
          <p>Konten Indonesia</p>
        </MarketingLayout>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.title).toBe(
        "About Niuva - Innovation and Product Development Partner",
      );
    });

    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      "content",
      "noindex, follow",
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      "href",
      expect.stringMatching(/\/tentang$/),
    );
    expect(
      document.querySelector('link[rel="alternate"][hreflang]'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent(
      "English translation belum tersedia",
    );
    expect(screen.getByText("Konten Indonesia").parentElement).toHaveAttribute(
      "lang",
      "id",
    );
  });

  test("moves a canonical hash destination below the shared navigation", () => {
    render(
      <MemoryRouter initialEntries={["/layanan#apparel-merchandise"]}>
        <MarketingLayout hideFooter>
          <section id="apparel-merchandise">Apparel & Merchandise</section>
        </MarketingLayout>
      </MemoryRouter>,
    );

    expect(
      screen.getByText("Apparel & Merchandise"),
    ).toHaveProperty("scrollIntoView");
    expect(HTMLElement.prototype.scrollIntoView).toHaveBeenCalledWith({
      block: "start",
    });
    expect(window.scrollTo).not.toHaveBeenCalled();
  });

  test("falls back to the page top when a malformed hash has no destination", () => {
    expect(() => {
      render(
        <MemoryRouter initialEntries={["/layanan#%E0%A4%A"]}>
          <MarketingLayout hideFooter>
            <p>Layanan</p>
          </MarketingLayout>
        </MemoryRouter>,
      );
    }).not.toThrow();

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      left: 0,
      behavior: "auto",
    });
  });
});

describe("canonical origin validation", () => {
  test("uses the explicit public origin for release metadata", () => {
    expect(
      resolveCanonicalOrigin(
        "https://staging.niuva.example/",
        "http://localhost:3000",
      ),
    ).toBe("https://staging.niuva.example");
  });

  test("falls back to runtime origin for unsafe or incomplete configuration", () => {
    expect(resolveCanonicalOrigin("https://staging.niuva.example/site", "https://runtime.example")).toBe(
      "https://runtime.example",
    );
    expect(resolveCanonicalOrigin("https://user:secret@staging.niuva.example", "https://runtime.example")).toBe(
      "https://runtime.example",
    );
    expect(resolveCanonicalOrigin("http://localhost:3000", "https://runtime.example")).toBe(
      "https://runtime.example",
    );
  });
});

describe("OperationalLayout accessibility", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
  });

  test("provides a skip link and one focusable main-content target", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <OperationalLayout>
          <p>Customer workspace</p>
        </OperationalLayout>
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: "Lewati ke konten" })).toHaveAttribute(
      "href",
      "#main-content",
    );
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content");
    expect(screen.getByRole("main")).toHaveAttribute("tabindex", "-1");
  });
});

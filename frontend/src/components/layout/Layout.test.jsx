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
  });

  test("keeps privacy metadata aligned with the active scope", async () => {
    render(
      <MemoryRouter initialEntries={["/privacy"]}>
        <MarketingLayout hideFooter>
          <p>Privacy content</p>
        </MarketingLayout>
      </MemoryRouter>,
    );

    await waitFor(() => {
      expect(document.title).toBe("Privacy Policy - PT Niuva Inovasi Utama");
    });

    const description = document.querySelector('meta[name="description"]');
    const canonical = document.querySelector('link[rel="canonical"]');

    expect(description).toHaveAttribute(
      "content",
      "Kebijakan privasi Niuva menjelaskan data yang dikumpulkan melalui form contact dan pemesanan, serta hak pengguna terkait data tersebut.",
    );
    expect(description).not.toHaveAttribute(
      "content",
      expect.stringMatching(/magang|internship/i),
    );
    expect(canonical).toHaveAttribute(
      "href",
      expect.stringMatching(/\/privacy$/),
    );
    expect(screen.getByRole("link", { name: "Lewati ke konten" })).toHaveAttribute(
      "href",
      "#main-content",
    );
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

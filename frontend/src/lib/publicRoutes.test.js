import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { I18nProvider, useI18n } from "@/i18n";
import {
  getLocaleSwitchPath,
  getPublicPath,
  getPublicRouteMetadata,
  PUBLIC_RETAIL_ITEMS,
  PUBLIC_ROUTE_ALIASES,
  PUBLIC_SERVICE_ITEMS,
  resolvePublicAlias,
  resolvePublicRoute,
} from "./publicRoutes";

function LanguageProbe() {
  const { lang, setLang } = useI18n();
  return (
    <div>
      <output data-testid="language">{lang}</output>
      <button type="button" onClick={() => setLang("en")}>English</button>
    </div>
  );
}

describe("public route registry", () => {
  test("declares every approved Indonesian and English path pair", () => {
    expect(getPublicPath("home", "id")).toBe("/");
    expect(getPublicPath("home", "en")).toBe("/en");
    expect(getPublicPath("about", "id")).toBe("/tentang");
    expect(getPublicPath("about", "en")).toBe("/en/about");
    expect(getPublicPath("services", "id")).toBe("/layanan");
    expect(getPublicPath("services", "en")).toBe("/en/services");
    expect(getPublicPath("projects", "id")).toBe("/proyek");
    expect(getPublicPath("projects", "en")).toBe("/en/projects");
    expect(getPublicPath("contact", "id")).toBe("/kontak");
    expect(getPublicPath("contact", "en")).toBe("/en/contact");
    expect(getPublicPath("retail", "id")).toBe("/retail");
    expect(getPublicPath("retail", "en")).toBe("/en/retail");
    expect(getPublicPath("faq", "id")).toBe("/faq");
    expect(getPublicPath("faq", "en")).toBe("/en/faq");
    expect(getPublicPath("privacy", "id")).toBe("/privasi");
    expect(getPublicPath("privacy", "en")).toBe("/en/privacy");
  });

  test("keeps four Services equal and Retail destinations separate", () => {
    expect(PUBLIC_SERVICE_ITEMS.map((item) => item.slug)).toEqual([
      "research-development",
      "consultant-workshop",
      "design-prototyping",
      "apparel-merchandise",
    ]);
    expect(PUBLIC_RETAIL_ITEMS.map((item) => item.hash)).toEqual([
      "custom-3d-print",
      "ready-products",
    ]);
  });

  test("resolves canonical routes and switches only registered paths", () => {
    expect(resolvePublicRoute("/en/projects/")).toMatchObject({
      key: "projects",
      locale: "en",
      fallbackToIndonesian: true,
    });
    expect(getLocaleSwitchPath("/proyek", "en")).toBe("/en/projects");
    expect(getLocaleSwitchPath("/dashboard", "en")).toBe("/dashboard");
  });

  test("keeps the approved application compatibility aliases explicit", () => {
    expect(resolvePublicAlias("/about?source=old")).toBe("/tentang");
    expect(resolvePublicAlias("/en/capabilities")).toBe("/en/services");
    expect(PUBLIC_ROUTE_ALIASES["/portfolio"]).toBe("/proyek");
  });

  test("uses reciprocal alternates only for complete language pairs", () => {
    expect(getPublicRouteMetadata("/en/contact")).toMatchObject({
      canonical: "/en/contact",
      robots: "index, follow",
      contentLanguage: "en",
      alternates: {
        id: "/kontak",
        en: "/en/contact",
        "x-default": "/kontak",
      },
    });
    expect(getPublicRouteMetadata("/en/projects")).toMatchObject({
      canonical: "/proyek",
      robots: "noindex, follow",
      contentLanguage: "id",
      alternates: null,
      fallbackToIndonesian: true,
    });
  });
});

describe("global language preference", () => {
  afterEach(() => {
    window.history.replaceState({}, "", "/");
    window.localStorage.clear();
  });

  test("lets a canonical Public URL override a stale stored preference", () => {
    window.localStorage.setItem("niuva_lang", "en");
    window.history.replaceState({}, "", "/kontak");

    render(
      <I18nProvider>
        <LanguageProbe />
      </I18nProvider>,
    );

    expect(screen.getByTestId("language")).toHaveTextContent("id");
  });

  test("stores an explicit preference for downstream non-Public surfaces", () => {
    window.history.replaceState({}, "", "/login");

    render(
      <I18nProvider>
        <LanguageProbe />
      </I18nProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "English" }));

    expect(screen.getByTestId("language")).toHaveTextContent("en");
    expect(window.localStorage.getItem("niuva_lang")).toBe("en");
  });
});

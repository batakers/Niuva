import {
  emptyProductDraft,
  normalizeValidationErrors,
  visibleCatalogActions,
} from "./catalog";


test("empty catalog draft has explicit safe defaults", () => {
  expect(emptyProductDraft()).toEqual({
    category_id: "",
    name: "",
    slug: "",
    short_description: "",
    description: "",
    media: [],
    pricing_mode: "fixed",
    price_from: 0,
    currency: "IDR",
    pricing_rule_reference: "",
    retail_cta_enabled: true,
    b2b_cta_enabled: true,
    stock_visibility: "status_only",
  });
});


test("validation errors are grouped by field", () => {
  const errors = [{ field: "media", code: "required", message: "Media wajib." }];
  expect(normalizeValidationErrors(errors)).toEqual({ media: ["Media wajib."] });
});


test("catalog actions follow exact permissions", () => {
  expect(visibleCatalogActions(["catalog.read"])).toEqual([]);
  expect(visibleCatalogActions(["catalog.write", "catalog.publish"])).toEqual([
    "create",
    "edit",
    "publish",
  ]);
  expect(visibleCatalogActions(["catalog.archive"])).toEqual(["archive"]);
});

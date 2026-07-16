import {
  buildCategoryPayload,
  categoryDraftFrom,
  emptyCategoryDraft,
  emptyProductDraft,
  normalizeValidationErrors,
  validCategoryDraft,
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


test("category drafts support safe create and edit payloads", () => {
  expect(emptyCategoryDraft()).toEqual({
    name: "",
    slug: "",
    description: "",
    sort_order: 0,
    status: "active",
  });
  const draft = categoryDraftFrom({
    id: "category-1",
    name: " Ready Stock ",
    slug: "ready-stock",
    description: " Products available now ",
    sort_order: 4,
    status: "active",
    created_at: "ignored",
  });
  expect(draft).toEqual({
    name: " Ready Stock ",
    slug: "ready-stock",
    description: " Products available now ",
    sort_order: 4,
    status: "active",
  });
  expect(buildCategoryPayload(draft)).toEqual({
    name: "Ready Stock",
    slug: "ready-stock",
    description: "Products available now",
    sort_order: 4,
    status: "active",
  });
  expect(validCategoryDraft({ ...draft, name: "R" })).toBe(false);
  expect(validCategoryDraft(draft)).toBe(true);
});

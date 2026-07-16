import { api } from "./api";

export function emptyCategoryDraft() {
  return {
    name: "",
    slug: "",
    description: "",
    sort_order: 0,
    status: "active",
  };
}


export function categoryDraftFrom(category = {}) {
  return {
    name: category.name || "",
    slug: category.slug || "",
    description: category.description || "",
    sort_order: Number(category.sort_order || 0),
    status: category.status || "active",
  };
}


export function buildCategoryPayload(form) {
  return {
    name: String(form.name || "").trim(),
    slug: String(form.slug || "").trim(),
    description: String(form.description || "").trim(),
    sort_order: Number(form.sort_order || 0),
    status: form.status || "active",
  };
}


export function validCategoryDraft(form) {
  const payload = buildCategoryPayload(form);
  return payload.name.length >= 2
    && payload.name.length <= 200
    && payload.slug.length <= 200
    && payload.description.length <= 2000
    && Number.isInteger(payload.sort_order)
    && payload.sort_order >= 0;
}

export function emptyProductDraft() {
  return {
    category_id: "", name: "", slug: "", short_description: "", description: "",
    media: [], pricing_mode: "fixed", price_from: 0, currency: "IDR",
    pricing_rule_reference: "", retail_cta_enabled: true, b2b_cta_enabled: true,
    stock_visibility: "status_only",
  };
}

export function normalizeValidationErrors(errors = []) {
  const values = Array.isArray(errors) ? errors : [];
  return values.reduce((grouped, error) => {
    const field = error?.field || "general";
    const message = error?.message || error?.msg || "Data belum valid.";
    return { ...grouped, [field]: [...(grouped[field] || []), message] };
  }, {});
}

export function visibleCatalogActions(permissions = []) {
  const allowed = (permission) => permissions.includes("*") || permissions.includes(permission);
  const actions = [];
  if (allowed("catalog.write")) actions.push("create", "edit");
  if (allowed("catalog.publish")) actions.push("publish");
  if (allowed("catalog.archive")) actions.push("archive");
  return actions;
}

const data = (request) => request.then((response) => response.data);

export const catalogApi = {
  listCategories: () => data(api.get("/admin/categories")),
  createCategory: (payload) => data(api.post("/admin/categories", payload)),
  updateCategory: (id, payload) => data(api.put(`/admin/categories/${id}`, payload)),
  archiveCategory: (id, reason) => data(api.post(`/admin/categories/${id}/archive`, { reason })),
  listProducts: () => data(api.get("/admin/products")),
  getProduct: (id) => data(api.get(`/admin/products/${id}`)),
  createProduct: (payload) => data(api.post("/admin/products", payload)),
  updateProduct: (id, payload) => data(api.put(`/admin/products/${id}`, payload)),
  replaceVariants: (id, variants) => data(api.put(`/admin/products/${id}/variants`, { variants })),
  replaceOptions: (id, options) => data(api.put(`/admin/products/${id}/options`, { options })),
  validateProduct: (id) => data(api.post(`/admin/products/${id}/validate`)),
  publishProduct: (id, reason) => data(api.post(`/admin/products/${id}/publish`, { reason })),
  rollbackProduct: (id, publicationId, reason) => data(api.post(`/admin/products/${id}/rollback`, { publication_id: publicationId, reason })),
  archiveProduct: (id, reason) => data(api.post(`/admin/products/${id}/archive`, { reason })),
};

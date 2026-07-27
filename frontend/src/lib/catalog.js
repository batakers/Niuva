import { api, unwrap } from "./api";


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

export const catalogApi = {
  listCategories: () => unwrap(api.get("/admin/categories")),
  createCategory: (payload) => unwrap(api.post("/admin/categories", payload)),
  updateCategory: (id, payload) => unwrap(api.put(`/admin/categories/${id}`, payload)),
  archiveCategory: (id, reason) => unwrap(api.post(`/admin/categories/${id}/archive`, { reason })),
  listProducts: () => unwrap(api.get("/admin/products")),
  getProduct: (id) => unwrap(api.get(`/admin/products/${id}`)),
  createProduct: (payload) => unwrap(api.post("/admin/products", payload)),
  updateProduct: (id, payload) => unwrap(api.put(`/admin/products/${id}`, payload)),
  replaceVariants: (id, variants) => unwrap(api.put(`/admin/products/${id}/variants`, { variants })),
  replaceOptions: (id, options) => unwrap(api.put(`/admin/products/${id}/options`, { options })),
  validateProduct: (id) => unwrap(api.post(`/admin/products/${id}/validate`)),
  publishProduct: (id, reason) => unwrap(api.post(`/admin/products/${id}/publish`, { reason })),
  rollbackProduct: (id, publicationId, reason) => unwrap(api.post(`/admin/products/${id}/rollback`, { publication_id: publicationId, reason })),
  archiveProduct: (id, reason) => unwrap(api.post(`/admin/products/${id}/archive`, { reason })),
  bulkArchiveProducts: (productIds, reason) => unwrap(api.post("/admin/products/bulk-archive", { product_ids: productIds, reason })),
};

export const publicCatalogApi = {
  categories: () => unwrap(api.get("/catalog/categories")),
  products: ({ cursor = null, limit = 24 } = {}) =>
    unwrap(
      api.get("/catalog/products", {
        params: {
          limit,
          ...(cursor ? { cursor } : {}),
        },
      }),
    ),
  product: (slug) => unwrap(api.get(`/catalog/products/${encodeURIComponent(slug)}`)),
};

export function formatCatalogPrice(product, variants = []) {
  const currency = product?.currency || "IDR";
  const values = variants
    .map((variant) => Number(variant.fixed_price || 0))
    .filter((value) => Number.isFinite(value) && value > 0);
  const base = Number(product?.price_from || 0);
  const amount = base > 0 ? base : values.length ? Math.min(...values) : 0;
  if (product?.pricing_mode === "quote_required" || amount <= 0) {
    return "Harga berdasarkan penawaran";
  }
  return `Mulai ${new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount)}`;
}

export function availabilityLabel(variants = []) {
  const statuses = new Set(variants.map((variant) => variant.stock_status));
  if (statuses.has("in_stock")) return "Tersedia";
  if (statuses.has("low_stock")) return "Stok terbatas";
  if (statuses.has("made_to_order")) return "Dibuat sesuai pesanan";
  return "Belum tersedia";
}

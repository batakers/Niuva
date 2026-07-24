import { api, unwrap } from "./api";
import { isReasonInRange } from "./utils";


export const SUPPORTED_MATERIAL_UNITS = Object.freeze([
  "pcs", "g", "kg", "mm", "cm", "m", "ml", "l", "sheet", "roll",
]);

export function materialFormFromRecord(record = {}) {
  return {
    ...(record.id ? { id: record.id } : {}),
    sku: record.sku || "",
    name: record.name || "",
    description: record.description || "",
    color: record.color || "",
    base_unit: record.base_unit || "",
    supplier_reference: record.supplier_reference || "",
    waste_percentage: String(record.waste_percentage ?? "0"),
    reorder_point: String(record.reorder_point ?? "0"),
    lead_time_days: String(record.lead_time_days ?? "0"),
    inventory_tracking_enabled: Boolean(record.inventory_tracking_enabled),
    setup_status: record.setup_status || "needs_review",
    status: record.status || (record.active === false ? "archived" : "active"),
  };
}

export function validReason(reason) {
  return isReasonInRange(reason);
}

export function formatIdr(amount) {
  if (amount == null || amount === "") return "—";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(amount));
}

export function priceVersionPayload(form) {
  return {
    amount: Number.parseInt(form.amount, 10),
    currency: "IDR",
    price_unit: form.price_unit,
    effective_from: new Date(form.effective_from).toISOString(),
    reason: String(form.reason || "").trim(),
  };
}

export function visibleMaterialActions(permissions = []) {
  const allowed = (permission) => permissions.includes("*") || permissions.includes(permission);
  const actions = [];
  if (allowed("materials.write")) actions.push("create", "edit");
  if (allowed("materials.archive")) actions.push("archive");
  if (allowed("pricing.read")) actions.push("price_history");
  if (allowed("pricing.write")) actions.push("append_price");
  return actions;
}

export const materialsApi = {
  list: () => unwrap(api.get("/admin/materials")),
  create: (payload) => unwrap(api.post("/admin/materials", payload)),
  update: (id, payload) => unwrap(api.put(`/admin/materials/${id}`, payload)),
  archive: (id, reason) => unwrap(api.post(`/admin/materials/${id}/archive`, { reason })),
  priceVersions: (id) => unwrap(api.get(`/admin/materials/${id}/price-versions`)),
  effectivePrice: (id) => unwrap(api.get(`/admin/materials/${id}/effective-price`)),
  appendPrice: (id, payload) => unwrap(api.post(`/admin/materials/${id}/price-versions`, payload)),
};

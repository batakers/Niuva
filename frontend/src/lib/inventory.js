import { api, unwrap } from "./api";
import { isReasonInRange } from "./utils";


export const MATERIAL_MOVEMENTS = Object.freeze([
  "receive", "reserve", "consume", "damage", "adjustment",
  "plan_incoming", "cancel_incoming", "plan_demand", "cancel_demand",
]);
export const PRODUCT_VARIANT_MOVEMENTS = Object.freeze([
  "produce", "reserve", "ship", "damage", "adjustment",
  "plan_incoming", "cancel_incoming", "plan_demand", "cancel_demand",
]);

function fallbackUuid() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (character) => {
    const random = Math.floor(Math.random() * 16);
    const value = character === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function movementTypesForSubject(subjectType) {
  return subjectType === "product_variant" ? [...PRODUCT_VARIANT_MOVEMENTS] : [...MATERIAL_MOVEMENTS];
}

export function visibleMovementTypes(subjectType, permissions = []) {
  const allowed = (permission) => permissions.includes("*") || permissions.includes(permission);
  if (!allowed("inventory.write")) return [];
  return movementTypesForSubject(subjectType).filter(
    (movement) => !["damage", "adjustment"].includes(movement) || allowed("inventory.adjust"),
  );
}

export function operationDefaults(subjectType = "material", subjectId = "", movementType = "receive") {
  const operationId = globalThis.crypto?.randomUUID?.() || fallbackUuid();
  return {
    operation_id: operationId,
    subject_type: subjectType,
    subject_id: subjectId,
    movement_type: movementType,
    quantity: "",
    on_hand_delta: "",
    reference_type: "manual",
    reference_id: "",
    reason: "",
  };
}

export function buildOperationPayload(form) {
  const payload = {
    operation_id: form.operation_id,
    subject_type: form.subject_type,
    subject_id: form.subject_id,
    movement_type: form.movement_type,
    reference_type: form.reference_type,
    reference_id: form.reference_id,
    reason: String(form.reason || "").trim(),
  };
  if (form.expected_balance_version !== undefined && form.expected_balance_version !== "") {
    payload.expected_balance_version = Number(form.expected_balance_version);
  }
  if (form.movement_type === "adjustment") payload.on_hand_delta = String(form.on_hand_delta);
  else payload.quantity = String(form.quantity);
  return payload;
}

export function reservationActions(reservation, permissions = []) {
  const allowed = permissions.includes("*") || permissions.includes("inventory.write");
  return allowed && reservation?.status === "active" ? ["release", "consume"] : [];
}

export function reservationTransitionDefaults(reservationId = "", action = "release") {
  return {
    reservation_id: reservationId,
    action,
    operation_id: globalThis.crypto?.randomUUID?.() || fallbackUuid(),
    reason: "",
  };
}


export function buildReservationTransitionPayload(form) {
  return {
    operation_id: form.operation_id,
    reason: String(form.reason || "").trim(),
  };
}

export function validInventoryReason(reason) {
  return isReasonInRange(reason);
}

const CONFLICT_MESSAGES = {
  stale_balance: "Data stok berubah. Muat ulang sebelum mencoba lagi.",
  balance_version_conflict: "Data stok berubah. Muat ulang sebelum mencoba lagi.",
  expected_balance_version_conflict: "Data stok berubah. Muat ulang sebelum mencoba lagi.",
  operation_id_conflict: "Operation ID sudah digunakan untuk data yang berbeda.",
  transaction_unavailable: "Transaksi database belum tersedia. Operasi stok dinonaktifkan.",
};

export function parseInventoryConflict(detail = {}) {
  return CONFLICT_MESSAGES[detail.code] || detail.message || "Operasi stok tidak dapat diproses.";
}

export function statusTone(status) {
  return ({ active: "warning", resolved: "success", expired: "muted", consumed: "success", released: "muted" })[status] || "muted";
}

export function alertActions(permissions = []) {
  return permissions.includes("*") || permissions.includes("restock_alerts.manage") ? ["resolve"] : [];
}

const query = (values) => ({ params: Object.fromEntries(Object.entries(values).filter(([, value]) => value !== "" && value != null)) });

export const inventoryApi = {
  balances: (filters = {}) => unwrap(api.get("/admin/inventory/balances", query(filters))),
  balance: (subjectType, subjectId) => unwrap(api.get(`/admin/inventory/balances/${subjectType}/${subjectId}`)),
  movements: (filters = {}) => unwrap(api.get("/admin/inventory/movements", query(filters))),
  apply: (payload) => unwrap(api.post("/admin/inventory/movements", payload)),
  reserve: (payload) => unwrap(api.post("/admin/inventory/reservations", payload)),
  reservations: (filters = {}) => unwrap(api.get("/admin/inventory/reservations", query(filters))),
  release: (id, payload) => unwrap(api.post(`/admin/inventory/reservations/${id}/release`, payload)),
  consume: (id, payload) => unwrap(api.post(`/admin/inventory/reservations/${id}/consume`, payload)),
  alerts: (filters = {}) => unwrap(api.get("/admin/inventory/restock-alerts", query(filters))),
  resolveAlert: (id, reason) => unwrap(api.post(`/admin/inventory/restock-alerts/${id}/resolve`, { reason })),
};

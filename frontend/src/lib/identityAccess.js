const ACCOUNT_STATUS_LABELS = Object.freeze({
  active: "Active",
  disabled: "Disabled",
});

const SAFE_AUDIT_EVENT_FIELDS = Object.freeze([
  "id",
  "actor_user_id",
  "action",
  "target_type",
  "target_id",
  "reason_code",
  "policy_version",
  "created_at",
]);

const SAFE_AUDIT_PROJECTION_FIELDS = Object.freeze([
  "roles",
  "access_state",
  "status",
  "organization_id",
  "membership_id",
  "member_role",
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function accountStatusLabel(status) {
  return ACCOUNT_STATUS_LABELS[status] || "Unknown status";
}

function safeAuditProjection(value) {
  if (!isRecord(value)) return {};
  return SAFE_AUDIT_PROJECTION_FIELDS.reduce((projection, field) => {
    const candidate = value[field];
    if (
      (field === "roles" && Array.isArray(candidate) && candidate.every((role) => typeof role === "string")) ||
      (field !== "roles" && typeof candidate === "string")
    ) {
      projection[field] = Array.isArray(candidate) ? [...candidate] : candidate;
    }
    return projection;
  }, {});
}

export function safeAuditEvent(event) {
  if (!isRecord(event)) return {};
  const safeEvent = SAFE_AUDIT_EVENT_FIELDS.reduce((result, field) => {
    if (typeof event[field] === "string") result[field] = event[field];
    return result;
  }, {});
  if (isRecord(event.previous) || isRecord(event.result)) {
    if (isRecord(event.previous)) safeEvent.previous = safeAuditProjection(event.previous);
    if (isRecord(event.result)) safeEvent.result = safeAuditProjection(event.result);
  } else {
    if (isRecord(event.before)) safeEvent.previous = event.before;
    if (isRecord(event.after)) safeEvent.result = event.after;
  }
  return safeEvent;
}

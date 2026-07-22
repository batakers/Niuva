const INTERNAL_ROLE_KIND = "internal";

const ACCOUNT_STATUS_LABELS = Object.freeze({
  active: "Active",
  disabled: "Disabled",
});

const ACCESS_STATE_LABELS = Object.freeze({
  approved: "Approved",
  access_review_required: "Access review required",
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

function policyRoles(policy) {
  if (!isRecord(policy) || !Array.isArray(policy.roles)) return [];
  return policy.roles.filter(
    (role) =>
      isRecord(role) &&
      typeof role.role === "string" &&
      typeof role.label === "string" &&
      typeof role.kind === "string"
  );
}

export function internalRoles(policy) {
  return policyRoles(policy).filter((role) => role.kind === INTERNAL_ROLE_KIND);
}

export function reasonCodes(policy) {
  if (!isRecord(policy) || !Array.isArray(policy.access_reason_codes)) return [];
  return policy.access_reason_codes.filter(
    (reason) =>
      isRecord(reason) &&
      typeof reason.code === "string" &&
      typeof reason.label === "string"
  );
}

export function roleLabels(user, policy) {
  const roles = Array.isArray(user?.roles)
    ? user.roles.filter((role) => typeof role === "string")
    : [];
  const suppliedLabels = Array.isArray(user?.role_labels)
    ? user.role_labels.filter((label) => typeof label === "string")
    : [];
  if (roles.length > 0 && suppliedLabels.length === roles.length) {
    return suppliedLabels;
  }

  const labelsByRole = new Map(
    policyRoles(policy).map((role) => [role.role, role.label])
  );
  return roles.map((role) => labelsByRole.get(role) || "Unknown role");
}

export function accountStatusLabel(status) {
  return ACCOUNT_STATUS_LABELS[status] || "Unknown status";
}

export function accessStateLabel(accessState) {
  return ACCESS_STATE_LABELS[accessState] || "Unknown access state";
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
  if (isRecord(event.previous)) safeEvent.previous = safeAuditProjection(event.previous);
  if (isRecord(event.result)) safeEvent.result = safeAuditProjection(event.result);
  return safeEvent;
}

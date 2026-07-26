const ACCOUNT_STATUS_LABELS = Object.freeze({
  active: "Active",
  disabled: "Disabled",
});

export function accountStatusLabel(status) {
  return ACCOUNT_STATUS_LABELS[status] || "Unknown status";
}

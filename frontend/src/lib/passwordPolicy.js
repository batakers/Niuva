export function passwordMetrics(value) {
  const candidate = String(value ?? "");
  return {
    codePoints: Array.from(candidate).length,
    utf8Bytes: new TextEncoder().encode(candidate).length,
  };
}

export async function fetchPasswordPolicy(apiClient) {
  const response = await apiClient.get("/auth/password-policy");
  return response.data;
}

export function passwordSatisfiesPolicy(value, policy) {
  if (!policy) return false;
  const { codePoints, utf8Bytes } = passwordMetrics(value);
  return (
    codePoints >= policy.min_code_points
    && codePoints <= policy.max_code_points
    && utf8Bytes <= policy.max_utf8_bytes
  );
}

export function passwordPolicySummary(policy) {
  if (!policy) return "";
  return (
    `${policy.min_code_points}–${policy.max_code_points} karakter Unicode; `
    + `maksimal ${policy.max_utf8_bytes} byte; password umum ditolak.`
  );
}

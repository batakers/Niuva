import {
  fetchPasswordPolicy,
  passwordMetrics,
  passwordPolicySummary,
  passwordSatisfiesPolicy,
} from "./passwordPolicy";

const POLICY = {
  min_code_points: 15,
  max_code_points: 128,
  max_utf8_bytes: 512,
};

test("counts Unicode code points separately from UTF-8 bytes", () => {
  expect(passwordMetrics("😀".repeat(128))).toEqual({
    codePoints: 128,
    utf8Bytes: 512,
  });
});

test("loads the canonical policy from the backend seam", async () => {
  const apiClient = {
    get: jest.fn().mockResolvedValue({ data: POLICY }),
  };

  await expect(fetchPasswordPolicy(apiClient)).resolves.toBe(POLICY);
  expect(apiClient.get).toHaveBeenCalledWith("/auth/password-policy");
});

test("applies the backend code-point and byte boundaries", () => {
  expect(passwordSatisfiesPolicy("x".repeat(14), POLICY)).toBe(false);
  expect(passwordSatisfiesPolicy("x".repeat(15), POLICY)).toBe(true);
  expect(passwordSatisfiesPolicy("x".repeat(73), POLICY)).toBe(true);
  expect(passwordSatisfiesPolicy("😀".repeat(128), POLICY)).toBe(true);
  expect(passwordSatisfiesPolicy(`${"😀".repeat(128)}x`, POLICY)).toBe(false);
  expect(passwordSatisfiesPolicy("valid only after policy loads", null)).toBe(false);
});

test("renders the policy supplied by the backend", () => {
  expect(passwordPolicySummary(POLICY)).toBe(
    "15–128 karakter Unicode; maksimal 512 byte; password umum ditolak.",
  );
});

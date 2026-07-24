import { fmtDate, fmtDay, rupiah } from "./format";

describe("rupiah", () => {
  test("formats a positive amount with Rp prefix and id-ID thousands separators", () => {
    expect(rupiah(125000)).toBe("Rp 125.000");
  });

  test("formats zero", () => {
    expect(rupiah(0)).toBe("Rp 0");
  });

  test("formats a numeric string", () => {
    expect(rupiah("50000")).toBe("Rp 50.000");
  });

  test("returns a dash for null or undefined", () => {
    expect(rupiah(null)).toBe("-");
    expect(rupiah(undefined)).toBe("-");
  });
});

describe("fmtDate", () => {
  test("returns a dash for a missing value", () => {
    expect(fmtDate(null)).toBe("-");
    expect(fmtDate(undefined)).toBe("-");
    expect(fmtDate("")).toBe("-");
  });

  test("formats a valid ISO timestamp as a non-empty localized string", () => {
    const result = fmtDate("2026-07-22T10:30:00Z");
    expect(typeof result).toBe("string");
    expect(result).not.toBe("-");
    expect(result.length).toBeGreaterThan(0);
  });
});

describe("fmtDay", () => {
  test("returns a dash for a missing value", () => {
    expect(fmtDay(null)).toBe("-");
    expect(fmtDay(undefined)).toBe("-");
    expect(fmtDay("")).toBe("-");
  });

  test("formats a valid ISO date as a non-empty localized string", () => {
    const result = fmtDay("2026-07-22T10:30:00Z");
    expect(typeof result).toBe("string");
    expect(result).not.toBe("-");
    expect(result.length).toBeGreaterThan(0);
  });

  test("does not include a time component", () => {
    const result = fmtDay("2026-07-22T10:30:00Z");
    expect(result).not.toMatch(/\d{1,2}:\d{2}/);
  });
});

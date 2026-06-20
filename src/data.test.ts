import { describe, it, expect } from "vitest";
import { MOCK_DATA } from "./data";

describe("MOCK_DATA integrity", () => {
  it("core arrays are populated", () => {
    expect(MOCK_DATA.tenants.length).toBeGreaterThan(0);
    expect(MOCK_DATA.mrr.length).toBe(12);
    expect(MOCK_DATA.gmv.length).toBe(12);
    expect(MOCK_DATA.aiCostSeries.length).toBe(12);
    expect(MOCK_DATA.gateways.length).toBeGreaterThan(0);
  });
  it("keeps the two PRICING concepts distinct (planConfig = Appido tiers)", () => {
    expect(MOCK_DATA.planConfig.map((p) => p.key).sort()).toEqual(["pro", "start"]);
    MOCK_DATA.planConfig.forEach((p) => expect(typeof p.price).toBe("number"));
  });
  it("keeps the two REVENUE series distinct (MRR vs GMV)", () => {
    expect(MOCK_DATA.mrr).not.toEqual(MOCK_DATA.gmv);
  });
  it("every string uses Western digits only (no Arabic-Indic numerals)", () => {
    const arabicIndic = /[\u06F0-\u06F9\u0660-\u0669]/;
    const ok = (v: unknown): boolean =>
      typeof v === "string" ? !arabicIndic.test(v)
      : Array.isArray(v) ? v.every(ok)
      : v && typeof v === "object" ? Object.values(v).every(ok)
      : true;
    expect(ok(MOCK_DATA)).toBe(true);
  });
});

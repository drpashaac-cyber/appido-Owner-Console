import { describe, it, expect } from "vitest";
import { MockApi, MOCK_DATA } from "./data";
import type { AppData } from "./types";

const KEYS: (keyof AppData)[] = [
  "mrr", "gmv", "plans", "regions", "tenants", "gender", "ages", "geo", "categories",
  "heatCols", "heatRows", "pricePoints", "intent", "opps", "flags", "audit", "funnel",
  "issues", "adoption", "confusion", "incidents", "planConfig", "script", "aiServices",
  "botHealth", "aiTips", "modelTiers", "aiControlServices", "aiCostSeries", "platformStatus",
  "allChats", "users", "sessions", "gateways",
];

describe("MockApi (default Api implementation)", () => {
  it("data() resolves to the full, typed AppData bundle", async () => {
    const d = await MockApi.data();
    expect(d).toBe(MOCK_DATA);
    for (const k of KEYS) expect(d[k], `AppData missing "${k}"`).toBeDefined();
  });
  it("me() resolves with the owner role", async () => {
    const me = await MockApi.me();
    expect(me.role).toBe("owner");
    expect(typeof me.name).toBe("string");
    expect(me.email).toContain("@");
  });
  it("data() is asynchronous (returns a Promise — swap-ready for fetch)", () => {
    expect(MockApi.data()).toBeInstanceOf(Promise);
  });
});

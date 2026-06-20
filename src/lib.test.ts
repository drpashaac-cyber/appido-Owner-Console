import { describe, it, expect } from "vitest";
import { fmt, money, moneyK, num, clamp, conv, aiUsageOf, defaultModel, nowHM, ROLES, PERMS, MONEY_ROLES, personaOf, traitsOf, chatsOf, botChatsOf, aiPlanOf } from "./lib";
import type { Tenant } from "./types";

const proT = { name: "X", plan: "pro", gmv: 33600, mrr: 179, status: "ok", health: 80, cust: 3000, members: 16000 } as Tenant;
const freeT = { name: "Y", plan: "free", gmv: 4000, mrr: 0, status: "ok", health: 60, cust: 200, members: 9000 } as Tenant;

describe("formatters (Western digits)", () => {
  it("fmt groups thousands", () => { expect(fmt(1234567)).toBe("1,234,567"); expect(fmt(1234.6)).toBe("1,235"); });
  it("money prefixes $", () => expect(money(1000)).toBe("$1,000"));
  it("moneyK compacts", () => { expect(moneyK(1500)).toBe("$1.5K"); expect(moneyK(2_500_000)).toBe("$2.50M"); expect(moneyK(999)).toBe("$999"); });
  it("num compacts without $", () => { expect(num(1500)).toBe("1.5K"); expect(num(2_500_000)).toBe("2.5M"); expect(num(500)).toBe("500"); });
});

describe("clamp / conv", () => {
  it("clamp bounds to 8..96", () => { expect(clamp(5)).toBe(8); expect(clamp(100)).toBe(96); expect(clamp(50)).toBe(50); });
  it("conv = cust/members %", () => { expect(conv(proT)).toBeCloseTo(18.8, 1); expect(conv({ members: 0, cust: 5 } as Tenant)).toBe(0); });
});

describe("aiUsageOf (margin logic)", () => {
  it("computes cost from plan + gmv", () => expect(aiUsageOf(proT).cost).toBe(254));
  it("pro over-budget when cost > mrr*1.4", () => expect(aiUsageOf(proT).overrun).toBe(true));
  it("free tenant with 0 MRR is always over budget", () => expect(aiUsageOf(freeT).overrun).toBe(true));
  it("tokensPct is clamped", () => expect(aiUsageOf(proT).tokensPct).toBe(90));
});

describe("defaultModel (tier assignment)", () => {
  it("LangMaster forced premium", () => expect(defaultModel({ name: "LangMaster", plan: "free" } as Tenant, "seller")).toBe("premium"));
  it("pro seller/support -> premium", () => expect(defaultModel({ name: "A", plan: "pro" } as Tenant, "seller")).toBe("premium"));
  it("pro other services -> standard", () => expect(defaultModel({ name: "A", plan: "pro" } as Tenant, "crm")).toBe("standard"));
  it("non-pro -> standard", () => expect(defaultModel({ name: "A", plan: "start" } as Tenant, "seller")).toBe("standard"));
});

describe("RBAC", () => {
  it("every role has a PERMS entry", () => ROLES.forEach((r: any) => expect(PERMS[r.key ?? r]).toBeDefined()));
  it("only owner + finance can see money", () => { expect(MONEY_ROLES.has("owner")).toBe(true); expect(MONEY_ROLES.has("finance")).toBe(true); expect(MONEY_ROLES.has("support")).toBe(false); });
});

describe("nowHM", () => {
  it("returns ASCII HH:MM", () => expect(nowHM()).toMatch(/^\d{2}:\d{2}$/));
});

describe("per-tenant intelligence", () => {
  it("personaOf maps status -> label", () => {
    expect(personaOf({ status: "churn" } as Tenant, "en")).toMatch(/diseng/i);
    expect(personaOf({ status: "ok", plan: "pro", health: 90 } as Tenant, "en")).toMatch(/leader/i);
    expect(personaOf({ status: "ok", plan: "start", health: 70 } as Tenant, "en")).toMatch(/grow/i);
  });
  it("traitsOf returns 5 clamped radar traits", () => {
    const tr = traitsOf(proT);
    expect(tr).toHaveLength(5);
    tr.forEach((x) => {
      expect(typeof x.v).toBe("number");
      expect(x.v).toBeGreaterThanOrEqual(8);
      expect(x.v).toBeLessThanOrEqual(96);
      expect(typeof x.fa).toBe("string");
    });
  });
  it("chatsOf and botChatsOf return non-empty ChatMsg[] with fa + en", () => {
    for (const fn of [chatsOf, botChatsOf]) {
      const msgs = fn(proT, "fa");
      expect(msgs.length).toBeGreaterThan(0);
      msgs.forEach((m) => { expect(typeof m.fa).toBe("string"); expect(typeof m.en).toBe("string"); });
    }
  });
  it("aiPlanOf returns actionable suggestions for at-risk tenants", () => {
    const plan = aiPlanOf({ ...freeT, status: "risk" } as Tenant, "en");
    expect(plan.length).toBeGreaterThan(0);
    plan.forEach((p) => { expect(p.title).toBeTruthy(); expect(p.impact).toBeTruthy(); });
  });
});


// HttpApi — live owner-console data from the backend.
//
// Honest scope: the backend currently computes the platform's FINANCIAL/OPERATIONAL core
// (overview KPIs, MRR by plan, GMV series, funnel) and a real tenant list. The market-research
// panels (demographics, heatmaps, intent mining, AI-service breakdowns, etc.) have no backend
// pipeline yet, so in live mode they return EMPTY — never fabricated numbers. Demo mode (MockApi)
// keeps the full illustrative dataset.
import type { AppData, Api, Me, Platform, Tenant, PlanShare, Region } from "./types";

const API_BASE = (): string =>
  (typeof window !== "undefined" && (window as unknown as { APPIDO_API_BASE?: string }).APPIDO_API_BASE) || "";

export const apiEnabled = (): boolean => !!API_BASE();

async function get<T>(path: string): Promise<T> {
  const res = await fetch(API_BASE() + path, { credentials: "include", headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`http_${res.status}`);
  return (await res.json()) as T;
}

const csrfToken = (): string => {
  if (typeof document === "undefined") return "";
  const m = document.cookie.match(/(?:^|;\s*)appido_csrf=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : "";
};

async function send<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(API_BASE() + path, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-Token": csrfToken() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`http_${res.status}`);
  return (res.status === 204 ? (undefined as T) : ((await res.json()) as T));
}

async function post<T>(path: string, body?: unknown): Promise<T> {
  return send<T>("POST", path, body);
}

// Owner-managed Appido plan catalog (shared with the landing page + dashboard).
export interface OwnerPlan {
  id: string; key: string; name: string; descFa: string | null; descEn: string | null;
  priceCents: number; annualCents: number | null; currency: string; periodDays: number;
  featuresFa: string[]; featuresEn: string[]; popular: boolean; active: boolean; sortOrder: number;
}
export type PlanPatch = Partial<Omit<OwnerPlan, "id">>;
export const ownerPlans = {
  list: () => get<OwnerPlan[]>("/v1/owner/plans"),
  create: (input: PlanPatch) => send<OwnerPlan>("POST", "/v1/owner/plans", input),
  update: (id: string, patch: PlanPatch) => send<OwnerPlan>("PATCH", `/v1/owner/plans/${encodeURIComponent(id)}`, patch),
  remove: (id: string) => send<{ ok: true }>("DELETE", `/v1/owner/plans/${encodeURIComponent(id)}`),
};

// Platform gateway policy (enable/disable a payment method for ALL tenants).
export interface GatewayPolicyRow { method: string; label: string; group: string; crypto: boolean; available: boolean; enabled: boolean }
export const ownerGateways = {
  list: () => get<GatewayPolicyRow[]>("/v1/owner/gateway-policy"),
  set: (method: string, enabled: boolean) => send<{ method: string; enabled: boolean }>("PUT", `/v1/owner/gateway-policy/${encodeURIComponent(method)}`, { enabled }),
};

// Platform settings shared with the landing + dashboard (e.g. free-trial length).
export const ownerSettings = {
  get: () => get<{ trialDays: number }>("/v1/owner/settings"),
  set: (trialDays: number) => send<{ trialDays: number }>("PUT", "/v1/owner/settings", { trialDays }),
};

// Platform compliance policy (consent, PII handling, residency, retention).
export interface GovernancePolicy { requireOptin: boolean; aiRequiresConsent: boolean; piiRedaction: string; dataRetentionDays: number; residency: string }
export const ownerGovernance = {
  get: () => get<GovernancePolicy>("/v1/owner/governance"),
  set: (p: Partial<GovernancePolicy>) => send<GovernancePolicy>("PUT", "/v1/owner/governance", p),
};

// Recent landing-page leads / signals (public analytics events). Read-only.
export interface LeadRow { id: string; name: string; anonId: string | null; email: string | null; phone: string | null; isLead: boolean; props: Record<string, unknown>; at: string | null }
export const ownerLeads = {
  list: () => get<LeadRow[]>("/v1/owner/leads"),
};

// Platform onboarding script (questions the tenant AI works through with new leads).
export interface ScriptRow { id: string; key: string; category: string; questionFa: string; questionEn: string; sortOrder: number; enabled: boolean; active: boolean }
export const ownerScript = {
  list: () => get<ScriptRow[]>("/v1/owner/script"),
  create: (b: Partial<ScriptRow>) => send<ScriptRow>("POST", "/v1/owner/script", b),
  update: (id: string, b: Partial<ScriptRow>) => send<ScriptRow>("PATCH", `/v1/owner/script/${id}`, b),
  remove: (id: string) => send<{ ok: true }>("DELETE", `/v1/owner/script/${id}`),
};

// Owner-console auth — uses the shared backend session (password or email-code, incl. 2FA).
export const ownerAuth = {
  ensureCsrf: () => get<{ ok: true }>("/auth/csrf"),
  loginPassword: (email: string, password: string) =>
    post<{ ok: true; next?: string; mustRotate?: boolean }>("/auth/login/password", { email, password }),
  loginStart: (email: string) => post<{ ok: true }>("/auth/login/start", { email }),
  loginCode: (email: string, code: string) => post<{ ok: true }>("/auth/login/code", { email, code }),
  logout: () => post<{ ok: true }>("/auth/logout"),
  me: () => get<{ name?: string; email?: string; role?: string }>("/me"),
};

// A platform (owner-side) role — anything that isn't a tenant-scoped user.
export const isPlatformRole = (role?: string): boolean => !!role && role !== "tenant_admin" && role !== "tenant_member";

// ── backend response shapes (subset we consume) ──────────────────────────────
interface OverviewR { tenants: number; channels: number; customers: number; activeSubscriptions: number; mrrUsd: number; gmvUsd: number; aiTokens: number }
interface TenantR { id: string; name: string; handle: string | null; country: string | null; plan: string; mrrCents: number; gmvCents: number; customers: number; members: number; aiModel: string | null; aiEnabled: boolean | null; createdAt: string | null; lastActivity: string | null }
interface MrrR { mrrCents: number; currency: string; byPlan: Array<{ plan: string; subs: number; cents: number }> }
interface GmvR { byCurrency: Array<{ currency: string; cents: number }>; series: Array<{ day: string; currency: string; cents: number }> }
interface FunnelR { customers: number; engaged: number; scored: number; paid: number; rates: { engagedPct: number; scoredPct: number; paidPct: number; scoredToPaidPct: number } }

// ── small presentation helpers (derive display fields from real data) ─────────
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const slug = (s: string) => "@" + (s || "tenant").toLowerCase().replace(/[^a-z0-9]+/g, "").slice(0, 18);
const fmtMonth = (iso: string | null): string => { if (!iso) return "—"; const d = new Date(iso); return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`; };
const daysSince = (iso: string | null): number | null => { if (!iso) return null; return Math.floor((Date.now() - new Date(iso).getTime()) / 86_400_000); };
const relTime = (iso: string | null): string => {
  if (!iso) return "—";
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return s + "s"; if (s < 3600) return Math.floor(s / 60) + "m";
  if (s < 86400) return Math.floor(s / 3600) + "h"; return Math.floor(s / 86400) + "d";
};
const hasPaidPlan = (r: TenantR) => (r.mrrCents || 0) > 0 || (!!r.plan && r.plan !== "free");
// status/health are transparent composites of real signals (subscription + activity), not fabricated scores.
function statusOf(r: TenantR): string {
  const d = daysSince(r.lastActivity);
  if (hasPaidPlan(r) && (d === null || d <= 7)) return "ok";
  if (d !== null && d <= 14) return "risk";
  return "churn";
}
function healthOf(r: TenantR): number {
  let h = 30;
  if (hasPaidPlan(r)) h += 35;
  if ((r.customers || 0) > 0) h += 20;
  const d = daysSince(r.lastActivity);
  if (d !== null && d <= 7) h += 15;
  return Math.min(100, h);
}

function mapTenant(r: TenantR): Tenant {
  const region = r.country || "—";
  const last = relTime(r.lastActivity);
  const joined = fmtMonth(r.createdAt);
  return {
    name: r.name,
    handle: r.handle || slug(r.name),
    plan: (r.plan || "free") as Tenant["plan"],
    regionFa: region, regionEn: region,
    members: r.members || 0,
    cust: r.customers || 0,
    mrr: Math.round((r.mrrCents || 0) / 100),
    gmv: Math.round((r.gmvCents || 0) / 100),
    health: healthOf(r),
    status: statusOf(r),
    last, lastEn: last,
    joinedFa: joined, joinedEn: joined,
    catFa: "—", catEn: "—",
    aiModel: r.aiModel ?? null,
    aiEnabled: r.aiEnabled ?? null,
  };
}

const PLAN_LABEL: Record<string, { fa: string; en: string; color: string }> = {
  free: { fa: "رایگان (trial)", en: "Free (trial)", color: "var(--sand)" },
  start: { fa: "Start · $79", en: "Start · $79", color: "var(--mint)" },
  pro: { fa: "Pro · $179", en: "Pro · $179", color: "var(--green)" },
};
function planShares(m: MrrR): PlanShare[] {
  const byPlan = m?.byPlan ?? [];
  const total = byPlan.reduce((s, p) => s + (p.subs || 0), 0) || 1;
  return byPlan.map((p) => {
    const meta = PLAN_LABEL[p.plan] || { fa: p.plan, en: p.plan, color: "var(--sand)" };
    return { key: p.plan, labelFa: meta.fa, labelEn: meta.en, pct: Math.round((p.subs / total) * 100), color: meta.color };
  });
}
function gmvDaily(g: GmvR): number[] {
  const byDay = new Map<string, number>();
  for (const r of g?.series ?? []) byDay.set(r.day, (byDay.get(r.day) || 0) + r.cents);
  const out = [...byDay.keys()].sort().map((d) => Math.round((byDay.get(d) || 0) / 100));
  return out.length >= 2 ? out : [out[0] ?? 0, out[0] ?? 0]; // charts need ≥2 points
}
function regionsFrom(tenants: Tenant[]): Region[] {
  const by = new Map<string, number>();
  for (const t of tenants) { const k = t.regionEn || "—"; by.set(k, (by.get(k) || 0) + 1); }
  return [...by.entries()].filter(([k]) => k && k !== "—").sort((a, b) => b[1] - a[1]).slice(0, 8)
    .map(([k, v]) => ({ fa: k, en: k, tenants: v }));
}

async function data(): Promise<AppData> {
  const [ov, tn, mrrR, gmvR, fn] = await Promise.all([
    get<OverviewR>("/v1/owner/overview"),
    get<TenantR[]>("/v1/owner/tenants"),
    get<MrrR>("/v1/owner/analytics/mrr"),
    get<GmvR>("/v1/owner/analytics/gmv"),
    get<FunnelR>("/v1/owner/analytics/funnel"),
  ]);
  const tenants = (tn ?? []).map(mapTenant);
  const members = tenants.reduce((s, t) => s + (t.members || 0), 0);
  const platform: Platform = {
    tenants: ov.tenants, channels: ov.channels, customers: ov.customers, members,
    activeSubscriptions: ov.activeSubscriptions, mrrUsd: ov.mrrUsd, gmvUsd: ov.gmvUsd, aiTokens: ov.aiTokens,
    conversionPct: fn?.rates?.paidPct ?? 0,
  };
  return {
    platform,
    mrr: [ov.mrrUsd, ov.mrrUsd], // flat: no historical MRR snapshot exists yet (honest — not a fake trend)
    gmv: gmvDaily(gmvR),
    plans: planShares(mrrR),
    regions: regionsFrom(tenants),
    tenants,
    funnel: [100, fn?.rates?.engagedPct ?? 0, fn?.rates?.scoredPct ?? 0, fn?.rates?.paidPct ?? 0],
    // Panels below need analytics pipelines that don't exist yet → empty in live (never fabricated):
    gender: [], ages: [], geo: [], categories: [], heatCols: [], heatRows: [], pricePoints: [],
    intent: [], opps: [], flags: [], audit: [], issues: [], adoption: [], confusion: [], incidents: [],
    planConfig: [], script: [], aiServices: [], botHealth: [], aiTips: [], modelTiers: [],
    aiControlServices: [], aiCostSeries: [0, 0], platformStatus: [], allChats: [], users: [], sessions: [], gateways: [],
  };
}

async function me(): Promise<Me> {
  const m = await get<{ name?: string; email?: string; role?: string }>("/me");
  return { role: m.role || "owner", name: m.name || "Owner", email: m.email || "" };
}

export const HttpApi: Api = { data, me };

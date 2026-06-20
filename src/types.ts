export type Plan = "free" | "start" | "pro";

export type Sev = "high" | "med" | "low";

export type Lang = "fa" | "en";

export type Dict = any;

export interface ViewProps { t: Dict; lang: Lang; }

export interface ChatMsg { me?: boolean; op?: boolean; fa: string; en: string; }

export interface ChartDatum { pct?: number; v?: number; color?: string; label?: string; labelFa?: string; labelEn?: string; fa?: string; en?: string; }

export interface PlanShare { key: string; labelFa: string; labelEn: string; pct: number; color: string; }

export interface Region { fa: string; en: string; tenants: number; }

export interface GenderSlice { fa: string; en: string; pct: number; color: string; }

export interface LabeledPct { label: string; pct: number; }

export interface FaEnPct { fa: string; en: string; pct: number; }

export interface CategoryTrend { fa: string; en: string; trend: number; }

export interface HeatCol { fa: string; en: string; }

export interface HeatRow { fa: string; en: string; v: number[]; }

export interface WeightedPhrase { fa: string; en: string; w: number; }

export interface Opportunity { fa: string; en: string; up: number; }

export interface ActivitySeed { time: string; fa: string; en: string; tone: string; channel?: string; }

export interface AICtrlSvc { key: string; fa: string; en: string; plans: string[]; }

export interface PlatformSvc { fa: string; en: string; status: string; uptime: string; }

export interface Gateway { key: string; fa: string; en: string; kind: string; on: boolean; }

export interface ChatRef { name: string; kind: string; }

export interface AppData {
  platform: Platform;
  mrr: number[]; gmv: number[]; plans: PlanShare[]; regions: Region[]; tenants: Tenant[];
  gender: GenderSlice[]; ages: LabeledPct[]; geo: FaEnPct[]; categories: CategoryTrend[];
  heatCols: HeatCol[]; heatRows: HeatRow[]; pricePoints: LabeledPct[]; intent: WeightedPhrase[]; opps: Opportunity[];
  flags: Flag[]; audit: AuditRow[]; funnel: number[]; issues: Issue[]; adoption: FaEnPct[]; confusion: WeightedPhrase[];
  incidents: Incident[]; planConfig: PlanCfg[]; script: ScriptQ[]; aiServices: AIService[]; botHealth: BotHealth[];
  aiTips: Tip[]; modelTiers: string[]; aiControlServices: AICtrlSvc[]; aiCostSeries: number[];
  platformStatus: PlatformSvc[]; allChats: ChatRef[]; users: UserRow[]; sessions: SessionRow[]; gateways: Gateway[];
}

export interface Me { role: string; name: string; email: string; }

// Real platform-wide figures (owner overview). Powers the home KPIs when live.
export interface Platform {
  tenants: number; channels: number; customers: number; members: number;
  activeSubscriptions: number; mrrUsd: number; gmvUsd: number; aiTokens: number; conversionPct: number;
}
// API contract — swap MockApi for an HTTP-backed impl (see BACKEND.md). Client never authorizes; server enforces.

export interface Api { data(): Promise<AppData>; me(): Promise<Me>; }

export interface Tenant { name: string; handle: string; plan: Plan; regionFa: string; regionEn: string; members: number; cust: number; mrr: number; gmv: number; health: number; status: string; last: string; lastEn: string; joinedFa: string; joinedEn: string; catFa: string; catEn: string; aiModel?: string | null; aiEnabled?: boolean | null; }

export interface Incident { tFa: string; tEn: string; who: string; whoType: string; sev: Sev; time: string; didFa: string; didEn: string; status: string; }

export interface Flag { fa: string; en: string; sev: Sev; }

export interface AuditRow { fa: string; en: string; t: string; }

export interface Issue { fa: string; en: string; sev: Sev; aff: number; fixFa: string; fixEn: string; }

export interface AIService { fa: string; en: string; tenants: number; tok: number; cost: number; lat: number; err: number; status: string; }

export interface BotHealth { name: string; status: string; doc: string; fail: number; rootFa: string; rootEn: string; fixFa: string; fixEn: string; }

export interface Tip { name: string; titleFa: string; titleEn: string; whyFa: string; whyEn: string; impFa: string; impEn: string; }

export interface PlanCfg { key: string; name: string; price: number; popular: boolean; featsFa: string[]; featsEn: string[]; active?: boolean; }

export interface ScriptQ { cat: string; fa: string; en: string; on: boolean; }

export interface UserRow { name: string; email: string; role: string; status: string; twofa: boolean; method: string; last: string; }

export interface SessionRow { user: string; device: string; browser: string; ip: string; geo: string; last: string; current: boolean; flag: string; }

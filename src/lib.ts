import { BOT_HEALTH } from "./data";
import type { Lang, ChatMsg, Tenant } from "./types";

export const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

export const money = (n: number) => "$" + fmt(n);

export const moneyK = (n: number) => n >= 1e6 ? "$" + (n / 1e6).toFixed(2) + "M" : n >= 1e3 ? "$" + (n / 1e3).toFixed(1) + "K" : "$" + fmt(n);

export const num = (n: number) => n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "K" : fmt(n);

export const clamp = (x: number) => Math.max(8, Math.min(96, Math.round(x)));

export const conv = (t: Tenant) => t.members ? Math.round((t.cust / t.members) * 1000) / 10 : 0;

/* -------------------------------- data ------------------------------------ */
/* -------------------------------- types ----------------------------------- */

export function nowHM() { const d = new Date(); return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0"); }

export function defaultModel(tenant: Tenant, k: string) {
  if (tenant.name === "LangMaster") return "premium";
  if (tenant.plan === "pro") return (k === "seller" || k === "support") ? "premium" : "standard";
  return "standard";
}

export const aiUsageOf = (t: Tenant) => {
  const tokensPct = clamp(40 + (t.plan === "pro" ? 38 : t.plan === "start" ? 22 : 8) + (t.gmv > 30000 ? 12 : 0));
  const cost = Math.round((t.plan === "pro" ? 120 : t.plan === "start" ? 48 : 14) + t.gmv * 0.004);
  const overrun = cost > (t.mrr || 0) * 1.4;
  const conn = t.status === "churn" ? "down" : "ok";
  return { tokensPct, cost, overrun, conn };
};

export const botChatsOf = (t: Tenant, lang: Lang): ChatMsg[] => {
  const ai = (fa: string, en: string) => ({ me: false, fa, en });
  const u = (fa: string, en: string) => ({ me: true, fa, en });
  const bot = BOT_HEALTH.find((b) => b.name === t.name);
  if (bot && bot.status === "alarm")
    return [
      u("کارمزدِ برداشت چقدره؟", "What's the withdrawal fee?"),
      ai("مطمئن نیستم؛ در اطلاعاتِ من چیزی دربارهٔ کارمزد نیست.", "I'm not sure; I don't have anything about fees in my knowledge."),
      u("یعنی چی؟ تو سایت نوشته بود!", "What? It was written on the site!"),
      ai("متأسفم، نمی‌توانم این مورد را تأیید کنم.", "Sorry, I can't confirm that."),
    ];
  return [
    u("چطور عضوِ کانالِ VIP بشم؟", "How do I join the VIP channel?"),
    ai("عالی! این لینکِ پرداخت است؛ بعد از پرداخت، دسترسی خودکار فعال می‌شود.", "Great! Here's the payment link; access activates automatically after payment."),
    u("ممنون", "Thanks"),
  ];
};

/* ---- per-tenant intelligence (items 2,3,4) ---- */

export const personaOf = (t: Tenant, lang: Lang) => {
  if (t.status === "churn") return lang === "fa" ? "در‌خطرِ ترک" : "Disengaging";
  if (t.status === "risk") return lang === "fa" ? "مردد / کم‌فعال" : "Hesitant / low-activity";
  if (t.plan === "pro" && t.health >= 85) return lang === "fa" ? "رهبرِ رشد" : "Growth leader";
  if (t.plan === "pro") return lang === "fa" ? "حرفه‌ایِ متمرکز" : "Focused pro";
  return lang === "fa" ? "در حالِ رشد" : "Growing";
};

export const traitsOf = (t: Tenant) => [
  { fa: "سرعتِ تصمیم", en: "Decision speed", v: clamp(t.health + (t.plan === "pro" ? 10 : -6)) },
  { fa: "ریسک‌پذیری", en: "Risk appetite", v: clamp((t.plan === "pro" ? 78 : 52) + (t.gmv > 30000 ? 10 : -6)) },
  { fa: "حساسیتِ قیمت", en: "Price sensitivity", v: clamp(t.plan === "free" ? 86 : t.plan === "start" ? 64 : 38) },
  { fa: "تسلطِ فنی", en: "Tech savvy", v: clamp(48 + (t.cust > 2000 ? 26 : 6)) },
  { fa: "تعاملِ فعال", en: "Engagement", v: clamp(t.health) },
];

export const bizAnalysisOf = (t: Tenant, lang: Lang) => {
  const cat = lang === "fa" ? t.catFa : t.catEn;
  const c = conv(t);
  if (lang === "fa")
    return `کسب‌وکارِ «${cat}» با ${num(t.members)} ممبر و نرخِ تبدیلِ ${c}%. ${c < 10 ? "ممبرِ زیاد ولی تبدیلِ پایین — پتانسیلِ بزرگِ درآمد با اتوماسیونِ فروش." : "تبدیلِ سالم — آمادهٔ مقیاس و ارتقا به پلنِ بالاتر."} ${t.status === "churn" ? "فعالیتِ اخیر افت کرده؛ ریسکِ ریزشِ بالا." : t.status === "risk" ? "فعالیت کم شده؛ نیازمندِ تعاملِ مجدد." : "روندِ فعالیت پایدار."}`;
  return `A "${cat}" business with ${num(t.members)} members and a ${c}% conversion rate. ${c < 10 ? "High audience but low conversion — large revenue upside via sales automation." : "Healthy conversion — ready to scale and upgrade."} ${t.status === "churn" ? "Recent activity dropped; high churn risk." : t.status === "risk" ? "Activity slowing; needs re-engagement." : "Activity trend is steady."}`;
};

export const approachOf = (t: Tenant, lang: Lang) => {
  const priceSens = traitsOf(t)[2].v > 60;
  if (lang === "fa")
    return priceSens ? "حساس به قیمت — با ROIِ عددی و تخفیفِ سالانه پیش برو، نه فشارِ فروش." : "کم‌حساس به قیمت و سریع‌تصمیم — مستقیم ارزشِ پلنِ بالاتر را نشان بده.";
  return priceSens ? "Price-sensitive — lead with ROI numbers and an annual discount, not pressure." : "Low price-sensitivity, fast decisions — show the higher plan's value directly.";
};

export const chatsOf = (t: Tenant, lang: Lang): ChatMsg[] => {
  const ai = (fa: string, en: string) => ({ me: false, fa, en });
  const me = (fa: string, en: string) => ({ me: true, fa, en });
  if (t.status === "risk" || t.status === "churn")
    return [
      me("فروش‌ام این هفته خیلی کم شده", "My sales dropped a lot this week"),
      ai("بررسی کردم — لینکِ دعوتِ کانالت 3 روز منقضی بوده. برات تمدیدش کنم؟", "I checked — your channel invite expired 3 days ago. Want me to renew it?"),
      me("آره لطفاً", "Yes please"),
      ai("انجام شد ✓ ضمناً 48 لیدِ سرد داری که می‌توانم با یک کمپین فعالشان کنم.", "Done ✓ You also have 48 cold leads I can re-activate with one campaign."),
    ];
  return [
    me("چطور می‌توانم فروشِ دوره‌ام را بیشتر کنم؟", "How can I increase my course sales?"),
    ai("1,200 ممبر داری ولی فقط 18% خریده‌اند. بیایید یک آفرِ محدود برای ممبرهای غیرخریدار بسازیم.", "You have 1,200 members but only 18% bought. Let's build a limited offer for non-buyers."),
    me("عالیه، چقدر طول می‌کشد؟", "Great, how long will it take?"),
    ai("الان آماده‌اش کردم — فقط تأیید کن تا ارسال شود.", "I've prepared it — just confirm to send."),
  ];
};

export const aiPlanOf = (t: Tenant, lang: Lang) => {
  const c = conv(t);
  const L = (fa: string, en: string) => (lang === "fa" ? fa : en);
  if (t.status === "churn" || t.status === "risk")
    return [
      { title: L("تعاملِ مجددِ فوری", "Immediate re-engagement"), why: L("افتِ فعالیت در 7 روزِ اخیر", "Activity dropped in the last 7 days"), impact: L("کاهشِ 60% احتمالِ ریزش", "−60% churn probability") },
      { title: L("فعال‌سازیِ لیدهای سرد", "Re-activate cold leads"), why: L(`${num(t.members - t.cust)} ممبرِ غیرخریدار`, `${num(t.members - t.cust)} non-buying members`), impact: L("+8% مشتریِ جدید", "+8% new customers") },
    ];
  if (t.plan !== "pro")
    return [
      { title: L("ارتقا به Pro", "Upgrade to Pro"), why: L(`تبدیلِ ${c}% + رشدِ پایدار = آمادهٔ AI کامل`, `${c}% conversion + steady growth = ready for full AI`), impact: L("+$100 MRR/ماه", "+$100 MRR/mo") },
      { title: L("فعال‌کردنِ کمپینِ خودکار", "Enable auto-campaigns"), why: L("پذیرشِ پایینِ فیچرِ کمپین", "Low campaign-feature adoption"), impact: L("+12% GMV", "+12% GMV") },
    ];
  return [
    { title: L("افزایشِ مصرفِ AI", "Increase AI usage"), why: L("حاشیهٔ سودِ سالم، فضای رشد", "Healthy margin, room to grow"), impact: L("+15% GMV", "+15% GMV") },
    { title: L("معرفی به برنامهٔ رفرال", "Invite to referral program"), why: L("کسب‌وکارِ راضی و فعال", "Happy, active business"), impact: L("1–2 کسب‌وکارِ جدید", "1–2 new tenants") },
  ];
};

/* ---- access control: roles, permission matrix, users, sessions ---- */

export const ROLES: string[] = ["owner", "manager", "marketer", "finance", "support", "trust"];

export const PERMS: Record<string, Record<string, "full" | "view" | "none">> = {
  owner:    { home: "full", activity: "full", tenants: "full", customers: "full", revenue: "full", intel: "full", strategist: "full", diagnostics: "full", aiops: "full", autopilot: "full", safety: "full", access: "full", settings: "full" },
  manager:  { home: "view", activity: "view", tenants: "view", customers: "view", revenue: "none", intel: "view", strategist: "view", diagnostics: "view", aiops: "view", autopilot: "view", safety: "none", access: "none", settings: "none" },
  marketer: { home: "view", activity: "view", tenants: "none", customers: "view", revenue: "none", intel: "view", strategist: "view", diagnostics: "none", aiops: "view", autopilot: "none", safety: "none", access: "none", settings: "none" },
  finance:  { home: "view", activity: "view", tenants: "view", customers: "none", revenue: "full", intel: "none", strategist: "none", diagnostics: "none", aiops: "view", autopilot: "none", safety: "none", access: "none", settings: "none" },
  support:  { home: "view", activity: "view", tenants: "view", customers: "view", revenue: "none", intel: "none", strategist: "none", diagnostics: "view", aiops: "view", autopilot: "none", safety: "none", access: "none", settings: "none" },
  trust:    { home: "view", activity: "view", tenants: "none", customers: "none", revenue: "none", intel: "none", strategist: "none", diagnostics: "none", aiops: "none", autopilot: "view", safety: "full", access: "none", settings: "none" },
};

export const MONEY_ROLES = new Set(["owner", "finance"]);

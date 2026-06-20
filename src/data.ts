import type { Tenant, Incident, Flag, AuditRow, Issue, AIService, BotHealth, Tip, PlanCfg, ScriptQ, UserRow, SessionRow, PlanShare, Region, GenderSlice, LabeledPct, FaEnPct, CategoryTrend, HeatCol, HeatRow, WeightedPhrase, Opportunity, ActivitySeed, AICtrlSvc, PlatformSvc, Gateway, ChatRef, AppData, Api } from "./types";

export const MRR_SERIES: number[] = [41, 46, 52, 58, 63, 71, 79, 88, 96, 108, 118, 128].map((v) => v * 1000);

export const GMV_SERIES: number[] = [3.1, 3.4, 3.9, 4.3, 4.8, 5.3, 5.9, 6.4, 6.9, 7.3, 7.8, 8.2].map((v) => v * 1e6);

export const PLANS: PlanShare[] = [
  { key: "free", labelFa: "رایگان (trial)", labelEn: "Free (trial)", pct: 38, color: "var(--sand)" },
  { key: "start", labelFa: "Start · $79", labelEn: "Start · $79", pct: 41, color: "var(--mint)" },
  { key: "pro", labelFa: "Pro · $179", labelEn: "Pro · $179", pct: 21, color: "var(--green)" },
];

export const REGIONS: Region[] = [
  { fa: "روسیه", en: "Russia", tenants: 612 }, { fa: "ترکیه", en: "Turkey", tenants: 388 },
  { fa: "ایران", en: "Iran", tenants: 341 }, { fa: "قزاقستان", en: "Kazakhstan", tenants: 214 },
  { fa: "امارات", en: "UAE", tenants: 169 }, { fa: "اوکراین", en: "Ukraine", tenants: 123 },
];

export const TENANTS: Tenant[] = [
  { name: "AcademyPro", handle: "@academypro", plan: "pro", regionFa: "روسیه", regionEn: "Russia", members: 18400, cust: 4120, mrr: 179, gmv: 28400, health: 92, status: "ok", last: "2 دقیقه", lastEn: "2m", joinedFa: "خرداد 1403", joinedEn: "Jun 2024", catFa: "دوره‌های آموزشی", catEn: "Courses" },
  { name: "SignalVIP", handle: "@signalvip", plan: "pro", regionFa: "ترکیه", regionEn: "Turkey", members: 12600, cust: 2870, mrr: 179, gmv: 41200, health: 88, status: "ok", last: "11 دقیقه", lastEn: "11m", joinedFa: "اردیبهشت 1403", joinedEn: "May 2024", catFa: "سیگنال / VIP", catEn: "Signals / VIP" },
  { name: "FitCoach", handle: "@fitcoach", plan: "start", regionFa: "ایران", regionEn: "Iran", members: 7300, cust: 1240, mrr: 79, gmv: 9800, health: 74, status: "ok", last: "1 ساعت", lastEn: "1h", joinedFa: "مرداد 1403", joinedEn: "Aug 2024", catFa: "کوچینگ", catEn: "Coaching" },
  { name: "CryptoEdu", handle: "@cryptoedu", plan: "pro", regionFa: "امارات", regionEn: "UAE", members: 15800, cust: 3510, mrr: 179, gmv: 33600, health: 81, status: "ok", last: "23 دقیقه", lastEn: "23m", joinedFa: "تیر 1403", joinedEn: "Jul 2024", catFa: "آموزشِ کریپتو", catEn: "Crypto edu" },
  { name: "DesignHub", handle: "@designhub", plan: "start", regionFa: "قزاقستان", regionEn: "Kazakhstan", members: 4100, cust: 880, mrr: 79, gmv: 6400, health: 58, status: "risk", last: "2 روز", lastEn: "2d", joinedFa: "شهریور 1403", joinedEn: "Sep 2024", catFa: "خدماتِ طراحی", catEn: "Design services" },
  { name: "TradeRoom", handle: "@traderoom", plan: "pro", regionFa: "روسیه", regionEn: "Russia", members: 21900, cust: 5240, mrr: 179, gmv: 52100, health: 95, status: "ok", last: "5 دقیقه", lastEn: "5m", joinedFa: "فروردین 1403", joinedEn: "Apr 2024", catFa: "سیگنال / VIP", catEn: "Signals / VIP" },
  { name: "LangMaster", handle: "@langmaster", plan: "free", regionFa: "ترکیه", regionEn: "Turkey", members: 2600, cust: 210, mrr: 0, gmv: 1200, health: 41, status: "risk", last: "4 روز", lastEn: "4d", joinedFa: "آبان 1403", joinedEn: "Oct 2024", catFa: "دوره‌های آموزشی", catEn: "Courses" },
  { name: "BeautyBox", handle: "@beautybox", plan: "start", regionFa: "ایران", regionEn: "Iran", members: 9400, cust: 1670, mrr: 79, gmv: 11900, health: 69, status: "ok", last: "40 دقیقه", lastEn: "40m", joinedFa: "مرداد 1403", joinedEn: "Aug 2024", catFa: "محصولاتِ فیزیکی", catEn: "Physical goods" },
  { name: "MentorX", handle: "@mentorx", plan: "free", regionFa: "اوکراین", regionEn: "Ukraine", members: 640, cust: 38, mrr: 0, gmv: 0, health: 22, status: "churn", last: "9 روز", lastEn: "9d", joinedFa: "آبان 1403", joinedEn: "Nov 2024", catFa: "کوچینگ", catEn: "Coaching" },
];

export const GENDER: GenderSlice[] = [
  { fa: "خانم", en: "Female", pct: 57, color: "var(--green)" },
  { fa: "آقا", en: "Male", pct: 41, color: "var(--mint)" },
  { fa: "نامشخص", en: "Unknown", pct: 2, color: "var(--sand)" },
];

export const AGES: LabeledPct[] = [{ label: "18–24", pct: 22 }, { label: "25–34", pct: 38 }, { label: "35–44", pct: 24 }, { label: "45–54", pct: 11 }, { label: "55+", pct: 5 }];

export const GEO: FaEnPct[] = [
  { fa: "روسیه", en: "Russia", pct: 34 }, { fa: "ترکیه", en: "Turkey", pct: 22 }, { fa: "ایران", en: "Iran", pct: 19 },
  { fa: "قزاقستان", en: "Kazakhstan", pct: 11 }, { fa: "امارات", en: "UAE", pct: 8 }, { fa: "سایر", en: "Other", pct: 6 },
];

export const CATEGORIES: CategoryTrend[] = [
  { fa: "دوره‌های آموزشی", en: "Online courses", trend: 18 }, { fa: "سیگنال / VIP", en: "Signals / VIP", trend: 27 },
  { fa: "کوچینگ و مشاوره", en: "Coaching", trend: 9 }, { fa: "اشتراکِ محتوا", en: "Content subs", trend: 14 },
  { fa: "محصولاتِ فیزیکی", en: "Physical goods", trend: -6 }, { fa: "خدماتِ آنلاین", en: "Online services", trend: -3 },
];

export const HEAT_COLS: HeatCol[] = [{ fa: "روسیه", en: "RU" }, { fa: "ترکیه", en: "TR" }, { fa: "ایران", en: "IR" }, { fa: "قزاقستان", en: "KZ" }, { fa: "امارات", en: "AE" }];

export const HEAT_ROWS: HeatRow[] = [
  { fa: "دوره", en: "Courses", v: [9, 7, 8, 5, 4] }, { fa: "سیگنال", en: "Signals", v: [8, 9, 6, 7, 9] },
  { fa: "کوچینگ", en: "Coaching", v: [5, 6, 7, 4, 5] }, { fa: "اشتراک", en: "Subs", v: [6, 5, 4, 3, 6] },
  { fa: "فیزیکی", en: "Goods", v: [3, 4, 5, 6, 7] },
];

export const PRICE_POINTS: LabeledPct[] = [{ label: "$9–19", pct: 14 }, { label: "$20–49", pct: 31 }, { label: "$50–99", pct: 28 }, { label: "$100–199", pct: 19 }, { label: "$200+", pct: 8 }];

export const INTENT: WeightedPhrase[] = [
  { fa: "تخفیف / کوپن", en: "discount", w: 92 }, { fa: "اقساط", en: "installments", w: 71 }, { fa: "تمدید", en: "renewal", w: 64 },
  { fa: "دموی رایگان", en: "free demo", w: 58 }, { fa: "بازپرداخت", en: "refund", w: 39 }, { fa: "پشتیبانی", en: "support", w: 33 },
];

export const OPPS: Opportunity[] = [
  { fa: "تقاضای «اقساط» در ترکیه 41% رشد کرد — ابزارِ پرداختِ اقساطی بساز", en: "Installments demand +41% in Turkey — build an installment-pay tool", up: 41 },
  { fa: "دستهٔ سیگنال در روسیه اشباع‌نشده و پرحاشیه است", en: "Signals in Russia is under-served and high-margin", up: 27 },
];

export const FLAGS: Flag[] = [
  { fa: "الگوی کلاهبرداریِ پرداخت — TradeRoom؟ (سرعتِ غیرعادی)", en: "Payment fraud pattern — TradeRoom? (velocity anomaly)", sev: "high" },
  { fa: "محتوای احتمالاً ممنوعه — 2 کانال در صفِ مودریشن", en: "Possibly prohibited content — 2 channels in moderation", sev: "high" },
  { fa: "نرخِ chargeback بالای آستانه — منطقهٔ CIS", en: "Chargeback rate over threshold — CIS", sev: "med" },
  { fa: "KYC ناقصِ کریپتو برای 7 کسب‌وکار", en: "Incomplete crypto KYC for 7 businesses", sev: "med" },
];

export const AUDIT: AuditRow[] = [
  { fa: "owner مشخصاتِ کاربرانِ AcademyPro را برای پشتیبانی دید", en: "owner viewed AcademyPro customers for support", t: "10:24" },
  { fa: "آستانهٔ k-anon در 50 تأیید شد", en: "k-anon threshold confirmed at 50", t: "09:10" },
  { fa: "گزارشِ بنچمارکِ Q2 صادر شد (تجمیعی)", en: "Q2 benchmark report exported (aggregate)", t: "دیروز" },
];

export const FUNNEL: number[] = [100, 71, 52, 38, 21];

export const ISSUES: Issue[] = [
  { fa: "29% بعد از ثبت‌نام، کانال وصل نمی‌کنند — مرحلهٔ اتصال گیج‌کننده است", en: "29% never connect a channel after signup — the connect step is confusing", sev: "high", aff: 537, fixFa: "اتصالِ کانال را به یک‌کلیک + راهنمای زنده ساده کن", fixEn: "Make channel-connect one-click with a live guide" },
  { fa: "14% trial بدونِ اولین فروش منقضی می‌شوند", en: "14% of trials expire without a first sale", sev: "high", aff: 259, fixFa: "یک محصولِ آماده + اولین کمپینِ خودکار در onboarding", fixEn: "A ready product + first auto-campaign in onboarding" },
  { fa: "پذیرشِ پایینِ ژورنی‌ساز (فقط 31%)", en: "Low adoption of the Journey builder (only 31%)", sev: "med", aff: 412, fixFa: "تمپلیتِ آماده + معرفیِ درون‌محصولی", fixEn: "Starter templates + in-product intro" },
  { fa: "خطای تکراریِ اتصالِ درگاهِ کریپتو", en: "Repeated crypto gateway connection errors", sev: "med", aff: 96, fixFa: "اعتبارسنجیِ بهتر + پیامِ خطای روشن", fixEn: "Better validation + clearer error message" },
];

export const ADOPTION: FaEnPct[] = [
  { fa: "بات / ژورنی", en: "Bot / Journeys", pct: 78 }, { fa: "صندوقِ پیام", en: "Inbox", pct: 71 },
  { fa: "CRM", en: "CRM", pct: 64 }, { fa: "کمپین", en: "Campaigns", pct: 42 }, { fa: "بینش‌ها", en: "Insights", pct: 31 },
];

export const CONFUSION: WeightedPhrase[] = [
  { fa: "چطور درگاهِ پرداخت وصل کنم؟", en: "How do I connect a payment gateway?", w: 88 },
  { fa: "لینکِ دعوت کجاست؟", en: "Where is the invite link?", w: 64 },
  { fa: "AI را چطور روشن کنم؟", en: "How do I turn on the AI?", w: 52 },
  { fa: "چرا فروش ثبت نشد؟", en: "Why wasn't my sale recorded?", w: 41 },
];

export const INCIDENTS: Incident[] = [
  { tFa: "پرداختِ ناموفقِ تکراری", tEn: "Repeated payment failure", who: "FitCoach", whoType: "tenant", sev: "high", time: "2 دقیقه", didFa: "درگاهِ پشتیبان فعال شد و پرداخت دوباره تلاش و موفق شد", didEn: "Switched to backup gateway, retried — succeeded", status: "fixed" },
  { tFa: "تحویلِ خودکارِ محصول انجام نشد", tEn: "Auto-delivery failed", who: "BeautyBox", whoType: "tenant", sev: "med", time: "18 دقیقه", didFa: "محصول دوباره برای 12 مشتری ارسال شد", didEn: "Re-delivered product to 12 customers", status: "fixed" },
  { tFa: "بات به پیامِ کاربر پاسخ نداد", tEn: "Bot stopped replying to a customer", who: "کاربرِ CryptoEdu", whoType: "user", sev: "med", time: "34 دقیقه", didFa: "فلوِ بات ری‌استارت و پاسخ ارسال شد", didEn: "Restarted the bot flow, reply sent", status: "fixed" },
  { tFa: "جهشِ نرخِ chargeback", tEn: "Chargeback rate spike", who: "TradeRoom", whoType: "tenant", sev: "high", time: "1 ساعت", didFa: "پرداخت‌های پرریسک موقتاً متوقف — نیازمندِ بازبینیِ تو", didEn: "High-risk payouts paused — needs your review", status: "pending" },
  { tFa: "هزینهٔ AI از درآمدِ کسب‌وکار پیشی گرفت", tEn: "AI cost exceeded tenant revenue", who: "LangMaster", whoType: "tenant", sev: "high", time: "2 ساعت", didFa: "به مدلِ ارزان‌تر سوییچ شد — نیازمندِ تصمیمِ پلن", didEn: "Switched to a cheaper model — needs a plan decision", status: "pending" },
];

export const PLAN_CONFIG: PlanCfg[] = [
  { key: "start", name: "Start", price: 79, popular: false, featsFa: ["رباتِ فروش و عضویت", "تأییدِ خودکارِ پرداخت", "تحویلِ خودکارِ محصول", "مدیریتِ دسترسیِ کانال", "صندوقِ پیام و CRM پایه"], featsEn: ["Sales & membership bot", "Auto payment confirm", "Auto product delivery", "Channel access management", "Inbox & basic CRM"] },
  { key: "pro", name: "Pro", price: 179, popular: true, featsFa: ["فروشندهٔ هوشمندِ 24ساعته", "پشتیبانِ هوشمندِ مشتریان", "مارکترِ هوشمند", "مدیر و مجریِ هوشمندِ کمپین", "CRM هوشمند"], featsEn: ["24/7 AI seller", "Smart customer support", "Smart marketer", "Smart campaign manager", "Smart CRM"] },
];

export const SCRIPT: ScriptQ[] = [
  { cat: "onboard", fa: "کسب‌وکارت چیست و چه می‌فروشی؟", en: "What's your business and what do you sell?", on: true },
  { cat: "onboard", fa: "بیشترِ مشتریانت از کجا می‌آیند؟", en: "Where do most of your customers come from?", on: true },
  { cat: "discover", fa: "بزرگ‌ترین چالشت در فروش چیست؟", en: "What's your biggest challenge in selling?", on: true },
  { cat: "discover", fa: "ماهانه چند لید جذب می‌کنی؟", en: "How many leads do you get monthly?", on: true },
  { cat: "upsell", fa: "اگر فروش‌ات 2 برابر شود، گلوگاهِ بعدی کجاست؟", en: "If sales doubled, where's the next bottleneck?", on: true },
  { cat: "support", fa: "کجای اپیدو برایت گیج‌کننده بوده؟", en: "What part of Appido has been confusing?", on: false },
];

/* ---- AI operations: services · token/cost · customer-bot health · tips ---- */

export const AI_SERVICES: AIService[] = [
  { fa: "فروشندهٔ هوشمند", en: "AI Seller", tenants: 612, tok: 74, cost: 18400, lat: 1.2, err: 0.8, status: "ok" },
  { fa: "پشتیبانِ هوشمند", en: "Smart Support", tenants: 540, tok: 81, cost: 14200, lat: 1.0, err: 1.1, status: "ok" },
  { fa: "مارکترِ هوشمند", en: "Smart Marketer", tenants: 388, tok: 63, cost: 9100, lat: 1.6, err: 0.6, status: "ok" },
  { fa: "مجریِ کمپین", en: "Campaign Runner", tenants: 274, tok: 58, cost: 6400, lat: 2.1, err: 2.9, status: "degraded" },
  { fa: "CRM هوشمند", en: "Smart CRM", tenants: 451, tok: 49, cost: 5200, lat: 0.9, err: 0.4, status: "ok" },
  { fa: "دستیارِ داشبورد", en: "Dashboard Assistant", tenants: 1847, tok: 88, cost: 21800, lat: 0.7, err: 0.5, status: "ok" },
  { fa: "باتِ مشتری", en: "Customer Bot", tenants: 1203, tok: 92, cost: 16900, lat: 1.4, err: 4.2, status: "degraded" },
];

export const BOT_HEALTH: BotHealth[] = [
  { name: "CryptoEdu", status: "alarm", doc: "gap", fail: 18, rootFa: "سندِ دانشِ آپلودشده بخشِ «کارمزدها» را ندارد؛ بات به سوالِ کارمزد اشتباه پاسخ می‌دهد", rootEn: "Uploaded knowledge doc is missing the fees section; the bot answers fee questions incorrectly", fixFa: "بخشِ کارمزدها را به سند اضافه و دوباره ایندکس کن", fixEn: "Add a fees section to the doc and re-index" },
  { name: "DesignHub", status: "alarm", doc: "stale", fail: 12, rootFa: "سندِ دانش 23 روز به‌روزرسانی نشده؛ قیمت‌های قدیمی پاسخ داده می‌شود", rootEn: "Knowledge doc not updated for 23 days; outdated prices are being served", fixFa: "قیمت‌نامهٔ جدید را جایگزین و دوباره آپلود کن", fixEn: "Replace with the new price list and re-upload" },
  { name: "SignalVIP", status: "ok", doc: "ok", fail: 3, rootFa: "—", rootEn: "—", fixFa: "—", fixEn: "—" },
  { name: "AcademyPro", status: "ok", doc: "ok", fail: 2, rootFa: "—", rootEn: "—", fixFa: "—", fixEn: "—" },
];

export const AI_TIPS: Tip[] = [
  { name: "LangMaster", titleFa: "سوییچ به مدلِ سبک‌تر", titleEn: "Switch to a lighter model", whyFa: "هزینهٔ AI از درآمدِ این کسب‌وکار بیشتر شده", whyEn: "AI cost now exceeds this tenant's revenue", impFa: "−62% هزینهٔ AI", impEn: "−62% AI cost" },
  { name: "CryptoEdu", titleFa: "فعال‌سازیِ کشِ پاسخ‌ها", titleEn: "Enable response caching", whyFa: "38% سوال‌ها تکراری‌اند", whyEn: "38% of questions are repeats", impFa: "−40% توکن", impEn: "−40% tokens" },
  { name: "TradeRoom", titleFa: "کوتاه‌کردنِ پنجرهٔ متن", titleEn: "Trim the context window", whyFa: "میانگینِ context بزرگ‌تر از نیاز است", whyEn: "Average context is larger than needed", impFa: "−22% توکن", impEn: "−22% tokens" },
];

export const SEED_ACTIVITY: ActivitySeed[] = [
  { time: "10:24", fa: "گزارشِ بنچمارکِ بازار (CSV) صادر شد", en: "Market benchmark (CSV) exported", tone: "ok" },
  { time: "09:50", fa: "نمای «به‌عنوانِ TradeRoom» — فقط‌خواندنی", en: "Viewed as TradeRoom — read-only", tone: "ok", channel: "Audit" },
  { time: "09:12", fa: "آستانهٔ k-anon در 50 تأیید شد", en: "k-anon threshold confirmed at 50", tone: "ok" },
];

export const MODEL_TIERS: string[] = ["economy", "standard", "premium"];

export const AI_CONTROL_SERVICES: AICtrlSvc[] = [
  { key: "seller", fa: "فروشندهٔ هوشمند", en: "AI Seller", plans: ["free", "start", "pro"] },
  { key: "support", fa: "پشتیبانِ هوشمند", en: "Smart Support", plans: ["free", "start", "pro"] },
  { key: "marketer", fa: "مارکترِ هوشمند", en: "Smart Marketer", plans: ["start", "pro"] },
  { key: "campaign", fa: "مجریِ کمپین", en: "Campaign Runner", plans: ["pro"] },
  { key: "crm", fa: "CRM هوشمند", en: "Smart CRM", plans: ["pro"] },
];

export const AI_COST_SERIES: number[] = [54, 58, 61, 66, 70, 74, 79, 83, 86, 90, 93, 96].map((v) => v * 1000);

export const PLATFORM_STATUS: PlatformSvc[] = [
  { fa: "API اصلی", en: "Core API", status: "ok", uptime: "99.98%" },
  { fa: "درگاه‌های پرداخت", en: "Payment gateways", status: "ok", uptime: "99.95%" },
  { fa: "موتورِ باتِ تلگرام", en: "Telegram bot runtime", status: "ok", uptime: "99.92%" },
  { fa: "دروازهٔ هوشِ مصنوعی", en: "AI gateway", status: "degraded", uptime: "99.40%" },
  { fa: "داشبورد و کنسول", en: "Dashboard & console", status: "ok", uptime: "99.99%" },
  { fa: "وب‌هوک‌ها", en: "Webhooks", status: "ok", uptime: "99.90%" },
];

export const GATEWAYS: Gateway[] = [
  { key: "zarinpal", fa: "زرین‌پال", en: "ZarinPal", kind: "rial", on: true },
  { key: "idpay", fa: "آیدی‌پی", en: "IDPay", kind: "rial", on: true },
  { key: "nextpay", fa: "نکست‌پی", en: "NextPay", kind: "rial", on: true },
  { key: "usdt_trc", fa: "تتر · TRC20", en: "USDT · TRC20", kind: "crypto", on: true },
  { key: "usdt_bep", fa: "تتر · BEP20", en: "USDT · BEP20", kind: "crypto", on: false },
];

export const ALL_CHATS: ChatRef[] = [
  { name: "DesignHub", kind: "dashboard" }, { name: "CryptoEdu", kind: "customer" },
  { name: "AcademyPro", kind: "dashboard" }, { name: "SignalVIP", kind: "customer" },
  { name: "FitCoach", kind: "dashboard" }, { name: "TradeRoom", kind: "customer" },
];

export const OWNER_EMAIL = "appido.co@gmail.com";

export const USERS: UserRow[] = [
  { name: "Owner", email: OWNER_EMAIL, role: "owner", status: "active", twofa: true, method: "password", last: "now" },
  { name: "Sara M.", email: "sara@appido.io", role: "manager", status: "active", twofa: true, method: "password", last: "12m" },
  { name: "Dmitri K.", email: "dmitri@appido.io", role: "marketer", status: "active", twofa: false, method: "code", last: "1h" },
  { name: "Elena V.", email: "elena@appido.io", role: "finance", status: "active", twofa: true, method: "password", last: "3h" },
  { name: "Omar S.", email: "omar@appido.io", role: "support", status: "suspended", twofa: false, method: "code", last: "2d" },
];

export const SESSIONS: SessionRow[] = [
  { user: "Owner", device: "MacBook Air", browser: "Chrome", ip: "151.x.x.x", geo: "Tehran, IR", last: "now", current: true, flag: "" },
  { user: "Sara M.", device: "MacBook Pro", browser: "Chrome", ip: "188.40.x.x", geo: "Berlin, DE", last: "2m", current: false, flag: "" },
  { user: "Dmitri K.", device: "Windows PC", browser: "Edge", ip: "95.71.x.x", geo: "Moscow, RU", last: "5m", current: false, flag: "share" },
  { user: "Dmitri K.", device: "iPhone", browser: "Safari", ip: "37.99.x.x", geo: "Istanbul, TR", last: "4m", current: false, flag: "travel" },
  { user: "Elena V.", device: "iPad", browser: "Safari", ip: "94.20.x.x", geo: "Dubai, AE", last: "1h", current: false, flag: "" },
];

/* ------------------------------- icons ------------------------------------ */

export const delay = <T,>(v: T, ms = 450): Promise<T> => new Promise((r) => setTimeout(() => r(v), ms));
// MockApi: returns the seed data above with simulated latency. Replace with HttpApi (fetch /api/...) for production.

export const MOCK_DATA: AppData = {
  platform: { tenants: 1847, channels: 2310, customers: 412900, members: 6.4e6, activeSubscriptions: 1204, mrrUsd: 128400, gmvUsd: 8.2e6, aiTokens: 74e6, conversionPct: 23 },
  mrr: MRR_SERIES, gmv: GMV_SERIES, plans: PLANS, regions: REGIONS, tenants: TENANTS,
  gender: GENDER, ages: AGES, geo: GEO, categories: CATEGORIES, heatCols: HEAT_COLS, heatRows: HEAT_ROWS,
  pricePoints: PRICE_POINTS, intent: INTENT, opps: OPPS, flags: FLAGS, audit: AUDIT, funnel: FUNNEL,
  issues: ISSUES, adoption: ADOPTION, confusion: CONFUSION, incidents: INCIDENTS, planConfig: PLAN_CONFIG,
  script: SCRIPT, aiServices: AI_SERVICES, botHealth: BOT_HEALTH, aiTips: AI_TIPS, modelTiers: MODEL_TIERS,
  aiControlServices: AI_CONTROL_SERVICES, aiCostSeries: AI_COST_SERIES, platformStatus: PLATFORM_STATUS,
  allChats: ALL_CHATS, users: USERS, sessions: SESSIONS, gateways: GATEWAYS,
};

export const MockApi: Api = {
  data: () => delay(MOCK_DATA),
  me: () => delay({ role: "owner", name: "Owner", email: OWNER_EMAIL }),
};

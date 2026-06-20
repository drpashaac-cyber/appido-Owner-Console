import React, { useState, useEffect, useMemo } from "react";
import { fmt, money, moneyK, num, conv, defaultModel, aiUsageOf, personaOf, traitsOf, bizAnalysisOf, approachOf, aiPlanOf } from "./lib";
import { Icon, useData, Donut, BarsH, AreaLine, Radar, Kpi, Card, planMeta, PlanTag, Health, sevCls, PageHead, useCtx, ModalShell, EmptyState, Toggle, SendBtn } from "./core";
import { ChatPanel } from "./shared";
import type { Lang, Dict, ViewProps, Tenant } from "./types";

export function ActionInbox({ t, lang }: ViewProps) {
  const dat = useData();
  const ctx = useCtx();
  const seed = useMemo(() => [
    ...dat.incidents.filter((x) => x.status === "pending").map((x, i) => ({ id: "inc" + i, fa: x.didFa, en: x.didEn, who: x.who, sev: x.sev, go: "safety" })),
    { id: "trial", fa: "34 trial امروز بدونِ اولین فروش منقضی می‌شوند", en: "34 trials expire today without a first sale", who: "", sev: "med", go: "diagnostics" },
  ], []);
  const [handled, setHandled] = useState<Record<string, string>>({});
  const open = seed.filter((x) => !handled[x.id]);
  const act = (x: any, kind: string) => {
    const prev = handled; setHandled({ ...handled, [x.id]: kind });
    ctx.logActivity({ fa: (kind === "resolve" ? "اقدام برای: " : "نادیده گرفته شد: ") + x.fa, en: (kind === "resolve" ? "Acted on: " : "Dismissed: ") + x.en, tone: kind === "resolve" ? "ok" : "warn" });
    ctx.toast(kind === "resolve" ? t.home.resolved : t.home.dismissed, () => setHandled(prev));
  };
  return (
    <Card title={t.home.inbox} sub={open.length ? open.length + " " + t.home.inboxOpen : undefined}>
      {open.length === 0
        ? <div className="oc-allok"><Icon name="check" size={15} /> {t.home.allClear}</div>
        : <ul className="oc-inbox">
            {open.map((x) => (
              <li key={x.id}>
                <span className={"oc-sev " + sevCls(x.sev)} />
                <div className="oc-inbox-body"><b>{lang === "fa" ? x.fa : x.en}</b>{x.who && <span className="oc-muted">{x.who}</span>}</div>
                <div className="oc-inbox-act">
                  <button className="oc-btn ghost sm" onClick={() => ctx.navigate(x.go)}>{t.home.openItem}</button>
                  {!ctx.readOnly && <button className="oc-btn green sm" onClick={() => act(x, "resolve")}>{t.home.resolve}</button>}
                  {!ctx.readOnly && <button className="oc-btn ghost sm" onClick={() => act(x, "dismiss")} aria-label={t.home.dismiss}><Icon name="close" size={14} /></button>}
                </div>
              </li>
            ))}
          </ul>}
    </Card>
  );
}

export function CommandCenter({ t, lang }: ViewProps) {
  const dat = useData();
  const ctx = useCtx();
  const [showIntro, setShowIntro] = useState(true);
  return (
    <div className="oc-view">
      <PageHead title={t.home.title} sub={t.home.sub} />
      {showIntro && (
        <div className="oc-onboard">
          <button className="oc-onboard-x" onClick={() => setShowIntro(false)} aria-label={lang === "fa" ? "بستن" : "Close"}><Icon name="close" size={15} /></button>
          <div className="oc-onboard-h"><span className="oc-onboard-mark"><Icon name="spark" size={18} /></span><div><b>{t.onb.title}</b><span>{t.onb.sub}</span></div></div>
          <div className="oc-onboard-steps">
            <button onClick={() => ctx.navigate("tenants")}><Icon name="tenants" size={16} /><span>{t.onb.s1}</span></button>
            <button onClick={() => ctx.navigate("settings")}><Icon name="settings" size={16} /><span>{t.onb.s2}</span></button>
            <button onClick={() => ctx.navigate("safety")}><Icon name="safety" size={16} /><span>{t.onb.s3}</span></button>
          </div>
        </div>
      )}
      <div className="oc-kpis">
        {ctx.canMoney && <Kpi label={t.kpi.mrr} value={moneyK(dat.platform.mrrUsd)} spark={dat.mrr.slice(-6)} />}
        {ctx.canMoney && <Kpi label={t.kpi.arr} value={moneyK(dat.platform.mrrUsd * 12)} />}
        <Kpi label={t.kpi.tenants} value={fmt(dat.platform.tenants)} />
        <Kpi label={t.kpi.members} value={num(dat.platform.members)} />
        <Kpi label={t.kpi.customers} value={fmt(dat.platform.customers)} />
        {ctx.canMoney && <Kpi label={t.kpi.gmv} value={moneyK(dat.platform.gmvUsd)} spark={dat.gmv.slice(-6)} />}
        <Kpi label={t.kpi.conv} value={dat.platform.conversionPct + "%"} />
      </div>
      <div className="oc-grid">
        {ctx.canMoney && (
          <Card title={t.home.twoRev} sub={t.home.mrrTrend} span={2}>
            <div className="oc-legend"><span><i className="lg green" />{t.home.mrrLabel}: <b>{moneyK(128400)}</b></span><span><i className="lg sand" />{t.home.gmvLabel}: <b>{moneyK(8.2e6)}</b></span></div>
            <AreaLine a={dat.mrr} b={dat.gmv.map((v) => v / 64)} />
          </Card>
        )}
        <Card title={t.home.plans}>
          <div className="oc-donut-wrap"><Donut data={dat.plans} /><div className="oc-donut-legend">{dat.plans.map((p, i) => <div key={i}><i style={{ background: p.color }} /><span>{lang === "fa" ? p.labelFa : p.labelEn}</span><b>{p.pct}%</b></div>)}</div></div>
        </Card>
        <Card title={t.home.autopilotCard} span={2}>
          <ul className="oc-mini-inc">
            {dat.incidents.slice(0, 3).map((x, i) => (
              <li key={i}><span className={"oc-sev " + sevCls(x.sev)} /><span className="oc-mi-txt">{lang === "fa" ? x.tFa : x.tEn} · {x.who}</span><span className={"oc-chip-st " + (x.status === "fixed" ? "ok" : "warn")}>{x.status === "fixed" ? t.home.autoFixed : t.home.needsYou}</span></li>
            ))}
          </ul>
        </Card>
        <ActionInbox t={t} lang={lang} />
      </div>
    </div>
  );
}

export function Businesses({ t, lang }: ViewProps) {
  const dat = useData();
  const ctx = useCtx();
  const [plan, setPlan] = useState("all");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("mrr");
  const [page, setPage] = useState(1);
  const PER = 8;
  const sorters: Record<string, (a: Tenant, b: Tenant) => number> = { mrr: (a, b) => b.mrr - a.mrr, gmv: (a, b) => b.gmv - a.gmv, members: (a, b) => b.members - a.members, health: (a, b) => b.health - a.health, name: (a, b) => a.name.localeCompare(b.name) };
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return dat.tenants.filter((r) => plan === "all" || r.plan === plan).filter((r) => !needle || (r.name + " " + r.handle + " " + r.regionFa + " " + r.regionEn + " " + r.catFa + " " + r.catEn).toLowerCase().includes(needle)).slice().sort(sorters[sort] || sorters.mrr);
  }, [plan, q, sort]);
  useEffect(() => { setPage(1); }, [plan, q, sort]);
  const pages = Math.max(1, Math.ceil(filtered.length / PER));
  const cur = Math.min(page, pages);
  const rows = filtered.slice((cur - 1) * PER, cur * PER);
  if (ctx.selTenant) return <TenantProfile t={t} lang={lang} tenant={ctx.selTenant} onBack={() => ctx.setSelTenant(null)} />;
  return (
    <div className="oc-view">
      <PageHead title={t.tn.title} sub={t.tn.sub} tag={t.secTag.tenant} />
      <div className="oc-list-controls">
        <div className="oc-searchbox oc-list-search"><Icon name="search" size={15} /><input value={q} placeholder={t.tn.searchPh} aria-label={t.tn.searchPh} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} /></div>
        <label className="oc-sortbox"><span>{t.tn.sortBy}</span><select className="oc-select" value={sort} aria-label={t.tn.sortBy} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSort(e.target.value)}><option value="mrr">{t.tn.sortMrr}</option><option value="gmv">{t.tn.sortGmv}</option><option value="members">{t.tn.sortMembers}</option><option value="health">{t.tn.sortHealth}</option><option value="name">{t.tn.sortName}</option></select></label>
      </div>
      <div className="oc-filters">{["all", "free", "start", "pro"].map((p) => <button key={p} className={"oc-fbtn" + (plan === p ? " on" : "")} onClick={() => setPlan(p)}>{p === "all" ? t.tn.all : (planMeta[p][lang] ?? planMeta[p].en)}</button>)}</div>
      <div className="oc-list-meta">{fmt(filtered.length)} {t.tn.results}</div>
      {rows.length ? (
        <div className="oc-table-wrap">
          <table className="oc-table">
            <thead><tr><th>{t.tn.cols.name}</th><th>{t.tn.cols.plan}</th><th>{t.tn.cols.region}</th><th>{t.tn.cols.members}</th><th>{t.tn.cols.cust}</th><th>{t.tn.cols.conv}</th>{ctx.canMoney && <th>{t.tn.cols.mrr}</th>}<th>{t.tn.cols.health}</th><th>{t.tn.cols.last}</th></tr></thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} tabIndex={0} role="button" aria-label={r.name} onClick={() => ctx.setSelTenant(r)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); ctx.setSelTenant(r); } }}>
                  <td><div className="oc-tn-name"><span className="oc-ava">{r.name[0]}</span><div><b>{r.name}</b><span>{r.handle}</span></div></div></td>
                  <td><PlanTag p={r.plan} lang={lang} /></td>
                  <td>{lang === "fa" ? r.regionFa : r.regionEn}</td>
                  <td>{num(r.members)}</td>
                  <td>{fmt(r.cust)}</td>
                  <td><span className={"oc-conv " + (conv(r) < 10 ? "low" : "ok")}>{conv(r)}%</span></td>
                  {ctx.canMoney && <td>{r.mrr ? money(r.mrr) : "—"}</td>}
                  <td><Health v={r.health} /></td>
                  <td className="oc-muted">{lang === "fa" ? r.last : r.lastEn}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <EmptyState label={t.m.noResults} />}
      {pages > 1 && (
        <div className="oc-pager">
          <button className="oc-btn ghost sm" disabled={cur <= 1} onClick={() => setPage(cur - 1)}>{t.tn.prev}</button>
          <span className="oc-pager-info">{fmt(cur)} / {fmt(pages)}</span>
          <button className="oc-btn ghost sm" disabled={cur >= pages} onClick={() => setPage(cur + 1)}>{t.tn.next}</button>
        </div>
      )}
    </div>
  );
}

export function TenantProfile({ t, lang, tenant, onBack }: { t: Dict; lang: Lang; tenant: Tenant; onBack: () => void }) {
  const dat = useData();
  const ctx = useCtx();
  const [tab, setTab] = useState("overview");
  const [aiOn, setAiOn] = useState(true);
  const c = conv(tenant);
  const tabs = ["overview", "ai", "controls", "chats", "analysis", "plan"];
  const seg = [{ fa: "خانم", en: "Female", pct: 60, color: "var(--green)" }, { fa: "آقا", en: "Male", pct: 38, color: "var(--mint)" }, { fa: "نامشخص", en: "Unknown", pct: 2, color: "var(--sand)" }];
  const messageModal = (
    <ModalShell title={t.m.msgTitle + tenant.name} footer={<><button className="oc-btn ghost" onClick={ctx.closeModal}>{t.m.cancel}</button><button className="oc-btn green" onClick={() => { ctx.closeModal(); ctx.toast(t.m.msgSent); }}><Icon name="send" size={14} /> {t.m.send}</button></>}>
      <textarea className="oc-input ta" placeholder={t.m.msgPlaceholder} rows={5} />
    </ModalShell>
  );
  return (
    <div className="oc-view">
      <button className="oc-back" onClick={onBack}><Icon name="back" size={16} /> {t.tn.back}</button>
      <div className="oc-profile-head">
        <span className="oc-ava xl">{tenant.name[0]}</span>
        <div className="oc-ph-info">
          <div className="oc-ph-title"><b>{tenant.name}</b><PlanTag p={tenant.plan} lang={lang} /><span className="oc-persona"><Icon name="spark" size={12} /> {personaOf(tenant, lang)}</span></div>
          <span className="oc-muted">{tenant.handle} · {lang === "fa" ? tenant.regionFa : tenant.regionEn} · {t.tn.since} {lang === "fa" ? tenant.joinedFa : tenant.joinedEn}</span>
        </div>
        <div className="oc-ph-actions">
          <button className="oc-btn green" onClick={() => ctx.confirm({ title: t.m.viewAsTitle, body: t.m.viewAsBody, ok: t.m.viewAsStart, onOk: () => ctx.startImpersonate(tenant.name) })}><Icon name="customers" size={15} /> {t.tn.view}</button>
          <button className="oc-btn ghost" onClick={() => ctx.openModal(messageModal)}><Icon name="msg" size={15} /> {t.tn.message}</button>
        </div>
      </div>
      <div className="oc-stat-strip">
        <div><span>{t.tn.members}</span><b>{num(tenant.members)}</b></div>
        <div><span>{t.tn.cust}</span><b>{fmt(tenant.cust)}</b></div>
        <div><span>{t.tn.conv}</span><b className={c < 10 ? "warn" : ""}>{c}%</b></div>
        {ctx.canMoney && <div><span>{t.tn.revenueTheir}</span><b>{moneyK(tenant.gmv)}/mo</b></div>}
        {ctx.canMoney && <div><span>{t.tn.paysUs}</span><b>{tenant.mrr ? money(tenant.mrr) : "—"}</b></div>}
        <div><span>{t.tn.cols.health}</span><b><Health v={tenant.health} /></b></div>
      </div>
      <div className="oc-tabs">{tabs.map((x) => <button key={x} className={"oc-tab" + (tab === x ? " on" : "")} onClick={() => setTab(x)}>{t.tn.tabs[x]}</button>)}</div>
      {tab === "overview" && (
        <div className="oc-grid">
          <Card title={t.tn.gap}>
            <div className="oc-gap"><div className="oc-gap-bar"><span className="oc-gap-members" /><span className="oc-gap-cust" style={{ width: c + "%" }} /></div>
              <div className="oc-gap-legend"><span><i className="lg sand" />{t.tn.members}: {num(tenant.members)}</span><span><i className="lg green" />{t.tn.cust}: {fmt(tenant.cust)} ({c}%)</span></div></div>
          </Card>
          <Card title={t.tn.custSeg}><div className="oc-donut-wrap sm"><Donut data={seg} size={104} /><div className="oc-donut-legend">{seg.map((g, i) => <div key={i}><i style={{ background: g.color }} /><span>{g[lang] ?? g.en}</span><b>{g.pct}%</b></div>)}</div></div></Card>
          <Card title={t.tn.risk}>{tenant.health < 60 ? <p className="oc-flag"><span className="oc-sev mid" />{lang === "fa" ? "افتِ فعالیت — کاندیدِ ریزش" : "Activity drop — churn candidate"}</p> : <p className="oc-muted">{t.tn.noflag}</p>}</Card>
        </div>
      )}
      {tab === "chats" && (
        <Card title={t.tn.tabs.chats} sub={t.tn.chatHint}>
          <ChatPanel t={t} lang={lang} tenant={tenant} />
        </Card>
      )}
      {tab === "analysis" && (
        <div className="oc-grid">
          <Card title={t.tn.traits}><div className="oc-radar-wrap"><Radar traits={traitsOf(tenant)} lang={lang} /></div></Card>
          <Card title={t.tn.biz} span={2}>
            <p className="oc-analysis">{bizAnalysisOf(tenant, lang)}</p>
            <div className="oc-approach"><span className="oc-approach-lbl"><Icon name="target" size={13} /> {t.tn.approach}</span><p>{approachOf(tenant, lang)}</p></div>
          </Card>
        </div>
      )}
      {tab === "controls" && <TenantControls key={tenant.name} t={t} lang={lang} tenant={tenant} />}
      {tab === "ai" && (
        <div className="oc-grid">
          <Card title={t.ai.svcHealth} span={2}>
            <div className="oc-stat-strip oc-mb0">
              <div><span>{t.ai.tokensUse}</span><b className={aiUsageOf(tenant).tokensPct >= 90 ? "warn" : ""}>{aiUsageOf(tenant).tokensPct}%</b></div>
              <div><span>{t.ai.cost}</span><b className={aiUsageOf(tenant).overrun ? "warn" : ""}>{money(aiUsageOf(tenant).cost)}/mo</b></div>
              <div><span>{t.ai.conn}</span><b className={aiUsageOf(tenant).conn === "ok" ? "" : "warn"}>{aiUsageOf(tenant).conn === "ok" ? t.ai.connOk : t.ai.connDown}</b></div>
            </div>
          </Card>
          <Card title={t.ai.assistant}>
            <div className="oc-gov-row oc-flush"><div><b>{t.tn.tabs.chats}</b><span>{t.ai.assistantOn}</span></div><button className={"oc-toggle" + (aiOn ? " on" : "")} onClick={() => { setAiOn(!aiOn); ctx.toast(aiOn ? t.ai.down : t.ai.ok); }} role="switch" aria-checked={aiOn}><span /></button></div>
          </Card>
          <Card title={t.ai.custBot} span={3}>
            {(() => {
              const b = dat.botHealth.find((x) => x.name === tenant.name);
              if (!b) return <p className="oc-muted">{t.tn.noflag}</p>;
              return (
                <>
                  <div className="oc-bot-meta"><span>{t.ai.doc}: <b className={b.doc === "ok" ? "" : "warn"}>{b.doc === "ok" ? t.ai.docOk : b.doc === "stale" ? t.ai.docStale : t.ai.docGap}</b></span><span>{t.ai.failRate}: <b className={b.fail > 8 ? "warn" : ""}>{b.fail}%</b></span><span className={"oc-chip-st " + (b.status === "alarm" ? "bad" : "ok")}>{b.status === "alarm" ? t.ai.alarm : t.ai.ok}</span></div>
                  {b.status === "alarm" && (
                    <div className="oc-confirm-step oc-mt12">
                      <span className="oc-issue-fix"><Icon name="alert" size={12} /> {t.ai.rootCause}</span><p className="oc-modal-txt">{lang === "fa" ? b.rootFa : b.rootEn}</p>
                      <span className="oc-issue-fix"><Icon name="spark" size={12} /> {lang === "fa" ? b.fixFa : b.fixEn}</span>
                      <SendBtn akey={"fix:" + b.name} title={t.ai.sendFix} body={<div className="oc-confirm-step"><b>{tenant.name}</b><span className="oc-plan-why">{lang === "fa" ? b.rootFa : b.rootEn}</span></div>} label={t.ai.sendFix} doneLabel={t.ai.fixSent} channel={t.m.toTenant} fa={"رفعِ ایرادِ باتِ " + b.name + " به کسب‌وکار ارسال شد"} en={"Bot fix for " + b.name + " sent to tenant"} cls="oc-mt10s" icon={13} />
                    </div>
                  )}
                </>
              );
            })()}
          </Card>
        </div>
      )}
      {tab === "plan" && (
        <Card title={t.tn.tabs.plan} sub={t.tn.planHint}>
          <div className="oc-plan-list">
            {aiPlanOf(tenant, lang).map((s, i: number) => (
              <div className="oc-plan-step" key={i}>
                <span className="oc-plan-n">{i + 1}</span>
                <div className="oc-plan-body"><b>{s.title}</b><span className="oc-plan-why">{t.str.why}: {s.why}</span></div>
                <span className="oc-plan-impact"><Icon name="up" size={12} />{s.impact}</span>
                <button className="oc-btn green sm" onClick={() => ctx.confirm({ title: t.m.applyTitle, body: <div className="oc-confirm-step"><b>{s.title}</b><span className="oc-plan-why">{t.str.why}: {s.why}</span><span className="oc-plan-impact"><Icon name="up" size={12} />{s.impact}</span></div>, ok: t.m.apply, onOk: () => { ctx.logActivity({ fa: "توصیهٔ استراتژی اعمال شد: " + s.title, en: "Strategy applied: " + s.title, tone: "ok" }); ctx.toast(t.m.applied); } })}>{t.str.apply}</button>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}

export function Customers({ t, lang }: ViewProps) {
  const dat = useData();
  return (
    <div className="oc-view">
      <PageHead title={t.cu.title} sub={t.cu.sub} tag={t.secTag.users} />
      <div className="oc-kpis four">
        <Kpi label={t.cu.members} value={num(6.4e6)} delta={7} up />
        <Kpi label={t.cu.total} value={fmt(412900)} delta={8} up />
        <Kpi label={t.cu.convGap} value="6.5%" delta={2} up />
        <Kpi label={t.cu.active30} value={fmt(286400)} delta={5} up />
      </div>
      <div className="oc-gapbanner">
        <div className="oc-gapbanner-bar"><span className="oc-gb-members" /><span className="oc-gb-cust" style={{ width: "6.5%" }} /></div>
        <div><h4>{t.cu.gapTitle}</h4><p>{t.cu.gapBody}</p></div>
      </div>
      <div className="oc-grid">
        <Card title={t.cu.gender}><div className="oc-donut-wrap"><Donut data={dat.gender} /><div className="oc-donut-legend">{dat.gender.map((g, i) => <div key={i}><i style={{ background: g.color }} /><span>{g[lang] ?? g.en}</span><b>{g.pct}%</b></div>)}</div></div></Card>
        <Card title={t.cu.age}><BarsH data={dat.ages} lang={lang} accent="var(--mint)" /></Card>
        <Card title={t.cu.geo}><BarsH data={dat.geo} lang={lang} /></Card>
      </div>
      <div className="oc-note"><Icon name="lock" size={13} /> {t.cu.note}</div>
    </div>
  );
}

export function Revenue({ t, lang }: ViewProps) {
  const dat = useData();
  const byPlan = [{ fa: "Pro · $179", en: "Pro · $179", pct: 71, color: "var(--green)" }, { fa: "Start · $79", en: "Start · $79", pct: 29, color: "var(--mint)" }];
  return (
    <div className="oc-view">
      <PageHead title={t.rev.title} sub={t.rev.sub} />
      <div className="oc-kpis four">
        <Kpi label={t.rev.arpa} value="$103" delta={4} up />
        <Kpi label={t.rev.failed} value="2.3%" delta={-1} up />
        <Kpi label={t.rev.refunds} value={moneyK(4100)} delta={-2} up />
        <Kpi label={t.rev.crypto} value={moneyK(38200)} delta={6} up />
      </div>
      <div className="oc-grid">
        <Card title={t.rev.byPlan}><BarsH data={byPlan} lang={lang} /></Card>
        <Card title={t.rev.byRegion}><BarsH data={dat.regions.map((r) => ({ ...r, v: Math.round(r.tenants * 0.62 * 120) }))} lang={lang} /></Card>
        <Card title={t.rev.trend} span={3}><AreaLine a={dat.mrr} /></Card>
      </div>
    </div>
  );
}

export function TenantControls({ t, lang, tenant }: { t: Dict; lang: Lang; tenant: Tenant }) {
  const dat = useData();
  const ctx = useCtx();
  const c = t.tn.ctrl;
  const editable = ctx.canMoney && !ctx.readOnly;
  const svcs = dat.aiControlServices.filter((s) => s.plans.includes(tenant.plan));
  const [models, setModels] = useState<Record<string, string>>(() => Object.fromEntries(svcs.map((s) => [s.key, defaultModel(tenant, s.key)])));
  const [ons, setOns] = useState<Record<string, boolean>>(() => Object.fromEntries(svcs.map((s) => [s.key, true])));
  const [cap, setCap] = useState<number>(tenant.plan === "pro" ? 600 : tenant.plan === "start" ? 250 : 80);
  const [dirty, setDirty] = useState(false);
  const [synced, setSynced] = useState(false);
  const u = aiUsageOf(tenant);
  const bot = dat.botHealth.find((b) => b.name === tenant.name);
  const apply = () => ctx.confirm({
    title: c.applyTitle,
    body: <div className="oc-confirm-step"><b>{tenant.name}</b><span className="oc-plan-why">{c.applyBody}</span></div>,
    ok: c.apply,
    onOk: () => { ctx.logActivity({ fa: "کنترل‌های AI برای " + tenant.name + " به‌روزرسانی و به کسب‌وکار sync شد", en: "AI controls for " + tenant.name + " updated & synced to tenant", tone: "ok", channel: t.m.toTenant }); setDirty(false); setSynced(true); ctx.toast(c.synced); },
  });
  const liveModel = tenant.aiModel ? (
    <div className="oc-allok"><span className={"oc-dot " + (tenant.aiEnabled === false ? "warn" : "ok")} /> {lang === "fa" ? "مدلِ فعالِ ربات" : "Bot's active model"}: <b dir="ltr" style={{ textTransform: "capitalize" }}>{tenant.aiModel}</b>{tenant.aiEnabled === false ? (lang === "fa" ? " · غیرفعال" : " · disabled") : ""}</div>
  ) : null;
  if (!svcs.length) return <div className="oc-ctrl">{liveModel}<EmptyState label={t.m.noResults} /></div>;
  return (
    <div className="oc-ctrl">
      {!editable && <div className="oc-note">{ctx.readOnly ? c.roView : c.roPerm}</div>}
      {liveModel}
      {synced && <div className="oc-allok"><span className="oc-dot ok" /> {c.syncedNote}</div>}
      <div className="oc-ctrl-kpis">
        <Kpi label={c.aiCost} value={money(u.cost)} />
        <Kpi label={c.tokensUse} value={u.tokensPct + "%"} />
        <Kpi label={c.docState} value={bot ? (bot.doc === "ok" ? t.ai.docOk : bot.doc === "stale" ? t.ai.docStale : t.ai.docGap) : t.ai.docOk} />
      </div>
      {u.overrun && <div className="oc-share-alarm"><span className="oc-inc-ico warn"><Icon name="alert" size={15} /></span><div><b>{c.overBudget}</b><span className="oc-plan-why">{c.overBudgetHint}</span></div></div>}
      <Card title={c.modelsTitle}>
        <div className="oc-ctrl-list">
          {svcs.map((s) => (
            <div className="oc-ctrl-row" key={s.key}>
              <div className="oc-ctrl-name"><b>{lang === "fa" ? s.fa : s.en}</b>{synced && <span className="oc-appido-set">{c.appidoSet}</span>}</div>
              <div className="oc-seg">{dat.modelTiers.map((m) => <button key={m} className={"oc-seg-b" + (models[s.key] === m ? " on" : "")} disabled={!editable || !ons[s.key]} onClick={() => { setModels((p) => ({ ...p, [s.key]: m })); setDirty(true); }}>{c[m]}</button>)}</div>
              {editable
                ? <Toggle on={ons[s.key]} set={() => { setOns((p) => ({ ...p, [s.key]: !ons[s.key] })); setDirty(true); }} />
                : <span className={"oc-chip-st " + (ons[s.key] ? "ok" : "bad")}>{ons[s.key] ? c.on : c.off}</span>}
            </div>
          ))}
        </div>
      </Card>
      <Card title={c.capTitle}>
        <div className="oc-cap-row">
          <span className="oc-cap-label">{c.capLabel}</span>
          <div className="oc-cap-input"><span>$</span><input type="number" value={cap} disabled={!editable} onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setCap(Number(e.target.value) || 0); setDirty(true); }} /></div>
          <span className="oc-muted oc-cap-now">{c.capNow}: {money(u.cost)}</span>
        </div>
        {cap > 0 && u.cost > cap && <div className="oc-cap-warn"><Icon name="alert" size={12} /> {c.capExceeded}</div>}
      </Card>
      {editable && dirty && <button className="oc-btn green oc-ctrl-apply" onClick={apply}><Icon name="send" size={15} /> {c.applySync}</button>}
    </div>
  );
}

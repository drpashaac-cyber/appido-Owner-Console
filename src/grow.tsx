import { useState, useEffect } from "react";
import { fmt, aiPlanOf } from "./lib";
import { Icon, useData, BarsH, Heat, Card, PlanTag, sevCls, PageHead, useCtx, ModalShell } from "./core";
import { apiEnabled, ownerLeads, type LeadRow } from "./http";
import type { ViewProps } from "./types";

export function MarketIntel({ t, lang }: ViewProps) {
  const dat = useData();
  const ctx = useCtx();
  const live = apiEnabled();
  const [leads, setLeads] = useState<LeadRow[]>([]);
  useEffect(() => { if (live) ownerLeads.list().then((r) => setLeads(r || [])).catch(() => {}); }, [live]);
  const maxW = Math.max(...dat.intent.map((i) => i.w));
  const exportCSV = () => {
    const head = ["Category", "Trend %", "Status"];
    const rows = dat.categories.map((c) => [lang === "fa" ? c.fa : c.en, c.trend, c.trend >= 0 ? "rising" : "declining"]);
    const csv = [head, ...rows].map((r) => r.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(",")).join("\n");
    try {
      const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
      const a = document.createElement("a"); a.href = url; a.download = "appido-benchmark.csv";
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      ctx.toast(t.m.exported);
    } catch (e) {
      ctx.openModal(<ModalShell title={t.m.exportCsv}><pre className="oc-cred">{csv}</pre></ModalShell>);
    }
  };
  return (
    <div className="oc-view">
      <PageHead title={t.intel.title} sub={t.intel.sub} tag={t.secTag.users} />
      <div className="oc-basis"><Icon name="lock" size={13} /> {t.intel.basis}<button className="oc-btn ghost sm oc-export" onClick={exportCSV}><Icon name="download" size={14} /> {t.m.exportCsv}</button></div>
      <div className="oc-grid">
        <Card title={t.intel.demand} span={2}>
          <div className="oc-cats">
            {dat.categories.map((c, i) => (
              <div className="oc-cat" key={i}><span className="oc-cat-n">{c[lang] ?? c.en}</span><span className={"oc-cat-trend " + (c.trend >= 0 ? "up" : "dn")}><Icon name={c.trend >= 0 ? "up" : "down"} size={13} />{Math.abs(c.trend)}%</span><span className="oc-cat-tag">{c.trend >= 0 ? t.intel.rising : t.intel.declining}</span></div>
            ))}
          </div>
        </Card>
        <Card title={t.intel.opp}>
          <ul className="oc-opps">{dat.opps.map((o, i) => <li key={i}><span className="oc-opp-up"><Icon name="up" size={12} />{o.up}%</span>{o[lang] ?? o.en}</li>)}</ul>
        </Card>
        <Card title={t.intel.heat}><Heat cols={dat.heatCols} rows={dat.heatRows} lang={lang} /></Card>
        <Card title={t.intel.price}><BarsH data={dat.pricePoints} lang={lang} /></Card>
        <Card title={t.intel.intent}><div className="oc-chips">{dat.intent.map((it, i) => <span key={i} className="oc-chip" style={{ fontSize: 12 + (it.w / maxW) * 9, opacity: 0.55 + (it.w / maxW) * 0.45 }}>{it[lang] ?? it.en}</span>)}</div></Card>
        {live ? (
          <Card title={lang === "fa" ? "لیدهای اخیرِ لندینگ" : "Recent landing leads"} span={2}>
            {leads.length === 0 ? (
              <div className="oc-muted" style={{ padding: 8, fontSize: 13 }}>{lang === "fa" ? "هنوز لیدی از لندینگ ثبت نشده است." : "No landing leads captured yet."}</div>
            ) : (
              <div>
                {leads.slice(0, 30).map((l) => (
                  <div key={l.id} style={{ display: "flex", gap: 8, alignItems: "center", padding: "7px 0", borderBottom: "1px solid var(--sand)" }}>
                    <span className={"oc-dot " + (l.isLead ? "ok" : "")} />
                    <b style={{ fontSize: 13 }} dir="ltr">{l.email || l.phone || l.anonId || "—"}</b>
                    <span className="oc-muted" style={{ fontSize: 12 }} dir="ltr">{l.name}</span>
                    <span className="oc-muted" style={{ marginInlineStart: "auto", fontSize: 11.5 }} dir="ltr">{l.at ? new Date(l.at).toLocaleString() : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}
      </div>
      <div className="oc-make"><div className="oc-make-ic"><Icon name="spark" size={22} /></div><div><h4>{t.intel.makeTitle}</h4><p>{t.intel.makeBody}</p></div></div>
    </div>
  );
}

export function Strategist({ t, lang }: ViewProps) {
  const dat = useData();
  const ctx = useCtx();
  const expand = dat.tenants.filter((x) => x.status === "ok" && x.plan !== "pro");
  const save = dat.tenants.filter((x) => x.status === "risk" || x.status === "churn");
  const Section = ({ icon, title, color, list }: any) => (
    <Card title={<span className="oc-str-h"><span className="oc-str-ic" style={{ background: color }}><Icon name={icon} size={14} /></span>{title} · {list.length}</span>}>
      <div className="oc-str-list">
        {list.map((x, i: number) => {
          const step = aiPlanOf(x, lang)[0];
          return (
            <div className="oc-str-card" key={i}>
              <div className="oc-str-top"><span className="oc-ava sm oc-clickable" onClick={() => { ctx.setSelTenant(x); ctx.navigate("tenants"); }}>{x.name[0]}</span><b>{x.name}</b><PlanTag p={x.plan} lang={lang} /></div>
              <div className="oc-str-play"><b>{step.title}</b><span className="oc-plan-why">{step.why}</span></div>
              <div className="oc-str-foot"><span className="oc-plan-impact"><Icon name="up" size={12} />{step.impact}</span><div className="oc-str-btns">
                <button className="oc-btn green sm" onClick={() => ctx.confirm({ title: t.m.applyTitle, body: <div className="oc-confirm-step"><b>{x.name} — {step.title}</b><span className="oc-plan-why">{step.why}</span><span className="oc-plan-impact"><Icon name="up" size={12} />{step.impact}</span></div>, ok: t.m.apply, onOk: () => { ctx.logActivity({ fa: "توصیه برای " + x.name + " اعمال شد: " + step.title, en: "Applied for " + x.name + ": " + step.title, tone: "ok", channel: t.m.toTenant }); ctx.toast(t.m.applied); } })}>{t.str.apply}</button>
                <button className="oc-btn ghost sm" onClick={() => { ctx.logActivity({ fa: x.name + " — گام به صفِ اجرا اضافه شد: " + step.title, en: x.name + " — step queued: " + step.title, tone: "ok", channel: t.m.toTenant }); ctx.toast(t.m.queued); }}>{t.str.queue}</button>
              </div></div>
            </div>
          );
        })}
      </div>
    </Card>
  );
  return (
    <div className="oc-view">
      <PageHead title={t.str.title} sub={t.str.sub} />
      <div className="oc-scan"><Icon name="spark" size={15} /> {t.str.scan} — <b>{expand.length}</b> {t.str.expand} · <b>{save.length}</b> {t.str.save} · <b>34</b> {t.str.activate}</div>
      <div className="oc-grid two">
        <Section icon="up" title={t.str.expand} color="var(--green)" list={expand} />
        <Section icon="alert" title={t.str.save} color="var(--terra)" list={save} />
      </div>
    </div>
  );
}

export function Diagnostics({ t, lang }: ViewProps) {
  const dat = useData();
  const ctx = useCtx();
  return (
    <div className="oc-view">
      <PageHead title={t.diag.title} sub={t.diag.sub} />
      <Card title={t.diag.funnel}>
        <div className="oc-funnel">
          {dat.funnel.map((v, i) => (
            <div className="oc-fn-step" key={i}>
              <div className="oc-fn-barwrap"><div className="oc-fn-bar" style={{ height: (36 + v * 1.1) + "px" }}>{v}%</div></div>
              <div className="oc-fn-foot">
                <span className="oc-fn-lbl">{t.diag.steps[i]}</span>
                {i > 0
                  ? <span className="oc-fn-drop"><Icon name="down" size={11} />{dat.funnel[i - 1] - v}% {t.diag.drop}</span>
                  : <span className="oc-fn-drop oc-fn-drop-empty" aria-hidden="true">—</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
      <div className="oc-grid">
        <Card title={t.diag.issues} span={2}>
          <ul className="oc-issues">
            {dat.issues.map((x, i) => (
              <li key={i}><span className={"oc-sev " + sevCls(x.sev)} />
                <div className="oc-issue-body"><b>{lang === "fa" ? x.fa : x.en}</b><span className="oc-issue-fix"><Icon name="spark" size={11} /> {t.diag.fix}: {lang === "fa" ? x.fixFa : x.fixEn}</span></div>
                <span className="oc-issue-aff">{t.diag.affected}<b>{fmt(x.aff)}</b></span>
                <button className="oc-btn ghost sm" onClick={() => ctx.confirm({ title: t.m.taskCreate, body: <div className="oc-confirm-step"><b>{lang === "fa" ? x.fa : x.en}</b><span className="oc-plan-why">{t.diag.fix}: {lang === "fa" ? x.fixFa : x.fixEn}</span></div>, ok: t.m.taskCreate, onOk: () => { ctx.logActivity({ fa: "تسکِ محصول ساخته شد: " + (lang === "fa" ? x.fa : x.en), en: "Product task created: " + (lang === "fa" ? x.fa : x.en), tone: "ok" }); ctx.toast(t.m.taskCreated); } })}>{t.m.taskCreate}</button>
              </li>
            ))}
          </ul>
        </Card>
        <Card title={t.diag.adoption}><BarsH data={dat.adoption} lang={lang} /></Card>
        <Card title={t.diag.confusion} span={3}><div className="oc-chips">{dat.confusion.map((x, i) => <span key={i} className="oc-chip">{lang === "fa" ? x.fa : x.en} · {x.w}</span>)}</div></Card>
      </div>
    </div>
  );
}

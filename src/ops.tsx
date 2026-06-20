import React, { useState, useEffect } from "react";
import { fmt, money, moneyK, defaultModel, aiUsageOf } from "./lib";
import { Icon, useData, TypeToConfirm, Donut, AreaLine, Kpi, Card, sevCls, PageHead, useCtx, ModalShell, Field, EmptyState, Toggle, SendBtn } from "./core";
import { ChatPanel } from "./shared";
import { apiEnabled, ownerPlans, ownerGateways, ownerSettings, ownerScript, ownerGovernance, type OwnerPlan, type GatewayPolicyRow, type ScriptRow } from "./http";
import type { Dict, ViewProps, UserRow, Gateway } from "./types";

export function Autopilot({ t, lang }: ViewProps) {
  const dat = useData();
  const ctx = useCtx();
  const [resolved, setResolved] = useState<Record<string, boolean>>({});
  const pendingCount = dat.incidents.filter((x, i) => x.status === "pending" && !resolved[i]).length;
  const fixedCount = dat.incidents.filter((x, i) => x.status === "fixed" || resolved[i]).length;
  const resolvedPct = Math.round((fixedCount / dat.incidents.length) * 100);
  const review = (x: any, i: number) => ctx.openModal(
    <ModalShell title={t.m.reviewTitle} footer={<><button className="oc-btn ghost" onClick={ctx.closeModal}>{t.m.cancel}</button><button className="oc-btn green" onClick={() => { setResolved((r) => ({ ...r, [i]: true })); ctx.closeModal(); ctx.toast(t.m.resolved); }}><Icon name="check" size={14} /> {t.m.resolve}</button></>}>
      <div className="oc-confirm-step"><b>{lang === "fa" ? x.tFa : x.tEn}</b><span className="oc-plan-why">{x.whoType === "tenant" ? t.auto.affTenant : t.auto.affUser}: {x.who} · {x.time}</span><span className="oc-inc-did"><Icon name="spark" size={11} /> {t.auto.did}: {lang === "fa" ? x.didFa : x.didEn}</span></div>
      {x.whoType === "tenant" && dat.tenants.find((q) => q.name === x.who) && <button className="oc-btn ghost sm oc-mt12" onClick={() => { const tt = dat.tenants.find((q) => q.name === x.who); ctx.closeModal(); ctx.setSelTenant(tt); ctx.navigate("tenants"); }}><Icon name="customers" size={13} /> {t.auto.openTenant}</button>}
    </ModalShell>
  );
  return (
    <div className="oc-view">
      <PageHead title={t.auto.title} sub={t.auto.sub} />
      <div className="oc-kpis four">
        <Kpi label={t.auto.today} value={String(dat.incidents.length)} delta={8} up />
        <Kpi label={t.auto.resolved} value={resolvedPct + "%"} delta={4} up />
        <Kpi label={t.auto.mttr} value="3.2m" delta={-12} up />
        <Kpi label={t.auto.needs} value={String(pendingCount)} />
      </div>
      <Card title={t.auto.feed}>
        <ul className="oc-incidents">
          {dat.incidents.map((x, i) => {
            const st = resolved[i] ? "fixed" : x.status;
            return (
              <li key={i} className={st === "pending" ? "pending" : ""}>
                <span className={"oc-inc-ico " + (st === "fixed" ? "ok" : "warn")}><Icon name={st === "fixed" ? "check" : "alert"} size={15} /></span>
                <div className="oc-inc-body">
                  <b>{lang === "fa" ? x.tFa : x.tEn}</b>
                  <span className="oc-inc-meta">{x.whoType === "tenant" ? t.auto.affTenant : t.auto.affUser}: {x.who} · {x.time}</span>
                  <span className="oc-inc-did"><Icon name="spark" size={11} /> {t.auto.did}: {lang === "fa" ? x.didFa : x.didEn}</span>
                </div>
                {st === "pending"
                  ? <button className="oc-btn ghost sm" onClick={() => review(x, i)}>{t.m.review}</button>
                  : <span className="oc-chip-st ok">{t.auto.fixed}</span>}
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

export function Safety({ t, lang }: ViewProps) {
  const dat = useData();
  const ctx = useCtx();
  const [done, setDone] = useState<Record<string, boolean>>({});
  return (
    <div className="oc-view">
      <PageHead title={t.sf.title} sub={t.sf.sub} />
      <div className="oc-grid">
        <Card title={t.sf.queue} span={2}>
          <ul className="oc-flags">{dat.flags.map((f, i) => (
            <li key={i}>
              <span className={"oc-sev " + sevCls(done[i] ? "low" : f.sev)} />
              <span className="oc-flag-txt">{lang === "fa" ? f.fa : f.en}</span>
              {done[i]
                ? <span className="oc-chip-st ok">{t.m.resolved}</span>
                : <><span className={"oc-sev-tag " + sevCls(f.sev)}>{t.sf.sev[f.sev]}</span><button className="oc-btn ghost sm" onClick={() => ctx.confirm({ title: t.m.reviewTitle, body: <div className="oc-confirm-step"><b>{lang === "fa" ? f.fa : f.en}</b></div>, ok: t.m.resolve, onOk: () => { setDone((d) => ({ ...d, [i]: true })); ctx.toast(t.m.resolved); } })}>{t.m.review}</button></>}
            </li>
          ))}</ul>
        </Card>
        <Card title={t.sf.audit}><ul className="oc-audit">{dat.audit.map((a, i) => <li key={i}><span className="oc-audit-t">{a.t}</span>{lang === "fa" ? a.fa : a.en}</li>)}</ul></Card>
      </div>
    </div>
  );
}

export function PlanEditForm({ plan, isNew, onSave, t, lang }: any) {
  const { closeModal } = useCtx();
  const [name, setName] = useState(plan?.name || "");
  const [price, setPrice] = useState(plan ? String(plan.price) : "0");
  const [feats, setFeats] = useState<string[]>(plan ? [...(lang === "fa" ? plan.featsFa : plan.featsEn)] : []);
  const [nf, setNf] = useState("");
  const addF = () => { if (nf.trim()) { setFeats([...feats, nf.trim()]); setNf(""); } };
  return (
    <ModalShell title={isNew ? t.m.newPkg : t.m.editPlan} footer={<><button className="oc-btn ghost" onClick={closeModal}>{t.m.cancel}</button><button className="oc-btn green" onClick={() => onSave({ name, price: +price || 0, feats })}>{t.m.save}</button></>}>
      <Field label={t.m.pkgName}><input className="oc-input" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} /></Field>
      <Field label={t.m.priceLbl}><input className="oc-input" type="number" value={price} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPrice(e.target.value)} /></Field>
      <Field label={t.m.featsLbl}>
        <div className="oc-feat-edit">
          {feats.map((f, i) => <div className="oc-feat-row" key={i}><Icon name="check" size={13} /><span>{f}</span><button className="oc-feat-del" onClick={() => setFeats(feats.filter((_, j) => j !== i))} aria-label="remove"><Icon name="trash" size={13} /></button></div>)}
          <div className="oc-feat-add"><input className="oc-input" value={nf} placeholder={t.m.addFeat} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNf(e.target.value)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") addF(); }} /><button className="oc-btn ghost sm" onClick={addF}><Icon name="plus" size={14} /></button></div>
        </div>
      </Field>
    </ModalShell>
  );
}

export function QEditForm({ q, isNew, onSave, t, lang }: any) {
  const { closeModal } = useCtx();
  const cats = ["onboard", "discover", "upsell", "support"];
  const [cat, setCat] = useState(q?.cat || "onboard");
  const [text, setText] = useState(q ? (lang === "fa" ? q.fa : q.en) : "");
  return (
    <ModalShell title={isNew ? t.m.newQ : t.m.editQ} footer={<><button className="oc-btn ghost" onClick={closeModal}>{t.m.cancel}</button><button className="oc-btn green" onClick={() => onSave({ cat, text })}>{t.m.save}</button></>}>
      <Field label={t.m.qCat}><div className="oc-seg">{cats.map((cc) => <button key={cc} className={"oc-seg-b" + (cat === cc ? " on" : "")} onClick={() => setCat(cc)}>{t.set.cat[cc]}</button>)}</div></Field>
      <Field label={t.m.qText}><input className="oc-input" value={text} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)} /></Field>
    </ModalShell>
  );
}

export function Settings({ t, lang }: ViewProps) {
  const dat = useData();
  const ctx = useCtx();
  const live = apiEnabled();
  const [tab, setTab] = useState("plans");
  const [trial, setTrial] = useState(14);
  const [plans, setPlans] = useState(dat.planConfig.map((p) => ({ ...p, featsFa: [...p.featsFa], featsEn: [...p.featsEn], active: true })));
  // Live: the plan catalog is owned by the backend (shared with the landing page + dashboard).
  const fromApi = (p: OwnerPlan) => ({ id: p.id, key: p.key, name: p.name, price: Math.round((p.priceCents || 0) / 100), popular: p.popular, featsFa: p.featuresFa || [], featsEn: p.featuresEn || [], active: p.active });
  const loadPlans = () => { if (live) ownerPlans.list().then((rows) => setPlans((rows || []).map(fromApi))).catch(() => {}); };
  useEffect(() => { loadPlans(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [live]);
  const [script, setScript] = useState(dat.script.map((s) => ({ ...s })));
  const fromScript = (r: ScriptRow) => ({ id: r.id, cat: r.category, fa: r.questionFa, en: r.questionEn, on: r.enabled });
  const loadScript = () => { if (live) ownerScript.list().then((rows) => setScript((rows || []).map(fromScript))).catch(() => {}); };
  useEffect(() => { loadScript(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [live]);
  const [gov, setGov] = useState({ optin: true, residency: true, pii: true });
  useEffect(() => { if (live) ownerGovernance.get().then((g) => setGov({ optin: g.requireOptin, residency: g.residency !== "global", pii: g.piiRedaction !== "off" })).catch(() => {}); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [live]);
  const saveGov = (next: { optin: boolean; residency: boolean; pii: boolean }) => {
    setGov(next);
    if (live) ownerGovernance.set({ requireOptin: next.optin, residency: next.residency ? "eu" : "global", piiRedaction: next.pii ? "mask_before_llm" : "off" }).catch(() => ctx.toast(t.m.loadErr));
  };
  const [kanon, setKanon] = useState(50);
  const [gws, setGws] = useState(dat.gateways.map((g) => ({ ...g })));
  // Live: gateway availability is owned by the backend policy (applies to every tenant).
  const fromGw = (r: GatewayPolicyRow) => ({ key: r.method, fa: r.label, en: r.label, kind: r.crypto ? "crypto" : "rial", on: r.enabled });
  const loadGws = () => { if (live) ownerGateways.list().then((rows) => setGws((rows || []).filter((r) => r.available).map(fromGw))).catch(() => {}); };
  useEffect(() => { loadGws(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [live]);
  useEffect(() => { if (live) ownerSettings.get().then((x) => setTrial(x.trialDays)).catch(() => {}); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [live]);
  const setTrialN = (n: number) => { const v = Math.max(0, Math.min(365, n)); setTrial(v); if (live) ownerSettings.set(v).catch(() => {}); };
  const gwEdit = ctx.canMoney && !ctx.readOnly;
  const toggleGw = (i: number) => {
    const g = gws[i]; const next = !g.on; const prev = gws;
    const log = () => ctx.logActivity({ fa: "درگاهِ " + g.fa + (next ? " برای همهٔ کسب‌وکارها فعال شد" : " برای همهٔ کسب‌وکارها غیرفعال شد"), en: "Gateway " + g.en + (next ? " enabled for all tenants" : " disabled for all tenants"), tone: next ? "ok" : "warn", channel: t.m.toTenant });
    const apply = () => {
      if (live) {
        ownerGateways.set(g.key, next)
          .then(() => { setGws(gws.map((x, j) => (j === i ? { ...x, on: next } : x))); log(); ctx.toast(next ? t.set.gw.enabledMsg : t.set.gw.disabledMsg); })
          .catch(() => ctx.toast(t.m.loadErr));
        return;
      }
      setGws(gws.map((x, j) => (j === i ? { ...x, on: next } : x))); log(); ctx.toast(next ? t.set.gw.enabledMsg : t.set.gw.disabledMsg, () => setGws(prev));
    };
    if (next) ctx.confirm({ title: t.set.gw.enableQ, body: <div className="oc-confirm-step"><b>{lang === "fa" ? g.fa : g.en}</b><span className="oc-plan-why">{t.set.gw.appliesAll}</span></div>, ok: t.set.gw.enable, onOk: apply });
    else ctx.openModal(<TypeToConfirm title={t.set.gw.disableQ} body={<div className="oc-confirm-step"><b>{lang === "fa" ? g.fa : g.en}</b><span className="oc-plan-why">{t.set.gw.appliesAll}</span></div>} match={lang === "fa" ? g.fa : g.en} hint={t.set.gw.typeHint} ok={t.set.gw.disable} onOk={apply} />);
  };
  const addGw = (d: any) => { setGws([...gws, { key: "gw" + Date.now(), fa: d.name, en: d.name, kind: d.kind, on: true }]); ctx.closeModal(); ctx.toast(t.set.gw.added); };
  const tabs = ["plans", "gateways", "script", "gov", "team"];
  const Toggle = ({ on, set }: { on: boolean; set: () => void }) => <button className={"oc-toggle" + (on ? " on" : "")} onClick={set} role="switch" aria-checked={on}><span /></button>;
  const savePlan = (idx: number, d: any) => {
    const p: any = plans[idx];
    if (live && p?.id) {
      ownerPlans.update(p.id, { name: d.name, priceCents: Math.round((+d.price || 0) * 100), ...(lang === "fa" ? { featuresFa: d.feats } : { featuresEn: d.feats }) })
        .then(() => { ctx.closeModal(); ctx.toast(t.m.planSaved); loadPlans(); })
        .catch(() => ctx.toast(t.m.loadErr));
      return;
    }
    setPlans(plans.map((q, i) => i === idx ? { ...q, name: d.name, price: d.price, ...(lang === "fa" ? { featsFa: d.feats } : { featsEn: d.feats }) } : q)); ctx.closeModal(); ctx.toast(t.m.planSaved);
  };
  const addPlan = (d: any) => {
    if (live) {
      ownerPlans.create({ name: d.name || t.m.newPkg, priceCents: Math.round((+d.price || 0) * 100), featuresFa: lang === "fa" ? d.feats : [], featuresEn: lang === "en" ? d.feats : [] })
        .then(() => { ctx.closeModal(); ctx.toast(t.m.pkgAdded); loadPlans(); })
        .catch(() => ctx.toast(t.m.loadErr));
      return;
    }
    setPlans([...plans, { key: "pkg" + Date.now(), name: d.name || t.m.newPkg, price: d.price, popular: false, active: true, featsFa: d.feats, featsEn: d.feats }]); ctx.closeModal(); ctx.toast(t.m.pkgAdded);
  };
  const togglePlanActive = (i: number) => {
    const p: any = plans[i];
    if (live && p?.id) { ownerPlans.update(p.id, { active: !p.active }).then(loadPlans).catch(() => ctx.toast(t.m.loadErr)); return; }
    setPlans(plans.map((q, k) => k === i ? { ...q, active: !q.active } : q));
  };
  const saveQ = (idx: number, d: any) => {
    const cur: any = script[idx];
    if (live && cur?.id) {
      const patch: any = { category: d.cat }; patch[lang === "fa" ? "questionFa" : "questionEn"] = d.text;
      ownerScript.update(cur.id, patch).then(loadScript).catch(() => ctx.toast(t.m.loadErr));
    } else {
      setScript(script.map((s, i) => (i === idx ? { ...s, cat: d.cat, [lang]: d.text } : s)));
    }
    ctx.closeModal(); ctx.toast(t.m.qSaved);
  };
  const addQ = (d: any) => {
    if (live) {
      ownerScript.create({ category: d.cat, questionFa: d.text, questionEn: d.text, sortOrder: script.length + 1 }).then(loadScript).catch(() => ctx.toast(t.m.loadErr));
    } else {
      setScript([...script, { cat: d.cat, fa: d.text, en: d.text, on: true }]);
    }
    ctx.closeModal(); ctx.toast(t.m.qSaved);
  };
  return (
    <div className="oc-view">
      <PageHead title={t.set.title} sub={t.set.sub} />
      <div className="oc-tabs">{tabs.map((x) => <button key={x} className={"oc-tab" + (tab === x ? " on" : "")} onClick={() => setTab(x)}>{t.set.tabs[x]}</button>)}</div>
      {tab === "gateways" && (
        <Card title={t.set.gw.title} sub={t.set.gw.hint} right={gwEdit && !live ? <button className="oc-btn green sm" onClick={() => ctx.openModal(<GatewayForm t={t} onSave={addGw} />)}><Icon name="plus" size={14} /> {t.set.gw.add}</button> : undefined}>
          {!gwEdit && <div className="oc-note"><Icon name="lock" size={13} /> {t.set.gw.lock}</div>}
          <div className="oc-gws">
            {gws.map((g, i) => (
              <div className={"oc-gw-row" + (g.on ? "" : " off")} key={g.key}>
                <span className={"oc-gw-kind " + g.kind}>{g.kind === "crypto" ? t.set.gw.crypto : t.set.gw.rial}</span>
                <b className="oc-gw-name">{lang === "fa" ? g.fa : g.en}</b>
                <span className={"oc-chip-st " + (g.on ? "ok" : "warn")}>{g.on ? t.set.gw.enabled2 : t.set.gw.disabled2}</span>
                <Toggle on={g.on} set={() => { if (gwEdit) toggleGw(i); }} />
              </div>
            ))}
          </div>
          <div className="oc-note"><Icon name="alert" size={12} /> {t.set.gw.backendNote}</div>
        </Card>
      )}
      {tab === "plans" && (
        <>
          <Card>
            <div className="oc-trial">
              <div><b>{t.set.trial}</b><span>{t.set.trialD}</span></div>
              <div className="oc-trial-ctl"><button onClick={() => setTrialN(trial - 1)}>−</button><b>{trial} {t.set.days}</b><button onClick={() => setTrialN(trial + 1)}>+</button></div>
            </div>
          </Card>
          <div className="oc-plan-cards">
            {plans.map((p, i) => (
              <div className={"oc-plancard" + (p.popular ? " pop" : "") + (p.active ? "" : " inactive")} key={i}>
                {p.popular && <span className="oc-plancard-pop"><Icon name="spark" size={11} /> {t.set.popular}</span>}
                <div className="oc-plancard-h"><b>{p.name}</b><button className="oc-iconbtn sm" aria-label="edit" onClick={() => ctx.openModal(<PlanEditForm plan={p} t={t} lang={lang} onSave={(d: any) => savePlan(i, d)} />)}><Icon name="edit" size={14} /></button></div>
                <div className="oc-plancard-price"><span className="oc-pc-amt">${p.price}</span><span className="oc-pc-per">{t.set.perMo}</span></div>
                <ul className="oc-plancard-feats">{(lang === "fa" ? p.featsFa : p.featsEn).map((f: string, j: number) => <li key={j}><Icon name="check" size={14} />{f}</li>)}</ul>
                <div className="oc-plancard-foot"><span className="oc-muted">{t.set.active}</span><Toggle on={p.active} set={() => togglePlanActive(i)} /></div>
              </div>
            ))}
            <button className="oc-addpkg" onClick={() => ctx.openModal(<PlanEditForm isNew t={t} lang={lang} onSave={addPlan} />)}><Icon name="plus" size={20} /><span>{t.set.addPkg}</span></button>
          </div>
        </>
      )}
      {tab === "script" && (
        <Card title={t.set.scriptTitle} sub={t.set.scriptHint} right={<button className="oc-btn green sm" onClick={() => ctx.openModal(<QEditForm isNew t={t} lang={lang} onSave={addQ} />)}><Icon name="plus" size={14} /> {t.set.addQ}</button>}>
          <div className="oc-script">
            {script.map((q, i) => (
              <div className={"oc-script-row" + (q.on ? "" : " off")} key={i}>
                <span className={"oc-script-cat " + q.cat}>{t.set.cat[q.cat]}</span>
                <span className="oc-script-q">{lang === "fa" ? q.fa : q.en}</span>
                <button className="oc-iconbtn sm" aria-label="edit" onClick={() => ctx.openModal(<QEditForm q={q} t={t} lang={lang} onSave={(d: any) => saveQ(i, d)} />)}><Icon name="edit" size={14} /></button>
                <Toggle on={q.on} set={() => { const nx = !q.on; const cur: any = q; if (live && cur?.id) { ownerScript.update(cur.id, { enabled: nx }).then(loadScript).catch(() => ctx.toast(t.m.loadErr)); } else { setScript(script.map((s, j) => (j === i ? { ...s, on: nx } : s))); } }} />
              </div>
            ))}
          </div>
        </Card>
      )}
      {tab === "gov" && (
        <Card title={t.set.tabs.gov}>
          <div className="oc-gov">
            <div className="oc-gov-row"><div><b>{t.set.kanon}</b><span>{t.set.kanonD}</span></div><div className="oc-kanon"><input type="range" min={20} max={200} step={10} value={kanon} onChange={(e) => setKanon(+e.target.value)} /><b>{kanon}</b></div></div>
            <div className="oc-gov-row"><div><b>{t.set.optin}</b><span>{t.set.optinD}</span></div><Toggle on={gov.optin} set={() => saveGov({ ...gov, optin: !gov.optin })} /></div>
            <div className="oc-gov-row"><div><b>{t.set.residency}</b><span>{t.set.residencyD}</span></div><Toggle on={gov.residency} set={() => saveGov({ ...gov, residency: !gov.residency })} /></div>
            <div className="oc-gov-row"><div><b>{t.set.pii}</b><span>{t.set.piiD}</span></div><Toggle on={gov.pii} set={() => saveGov({ ...gov, pii: !gov.pii })} /></div>
          </div>
        </Card>
      )}
      {tab === "team" && <Card title={t.set.tabs.team}><div className="oc-roles">{Object.values(t.set.roles).map((r, i: number) => <span key={i} className="oc-role">{r}</span>)}</div></Card>}
    </div>
  );
}

export function AIOps({ t, lang }: ViewProps) {
  const dat = useData();
  const ctx = useCtx();
  const [tab, setTab] = useState("fleet");
  const [aiMaster, setAiMaster] = useState(true);
  const tabs = ["fleet", "tokens", "models", "bots", "tips", "chats", "status"];
  const Toggle = ({ on, set }: { on: boolean; set: () => void }) => <button className={"oc-toggle" + (on ? " on" : "")} onClick={set} role="switch" aria-checked={on}><span /></button>;
  const stCls = (s: string) => (s === "ok" ? "ok" : s === "degraded" ? "warn" : "bad");
  const stLbl = (s: string) => (s === "ok" ? t.ai.ok : s === "degraded" ? t.ai.degraded : t.ai.down);
  const openChat = (c: any) => {
    const tn = dat.tenants.find((x) => x.name === c.name) || dat.tenants[0];
    ctx.openModal(
      <ModalShell title={(c.kind === "customer" ? t.ai.kindCust : t.ai.kindDash) + " · " + c.name}>
        <ChatPanel t={t} lang={lang} tenant={tn} kind={c.kind} />
      </ModalShell>
    );
  };
  return (
    <div className="oc-view">
      <PageHead title={t.ai.title} sub={t.ai.sub} />
      <div className="oc-kpis four">
        <Kpi label={t.ai.kCost} value={moneyK(dat.aiServices.reduce((s, x) => s + x.cost, 0))} delta={6} up />
        <Kpi label={t.ai.kTokens} value="1.8B" delta={9} up />
        <Kpi label={t.ai.kMargin} value="71%" delta={2} up />
        <Kpi label={t.ai.kBots} value={String(dat.botHealth.filter((b) => b.status === "alarm").length)} />
      </div>
      <div className="oc-tabs">{tabs.map((x) => <button key={x} className={"oc-tab" + (tab === x ? " on" : "")} onClick={() => setTab(x)}>{t.ai.tabs[x]}</button>)}</div>

      {tab === "models" && <ModelControlPlane t={t} lang={lang} />}
      {tab === "fleet" && (
        <Card title={t.ai.tabs.fleet}>
          <div className="oc-table-wrap"><table className="oc-table">
            <thead><tr><th>{t.ai.svc}</th><th>{t.ai.usingTenants}</th><th>{t.ai.tokensUse}</th><th>{t.ai.cost}</th><th>{t.ai.latency}</th><th>{t.ai.errRate}</th><th>{t.ai.status}</th></tr></thead>
            <tbody>{dat.aiServices.map((s, i) => (
              <tr key={i}>
                <td><b>{lang === "fa" ? s.fa : s.en}</b></td>
                <td>{fmt(s.tenants)}</td>
                <td><span className="oc-health"><span className="oc-health-bar"><span className={"oc-health-fill " + (s.tok >= 85 ? "bad" : s.tok >= 70 ? "mid" : "ok")} style={{ width: s.tok + "%" }} /></span><span className="oc-health-n">{s.tok}%</span></span></td>
                <td>{moneyK(s.cost)}</td>
                <td>{s.lat}s</td>
                <td className={s.err >= 3 ? "warn" : ""}>{s.err}%</td>
                <td><span className={"oc-chip-st " + stCls(s.status)}>{stLbl(s.status)}</span></td>
              </tr>
            ))}</tbody>
          </table></div>
        </Card>
      )}

      {tab === "tokens" && (
        <>
          <Card title={t.ai.costHistory}>
            <AreaLine a={dat.aiCostSeries} />
            <div className="oc-forecast"><b>{moneyK(Math.round(dat.aiCostSeries[dat.aiCostSeries.length - 1] + (dat.aiCostSeries[dat.aiCostSeries.length - 1] - dat.aiCostSeries[dat.aiCostSeries.length - 4]) / 3))}</b><span>{t.ai.forecast}</span></div>
          </Card>
          <Card title={t.ai.tokTitle}>
            <div className="oc-aiusage">
              {dat.tenants.filter((x) => x.plan !== "free").map((x, i) => {
                const u = aiUsageOf(x);
                return (
                  <div className="oc-aiu-row" key={i}>
                    <div className="oc-aiu-name"><span className="oc-ava sm">{x.name[0]}</span><b>{x.name}</b><span className={"oc-conn " + (u.conn === "ok" ? "ok" : "bad")}>{u.conn === "ok" ? t.ai.connOk : t.ai.connDown}</span></div>
                    <span className="oc-bar-track"><span className="oc-bar-fill" style={{ width: u.tokensPct + "%", background: u.tokensPct >= 90 ? "var(--terra)" : u.tokensPct >= 75 ? "var(--amber)" : "var(--green)" }} /></span>
                    <span className="oc-aiu-pct">{u.tokensPct}%</span>
                    <span className={"oc-aiu-cost" + (u.overrun ? " warn" : "")}>{money(u.cost)}{u.overrun ? " ⚠" : ""}</span>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      {tab === "bots" && (
        <div className="oc-grid">
          {dat.botHealth.map((b, i) => (
            <Card key={i} title={<span className="oc-str-h"><span className="oc-ava sm">{b.name[0]}</span>{b.name}</span>} right={<span className={"oc-chip-st " + (b.status === "alarm" ? "bad" : "ok")}>{b.status === "alarm" ? t.ai.alarm : t.ai.ok}</span>}>
              <div className="oc-bot-meta"><span>{t.ai.doc}: <b className={b.doc === "ok" ? "" : "warn"}>{b.doc === "ok" ? t.ai.docOk : b.doc === "stale" ? t.ai.docStale : t.ai.docGap}</b></span><span>{t.ai.failRate}: <b className={b.fail > 8 ? "warn" : ""}>{b.fail}%</b></span></div>
              {b.status === "alarm" && (
                <>
                  <div className="oc-confirm-step oc-mt12"><span className="oc-issue-fix"><Icon name="alert" size={12} /> {t.ai.rootCause}</span><p className="oc-modal-txt">{lang === "fa" ? b.rootFa : b.rootEn}</p><span className="oc-issue-fix"><Icon name="spark" size={12} /> {lang === "fa" ? b.fixFa : b.fixEn}</span></div>
                  <SendBtn akey={"fix:" + b.name} title={t.ai.sendFix} body={<div className="oc-confirm-step"><b>{b.name}</b><span className="oc-plan-why">{lang === "fa" ? b.rootFa : b.rootEn}</span><span className="oc-issue-fix"><Icon name="spark" size={11} /> {lang === "fa" ? b.fixFa : b.fixEn}</span></div>} label={t.ai.sendFix} doneLabel={t.ai.fixSent} channel={t.m.toTenant} fa={"رفعِ ایرادِ باتِ " + b.name + " به کسب‌وکار ارسال شد"} en={"Bot fix for " + b.name + " sent to tenant"} cls="oc-mt12" icon={14} />
                </>
              )}
            </Card>
          ))}
        </div>
      )}

      {tab === "tips" && (
        <div className="oc-str-list">
          {dat.aiTips.map((p, i) => (
            <div className="oc-str-card" key={i}>
              <div className="oc-str-top"><span className="oc-str-ic" style={{ background: "var(--green)" }}><Icon name="spark" size={14} /></span><b>{lang === "fa" ? p.titleFa : p.titleEn}</b><span className="oc-muted oc-tip-name">{p.name}</span></div>
              <div className="oc-str-play"><span className="oc-plan-why">{t.ai.why}: {lang === "fa" ? p.whyFa : p.whyEn}</span></div>
              <div className="oc-str-foot"><span className="oc-plan-impact"><Icon name="up" size={12} />{lang === "fa" ? p.impFa : p.impEn}</span><SendBtn akey={"tip:" + p.name} title={t.ai.sendTip} body={<div className="oc-confirm-step"><b>{p.name} — {lang === "fa" ? p.titleFa : p.titleEn}</b><span className="oc-plan-why">{lang === "fa" ? p.whyFa : p.whyEn}</span></div>} label={t.ai.sendTip} doneLabel={t.ai.tipSent} channel={t.m.toTenant} fa={"تیپِ بهینه‌سازی برای " + p.name + " به کسب‌وکار ارسال شد"} en={"Optimization tip for " + p.name + " sent to tenant"} icon={13} /></div>
            </div>
          ))}
        </div>
      )}

      {tab === "chats" && (
        <>
          <div className="oc-aimaster"><div><b>{t.ai.master}</b><span>{t.ai.masterOn}</span></div><Toggle on={aiMaster} set={() => setAiMaster(!aiMaster)} /></div>
          <Card title={t.ai.chatsTitle}>
            <div className="oc-issues">
              {dat.allChats.map((c, i) => (
                <button className="oc-chatrow" key={i} onClick={() => openChat(c)}>
                  <span className="oc-ava sm">{c.name[0]}</span>
                  <div className="oc-issue-body"><b>{c.name}</b><span className="oc-issue-fix">{c.kind === "customer" ? t.ai.kindCust : t.ai.kindDash}</span></div>
                  <span className="oc-btn ghost sm">{t.ai.view}</span>
                </button>
              ))}
            </div>
          </Card>
        </>
      )}
      {tab === "status" && (
        <>
          {dat.platformStatus.every((p) => p.status === "ok")
            ? <div className="oc-allok"><span className="oc-dot ok" /> {t.ai.allOk}</div>
            : <div className="oc-share-alarm"><span className="oc-inc-ico warn"><Icon name="alert" size={15} /></span><div><b>{dat.platformStatus.filter((p) => p.status !== "ok").length} {lang === "fa" ? "سرویس دچارِ اختلال" : "service(s) degraded"}</b></div></div>}
          <Card title={t.ai.statusTitle}>
            <div className="oc-statlist">
              {dat.platformStatus.map((p, i) => (
                <div className="oc-status-row" key={i}>
                  <span className="nm"><span className={"oc-dot " + (p.status === "ok" ? "ok" : "warn")} />{lang === "fa" ? p.fa : p.en}</span>
                  <span className={"oc-chip-st " + (p.status === "ok" ? "ok" : "warn")}>{p.status === "ok" ? t.ai.operational : t.ai.degraded}</span>
                  <span className="oc-status-up">{t.ai.uptime}: {p.uptime}</span>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export function CreateUserForm({ onSave, t }: { onSave: (d: { name: string; email: string; role: string; method: string; password: string; require2fa: boolean }) => void; t: Dict }) {
  const { closeModal } = useCtx();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("manager");
  const [require2fa, setReq] = useState(true);
  const [method, setMethod] = useState("password");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const roles = ["manager", "marketer", "finance", "support", "trust"];
  const pwdOk = method !== "password" || password.length >= 8;
  return (
    <ModalShell title={t.acc.newUser} footer={<><button className="oc-btn ghost" onClick={closeModal}>{t.m.cancel}</button><button className="oc-btn green" disabled={!email || !pwdOk} onClick={() => onSave({ name, email, role, method, password, require2fa })}>{t.acc.create}</button></>}>
      <Field label={t.acc.name}><input className="oc-input" value={name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} /></Field>
      <Field label={t.acc.email}><input className="oc-input" type="email" value={email} placeholder="name@appido.io" onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} /></Field>
      <Field label={t.acc.roleLbl}><div className="oc-seg">{roles.map((r) => <button key={r} className={"oc-seg-b" + (role === r ? " on" : "")} onClick={() => setRole(r)}>{t.acc.roleNames[r]}</button>)}</div></Field>
      <Field label={t.acc.genCred}><div className="oc-seg"><button className={"oc-seg-b" + (method === "password" ? " on" : "")} onClick={() => setMethod("password")}>{t.acc.mPass}</button><button className={"oc-seg-b" + (method === "code" ? " on" : "")} onClick={() => setMethod("code")}>{t.acc.mCode}</button></div></Field>
      {method === "password" && (
        <Field label={t.acc.pwdLbl}>
          <div className="oc-pwd"><input className="oc-input" type={showPwd ? "text" : "password"} value={password} placeholder={t.acc.pwdPh} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)} /><button type="button" className="oc-pwd-toggle" onClick={() => setShowPwd(!showPwd)}>{showPwd ? t.acc.pwdHide : t.acc.pwdShow}</button></div>
          <p className="oc-field-hint">{t.acc.pwdHint}</p>
        </Field>
      )}
      <label className="oc-check"><input type="checkbox" checked={require2fa} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setReq(e.target.checked)} /> <span>{t.acc.require2fa}</span></label>
      {method === "password" && require2fa && <p className="oc-field-hint">{t.acc.twofaNote}</p>}
    </ModalShell>
  );
}

export function AccessSecurity({ t, lang }: ViewProps) {
  const dat = useData();
  const ctx = useCtx();
  const [tab, setTab] = useState("users");
  const [users, setUsers] = useState(dat.users.map((u) => ({ ...u })));
  const [sessions, setSessions] = useState(dat.sessions.map((s) => ({ ...s })));
  const tabs = ["users", "sessions", "posture"];
  const rn = (r: string) => t.acc.roleNames[r] || r;
  const sharers = Array.from(new Set(sessions.filter((s) => s.flag).map((s) => s.user)));
  const twofaPct = Math.round((users.filter((u) => u.twofa).length / users.length) * 100);
  const setUser = (i: number, patch: Partial<UserRow>) => setUsers(users.map((u, j) => (j === i ? { ...u, ...patch } : u)));
  const created = (d: { name: string; email: string; role: string; method: string; password: string; require2fa: boolean }) => {
    const code = d.method === "code";
    setUsers([...users, { name: d.name || d.email, email: d.email || "—", role: d.role, status: "active", twofa: d.require2fa, method: d.method, last: "—" }]);
    ctx.logActivity({ fa: "کاربر ساخته شد: " + (d.email || d.name) + " — نقش: " + (t.acc.roleNames[d.role] || d.role) + "، ورود: " + (code ? t.acc.mCode : t.acc.mPass), en: "User created: " + (d.email || d.name) + " — role: " + (t.acc.roleNames[d.role] || d.role) + ", sign-in: " + (code ? t.acc.mCode : t.acc.mPass), tone: "ok", channel: t.m.actTag });
    ctx.openModal(<ModalShell title={code ? t.acc.codeAccess : t.acc.created} footer={<button className="oc-btn green" onClick={ctx.closeModal}>{t.m.confirm}</button>}><p className="oc-modal-txt">{code ? t.acc.createdCodeNote : t.acc.createdPwdNote}</p></ModalShell>);
  };
  return (
    <div className="oc-view">
      <PageHead title={t.acc.title} sub={t.acc.sub} />
      <div className="oc-tabs">{tabs.map((x) => <button key={x} className={"oc-tab" + (tab === x ? " on" : "")} onClick={() => setTab(x)}>{t.acc.tabs[x]}</button>)}</div>

      {tab === "users" && (
        <Card title={t.acc.tabs.users} right={<button className="oc-btn green sm" onClick={() => ctx.openModal(<CreateUserForm t={t} onSave={(d) => { ctx.closeModal(); created(d); }} />)}><Icon name="plus" size={14} /> {t.acc.newUser}</button>}>
          <div className="oc-table-wrap"><table className="oc-table">
            <thead><tr><th>{t.acc.uCols.user}</th><th>{t.acc.uCols.role}</th><th>{t.acc.uCols.twofa}</th><th>{t.acc.uCols.method}</th><th>{t.acc.uCols.status}</th><th>{t.acc.uCols.last}</th><th>{t.acc.uCols.act}</th></tr></thead>
            <tbody>{users.map((u, i) => (
              <tr key={i}>
                <td><div className="oc-tn-name"><span className="oc-ava">{u.name[0]}</span><div><b>{u.name}</b><span>{u.email}</span></div></div></td>
                <td><span className="oc-plan start">{rn(u.role)}</span></td>
                <td><span className={"oc-chip-st " + (u.twofa ? "ok" : "warn")}>{u.twofa ? "On" : "Off"}</span></td><td><span className="oc-method"><Icon name={u.method === "code" ? "send" : "key"} size={12} /> {u.method === "code" ? t.acc.mCode : t.acc.mPass}</span></td>
                <td><span className={"oc-chip-st " + (u.status === "active" ? "ok" : u.status === "invited" ? "warn" : "bad")}>{u.status === "active" ? t.acc.active : u.status === "invited" ? t.acc.invited : t.acc.suspended}</span></td>
                <td className="oc-muted">{u.last}</td>
                <td><div className="oc-uacts">
                  <button className="oc-btn ghost sm" onClick={() => ctx.confirm({ title: t.acc.reset, body: u.email, ok: t.acc.reset, onOk: () => { ctx.logActivity({ fa: "لینکِ ریستِ رمز برای " + u.email + " ارسال شد", en: "Password reset link sent to " + u.email, tone: "warn", channel: t.m.actTag }); ctx.toast(t.acc.resetDone); } })}>{t.acc.reset}</button>
                  {u.role !== "owner" && (u.status === "active"
                    ? <button className="oc-btn ghost sm" onClick={() => ctx.confirm({ title: t.acc.revokeAccess, body: u.name, ok: t.acc.revokeAccess, tone: "bad", onOk: () => { setUser(i, { status: "suspended" }); ctx.logActivity({ fa: "دسترسیِ " + u.email + " قطع شد", en: "Access revoked for " + u.email, tone: "warn", channel: t.m.actTag }); ctx.toast(t.acc.revokeDone); } })}>{t.acc.revokeAccess}</button>
                    : u.status === "invited"
                    ? <button className="oc-btn ghost sm" onClick={() => ctx.confirm({ title: t.acc.revokeInvite, body: u.email, ok: t.acc.revokeInvite, tone: "bad", onOk: () => { setUsers(users.filter((_, j) => j !== i)); ctx.logActivity({ fa: "دعوتِ " + u.email + " لغو شد", en: "Invite cancelled for " + u.email, tone: "warn", channel: t.m.actTag }); ctx.toast(t.acc.revokeDone); } })}>{t.acc.revokeInvite}</button>
                    : <button className="oc-btn ghost sm" onClick={() => { setUser(i, { status: "active" }); ctx.toast(t.acc.activateDone); }}>{t.acc.activate}</button>)}
                </div></td>
              </tr>
            ))}</tbody>
          </table></div>
        </Card>
      )}

      {tab === "sessions" && (
        <>
          {sharers.length > 0 && (
            <div className="oc-share-alarm">
              <span className="oc-inc-ico warn"><Icon name="alert" size={15} /></span>
              <div><b>{t.acc.sharingAlarm}</b><span>{t.acc.sharingBody}</span></div>
              <button className="oc-btn bad sm" onClick={() => ctx.confirm({ title: t.acc.logoutAll, body: sharers.join(", "), ok: t.acc.logoutAll, tone: "bad", onOk: () => { setSessions(sessions.filter((s) => !sharers.includes(s.user) || s.current)); ctx.toast(t.acc.logoutDone); } })}>{t.acc.logoutAll}</button>
            </div>
          )}
          <Card title={t.acc.sessTitle}>
            <ul className="oc-incidents">
              {sessions.map((s, i) => (
                <li key={i} className={s.flag ? "pending" : ""}>
                  <span className={"oc-inc-ico " + (s.flag ? "warn" : "ok")}><Icon name={s.flag ? "alert" : "check"} size={15} /></span>
                  <div className="oc-inc-body">
                    <b>{s.user}{s.current && <span className="oc-conn ok oc-cur-tag">{t.acc.current}</span>}</b>
                    <span className="oc-inc-meta">{s.device} · {s.browser} · {s.geo} · {s.ip} · {s.last}</span>
                    {s.flag && <span className="oc-inc-did"><Icon name="alert" size={11} /> {s.flag === "share" ? t.acc.flagShare : s.flag === "travel" ? t.acc.flagTravel : t.acc.flagNew}</span>}
                  </div>
                  {!s.current && <button className="oc-btn ghost sm" onClick={() => { setSessions(sessions.filter((_, j) => j !== i)); ctx.toast(t.acc.revoked); }}>{t.acc.revoke}</button>}
                </li>
              ))}
            </ul>
          </Card>
        </>
      )}

      {tab === "posture" && (
        <>
          <div className="oc-kpis four">
            <Kpi label={t.acc.p2fa} value={twofaPct + "%"} delta={4} up />
            <Kpi label={t.acc.pSessions} value={String(sessions.length)} />
            <Kpi label={t.acc.pFailed} value="3" delta={-2} up />
            <Kpi label={t.acc.pAllow} value={t.off} />
          </div>
          <Card title={t.acc.auditTitle}>
            <ul className="oc-audit">{dat.audit.map((a, i) => <li key={i}><span className="oc-audit-t">{a.t}</span>{lang === "fa" ? a.fa : a.en}</li>)}</ul>
          </Card>
          <div className="oc-note"><Icon name="lock" size={13} /> {t.acc.backendNote}</div>
        </>
      )}
    </div>
  );
}

export function Activity({ t, lang }: ViewProps) {
  const ctx = useCtx();
  const [q, setQ] = useState("");
  const [tone, setTone] = useState("all");
  const rows = ctx.activity.filter((a) => {
    const text = ((lang === "fa" ? a.fa : a.en) + " " + (a.channel || "")).toLowerCase();
    return (tone === "all" || (a.tone || "ok") === tone) && (!q || text.includes(q.toLowerCase()));
  });
  const exportCsv = () => {
    const head = ["time", "event", "tone", "channel"];
    const lines = [head.join(","), ...rows.map((a) => [a.time, '"' + String(lang === "fa" ? a.fa : a.en).replace(/"/g, '""') + '"', a.tone || "ok", a.channel || ""].join(","))];
    try {
      const blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob); const el = document.createElement("a");
      el.href = url; el.download = "appido-activity.csv"; el.click(); URL.revokeObjectURL(url);
      ctx.toast(t.m.actExported);
    } catch (e) { ctx.toast(t.m.actExported); }
  };
  return (
    <div className="oc-view">
      <PageHead title={t.m.actTitle} sub={t.m.actSub} tag={t.m.actTag} />
      <div className="oc-list-controls">
        <div className="oc-searchbox oc-list-search"><Icon name="search" size={15} /><input value={q} placeholder={t.m.actSearch} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} aria-label={t.m.actSearch} /></div>
        <select className="oc-select" value={tone} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setTone(e.target.value)} aria-label={t.m.actAll}>
          <option value="all">{t.m.actAll}</option>
          <option value="ok">{t.m.actOk}</option>
          <option value="warn">{t.m.actWarn}</option>
          <option value="bad">{t.m.actBad}</option>
        </select>
        <button className="oc-btn ghost sm" onClick={exportCsv} disabled={!rows.length}><Icon name="download" size={14} /> {t.m.actExport}</button>
      </div>
      {rows.length ? (
        <Card title={t.m.actRecent} sub={rows.length + " " + t.m.actCount}>
          <ul className="oc-actlog">
            {rows.map((a, i: number) => (
              <li key={i}><span className={"oc-dot " + (a.tone || "ok")} /><div><b>{lang === "fa" ? a.fa : a.en}</b><span className="oc-muted">{a.time}{a.channel ? " · " + a.channel : ""}</span></div></li>
            ))}
          </ul>
        </Card>
      ) : <EmptyState label={ctx.activity.length ? t.m.actNoMatch : t.m.actEmpty} />}
    </div>
  );
}

export function ModelControlPlane({ t, lang }: ViewProps) {
  const dat = useData();
  const ctx = useCtx();
  const c = t.ai.mc;
  const editable = ctx.canMoney && !ctx.readOnly;
  const [moved, setMoved] = useState<Record<string, boolean>>({});
  const rows: any[] = [];
  dat.tenants.forEach((tn) => dat.aiControlServices.filter((s) => s.plans.includes(tn.plan)).forEach((s) => rows.push({ tenant: tn.name, svc: s.key, model: moved[tn.name] ? "economy" : defaultModel(tn, s.key) })));
  const total = rows.length || 1;
  const tierCount = (mdl: string) => rows.filter((r) => r.model === mdl).length;
  const over = dat.tenants.filter((tn) => !moved[tn.name] && aiUsageOf(tn).overrun);
  const spend = dat.tenants.reduce((a, tn) => a + aiUsageOf(tn).cost, 0);
  const mix = [
    { label: c.economy, pct: tierCount("economy"), color: "var(--green)" },
    { label: c.standard, pct: tierCount("standard"), color: "var(--mint)" },
    { label: c.premium, pct: tierCount("premium"), color: "var(--sand)" },
  ];
  const bulk = () => ctx.confirm({
    title: c.bulkTitle,
    body: <div className="oc-confirm-step"><b>{over.length} {c.tenants}</b><span className="oc-plan-why">{c.bulkBody}</span></div>,
    ok: c.bulkOk,
    onOk: () => { const names = over.map((x) => x.name); const prevMoved = moved; setMoved((p) => { const n = { ...p }; names.forEach((nm: string) => { n[nm] = true; }); return n; }); ctx.logActivity({ fa: names.length + " کسب‌وکارِ over-budget به مدلِ اقتصادی منتقل شد", en: names.length + " over-budget tenants moved to Economy", tone: "ok", channel: t.m.toTenant }); ctx.toast(c.bulkDone, () => setMoved(prevMoved)); },
  });
  return (
    <>
      <div className="oc-kpis four">
        <Kpi label={c.totalAssign} value={String(total)} />
        <Kpi label={c.economyShare} value={Math.round(tierCount("economy") / total * 100) + "%"} />
        <Kpi label={c.aiSpend} value={moneyK(spend)} />
        <Kpi label={c.overCount} value={String(over.length)} />
      </div>
      <div className="oc-grid two">
        <Card title={c.mixTitle}>
          <div className="oc-donut-wrap"><Donut data={mix} /><div className="oc-donut-legend">{mix.map((g, i) => <div key={i}><i style={{ background: g.color }} /><span>{g.label}</span><b>{Math.round(g.pct / total * 100)}%</b></div>)}</div></div>
        </Card>
        <Card title={c.perSvcTitle}>
          {dat.aiControlServices.map((s) => {
            const r = rows.filter((x) => x.svc === s.key); const tot = r.length || 1;
            const e = r.filter((x) => x.model === "economy").length, st = r.filter((x) => x.model === "standard").length, pr = r.filter((x) => x.model === "premium").length;
            return (
              <div className="oc-mc-svc" key={s.key}>
                <span className="oc-mc-svc-n">{lang === "fa" ? s.fa : s.en}</span>
                <div className="oc-mc-bar"><span style={{ width: e / tot * 100 + "%", background: "var(--green)" }} /><span style={{ width: st / tot * 100 + "%", background: "var(--mint)" }} /><span style={{ width: pr / tot * 100 + "%", background: "var(--sand)" }} /></div>
                <span className="oc-mc-svc-c">{r.length}</span>
              </div>
            );
          })}
        </Card>
      </div>
      <Card title={c.overTitle} right={editable && over.length ? <button className="oc-btn green sm" onClick={bulk}><Icon name="down" size={13} /> {c.bulkBtn}</button> : undefined}>
        {!editable && <div className="oc-note">{ctx.readOnly ? t.tn.ctrl.roView : t.tn.ctrl.roPerm}</div>}
        {over.length ? (
          <ul className="oc-mc-over">{over.map((x, i: number) => { const u = aiUsageOf(x); return (
            <li key={i}><span className="oc-ava sm">{x.name[0]}</span><div className="oc-mc-over-info"><b>{x.name}</b><span className="oc-muted">{c.aiCost}: {money(u.cost)} · {c.rev}: {money(x.mrr)}</span></div><span className="oc-chip-st bad">{c.over}</span></li>
          ); })}</ul>
        ) : <div className="oc-allok"><span className="oc-dot ok" /> {c.allInBudget}</div>}
      </Card>
    </>
  );
}

export function GatewayForm({ t, onSave }: { t: Dict; onSave: (d: any) => void }) {
  const { closeModal } = useCtx();
  const [name, setName] = useState("");
  const [kind, setKind] = useState("rial");
  return (
    <ModalShell title={t.set.gw.addTitle} footer={<><button className="oc-btn ghost" onClick={closeModal}>{t.m.cancel}</button><button className="oc-btn green" onClick={() => { if (name.trim()) onSave({ name: name.trim(), kind }); }}>{t.m.save}</button></>}>
      <Field label={t.set.gw.nameLbl}><input className="oc-input" value={name} placeholder={t.set.gw.namePh} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)} /></Field>
      <Field label={t.set.gw.kindLbl}><div className="oc-seg"><button className={"oc-seg-b" + (kind === "rial" ? " on" : "")} onClick={() => setKind("rial")}>{t.set.gw.rial}</button><button className={"oc-seg-b" + (kind === "crypto" ? " on" : "")} onClick={() => setKind("crypto")}>{t.set.gw.crypto}</button></div></Field>
    </ModalShell>
  );
}

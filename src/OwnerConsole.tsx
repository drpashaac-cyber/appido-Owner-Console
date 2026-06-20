import React, { useState, useEffect, useMemo, useCallback } from "react";
import { SEED_ACTIVITY, MockApi } from "./data";
import { nowHM, ROLES, PERMS, MONEY_ROLES } from "./lib";
import { Icon, useResource, ViewSkeleton, AppCtx, ModalShell, ErrorState } from "./core";
import { LoginGate, CommandPalette, NotifPanel, OwnerMenu } from "./shared";
import { apiEnabled, ownerAuth, isPlatformRole } from "./http";
import { CommandCenter, Businesses, Customers, Revenue } from "./run";
import { MarketIntel, Strategist, Diagnostics } from "./grow";
import { AIOps, Settings, AccessSecurity, Autopilot, Safety, Activity } from "./ops";
import { RTL, T } from "./i18n";
import type { Tenant, Api, AppData } from "./types";

// A promise that never settles — keeps the data resource idle until the owner is authenticated.
const neverResolve = <T,>(): Promise<T> => new Promise<T>(() => {});

export default function OwnerConsole({ api = MockApi }: { api?: Api } = {}) {
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try { const sv = localStorage.getItem("appido-theme"); if (sv === "dark" || sv === "light") return sv; return matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; } catch { return "light"; }
  });
  const [lang, setLang] = useState<"fa" | "en">(() => {
    try { return localStorage.getItem("appido-lang") === "en" ? "en" : "fa"; } catch { return "fa"; }
  });
  useEffect(() => {
    try {
      localStorage.setItem("appido-theme", theme);
      localStorage.setItem("appido-lang", lang);
      const h = document.documentElement;
      h.setAttribute("data-theme", theme);
      h.setAttribute("lang", lang);
      h.setAttribute("dir", lang === "fa" ? "rtl" : "ltr");
      h.style.background = theme === "dark" ? "#1A312B" : "#F4F1E6";
    } catch (e) { /* SSR or storage-blocked: no-op */ }
  }, [theme, lang]);
  const [view, setViewState] = useState("home");
  const [navOpen, setNavOpen] = useState(false);
  const [navCol, setNavCol] = useState<Record<string, boolean>>({});
  const [selTenant, setSelTenant] = useState<Tenant | null>(null);
  const [modal, setModal] = useState<React.ReactNode>(null);
  const [toasts, setToasts] = useState<{ id: number; msg: string; undo?: () => void }[]>([]);
  const live = apiEnabled();
  const [auth, setAuth] = useState<"checking" | "in" | "out">(live ? "checking" : "in");
  const [role, setRole] = useState("owner");
  const [imp, setImp] = useState<{ name: string } | null>(null);
  const [impLeft, setImpLeft] = useState(0);
  const [notifSeen, setNotifSeen] = useState(false);
  const [activity, setActivity] = useState<{ time?: string; fa: string; en: string; tone?: string; channel?: string }[]>(SEED_ACTIVITY);
  const logActivity = useCallback((e: { fa: string; en: string; tone?: string; channel?: string }) => setActivity((prev) => [{ time: nowHM(), ...e }, ...prev].slice(0, 60)), []);
  const t = T[lang];
  const dir = RTL.has(lang) ? "rtl" : "ltr";
  const can = useCallback((v: string) => (PERMS[role] && PERMS[role][v]) || "none", [role]);
  const canMoney = MONEY_ROLES.has(role);
  const closeModal = useCallback(() => setModal(null), []);
  const openModal = useCallback((node: React.ReactNode) => setModal(node), []);
  const toast = useCallback((msg: string, undo?: () => void) => { const id = Date.now() + Math.random(); setToasts((ts) => [...ts, { id, msg, undo }]); setTimeout(() => setToasts((ts) => ts.filter((x) => x.id !== id)), 2600); }, []);
  const appRes = useResource(() => (auth === "in" ? api.data() : neverResolve<AppData>()), [auth]);
  // Live: confirm an existing owner session on load (or show the login gate).
  useEffect(() => {
    if (!live) return;
    let alive = true;
    ownerAuth.me()
      .then((me) => { if (!alive) return; if (isPlatformRole(me.role)) { setRole(me.role || "owner"); setAuth("in"); } else { setAuth("out"); } })
      .catch(() => { if (alive) setAuth("out"); });
    return () => { alive = false; };
  }, [live]);
  const navigate = useCallback((v: string) => { setViewState(v); setNavOpen(false); }, []);
  const setView = useCallback((v: string) => { if (v !== "tenants") setSelTenant(null); setViewState(v); setNavOpen(false); }, []);
  const signOut = useCallback(() => { if (live) ownerAuth.logout().catch(() => {}); setAuth("out"); setNavOpen(false); setModal(null); setRole("owner"); setViewState("home"); }, [live]);
  const startImpersonate = useCallback((name: string) => { setImp({ name }); setImpLeft(300); logActivity({ fa: "نمای «به‌عنوانِ " + name + "» آغاز شد — فقط‌خواندنی", en: "Started viewing as " + name + " — read-only", tone: "ok", channel: t.m.actTag }); toast(t.m.viewLogged); }, [t, logActivity, toast]);
  const stopImpersonate = useCallback(() => { setImp(null); setImpLeft(0); }, []);
  const confirm = useCallback(({ title, body, ok, tone, onOk }: { title: React.ReactNode; body: React.ReactNode; ok: React.ReactNode; tone?: string; onOk: () => void }) => openModal(
    <ModalShell title={title} footer={<><button className="oc-btn ghost" onClick={closeModal}>{t.m.cancel}</button><button className={"oc-btn " + (tone === "bad" ? "bad" : "green")} onClick={() => { onOk && onOk(); closeModal(); }}>{ok || t.m.confirm}</button></>}>
      {typeof body === "string" ? <p className="oc-modal-txt">{body}</p> : body}
    </ModalShell>
  ), [t, openModal, closeModal]);
  const ctx = useMemo(() => ({ t, lang, navigate, openModal, closeModal, toast, confirm, selTenant, setSelTenant, role, can, canMoney, signOut, startImpersonate, activity, logActivity, readOnly: !!imp, data: appRes.data, api }), [t, lang, navigate, openModal, closeModal, toast, confirm, selTenant, role, can, canMoney, signOut, startImpersonate, activity, logActivity, imp, appRes.data]);
  useEffect(() => {
    if (!modal) return;
    const prev: Element | null = typeof document !== "undefined" ? document.activeElement : null;
    const onKey = (e: React.KeyboardEvent) => { if (e.key === "Escape") closeModal(); };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); if (prev && prev.focus) prev.focus(); };
  }, [modal]);
  useEffect(() => {
    if (!imp) return;
    if (impLeft <= 0) { setImp(null); return; }
    const id = setTimeout(() => setImpLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [imp, impLeft]);
  const NAV = [
    { g: "run", items: [["home", "home"], ["tenants", "tenants"], ["customers", "customers"], ["revenue", "revenue"]] },
    { g: "grow", items: [["intel", "intel"], ["strategist", "strategist"], ["diagnostics", "diagnostics"]] },
    { g: "ops", items: [["activity", "activity"], ["aiops", "aiops"], ["autopilot", "autopilot"], ["safety", "safety"], ["settings", "settings"], ["access", "access"]] },
  ];
  const flatNav = NAV.flatMap((g) => g.items.map((it) => it[0])).filter((id) => can(id) !== "none");
  const views: Record<string, React.ReactNode> = useMemo(() => ({
    home: <CommandCenter t={t} lang={lang} />, tenants: <Businesses t={t} lang={lang} />, customers: <Customers t={t} lang={lang} />,
    revenue: <Revenue t={t} lang={lang} />, intel: <MarketIntel t={t} lang={lang} />, strategist: <Strategist t={t} lang={lang} />,
    diagnostics: <Diagnostics t={t} lang={lang} />, autopilot: <Autopilot t={t} lang={lang} />, safety: <Safety t={t} lang={lang} />,
    aiops: <AIOps t={t} lang={lang} />, settings: <Settings t={t} lang={lang} />, access: <AccessSecurity t={t} lang={lang} />, activity: <Activity t={t} lang={lang} />,
  }), [t, lang]);
  useEffect(() => {
    try { const h = (window.location.hash || "").replace(/^#\/?(owner\/)?/, ""); if (h && (views as any)[h] && can(h) !== "none") setViewState(h); } catch (e) {}
  }, []);
  useEffect(() => { try { window.history.replaceState(null, "", "#/owner/" + view); } catch (e) {} }, [view]);
  const cur = can(view) !== "none" ? view : "home";
  if (auth === "checking") return (
    <div className="oc" dir={dir} data-theme={theme}>
      <div className="oc-login"><div className="oc-login-card">
        <div className="oc-login-brand"><span className="oc-logo-mark"><Icon name="spark" size={20} /></span><b>Appido</b></div>
        <p className="oc-login-sent" style={{ marginTop: 16 }}>…</p>
      </div></div>
    </div>
  );
  if (auth !== "in") return (
    <div className="oc" dir={dir} data-theme={theme}><LoginGate t={t} live={live} auth={ownerAuth} onAuthed={(me) => { setRole(me.role); setAuth("in"); }} /></div>
  );
  return (
    <AppCtx.Provider value={ctx}>
      <div className="oc" dir={dir} data-theme={theme}>
        
        {navOpen && <div className="oc-nav-scrim" onClick={() => setNavOpen(false)} />}
        <aside className={"oc-side" + (navOpen ? " open" : "")}>
          <div className="oc-logo"><span className="oc-logo-mark"><Icon name="spark" size={18} /></span><div><b>{t.brand}</b><span>{t.role}</span></div></div>
          <nav className="oc-nav">
            {NAV.map((grp, gi) => {
              const items = grp.items.filter(([id]) => can(id) !== "none");
              if (!items.length) return null;
              const col = navCol[grp.g] && !items.some(([id]) => id === view);
              return (
                <div className="oc-navgrp" key={gi}>
                  <button className="oc-navgrp-t" onClick={() => setNavCol((c) => ({ ...c, [grp.g]: !c[grp.g] }))} aria-expanded={!col}><span>{t.groups[grp.g]}</span><span className={"oc-navgrp-chev" + (col ? " col" : "")}><Icon name="down" size={13} /></span></button>
                  {!col && items.map(([id, icon]) => <button key={id} className={"oc-navitem" + (view === id ? " on" : "")} onClick={() => { setView(id); setNavOpen(false); }}><Icon name={icon} size={18} /><span>{t.nav[id]}</span></button>)}
                </div>
              );
            })}
          </nav>
        </aside>
        <div className="oc-main">
          {imp && <div className="oc-impbar"><Icon name="customers" size={15} /> {t.m.viewingAsBar} {imp.name} · {lang === "fa" ? "فقط‌خواندنی" : "read-only"}<span className="oc-imp-time">{Math.floor(impLeft / 60)}:{String(impLeft % 60).padStart(2, "0")}</span><button onClick={stopImpersonate}>{t.m.exitView}</button></div>}
          <header className="oc-top">
            <button className="oc-iconbtn oc-burger" onClick={() => setNavOpen(true)} aria-label="menu"><Icon name="menu" size={18} /></button>
            <button className="oc-searchbox" onClick={() => openModal(<CommandPalette t={t} lang={lang} nav={flatNav} />)}><Icon name="search" size={16} /><span className="oc-search-ph">{t.search}</span></button>
            <div className="oc-top-actions">
              <label className="oc-roleswitch"><span>{t.acc.viewingAs}</span><select value={role} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setRole(e.target.value); setView("home"); }}>{ROLES.map((r) => <option key={r} value={r}>{t.acc.roleNames[r]}</option>)}</select></label>
              <button className="oc-iconbtn" onClick={() => setLang(lang === "fa" ? "en" : "fa")} aria-label="language"><Icon name="globe" size={18} /><span className="oc-lang">{lang.toUpperCase()}</span></button>
              <button className="oc-iconbtn" onClick={() => setTheme(theme === "light" ? "dark" : "light")} aria-label="theme"><Icon name={theme === "light" ? "moon" : "sun"} size={18} /></button>
              <button className="oc-iconbtn" aria-label="alerts" onClick={() => openModal(<NotifPanel t={t} lang={lang} onSeen={() => setNotifSeen(true)} />)}><Icon name="bell" size={18} />{!notifSeen && <span className="oc-badge-dot" />}</button>
              <button className="oc-owner" onClick={() => openModal(<OwnerMenu t={t} />)} aria-label="account"><span className="oc-ava">O</span></button>
            </div>
          </header>
          <main className="oc-content">{appRes.loading ? <ViewSkeleton view={cur} /> : appRes.error ? <div className="oc-view"><ErrorState label={t.m.loadErr} retry={t.m.retry} onRetry={appRes.retry} /></div> : views[cur]}</main>
        </div>
        {modal && <div className="oc-scrim" onClick={closeModal}><div className="oc-modal-wrap">{modal}</div></div>}
        <div className="oc-toasts">{toasts.map((x) => <div className="oc-toast" key={x.id}><Icon name="check" size={15} /> {x.msg}{x.undo && <button className="oc-toast-undo" onClick={() => { x.undo(); setToasts((ts) => ts.filter((y) => y.id !== x.id)); }}>{t.m.undo}</button>}</div>)}</div>
      </div>
    </AppCtx.Provider>
  );
}

/* --------------------------------- CSS ------------------------------------ */

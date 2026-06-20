import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { fmt } from "./lib";
import type { Lang, ChartDatum, HeatCol, HeatRow, AppData } from "./types";

export const P: Record<string, string> = {
  home: "M3 11l9-8 9 8M5 9.5V21h14V9.5", tenants: "M3 21V7l6-4 6 4v14M9 21v-5h2v5M15 11h3v10",
  customers: "M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8", revenue: "M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6",
  intel: "M3 17l5-5 4 4 8-9M14 7h7v7", strategist: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4",
  diagnostics: "M22 12h-4l-3 9L9 3l-3 9H2", autopilot: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
  safety: "M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6l8-4z", settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a7 7 0 0 0-1.7-1l-.4-2.6h-4l-.4 2.6a7 7 0 0 0-1.7 1l-2.4-1-2 3.4 2 1.6a7 7 0 0 0 0 2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7 7 0 0 0 1.7-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1z",
  sun: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
  moon: "M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z", globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.7 2.5 15.3 0 18M12 3c-2.5 2.7-2.5 15.3 0 18",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3", up: "M12 19V5M5 12l7-7 7 7", down: "M12 5v14M19 12l-7 7-7-7",
  close: "M18 6 6 18M6 6l12 12", bell: "M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  lock: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4", spark: "M12 2v6M12 16v6M2 12h6M16 12h6M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3",
  back: "M15 18l-6-6 6-6", msg: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z", target: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  edit: "M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.1 2.1 0 0 1 3 3L12 15l-4 1 1-4z", plus: "M12 5v14M5 12h14",
  alert: "M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0zM12 9v4M12 17h.01",
  check: "M20 6 9 17l-5-5", users: "M17 21v-2a4 4 0 0 0-3-3.9M9 21v-2a4 4 0 0 1 3-3.9M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M19 8a3 3 0 0 1 0 6",
  menu: "M3 6h18M3 12h18M3 18h18", send: "M22 2 11 13M22 2l-7 20-4-9-9-4z", trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  aiops: "M3 12h4l3 8 4-16 3 8h4", download: "M12 3v12m0 0l-4-4m4 4l4-4M5 21h14", activity: "M12 7v5l3 2M21 12a9 9 0 11-18 0 9 9 0 0118 0",
  access: "M10 13a4 4 0 1 1 2.83-1.17L21 20l-2 2-2-2-2 2-1.5-1.5", key: "M10 13a4 4 0 1 1 2.83-1.17L21 20l-2 2-2-2-2 2-1.5-1.5",
};

export function Icon({ name, size = 18 }: { name: string; size?: number }) {
  return <svg className={"oc-ic-" + name} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={P[name]} /></svg>;
}

/* ------------------------------ chart bits -------------------------------- */

export function _Donut({ data, size = 124 }: { data: ChartDatum[]; size?: number }) {
  const total = data.reduce((s, d) => s + (d.pct ?? 0), 0) || 1;
  const r = size / 2 - 11, c = 2 * Math.PI * r; let off = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="distribution chart">
      <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
        {data.map((d, i: number) => { const len = ((d.pct ?? 0) / total) * c; const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={d.color} strokeWidth="11" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-off} />; off += len; return el; })}
      </g>
    </svg>
  );
}

export const Donut = React.memo(_Donut);

export function _BarsH({ data, lang, accent = "var(--green)" }: { data: ChartDatum[]; lang: Lang; accent?: string }) {
  const m = Math.max(...data.map((d) => d.pct ?? d.v ?? 0)) || 1;
  return (
    <div className="oc-bars">
      {data.map((d, i: number) => {
        const v = d.pct ?? d.v ?? 0;
        return (
          <div className="oc-bar-row" key={i}>
            <span className="oc-bar-lbl">{d[lang] ?? d.label ?? d.fa}</span>
            <span className="oc-bar-track"><span className="oc-bar-fill" style={{ width: `${(v / m) * 100}%`, background: d.color || accent }} /></span>
            <span className="oc-bar-val">{d.pct != null ? v + "%" : fmt(v)}</span>
          </div>
        );
      })}
    </div>
  );
}

export const BarsH = React.memo(_BarsH);

export function _AreaLine({ a, b, h = 150 }: { a: number[]; b: number[]; h?: number }) {
  const w = 560, pad = 6, all = [...a, ...(b || [])], max = Math.max(...all), min = Math.min(...all);
  const norm = (s: number[]) => s.map((v, i) => [pad + (i / (s.length - 1)) * (w - pad * 2), pad + (1 - (v - min) / (max - min || 1)) * (h - pad * 2)]);
  const line = (pts: number[][]) => pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1)).join(" ");
  const A = norm(a), B = b ? norm(b) : null;
  return (
    <svg width="100%" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="oc-area" role="img" aria-label="trend chart">
      <defs><linearGradient id="ocg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--green)" stopOpacity="0.28" /><stop offset="100%" stopColor="var(--green)" stopOpacity="0" /></linearGradient></defs>
      <path d={`${line(A)} L ${A[A.length - 1][0].toFixed(1)} ${h - pad} L ${A[0][0].toFixed(1)} ${h - pad} Z`} fill="url(#ocg)" />
      {B && <path d={line(B)} fill="none" stroke="var(--sand)" strokeWidth="2" strokeDasharray="5 4" />}
      <path d={line(A)} fill="none" stroke="var(--green)" strokeWidth="2.5" />
    </svg>
  );
}

export const AreaLine = React.memo(_AreaLine);

export function _Heat({ cols, rows, lang }: { cols: HeatCol[]; rows: HeatRow[]; lang: Lang }) {
  const col = (v: number) => v >= 8 ? "var(--green)" : v >= 6 ? "var(--mint)" : v >= 4 ? "var(--sand)" : "var(--surface-2)";
  return (
    <div className="oc-heat">
      <div className="oc-heat-row oc-heat-head"><span />{cols.map((c, i) => <span key={i} className="oc-heat-h">{c[lang] ?? c.en}</span>)}</div>
      {rows.map((row, i) => (
        <div className="oc-heat-row" key={i}><span className="oc-heat-rl">{row[lang] ?? row.en}</span>{row.v.map((v, j) => <span key={j} className="oc-heat-cell" style={{ background: col(v) }}>{v}</span>)}</div>
      ))}
    </div>
  );
}

export const Heat = React.memo(_Heat);

export function _Spark({ data }: { data: number[] }) {
  const w = 120, h = 26, max = Math.max(...data), min = Math.min(...data);
  const pts = data.map((v: number, i: number) => `${((i / (data.length - 1)) * w).toFixed(1)} ${(h - ((v - min) / (max - min || 1)) * (h - 4) - 2).toFixed(1)}`);
  return <svg className="oc-spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" role="img" aria-label="sparkline"><polyline points={pts.join(" ")} fill="none" stroke="var(--green)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export const Spark = React.memo(_Spark);

export function _Radar({ traits, lang }: { traits: ChartDatum[]; lang: Lang }) {
  const size = 200, cx = size / 2, cy = size / 2, R = 72, n = traits.length;
  const pt = (i: number, r: number) => { const ang = -Math.PI / 2 + (i / n) * 2 * Math.PI; return [cx + r * Math.cos(ang), cy + r * Math.sin(ang)]; };
  const grid = [0.25, 0.5, 0.75, 1].map((g) => traits.map((_, i: number) => pt(i, R * g).join(",")).join(" "));
  const poly = traits.map((t, i: number) => pt(i, R * ((t.v ?? 0) / 100)).join(",")).join(" ");
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="oc-radar" role="img" aria-label="personality profile chart">
      {grid.map((g, i) => <polygon key={i} points={g} fill="none" stroke="var(--line)" strokeWidth="1" />)}
      {traits.map((_, i: number) => { const e = pt(i, R); return <line key={i} x1={cx} y1={cy} x2={e[0]} y2={e[1]} stroke="var(--line)" strokeWidth="1" />; })}
      <polygon points={poly} fill="color-mix(in srgb,var(--green) 26%,transparent)" stroke="var(--green)" strokeWidth="2" />
      {traits.map((t, i: number) => { const e = pt(i, R + 16); return <text key={i} x={e[0]} y={e[1]} fontSize="9.5" fill="var(--muted)" textAnchor="middle" dominantBaseline="middle">{((t[lang] ?? t.en) || "").split(" ")[0]}</text>; })}
    </svg>
  );
}

export const Radar = React.memo(_Radar);

/* ------------------------------ primitives -------------------------------- */

export function _Kpi({ label, value, delta, up, spark }: { label: React.ReactNode; value: React.ReactNode; delta?: number; up?: boolean; spark?: number[] }) {
  return (
    <div className="oc-kpi">
      <div className="oc-kpi-top"><span className="oc-kpi-lbl">{label}</span>
        {delta != null && <span className={"oc-kpi-d " + (up ? "up" : "dn")}><Icon name={up ? "up" : "down"} size={12} />{Math.abs(delta)}%</span>}
      </div>
      <div className="oc-kpi-val">{value}</div>
      {spark && <Spark data={spark} />}
    </div>
  );
}

export const Kpi = React.memo(_Kpi);

export function Card({ title, sub, right, children, span }: { title?: React.ReactNode; sub?: React.ReactNode; right?: React.ReactNode; children: React.ReactNode; span?: number }) {
  return (
    <section className={"oc-card" + (span ? " span" + span : "")}>
      {(title || right) && <header className="oc-card-h"><div><h3>{title}</h3>{sub && <p>{sub}</p>}</div>{right}</header>}
      {children}
    </section>
  );
}

export const planMeta: Record<string, { fa: string; en: string; cls: string }> = { free: { fa: "رایگان", en: "Free", cls: "free" }, start: { fa: "Start", en: "Start", cls: "start" }, pro: { fa: "Pro", en: "Pro", cls: "pro" } };

export const PlanTag = ({ p, lang }: { p: string; lang: Lang }) => <span className={"oc-plan " + planMeta[p].cls}>{planMeta[p][lang] ?? planMeta[p].en}</span>;

export function Health({ v }: { v: number }) {
  const cls = v >= 75 ? "ok" : v >= 50 ? "mid" : "bad";
  return <span className="oc-health"><span className="oc-health-bar"><span className={"oc-health-fill " + cls} style={{ width: v + "%" }} /></span><span className="oc-health-n">{v}</span></span>;
}

export const sevCls = (s: string) => (s === "high" ? "bad" : s === "med" ? "mid" : "ok");

export const PageHead = ({ title, sub, tag }: { title: React.ReactNode; sub?: React.ReactNode; tag?: React.ReactNode }) => (
  <div className="oc-pagehead"><div className="oc-ph-row"><h1>{title}</h1>{tag && <span className="oc-sectag">{tag}</span>}</div><p>{sub}</p></div>
);

/* --------------------- app context · modal · forms ------------------------ */

export const AppCtx = React.createContext<any>(null);

export const useCtx = () => React.useContext(AppCtx);

export function ModalShell({ title, children, footer }: { title: React.ReactNode; children: React.ReactNode; footer?: React.ReactNode }) {
  const { closeModal } = useCtx();
  const ref = useRef<any>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const f = el.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])');
    (f[0] || el).focus();
  }, []);
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== "Tab") return;
    const el = ref.current; if (!el) return;
    const f = (Array.from(el.querySelectorAll('button,[href],input,select,textarea,[tabindex]:not([tabindex="-1"])')) as any[]).filter((x) => !x.disabled);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  };
  return (
    <div ref={ref} className="oc-modal" role="dialog" aria-modal="true" tabIndex={-1} onKeyDown={onKeyDown} onClick={(e: React.MouseEvent) => e.stopPropagation()}>
      <header className="oc-modal-h"><h3>{title}</h3><button className="oc-iconbtn sm" onClick={closeModal} aria-label="close"><Icon name="close" size={16} /></button></header>
      <div className="oc-modal-body">{children}</div>
      {footer && <footer className="oc-modal-foot">{footer}</footer>}
    </div>
  );
}

export function Field({ label, children }: { label: React.ReactNode; children: React.ReactNode }) {
  return <label className="oc-field"><span>{label}</span>{children}</label>;
}

export function EmptyState({ label }: { label: React.ReactNode }) {
  return <div className="oc-empty"><Icon name="search" size={20} /><span>{label}</span></div>;
}

export function ErrorState({ label, retry, onRetry }: { label: React.ReactNode; retry?: React.ReactNode; onRetry?: () => void }) {
  return <div className="oc-empty err"><Icon name="alert" size={20} /><span>{label}</span>{onRetry && <button className="oc-btn ghost sm" onClick={onRetry}>{retry}</button>}</div>;
}

/* ------------------------ loading / data seam (#4) ------------------------- */

export function useResource<T>(fetcher: () => Promise<T>, deps: React.DependencyList = []) {
  const [st, setSt] = useState<{ loading: boolean; error: Error | null; data: T | null }>({ loading: true, error: null, data: null });
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    let alive = true;
    setSt((p) => ({ ...p, loading: true, error: null }));
    fetcher()
      .then((d) => { if (alive) setSt({ loading: false, error: null, data: d }); })
      .catch((e) => { if (alive) setSt({ loading: false, error: e instanceof Error ? e : new Error(String(e)), data: null }); });
    return () => { alive = false; };
    // deps intentionally spread; nonce drives retry
  }, [...deps, nonce]);
  return { loading: st.loading, error: st.error, data: st.data, retry: () => setNonce((n) => n + 1) };
}
// typed access to the app dataset fetched by the shell (non-null once views render, gated by the shell)

export const useData = (): AppData => useCtx().data as AppData;

export function Skeleton({ w = "100%", h = 14, r = 8, mb = 0 }: { w?: number | string; h?: number | string; r?: number; mb?: number }) {
  return <span className="oc-sk" style={{ width: w, height: h, borderRadius: r, marginBottom: mb }} aria-hidden="true" />;
}

export function SkeletonDash() {
  return (
    <div className="oc-view" aria-busy="true">
      <Skeleton w="38%" h={26} mb={8} /><Skeleton w="58%" h={13} mb={22} />
      <div className="oc-kpis four">{[0, 1, 2, 3].map((i) => <div className="oc-kpi" key={i}><Skeleton w="55%" h={11} mb={12} /><Skeleton w="72%" h={22} /></div>)}</div>
      <div className="oc-grid two" style={{ marginTop: 16 }}>{[0, 1].map((i) => <div className="oc-card" key={i}><Skeleton w="34%" h={14} mb={18} /><Skeleton h={150} r={12} /></div>)}</div>
    </div>
  );
}

export function SkeletonTable({ rows = 8 }: { rows?: number }) {
  return <div className="oc-table-wrap" aria-busy="true">{Array.from({ length: rows }).map((_, i) => <div className="oc-sk-row" key={i}><Skeleton w={32} h={32} r={9} /><Skeleton w="24%" h={13} /><Skeleton w="13%" h={13} /><Skeleton w="15%" h={13} /><Skeleton w="11%" h={13} /></div>)}</div>;
}

export function SkeletonPage() {
  return (
    <div className="oc-view" aria-busy="true">
      <Skeleton w="34%" h={24} mb={8} /><Skeleton w="52%" h={13} mb={22} />
      <div className="oc-grid two">{[0, 1, 2, 3].map((i) => <div className="oc-card" key={i}><Skeleton w="40%" h={14} mb={16} /><Skeleton h={90} r={10} mb={10} /><Skeleton w="80%" h={12} /></div>)}</div>
    </div>
  );
}

export function ViewSkeleton({ view }: { view: string }) {
  if (view === "home") return <SkeletonDash />;
  if (view === "tenants" || view === "access") return <div className="oc-view" aria-busy="true"><Skeleton w="34%" h={24} mb={8} /><Skeleton w="52%" h={13} mb={22} /><SkeletonTable rows={8} /></div>;
  return <SkeletonPage />;
}

export function TypeToConfirm({ title, body, match, hint, ok, onOk }: { title: React.ReactNode; body: React.ReactNode; match: string; hint: React.ReactNode; ok: React.ReactNode; onOk: () => void }) {
  const { closeModal, t } = useCtx();
  const [val, setVal] = useState("");
  const armed = val.trim() === match;
  return (
    <ModalShell title={title} footer={<><button className="oc-btn ghost" onClick={closeModal}>{t.m.cancel}</button><button className="oc-btn bad" disabled={!armed} onClick={() => { if (armed) { onOk(); closeModal(); } }}>{ok}</button></>}>
      {typeof body === "string" ? <p>{body}</p> : body}
      <Field label={hint}><input className="oc-input" value={val} placeholder={match} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVal(e.target.value)} autoFocus /></Field>
    </ModalShell>
  );
}
/* -------------------------------- views ----------------------------------- */

export function Toggle({ on, set }: { on: boolean; set: () => void }) { return <button className={"oc-toggle" + (on ? " on" : "")} onClick={set} role="switch" aria-checked={on}><span /></button>; }

export function SendBtn({ akey, title, body, label, doneLabel, channel, fa, en, cls = "", icon = 14 }: { akey: string; title: React.ReactNode; body: React.ReactNode; label: React.ReactNode; doneLabel: React.ReactNode; channel?: string; fa: string; en: string; cls?: string; icon?: number }) {
  const ctx = useCtx();
  if (ctx.activity.some((a) => a.key === akey)) return <span className={"oc-btn ghost sm oc-done " + cls}><Icon name="check" size={13} /> {doneLabel}</span>;
  return <button className={"oc-btn green sm " + cls} onClick={() => ctx.confirm({ title, body, ok: label, onOk: () => { ctx.logActivity({ key: akey, fa, en, tone: "ok", channel }); ctx.toast(doneLabel); } })}><Icon name="send" size={icon} /> {label}</button>;
}

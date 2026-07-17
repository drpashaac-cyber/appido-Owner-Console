import React, { useState, useEffect } from "react";
import { OWNER_EMAIL } from "./data";
import { botChatsOf, chatsOf } from "./lib";
import { Icon, useData, useCtx, ModalShell, Field } from "./core";
import { isPlatformRole } from "./http";
import type { Lang, Dict, ChatMsg, Tenant } from "./types";

type OwnerAuthFns = {
  ensureCsrf: () => Promise<unknown>;
  loginPassword: (email: string, password: string) => Promise<{ ok: true; next?: string }>;
  loginStart: (email: string) => Promise<unknown>;
  loginCode: (email: string, code: string) => Promise<unknown>;
  logout: () => Promise<unknown>;
  me: () => Promise<{ name?: string; email?: string; role?: string }>;
};
type AuthedMe = { role: string; name: string; email: string };

export function LoginGate({ t, live, auth, onAuthed }: { t: Dict; live?: boolean; auth?: OwnerAuthFns; onAuthed: (me: AuthedMe) => void }) {
  const L = t.acc.login;
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [code, setCode] = useState("");
  const [via, setVia] = useState("code");
  const [cool, setCool] = useState(0);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  useEffect(() => { if (cool <= 0) return; const id = setTimeout(() => setCool(cool - 1), 1000); return () => clearTimeout(id); }, [cool]);

  // After a session is established, confirm the account may use the owner console.
  const finish = async () => {
    if (!auth) return;
    const me = await auth.me();
    if (!isPlatformRole(me.role)) { setErr(L.notOwner); try { await auth.logout(); } catch { /* ignore */ } setBusy(false); return; }
    onAuthed({ role: me.role || "owner", name: me.name || "Owner", email: me.email || email });
  };
  const guard = async (fn: () => Promise<void>) => {
    setErr(""); setBusy(true);
    try { await fn(); } catch { setErr(L.err); setBusy(false); }
  };

  const toCode = (mode: string) => {
    if (live && auth) { guard(async () => { await auth.ensureCsrf(); if (mode === "code") await auth.loginStart(email); setVia(mode); setCool(30); setStep("code"); setBusy(false); }); }
    else { setVia(mode); setCool(30); setStep("code"); }
  };
  const doPassword = () => {
    if (live && auth) { guard(async () => { await auth.ensureCsrf(); const r = await auth.loginPassword(email, pwd); if (r?.next === "twofa") { setVia("password"); setCool(30); setStep("code"); setBusy(false); } else { await finish(); } }); }
    else { setVia("password"); setCool(30); setStep("code"); }
  };
  const doVerify = () => {
    if (live && auth) { guard(async () => { await auth.loginCode(email, code.trim()); await finish(); }); }
    else { onAuthed({ role: "owner", name: "Owner", email: email || "owner@appido.io" }); }
  };
  const resend = () => {
    setCode("");
    if (live && auth && via === "code") { guard(async () => { await auth.loginStart(email); setCool(30); setBusy(false); }); }
    else { setCool(30); }
  };

  return (
    <div className="oc-login">
      <div className="oc-login-card">
        <div className="oc-login-brand"><span className="oc-logo-mark"><Icon name="spark" size={20} /></span><b>Appido</b></div>
        <span className="oc-login-url">{L.brand}</span>
        <h2>{L.title}</h2>
        {step === "email" && (
          <>
            <Field label={L.emailLbl}><input className="oc-input" type="email" value={email} placeholder={L.emailPh} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} /></Field>
            <button className="oc-btn green oc-login-btn" disabled={!email} onClick={() => { setErr(""); setStep("pick"); }}>{L.cont}</button>
          </>
        )}
        {step === "pick" && (
          <>
            <p className="oc-login-sub">{L.pickTitle}</p>
            <div className="oc-login-methods">
              <button className="oc-login-method" disabled={busy} onClick={() => { setErr(""); setStep("password"); }}><Icon name="key" size={18} /><span>{L.withPass}</span></button>
              <button className="oc-login-method" disabled={busy} onClick={() => toCode("code")}><Icon name="send" size={18} /><span>{L.withCode}</span></button>
            </div>
            <button className="oc-login-back" onClick={() => setStep("email")}><Icon name="back" size={14} /> {L.back}</button>
          </>
        )}
        {step === "password" && (
          <>
            <Field label={L.pwdLbl}>
              <div style={{ position: "relative" }}>
                <input className="oc-input" type={showPwd ? "text" : "password"} value={pwd} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPwd(e.target.value)} style={{ paddingInlineEnd: 38 }} />
                <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ position: "absolute", insetInlineEnd: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, color: "inherit", opacity: 0.6 }}>
                  {showPwd ? <Icon name="eye-off" size={16} /> : <Icon name="eye" size={16} />}
                </button>
              </div>
            </Field>
            <button className="oc-btn green oc-login-btn" disabled={!pwd || busy} onClick={doPassword}>{L.signin}</button>
            <button type="button" style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "inherit", opacity: 0.65, marginTop: 4, padding: 0 }} onClick={() => { if (live && auth) { guard(async () => { await auth.ensureCsrf(); await auth.loginStart(email); setVia("code"); setCool(30); setStep("code"); setBusy(false); }); } else { setVia("code"); setCool(30); setStep("code"); } }}>Forgot password?</button>
            <button className="oc-login-back" onClick={() => setStep("pick")}><Icon name="back" size={14} /> {L.back}</button>
          </>
        )}
        {step === "code" && (
          <>
            <p className="oc-login-sent">{L.sent}</p>
            <Field label={via === "password" ? L.code2faLbl : L.codeLbl}><input className="oc-input oc-code-input" inputMode="numeric" maxLength={6} placeholder="······" value={code} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCode(e.target.value.replace(/\D/g, ""))} /></Field>
            <button className="oc-btn green oc-login-btn" disabled={busy || code.trim().length < 6} onClick={doVerify}><Icon name="lock" size={15} /> {L.verify}</button>
            <button className="oc-login-resend" disabled={cool > 0 || busy} onClick={resend}>{cool > 0 ? L.resendIn + " " + cool : L.resend}</button>
            <button className="oc-login-back" onClick={() => setStep("pick")}><Icon name="back" size={14} /> {L.back}</button>
          </>
        )}
        {err ? <p style={{ margin: "8px 0 0", fontSize: 12, fontWeight: 600, color: "#c0392b" }}>{err}</p> : null}
        <p className="oc-login-note">{L.only}</p>
        {!live ? <p className="oc-login-demo">{L.demoNote}</p> : null}
      </div>
    </div>
  );
}

/* -------------------------------- shell ----------------------------------- */

export function CommandPalette({ t, lang, nav }: { t: Dict; lang: Lang; nav: string[] }) {
  const dat = useData();
  const ctx = useCtx();
  const [q, setQ] = useState("");
  const ql = q.trim().toLowerCase();
  const pages = nav.filter((n) => !ql || (t.nav[n] || "").toLowerCase().includes(ql) || n.includes(ql));
  const biz = dat.tenants.filter((b) => !ql || b.name.toLowerCase().includes(ql) || b.handle.toLowerCase().includes(ql));
  return (
    <ModalShell title={t.search}>
      <input className="oc-input" autoFocus placeholder={t.m.paletteHint} value={q} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQ(e.target.value)} />
      <div className="oc-palette">
        {pages.length > 0 && <div className="oc-palette-sec">{t.m.pages}</div>}
        {pages.map((n) => <button className="oc-palette-row" key={n} onClick={() => { ctx.navigate(n); ctx.closeModal(); }}><Icon name={n} size={15} /><span>{t.nav[n]}</span></button>)}
        {biz.length > 0 && <div className="oc-palette-sec">{t.tn.title}</div>}
        {biz.map((b) => <button className="oc-palette-row" key={b.handle} onClick={() => { ctx.setSelTenant(b); ctx.navigate("tenants"); ctx.closeModal(); }}><span className="oc-ava sm">{b.name[0]}</span><span>{b.name}</span><span className="oc-palette-h">{b.handle}</span></button>)}
        {pages.length === 0 && biz.length === 0 && <p className="oc-palette-empty">{t.m.noResults}</p>}
      </div>
    </ModalShell>
  );
}

export function ChatPanel({ t, lang, tenant, kind = "dashboard" }: { t: Dict; lang: Lang; tenant: Tenant; kind?: string }) {
  const ctx = useCtx();
  const [extra, setExtra] = useState<ChatMsg[]>([]);
  const [text, setText] = useState("");
  const [taken, setTaken] = useState(false);
  const send = () => {
    const v = text.trim(); if (!v) return;
    setExtra([...extra, { me: true, op: true, fa: v, en: v }]);
    if (!taken) { setTaken(true); ctx.logActivity({ fa: "اپراتور گفتگوی هوشِ مصنوعی با «" + tenant.name + "» را به‌دست گرفت", en: "Operator took over the AI chat with " + tenant.name, tone: "ok", channel: t.m.toTenant }); }
    setText("");
  };
  const msgs = [...(kind === "customer" ? botChatsOf(tenant, lang) : chatsOf(tenant, lang)), ...extra];
  return (
    <div className="oc-chatpanel">
      {taken && <div className="oc-takeover"><Icon name="msg" size={13} /> {t.tn.takeover}</div>}
      <div className="oc-chat">{msgs.map((m, i: number) => <div key={i} className={"oc-bubble " + (m.me ? "me" : "ai") + (m.op ? " op" : "")}>{!m.me && <span className="oc-bubble-tag"><Icon name="spark" size={11} /> AI</span>}{m.op && <span className="oc-bubble-tag op">{t.tn.youTag}</span>}{lang === "fa" ? m.fa : m.en}</div>)}</div>
      {ctx.readOnly
        ? <div className="oc-note"><Icon name="lock" size={13} /> {t.tn.ctrl.roView}</div>
        : <div className="oc-composer"><input className="oc-input" value={text} placeholder={t.tn.composer} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setText(e.target.value)} onKeyDown={(e: React.KeyboardEvent) => { if (e.key === "Enter") send(); }} /><button className="oc-btn green sm" onClick={send} disabled={!text.trim()}><Icon name="send" size={14} /> {t.tn.send}</button></div>}
      <div className="oc-note"><Icon name="alert" size={12} /> {t.tn.chatBackend}</div>
    </div>
  );
}

export function NotifPanel({ t, lang, onSeen }: { t: Dict; lang: Lang; onSeen: () => void }) {
  const dat = useData();
  const ctx = useCtx();
  const pend = dat.incidents.filter((x) => x.status === "pending");
  const earlier = dat.incidents.filter((x) => x.status === "fixed");
  const go = (v: string) => { ctx.navigate(v); ctx.closeModal(); };
  return (
    <ModalShell title={t.m.notif + " · " + (pend.length + 1)}>
      <div className="oc-notif-head"><button className="oc-btn ghost sm" onClick={() => { onSeen && onSeen(); ctx.toast(t.m.allRead); }}><Icon name="check" size={13} /> {t.m.markRead}</button></div>
      <div className="oc-notif-sec">{t.m.notifNew}</div>
      <ul className="oc-notif-list">
        {pend.map((x, i) => (
          <li key={i} onClick={() => go("autopilot")}><span className="oc-sev bad" /><div><b>{lang === "fa" ? x.tFa : x.tEn}</b><span className="oc-muted">{x.who} · {x.time} · {t.m.goAutopilot}</span></div></li>
        ))}
        <li onClick={() => go("diagnostics")}><span className="oc-sev mid" /><div><b>{lang === "fa" ? "34 trial امروز بدونِ اولین فروش منقضی می‌شوند" : "34 trials expire today without a first sale"}</b><span className="oc-muted">{lang === "fa" ? "عیب‌یابیِ اپیدو" : "Product Diagnostics"}</span></div></li>
      </ul>
      <div className="oc-notif-sec">{t.m.notifEarlier}</div>
      <ul className="oc-notif-list">
        {earlier.map((x, i) => (
          <li key={i} onClick={() => go("autopilot")}><span className="oc-sev low" /><div><b>{lang === "fa" ? x.tFa : x.tEn}</b><span className="oc-muted">{x.who} · {x.time} · {t.auto.fixed}</span></div></li>
        ))}
      </ul>
    </ModalShell>
  );
}

export function OwnerMenu({ t }: { t: Dict }) {
  const ctx = useCtx();
  return <ModalShell title={t.acc.roleNames.owner + " \u00b7 " + OWNER_EMAIL}><div className="oc-menu">
    <button className="oc-menu-row" onClick={() => { ctx.closeModal(); ctx.navigate("settings"); }}>{t.m.account}</button>
    <button className="oc-menu-row" onClick={() => { ctx.closeModal(); ctx.navigate("revenue"); }}>{t.m.billing}</button>
    <button className="oc-menu-row" onClick={() => { ctx.closeModal(); ctx.signOut(); }}>{t.m.signout}</button>
  </div></ModalShell>;
}

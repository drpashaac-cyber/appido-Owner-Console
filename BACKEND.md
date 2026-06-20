# APPIDO Owner Console — Backend Integration Contract

> **Status.** This console ships as a fully interactive **frontend** with mock data and
> **client-side gating only**. Nothing in this client is a security boundary. This document
> specifies exactly what the **server** must own and the API contract the frontend expects,
> so the work can be implemented without guesswork and without faking it on the client.

---

## 0. The one rule — the client never authorizes

Every gate you see in the UI (role checks, `View as`, hidden money figures, disabled buttons)
exists **only to shape the experience**. It must be duplicated and **enforced on the server**:

- The server authorizes **every read and every write** against the caller's session, independently of the client.
- If the client and server disagree, the **server wins** (return `403`, the client shows the locked state).
- Secrets, tokens, and permission decisions never live in or depend on client code.

A malicious user can edit the bundle and flip any flag. Assume they will.

---

## 1. What is mock today (the integration seams)

| Seam | Where in the client | What the server must replace |
|---|---|---|
| Login | `LoginGate`, `authed` state, `signOut()` | Real auth + session (§2) |
| Roles & gating | `ROLES`, `PERMS`, `can()`, `MONEY_ROLES`/`canMoney` | Server-enforced RBAC + `/me` (§3) |
| 2FA flag | `UserRow.twofa`, `AccessSecurity` | TOTP/WebAuthn enroll + verify (§4) |
| View as tenant | `startImpersonate()`, `imp`, `impLeft` (5-min), `readOnly` | Scoped, audited, read-only impersonation token (§5) |
| Activity log | `activity`, `logActivity()`, `SEED_ACTIVITY` | Append-only server audit log (§6) |
| All tables/charts | `TENANTS`, `USERS`, `SESSIONS`, `AI_SERVICES`, `INCIDENTS`, `MRR_SERIES`, `GMV_SERIES`, … | Data endpoints (§7) |
| Actions that only toast/log | model control, plan edits, script toggles, create user, reset password, send-fix, strategist apply | Real authorized + audited mutations (§8) |

---

## 2. Authentication & session

Recommended: server-issued **httpOnly, Secure, SameSite=Strict** session cookie (not a
token in JS). The client holds no credential, and **`LoginGate` never verifies anything itself** —
it only collects input and calls these endpoints.

Two sign-in methods, chosen per user by the owner at creation (`UserRow.method`):

**A. Password** (owner sets it — see below):
```
POST /api/auth/password/login  { email, password }
  -> 200  { status: "ok" } + session cookie          // 2FA off
  -> 200  { status: "2fa_required", challengeId }     // 2FA on -> code/verify
  -> 401  { error: "invalid_credentials" }            // generic; never says which field
```

**B. Email sign-in code** (passwordless):
```
POST /api/auth/code/request    { email }
  -> 200  { status: "sent" }     // ALWAYS 200, even if the email has no access (anti-enumeration)
POST /api/auth/code/verify     { email, code, challengeId? }
  -> 200  + session cookie  |  401 { error: "invalid_code" }
```

Session lifecycle:
```
POST /api/auth/logout            -> 204 (clears session)
GET  /api/auth/session           -> 200 { authenticated, user } | 401
```

**Owner-set password — must be temporary.** The owner types it in `CreateUserForm`; the server:
- stores only an **argon2/bcrypt hash**, never plaintext, and **never returns it** (no "show once" screen — the owner already knows it);
- marks it **`mustRotate: true`** so the user is **forced to change it on first sign-in** (this is why an owner-known password is not a standing backdoor — see §5);
- enforces minimum strength server-side (the client also gates >= 8 chars as a hint).

**One-time code hygiene** (server-side): >= 6 digits, ~10-minute expiry, **single-use** (no replay),
per-email + per-IP **rate-limiting**, attempt **lockout**, and a **resend cooldown** (the client's 30s
countdown is UX only).

Client mapping: the `LoginGate` state machine (`email -> pick method -> password / code`) maps 1:1
to the calls above; `LoginGate.onSignIn()` fires only after the server confirms a session. `signOut()`
calls `logout`. On load the shell calls `GET /session` and renders `LoginGate` when unauthenticated.
All error copy stays generic and enumeration-safe.

---

## 3. Authorization (RBAC)

Roles in the product: `owner`, `manager`, `marketer`, `finance`, `support`, `trust`.

**Primary owner (bootstrap).** The `owner` role is held by a single bootstrap identity — `appido.co@gmail.com` — provisioned **out-of-band** at deploy time (env / secret, not through the in-app `CreateUserForm`). It signs in with the same two methods as any account (owner-set password **or** an emailed code, §2), has full access, and is the only account permitted to create, suspend, or revoke operators. Every other user is an operator it creates with a scoped role.

The client `PERMS[role][view]` matrix and `MONEY_ROLES` (`owner`, `finance`) are **UX hints
only** — they decide what to show, never what is allowed. The server is the source of truth.

```
GET /api/me  -> 200 {
  user: { id, name, email },
  role: "owner" | "manager" | "marketer" | "finance" | "support" | "trust",
  permissions: { [view: string]: "full" | "view" | "none" },   // mirrors client PERMS shape
  canMoney: boolean                                             // revenue/GMV/MRR visibility
}
```

Rules:
- The client calls `/me`, then uses the returned `permissions`/`canMoney` to drive `can()` and `canMoney` instead of the hard-coded matrix.
- **Every** data/mutation endpoint independently checks the caller's role server-side.
- Money-bearing responses (MRR, GMV, revenue, AI spend) must be **omitted/redacted server-side** when `canMoney` is false — do not rely on the client hiding them.
- Unauthorized → `403 { error: "forbidden", view }`; the client renders the existing locked/empty state.

---

## 4. Two-factor authentication (2FA)

Drives `UserRow.twofa` + `UserRow.method` and the per-user controls in `AccessSecurity`.

The `require2fa` flag set in `CreateUserForm` governs the **password** path: when on, a successful
password check returns `status: "2fa_required"` and the user must also pass an **emailed one-time
code** (`/api/auth/code/verify`) — *something you know* (password) **+** *something you have* (mailbox).
The **email-code** method is itself a single possession factor (passwordless); to make it truly
two-factor, pair it with an authenticator app.

```
POST /api/2fa/enroll/start                 -> { method: "totp", secret, otpauthUrl }  // or WebAuthn options
POST /api/2fa/enroll/verify  { code }      -> 204 (enables 2FA)
POST /api/2fa/disable        { code }      -> 204
```

Prefer **TOTP** (RFC 6238) and/or **WebAuthn/passkeys** over email codes where the threat model
warrants it. 2FA state shown per user must come from the server; enabling/disabling for *other*
users is an `owner`-scoped admin action and is audited (§6).

---

## 5. Impersonation — "View as tenant"

The client shows a **5-minute** countdown (`impLeft`) and a global `readOnly` mode. The
server must make this real and safe:

```
POST /api/impersonation/start  { tenantId }
  -> 200 { impersonationId, tenantId, expiresAt }   // scope = READ-ONLY, TTL ~5 min
POST /api/impersonation/stop   { impersonationId }  -> 204
```

Requirements:
- The impersonation session is **read-only**: the server **rejects every mutation** while it is active (`409 { error: "read_only_impersonation" }`), matching the client's `readOnly` UX.
- It is **time-boxed** (auto-expires; client countdown is cosmetic, server clock is authoritative).
- Every request made under impersonation is **attributed to the operator** (not the tenant) in the audit log, including the `tenantId` being viewed.
- Starting/stopping impersonation each write an audit entry (the client already logs this locally — that log must move server-side).
- An **owner-set password is temporary and force-rotated on first sign-in** (§2), so it never becomes a standing way to log in *as* a user outside this audited, read-only impersonation flow.

---

## 6. Audit log — the source of truth

The client's `activity` / `logActivity()` is **display only**. The real audit log is an
**append-only, immutable** server store, and it is the system of record.

```
GET  /api/audit?limit=&cursor=  -> { entries: AuditEntry[], nextCursor? }

AuditEntry {
  id: string;
  ts: string;            // ISO 8601 (client renders HH:MM in Western digits)
  actor: { id, name };   // the operator, even under impersonation
  action: string;        // stable key, e.g. "model.bulk_economy" (client localises fa/en)
  tone?: "ok" | "warn" | "bad";
  targetTenantId?: string;
  channel?: string;      // e.g. "tenant-dashboard" for actions propagated to a tenant
  ip?: string;
}
```

**Every mutating endpoint writes its own audit entry server-side** — the client must not be
trusted to log. The console's local list can stay as an optimistic view that is reconciled
against `GET /audit`.

---

## 7. Data endpoints (replace the mock constants)

Each replaces a mock array and is subject to the §3 scope checks. **Preserve two product
invariants in the API design:**

1. **Two pricing concepts are distinct** — Appido's own subscription (`Start`/`Pro`) vs. each tenant's own in-dashboard products. Never merge them into one "price" field.
2. **Two revenue streams are distinct** — Appido **MRR** (subscriptions) vs. platform **GMV** (tenant sales). Keep separate fields/series.

```
GET /api/tenants                         -> Tenant[]                 (replaces TENANTS)
GET /api/tenants/:id                     -> Tenant + detail          (TenantProfile)
GET /api/tenants/:id/customers           -> customer rows            (Customers)
GET /api/tenants/:id/ai-usage            -> { tokensPct, cost, overrun, conn, knowledgeDoc }   (aiUsageOf)
GET /api/metrics/revenue                 -> { mrrSeries, arr, … }    (canMoney; MRR_SERIES)
GET /api/metrics/gmv                     -> { gmvSeries, … }         (canMoney; GMV_SERIES)
GET /api/ai/fleet                        -> AIService[]              (AI_SERVICES)
GET /api/ai/models                       -> per-(tenant,service) model assignments  (ModelControlPlane)
GET /api/incidents                       -> Incident[]               (INCIDENTS)
GET /api/flags                           -> Flag[]                   (FLAGS)
GET /api/plans                           -> PlanCfg[]                (PLAN_CONFIG — Appido subscription tiers)
GET /api/script                          -> ScriptQ[]                (SCRIPT)
GET /api/platform/status                 -> service health           (PLATFORM_STATUS)
GET /api/users                           -> UserRow[]                (USERS)
GET /api/sessions                        -> SessionRow[]             (SESSIONS)
```

(Field shapes already exist as TypeScript interfaces in `src/types.ts` — reuse them as the
response contract. The shell consumes all of them as a single `AppData` bundle returned by `Api.data()` — see §9.)

---

## 8. Write operations (today they only `toast` + `logActivity`)

These UI actions currently update local state and show a toast. Each must become a real
**authenticated, authorized, audited** mutation. Where the UI says *"sync to tenant"*, the
server must actually propagate the change to that tenant's dashboard.

```
PATCH /api/tenants/:id/ai/:service   { model?, enabled?, monthlyCapUSD? }   // per-tenant model + cap
POST  /api/ai/models/bulk-economy    { tenantIds: string[] }                // "All → Economy"
PATCH /api/plans/:key                { … }                                  // plan/packaging edit
PATCH /api/script/:id                { on: boolean }                        // script-question toggle
POST  /api/users                     { name, email, role }                  // create operator
POST  /api/users/:id/reset-password                                          // reset
POST  /api/tenants/:id/send-fix      { issueId }                            // push fix to tenant
POST  /api/strategist/apply          { tenantId, actionId }                 // apply recommendation
POST  /api/incidents/:id/resolve                                            // resolve / create task
```

All of the above: reject under impersonation (§5), require the right role (§3), and emit an
audit entry (§6).

---

## 9. Frontend wiring — IMPLEMENTED (swap the data source only)

The console already ships the full data-access layer. Production swaps the *implementation*, not the components:

- **`interface Api { data(): Promise<AppData>; me(): Promise<Me> }`** (`src/types.ts`) is the contract.
- **`MockApi`** (`src/data.ts`) is the default: it resolves the seed data (`MOCK_DATA: AppData`) and `{ role: "owner" }` after a simulated latency. **Replace it with an `HttpApi`** that calls the §7 endpoints — no component change required.
- The shell takes the api as a prop: `OwnerConsole({ api = MockApi })`. Inject the real client: `<OwnerConsole api={httpApi} />`.
- **`useResource<T>(fetcher)`** (`src/core.tsx`) is the generic async hook → `{ loading, error, data, retry }`. The shell fetches `api.data()` once, renders `<ViewSkeleton>` while loading and `<ErrorState onRetry>` on failure, and publishes the result on context as `ctx.data`.
- Views read it through **`useData(): AppData`** (`const dat = useData()`) and never import the seed constants.

To go live:

1. Implement `HttpApi.data()` — either one `GET /api/bootstrap` returning `AppData`, or compose the granular §7 endpoints with `Promise.all` into the `AppData` shape.
2. Implement `HttpApi.me()` → `GET /me`; drive `can()` / `canMoney` from it server-side (keep the client `PERMS` matrix only as a fallback for *hiding* UI).
3. Mount with `<OwnerConsole api={new HttpApi(import.meta.env.VITE_API_BASE_URL)} />`.
4. Wire the §8 mutations; reconcile optimistic state + the `activity` log against server responses.

`AppData` (the response contract for `data()`) is defined in `src/types.ts`; its fields map 1:1 to the §7 endpoints. The only intentionally mock-derived content is the demo chat-transcript generator (`chatsOf` / `botChatsOf` in `src/lib.ts`) — point it at a real conversation endpoint if needed.

No visual or UX change — these are data-source swaps behind the existing components.

---

## 10. Security checklist (server-side)

- [ ] httpOnly + Secure + SameSite cookies; CSRF protection on state-changing requests.
- [ ] Per-endpoint authorization (never trust the client `PERMS`).
- [ ] Money fields redacted server-side unless `canMoney`.
- [ ] Impersonation: read-only enforced, time-boxed, operator-attributed, fully audited.
- [ ] Audit log append-only / tamper-evident; written by the server on every mutation.
- [ ] Rate limiting on `login`, `2fa/verify`, and `impersonation/start`.
- [ ] Least-privilege session tokens; short TTLs; revocation via `/sessions`.
- [ ] No secrets, API keys, or authorization logic shipped in the client bundle.

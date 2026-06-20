# APPIDO — Owner Console

Platform / super-admin console for APPIDO (AI sales-automation SaaS for Telegram businesses).
Vite 6 + React 19 + TypeScript (strict). FA-first + RTL with EN, light/dark, locked 5-colour palette, Western digits.

## Setup
```bash
npm install
npm run build      # production build -> dist/
npm run dev        # local dev server
npm run typecheck  # tsc --noEmit (strict gate)
npm run preview    # preview the production build
npm test           # run unit + smoke tests (Vitest)
```
Requires Node 20 (see `.nvmrc`).

## Structure (`src/`)
| File | Responsibility |
|---|---|
| `types.ts` | shared TypeScript interfaces/types |
| `i18n.ts` | `T` dictionary (fa + en) + `RTL` set |
| `data.ts` | mock/seed data constants |
| `lib.ts` | helpers (money, fmt, …) + RBAC (`ROLES`/`PERMS`) + AI/usage derivations |
| `core.tsx` | shared kit: charts (Donut/Bars/…), UI primitives (Card/Kpi/Modal/…), context |
| `features.tsx` | all view + panel components (CommandCenter, Businesses, AIOps, …) |
| `OwnerConsole.tsx` | app shell (default export) — nav, theme, lang, modal, RBAC wiring |
| `styles.css` | full stylesheet (palette via CSS variables) |
| `main.tsx` | React entry |
| `lib.test.ts` / `OwnerConsole.test.tsx` | Vitest unit + smoke tests |

## Notes
- The locked 5-colour palette is a hard product invariant (no pure white/black; new shades only via `color-mix()`).
- Appido subscription pricing (Start/Pro) and tenants' own in-dashboard product pricing are separate concepts and must never be conflated.

## Backend
This is a frontend with mocked auth/RBAC/2FA/session/audit. See **BACKEND.md** for the full server integration contract (endpoints, payloads, security rules).

## Deploy & launch
See **[DEPLOY.md](./DEPLOY.md)** for the full deploy/launch guide (Vercel, Netlify, or any
static host). Quick path: `npm install && npm run build` → deploy the `dist/` folder.
The app runs standalone on the bundled `MockApi`; connect the real backend per BACKEND.md §9.

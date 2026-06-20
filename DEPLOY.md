# APPIDO Owner Console — Deploy & Launch

A Vite 6 + React 19 + TypeScript single-page app. It ships with an in-memory
`MockApi`, so it **builds and runs with no backend** — ideal for a preview/demo launch.
Wiring it to the real backend is a single swap (see [BACKEND.md](./BACKEND.md) §9).

## 1. Requirements
- **Node 20+** (pinned in `.nvmrc`; CI uses it). Run `nvm use` if you use nvm.
- npm (ships with Node).

## 2. Install & verify locally
```bash
npm install        # or: npm ci   (clean, lockfile-exact)
npm run typecheck  # tsc --noEmit — strict + noUnusedLocals/noUnusedParameters
npm test           # vitest: api, data, lib, useResource, shell smoke
npm run dev        # dev server -> http://localhost:5173
```

## 3. Production build
```bash
npm run build      # -> dist/  (minified, content-hashed assets)
npm run preview    # serve dist/ locally -> http://localhost:4173
```
The deployable artifact is the **`dist/`** folder (`index.html`, `assets/*`,
`favicon.svg`, `theme-init.js`, `robots.txt`).

## 4. Deploy

### Option A — Vercel (recommended)
- Push to GitHub and "Import Project" on Vercel, **or** run `npx vercel` from the project root.
- Framework preset: **Vite**; build `npm run build`; output `dist`.
- `vercel.json` (included) already sets the SPA rewrite, security headers, and a long-cache for `/assets/*`.

### Option B — Netlify
- "Import from Git", **or** `npx netlify deploy --build --prod`.
- `netlify.toml` (included) sets the build command, `publish = dist`, the SPA redirect, and the same headers.

### Option C — Any static host / Nginx / S3 + CloudFront
Upload the contents of `dist/` to the web root, add an SPA fallback and the security
headers. Example Nginx:
```nginx
location / { try_files $uri /index.html; }
location /assets/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
add_header X-Frame-Options "DENY";
add_header X-Content-Type-Options "nosniff";
add_header Referrer-Policy "no-referrer";
add_header Content-Security-Policy "default-src 'self'; frame-ancestors 'none'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' https://api.appido.io";
```

## 5. Connect the real backend (for a non-demo launch)
The console authorizes nothing client-side. To go live with real data + auth:
1. Implement `HttpApi` — the `{ data(): Promise<AppData>; me(): Promise<Me> }` contract — calling the endpoints in [BACKEND.md](./BACKEND.md) §7–§8.
2. Mount it in `src/main.tsx`: `<OwnerConsole api={new HttpApi(import.meta.env.VITE_API_BASE_URL)} />`.
3. Set `VITE_API_BASE_URL` (see `.env.example`) and add that origin to `connect-src` in the CSP (`vercel.json` / `netlify.toml`).
4. Authentication is **server-side** (httpOnly cookie). `LoginGate` only collects input — see §2/§4.

## 6. Owner & access notes
- The **primary owner** is `appido.co@gmail.com`, provisioned **out-of-band** with the `owner` role (env/secret, not via the in-app form). It is the only account that can create / suspend / revoke operators.
- Owner-set passwords are **temporary** and force-rotated on first sign-in. No password is ever stored in this repo.

## 7. Launch checklist
- [ ] `npm run typecheck && npm test && npm run build` all pass
- [ ] `dist/` deployed; the URL loads the console (mock data) with no console errors
- [ ] Light/dark + FA/EN toggles work and **persist across reload**
- [ ] Security headers present (verify in the Network tab or securityheaders.com)
- [ ] `robots.txt` blocks crawlers and the page is `noindex` (admin console)
- [ ] (Real launch) `HttpApi` wired, `VITE_API_BASE_URL` set, CSP `connect-src` updated, auth verified server-side

## What is intentionally NOT in the frontend
Real authentication, 2FA, impersonation enforcement, rate-limiting, and data
authorization are **server-side** by design (BACKEND.md). The bundled `MockApi`
exists only to make the UI runnable and demoable on its own.

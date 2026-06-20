// Runtime config — APPIDO_API_BASE is the deployed backend origin (no trailing slash).
// Loaded before the app bundle. Set to "" only to preview the console in demo mode (mock data).
// LIVE mode requires an authenticated owner session (platform:overview) on the same parent domain
// (cookie domain = .appido.io). It makes the console render REAL platform data from the API — never mock.
window.APPIDO_API_BASE = "https://api.appido.io";

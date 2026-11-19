# Google OAuth and Better Auth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace DashCash's fake browser-only login with real Google OAuth sessions using Better Auth on a Cloudflare Worker backed by D1.

**Architecture:** Serve the React app and `/api/auth/*` from the Cloudflare Pages project, using a Pages Function as the Better Auth endpoint. Better Auth owns OAuth, session cookies, and user tables in D1. The browser uses Better Auth's client and never receives Google client secrets. This phase does not claim the cash-flow data is persisted; transaction storage remains a separate follow-up.

**Tech Stack:** React + Vite, Better Auth, Cloudflare Pages Functions, Cloudflare D1, Google OAuth.

## Global Constraints

- Google client secret, Better Auth secret, and any mail-provider key are server-only secrets; never put them in `VITE_*`, source files, or commits.
- The browser redirects through Better Auth; do not implement OAuth, passwords, or sessions ourselves.
- Use Cloudflare D1 and Better Auth, not Clerk or Supabase.
- Keep the existing marketing page and manual cash-flow preview; clearly distinguish preview-only data from authenticated accounts.
- Deployment goes through the connected GitHub repository and Cloudflare Pages.

---

## Task 1: Better Auth integration contract

**Files:** `src/lib/auth.test.js`, `src/lib/auth.js`, `src/components/auth/GoogleSignInButton.jsx`, `package.json`.

- [ ] Add focused tests for a Google sign-in action using Better Auth's documented client API, loading guard, and error feedback.
- [ ] Run tests and observe the missing auth integration failure.
- [ ] Add Better Auth client dependency and expose one typed/JS auth helper initialized at same-origin `/api/auth`.
- [ ] Build a Google sign-in button that calls `authClient.signIn.social({ provider: "google", callbackURL: "/dashboard" })`; show progress and a safe error message.
- [ ] Run auth unit tests and production build.

## Task 2: Worker-side Better Auth and D1

**Files:** `functions/api/auth/[[path]].js`, `src/lib/server/auth.js`, `migrations/0001_better_auth.sql`, `wrangler.toml`, `package.json`.

- [ ] Add tests for required bindings and auth route request delegation; tests must fail before the handler exists.
- [ ] Configure Better Auth with its Cloudflare D1 adapter and Google provider using server-side `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `BETTER_AUTH_SECRET` bindings.
- [ ] Generate or author the Better Auth D1 schema using the installed version's official schema generator; commit the migration, never a live database dump.
- [ ] Route only `/api/auth/*` to Better Auth and return its response with secure production cookie settings; use Pages' request context/env bindings.
- [ ] Fail closed with actionable server logs/errors if required bindings or D1 are missing. Do not log secrets, OAuth codes, tokens, or session cookies.
- [ ] Run unit tests and Wrangler local type/bundle validation.

## Task 3: Real login/signup route and UX

**Files:** `src/main.jsx`, `src/styles.css`, `src/lib/auth.js`, auth tests.

- [ ] Add tests proving fake email/password submission cannot advance to onboarding/dashboard and Google button triggers the provider flow.
- [ ] Replace prototype credential forms with a clearly labeled “Continue with Google” control and OAuth progress/error states.
- [ ] Subscribe to Better Auth session state. Route signed-out users to login; route signed-in users to the dashboard preview, keeping cash-flow data clearly marked as not saved.
- [ ] Provide logout and preserve accessible labels, keyboard focus, responsive layout, and clear OAuth failure recovery.
- [ ] Run all tests and production build.

## Task 4: Cloudflare and Google configuration, verification, deployment

**Files:** `.dev.vars.example`, `.gitignore`, `README.md`, Cloudflare Pages bindings/secrets, D1 database.

- [ ] Add only variable names (no values) to `.dev.vars.example` and ignore `.dev.vars`, `.env*` except `.env.example`, and generated output.
- [ ] Create/bind a D1 database named for DashCash; apply the Better Auth migration to local and remote D1.
- [ ] Configure Pages Functions D1 binding `DB`; add `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, and `GOOGLE_CLIENT_SECRET` as encrypted runtime secrets, not build variables.
- [ ] Register Google OAuth authorized origin and callback `https://dashcash.pages.dev/api/auth/callback/google` (plus local development callback) in Google Cloud Console. Redirect URI must match Better Auth's documented callback path for the installed version.
- [ ] Configure app URL/allowed origins for the production Pages domain and local development.
- [ ] Verify local Google authorization, callback, session persistence, refresh/reload, logout, invalid/missing config, and that API bundle/source maps do not reveal secrets.
- [ ] Push only intended source/migration/docs files; wait for Cloudflare Pages production build and verify the deployed Google flow in a browser.

**Setup boundary:** Google OAuth cannot complete until the project owner creates/provides a Google OAuth client and configures the Cloudflare runtime secrets. Never request secret values in chat; have the owner enter them directly in Google/Cloudflare dashboards or local ignored `.dev.vars`.

## Out of Scope

- Persisting business profiles or transactions, email/password auth, verification email delivery, password reset, account deletion/export, bank connections, and public production launch readiness.

## Acceptance Criteria

- Clicking Google sign-in initiates Better Auth's real Google OAuth redirect, and a successful callback establishes a server-managed session.
- OAuth client secret and Better Auth secret exist only as server-side secrets.
- Unauthenticated visitors cannot reach the authenticated preview route; a session survives refresh and logout invalidates it.
- Cloudflare production build passes and the deployed route uses D1-backed Better Auth.
- The dashboard explicitly states cash-flow data is still browser-only and not persisted.

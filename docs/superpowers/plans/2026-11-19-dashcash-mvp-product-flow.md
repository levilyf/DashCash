# DashCash MVP Product Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn DashCash from a marketing site into a usable, secure MVP where a small-business owner can create an account, configure a business, manually record income and expenses, and understand their cash flow.

**Architecture:** Keep the existing React + Vite frontend and Cloudflare Pages hosting. Add a managed backend for authentication and relational persistence; recommended default is Supabase Auth + Postgres with row-level security, accessed by the browser through its supported client and restricted public key. Never expose a service-role secret in frontend code. Start with one owner per business; design records with business ownership so multi-user membership can be added later. Do not connect bank accounts or claim accounting/tax-grade accuracy in v1.

**Tech Stack:** Existing React + Vite + JavaScript; Supabase Auth, Postgres, and Row Level Security; Cloudflare Pages for static frontend. Before implementation, confirm current Supabase pricing/limits, data-region needs, and whether Cloudflare Workers are needed for any secrets or server-only operations.

## Global Constraints

- Hosting target: Cloudflare Pages; retain GitHub-based deployments.
- MVP users manually enter income and expenses; no bank sync, payment processing, or CSV import in v1.
- A user must only access records for businesses they own; enforce this in database RLS, not just frontend filtering.
- Store monetary values as integer minor units (for example cents) plus an explicit ISO currency code; never use floating-point as the source of truth.
- Store timestamps/dates consistently and display dates in the user's chosen locale/time zone where relevant.
- Signup and onboarding must clearly disclose what data is stored and provide account deletion/support contact before public launch.
- Secrets: Supabase service-role keys and other privileged secrets must never ship to the browser or be committed.
- Treat the current landing form as a visual-only prototype until replaced with working account entry; do not imply it stores addresses.
- Existing project is a React/Vite marketing site; inspect it before modifications. Exclude generated `dist/`, `node_modules/`, deployment payloads, and temporary `gh-file-*`/`github-files.json` files from GitHub.

---

## Product decisions to confirm before implementation

These are recommended MVP defaults, not already-approved product requirements:

1. **Business profile:** required business name and currency; country is optional unless needed to select currency. Do not request address, tax ID, bank credentials, or legal structure in v1.
2. **Transactions:** income/expense type, description, positive amount, category, transaction date, optional note. For v1, represent money received/paid, not invoices, receivables, inventory, or bank balances.
3. **Dashboard promise:** show totals for a selectable period (default current month): income, expenses, and net cash flow (income minus expenses); recent transactions; simple daily/weekly trend. Label clearly that these are user-entered records, not synced bank balances.
4. **Accounts:** email/password with email verification and password reset; require verified email before saving business data. Evaluate Google sign-in only if it materially improves launch conversion and setup.
5. **Account ownership:** one business per account initially. Design schema with `business_id` and ownership mapping so multiple businesses/team members can be added later without restructuring transactions.
6. **Currency:** choose once during onboarding; changing it later must not silently reinterpret old amounts. Decide whether mixed currencies are excluded in v1 (recommended: one currency per business).
7. **Deletion/export:** provide a user-facing path to request account/data deletion and CSV export, or explicitly scope these requirements and support process before inviting real users.

Resolve these items in a short product decision checkpoint before building database schema. If product owner changes a default, update this plan first.

---

## File Structure

- `src/main.jsx` — app bootstrap and router integration.
- `src/App.jsx` — route-level app shell and authenticated/unauthenticated layouts.
- `src/pages/` — `LoginPage.jsx`, `SignupPage.jsx`, `ResetPasswordPage.jsx`, `OnboardingPage.jsx`, `DashboardPage.jsx`, `TransactionsPage.jsx`, and `SettingsPage.jsx` as implementation scope requires.
- `src/components/auth/` — auth forms, validation, loading/error state.
- `src/components/onboarding/` — business profile form and onboarding progress/empty states.
- `src/components/transactions/` — transaction form, list, filters, edit/delete confirmation.
- `src/components/dashboard/` — period selector, totals, trend and recent transactions.
- `src/lib/supabase.js` — browser client initialized only from public project URL and anon/publishable key.
- `src/lib/auth.js` — auth/session helpers, if not covered cleanly by context/hooks.
- `src/lib/transactions.js` — validated transaction data access; all queries scoped by business and reinforced with RLS.
- `src/lib/metrics.js` — pure calculation and formatting helpers, independently tested.
- `src/styles.css` — responsive styles aligned with the existing DashCash brand.
- `supabase/migrations/` — versioned SQL schema, indexes, grants, constraints, and RLS policies.
- `.env.example` — variable names only; no credentials.
- `README.md` — local setup, Supabase project setup/migrations, environment variables, deployment and security notes.
- Tests colocated or under `src/` according to the selected runner; add unit tests for calculations/validation and integration checks for auth/data flows.

Avoid splitting files mechanically if the existing source structure suggests a simpler organization; keep ownership/data access and UI responsibilities separated.

---

## Task 1: Confirm MVP decisions and provider setup

**Files:** `docs/superpowers/plans/2026-11-19-dashcash-mvp-product-flow.md`, `README.md` only if provider setup notes are added.

- [ ] Confirm the recommended product decisions above, especially currency scope, verification requirement, owner-per-business assumption, and deletion/export expectations.
- [ ] Compare Supabase and Cloudflare-native alternatives against the actual MVP needs: hosted auth, relational transactions, RLS, operational burden, current free/paid limits, data region, and backups. Default to Supabase unless a concrete constraint favors another provider.
- [ ] Create a Supabase project in the user's account and select an appropriate region; user must control the account and billing.
- [ ] Record the project URL and public anon/publishable key in local environment setup; do not expose or request service-role keys.
- [ ] Add `.env.example` containing `VITE_SUPABASE_URL=` and `VITE_SUPABASE_ANON_KEY=` only.
- [ ] Document local setup and ensure `.env*` secrets are ignored by Git (allow `.env.example`).

**Checkpoint:** provider project exists, browser-safe credentials are configured locally, and the product decisions are recorded. No customer data is entered yet.

## Task 2: Add test foundation and money/domain validation

**Files:** `package.json`, lockfile, `src/lib/metrics.js`, `src/lib/validation.js`, corresponding tests.

- [ ] Add a lightweight test runner compatible with the Vite project and scripts for test/watch if missing.
- [ ] Write failing tests for amount parsing to integer minor units, supported currency precision, positive amounts, required fields, allowed transaction types, and date validation.
- [ ] Write failing metric tests for period boundary inclusion, empty periods, income totals, expense totals, net cash flow, and mixed dates.
- [ ] Implement pure domain functions; keep locale formatting separate from persisted values.
- [ ] Run tests and production build; ensure no existing landing route regressions.

## Task 3: Create schema and enforce tenant isolation

**Files:** `supabase/migrations/<timestamp>_initial_schema.sql`, README setup instructions, migration tests/checklist.

- [ ] Define `businesses` with UUID primary key, name, currency code, timezone, owner user ID, and timestamps.
- [ ] Define `transactions` with UUID, business ID, transaction type, description, category, integer minor-unit amount, ISO transaction date, optional note, created/updated timestamps, and creator user ID.
- [ ] Add database constraints for valid transaction type, positive amount, currency format, required fields, and valid references; add indexes for business/date queries.
- [ ] Enable RLS on all user data tables. Policies must enforce authenticated owner access for select/insert/update/delete, using `auth.uid()` and ownership relation; do not depend on client-supplied IDs alone.
- [ ] Decide how signup creates an initial business safely. Prefer an authenticated onboarding insert under RLS; avoid insecure service-role triggers or broad public policies.
- [ ] Apply migration to a development project and verify a user cannot read or mutate another user's business/transactions, including direct API requests.
- [ ] Document backup, migration, and production-vs-development project separation.

**Security gate:** Do not proceed to real-user onboarding until isolation tests pass against the hosted project.

## Task 4: Implement authentication and route protection

**Files:** `package.json`, `src/lib/supabase.js`, `src/App.jsx`, `src/main.jsx`, `src/pages/LoginPage.jsx`, `src/pages/SignupPage.jsx`, `src/pages/ResetPasswordPage.jsx`, auth components and tests.

- [ ] Add Supabase JS client and initialize from the two public Vite environment variables; fail closed with a clear setup error when missing.
- [ ] Write tests for auth route states and form validation before UI integration.
- [ ] Implement signup, login, logout, email verification feedback, reset-password flow, loading states, error recovery, and session persistence using the provider's supported APIs.
- [ ] Protect product routes and redirect unauthenticated users to login; after successful auth, route users with no business to onboarding and configured users to dashboard.
- [ ] Do not log passwords, access tokens, or full auth payloads. Avoid unsafe HTML rendering of provider errors.
- [ ] Ensure accessible labels, keyboard interaction, mobile layout, and actionable error messages.
- [ ] Test expired session, refresh/reload, unverified account, invalid credentials, and password reset.

## Task 5: Implement business onboarding

**Files:** `src/pages/OnboardingPage.jsx`, onboarding components, `src/lib/businesses.js`, data access tests.

- [ ] Build the minimal onboarding form: business name and one currency selection (country/timezone only if needed for display); include concise explanation that users enter transactions manually.
- [ ] Write tests for required name/currency, duplicate submission prevention, and safe handling of failed network requests.
- [ ] Create the business record using the authenticated user's session and RLS; do not use privileged credentials in the browser.
- [ ] On success, route to the empty dashboard and clearly identify the business/currency.
- [ ] Ensure onboarding can resume after reload and handles a business created before an interrupted redirect.

## Task 6: Implement manual transaction create/list/edit/delete

**Files:** `src/lib/transactions.js`, transaction pages/components, validation tests, data-access tests.

- [ ] Write failing tests for create/update/delete validation, business scoping, empty list, date sorting, and error handling.
- [ ] Implement transaction list filtered by period/type/category with pagination or a bounded recent-items query.
- [ ] Implement create and edit form with income/expense type, description, category, positive amount, date, optional note; persist as minor currency units.
- [ ] Implement delete confirmation with clear irreversible-action copy; use optimistic updates only if rollback on failure is tested.
- [ ] Query by the active business ID and rely on RLS as the actual security boundary; test cross-user access denial directly against database/API.
- [ ] Add no-data, loading, validation, network error, and success states; support narrow mobile screens.

## Task 7: Build useful dashboard and connect landing entry points

**Files:** `src/pages/DashboardPage.jsx`, dashboard components, `src/lib/metrics.js`, `src/App.jsx`, `src/main.jsx`, existing landing source/routes, styles.

- [ ] Write tests for selected period calculations and make period boundaries use the business timezone.
- [ ] Show current-period income, expenses, and net cash flow; label these as manually recorded, not bank balances.
- [ ] Add a simple trend and recent transaction list with meaningful empty states and an obvious “Add transaction” action.
- [ ] Add period selection and consistent explicit currency/date formatting; never combine different currencies in totals.
- [ ] Preserve the marketing landing page, but replace the visual-only early-access form with clear “Log in” and “Create account” routes/CTAs. Remove any claim that the form submits or stores data.
- [ ] Verify logged-in navigation, mobile layout, empty dashboard, populated dashboard, and return-to-dashboard flows.

## Task 8: Data rights, security review, and production readiness

**Files:** `src/pages/SettingsPage.jsx` or account settings equivalent, README/privacy copy, migration/tests, Cloudflare Pages settings.

- [ ] Add account settings with logout, business/currency display, and a clearly explained deletion/support path; implement deletion only when a complete cascade and confirmation flow is tested.
- [ ] Decide/export a usable CSV format for business transactions or document a safe operational export process before MVP launch.
- [ ] Add privacy notice covering stored profile/business/transaction data, provider processing, retention, and support contact; get appropriate legal review before public launch.
- [ ] Confirm Supabase production project security, RLS enabled, backups/retention, auth redirect URLs, email templates/delivery, allowed origins, and rate limits.
- [ ] Configure Cloudflare Pages environment variables with only public Supabase URL and anon/publishable key; keep secrets out of GitHub and build logs.
- [ ] Run tests, production build, dependency/security review, RLS cross-tenant tests, and manual browser checks on desktop/mobile.
- [ ] Deploy through the GitHub-linked Cloudflare Pages project and verify auth redirect, signup, email verification, onboarding, CRUD, logout, and login on the deployed domain.
- [ ] State the product boundary in UI/help: manual cash-flow tracking, not bank synchronization, bookkeeping, tax advice, or a verified bank balance.

## Out of Scope for MVP

- Bank account connections, automated transaction import, payment processing, invoicing, payroll, inventory, tax calculations, accounting reconciliation, team roles, multi-business membership, and AI financial advice.
- Migrating production customer data or claiming regulatory/compliance certifications without a specific verified requirement.

## Acceptance Criteria

- A new user can sign up, verify email, create one business, add/edit/delete manual income and expense records, and see correct totals for the selected period.
- A returning user can log in, reset a password, and only access their own business records.
- Database RLS prevents cross-user access even when requests are made outside the UI.
- Currency/date presentation is explicit, totals use integer minor units, and the dashboard never implies real bank balance synchronization.
- Production build succeeds and deployed Cloudflare URL supports the full flow with no privileged secrets in client assets or Git history.

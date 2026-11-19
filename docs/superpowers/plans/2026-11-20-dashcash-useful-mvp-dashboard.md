# DashCash India-First Small Business Finance Hub Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build DashCash into an India-first small-business finance hub that helps owners manage cash, receivables, payables and budgets, understand what needs attention, and take action—without pretending to be a bank or a full accounting/tax system.

**Architecture:** Keep React + Vite on Cloudflare Pages; use Pages Functions, Better Auth, and D1 for secure accounts and persistence. Organize the product as related modules—Overview, Sales & Invoices, Expenses & Bills, Cash Flow, Budgets, Reports, and Settings—sharing business, customer/vendor, category, invoice, bill, and payment records. The overview summarizes real saved data and highlights actionable items (overdue invoices, upcoming bills, budget exceptions, and unusual cash-flow changes); it never shows invented figures. Build in vertical slices so each module works end-to-end before adding the next. India-specific currency/date defaults are included; GST/tax calculations are explicitly excluded pending accounting/legal review.

**Tech Stack:** React + Vite + JavaScript; Cloudflare Pages Functions; Better Auth; Cloudflare D1; Node built-in test runner.

## Global Constraints

- Hosting and Git deployment: Cloudflare Pages via GitHub `main`.
- Auth/data stack: Better Auth + Cloudflare Pages Functions + D1; do not use Clerk or Supabase.
- Initial product: India-first, INR as the default currency, one owner/business per account; other currencies remain selectable for legitimate needs.
- Core modules: transaction ledger; sales invoices and payment status; bills/payables and due dates; budgets/targets; reports and CSV export; actionable overview.
- No bank integrations or payment processing in the first release. CSV import is deferred until manual data model and duplicate handling are stable.
- Do not calculate GST, file taxes, or claim accounting-grade compliance in the initial release; keep tax fields informational only if later approved.
- Store money as integer minor units with explicit currency; never use floats as the source of truth.
- Store transaction dates as date-only values and calculate periods using a documented business timezone convention.
- Every read/write must scope to the authenticated user's owned business; enforce on the server and in database constraints/queries.
- Google OAuth and Better Auth secrets must remain server-side; never place secrets in Vite `VITE_*`, source files, or commits.
- Be explicit in UI that entries are manually entered and not bank-synced. Do not show invented financial values or transactions anywhere in the real dashboard.
- Keep current landing page branding and apply its visual system to the usable app: sidebar navigation, restrained sage/cream palette, compact metric panels, chart/activity hierarchy, responsive layout.
- Do not deploy an auth flow as working until provider credentials and runtime bindings are configured and end-to-end verified. Until then, clearly label the demo, do not collect real credentials or business data.

## Product Decisions (Confirmed)

1. Product positioning: India-first business finance hub; not a generic transaction notebook.
2. Core outcome: know cash position from recorded activity, track money customers owe and bills due, monitor budgets, and see the next action.
3. Persistence: real accounts and cloud storage using Better Auth + D1.
4. Initial workflow: manually recorded categorized transactions; invoices and bills create/settle corresponding ledger entries without double counting.
5. Market: Indian small businesses; INR default and India number/date formatting. Do not assume every user is GST registered.
6. Core modules in staged delivery: Overview + ledger; invoices/receivables; bills/payables; budgets; reports/export.
7. Explicitly defer bank feeds, payment processing, CSV import, recurring automation and GST/tax computation.
6. One business/currency per account for initial release; confirm email verification and deletion/export/support expectations before public launch.

---

## Scope and File Map

- `src/main.jsx`: keep as marketing bootstrap only; move product flow out as routes/components rather than extending the current monolithic component.
- `src/App.jsx`, `src/router.js`: route tree, auth gate, app shell.
- `src/pages/`: Login, Signup, Onboarding, Dashboard, Transactions, Settings.
- `src/components/app/`: authenticated header/sidebar, mobile navigation, page shell.
- `src/components/dashboard/`: period selector, KPI cards, chart, recent activity, no-data/loading/error states.
- `src/components/transactions/`: form, category selector, table/list, filters, edit, delete confirmation.
- `src/lib/server/auth.js`: request-aware Better Auth instance from Pages env bindings.
- `functions/api/auth/[[path]].js`: Better Auth endpoint handler.
- `functions/api/businesses/` and `functions/api/transactions/`: authenticated data API endpoints.
- `src/lib/api.js`: same-origin typed-by-convention browser API helper with safe error parsing.
- `src/lib/domain/transactions.js`: validation, currency conversion, category/type definitions.
- `src/lib/domain/dashboard.js`: period filtering, totals, chart series, recent sorting.
- `src/lib/domain/*.test.js`: Node built-in tests for pure domain logic.
- `migrations/`: versioned D1 SQL schema; users/Better Auth tables, businesses, categories strategy, transactions, indexes, ownership constraints.
- `wrangler.toml`: Pages build output and D1 binding (ID placeholder only until real account resource exists).
- `.dev.vars.example`, `.gitignore`, `README.md`: variable names and safe local/deploy setup; no secret values.
- `src/styles.css`: current landing styles plus responsive authenticated product styles, preferably gradually split into focused CSS files.

---

## Task 1: Product and route architecture baseline

**Files:** `src/App.jsx`, `src/main.jsx`, `src/router.js`, relevant route tests, `README.md`.

- [ ] Inspect current routes and document existing demo behavior and which parts remain nonfunctional.
- [ ] Add route tests for marketing, login, onboarding, dashboard, transactions, and settings; make them fail before route components exist.
- [ ] Split the product-flow branches out of monolithic `ProductFlow` into a route-level app structure without changing the current visual brand.
- [ ] Establish one authenticated app shell with desktop sidebar and mobile navigation; make active route and keyboard focus visible.
- [ ] Preserve marketing-page build and links, while making demo limitations truthful.
- [ ] Run tests/build and verify no marketing content regression.

**Deliverable:** maintainable route structure ready for auth and real data; no credentials collected.

## Task 2: Domain rules and transaction model (TDD)

**Files:** `src/lib/domain/transactions.js`, `src/lib/domain/dashboard.js`, corresponding tests, `src/lib/metrics.js` migration if needed.

- [ ] Add failing tests for valid income/expense, required description/category/date, positive precise amount, supported currency precision, and rejection of invalid values.
- [ ] Add failing tests for inclusive date range, current/previous period, totals, net, zero-data behavior, sorting recent transactions, and daily/weekly chart buckets.
- [ ] Define a transaction model: id, businessId, type, description, categoryId/categoryKey, amountMinor, transactionDate, optional note, createdAt, updatedAt.
- [ ] Define category defaults suitable for broad small businesses; income examples (Sales, Services, Other income), expense defaults (Supplies, Rent, Payroll, Travel, Software, Utilities, Marketing, Fees, Other expense). Allow a category selection rather than free text only.
- [ ] Implement pure functions and locale/currency formatting separately from storage representation.
- [ ] Run tests and explicitly confirm an empty transaction set produces 0 totals and no fabricated chart history.

**Deliverable:** tested domain contract independent of UI and storage.

## Task 3: Better Auth + D1 server setup

**Files:** `functions/api/auth/[[path]].js`, `src/lib/server/auth.js`, `migrations/0001_auth_and_businesses.sql`, `wrangler.toml`, `.dev.vars.example`, `.gitignore`, tests.

- [ ] Verify installed Better Auth and Cloudflare integration versions and their D1/Pages request-context requirements from package docs.
- [ ] Add tests for absent binding/config fail-closed behavior and auth session retrieval; no secret values in test fixtures/logs.
- [ ] Create D1 auth schema and business table with owner foreign key, currency code, timezone (document default), created/updated timestamps, unique one-business-per-owner constraint for MVP.
- [ ] Initialize Better Auth from Pages Function request env with D1 and Google provider. Enforce production origin, secure cookies, and trusted origin allowlist.
- [ ] Implement `/api/auth/*` handler only; no fake password form and no OAuth emulation in production route.
- [ ] Add example binding names and secret variable names without values. Use local `.dev.vars` ignored by Git; configure runtime secrets in dashboard/CLI, never in build env.
- [ ] Run local Wrangler compatibility/bundle checks and apply migration locally.

**Gate:** real Google flow cannot be called working until owner supplies Google OAuth client, Cloudflare bindings/secrets, redirect URI is registered, and end-to-end callback/session is verified. Until this gate, leave a demo route that cannot accept real business data.

## Task 4: Authenticated, ownership-scoped API and business onboarding

**Files:** `functions/api/businesses/`, `src/lib/server/auth.js`, `migrations/`, `src/lib/api.js`, onboarding page/components/tests.

- [ ] Add API tests for unauthenticated 401, malformed input 400, ownership scoping, and duplicate business creation; initially fail.
- [ ] Add server helpers that resolve current Better Auth session and require a business owned by session user for every data operation.
- [ ] Add `GET/POST /api/businesses` with business name, currency and timezone validation; enforce one owner/business.
- [ ] Build onboarding with business name, currency, timezone/default locale info, privacy/manual-entry disclosure, loading/error/success states.
- [ ] Onboarding must resume correctly after refresh: read existing business and route to dashboard if already configured.
- [ ] Protect every product route. An unauthenticated request redirects to login; a signed-in user without business routes to onboarding.
- [ ] Verify server rejects forged business IDs and cannot access a second user's rows in local integration tests.

**Deliverable:** real account can create/read its own business profile, pending external OAuth configuration if not available.

## Task 5: Transaction persistence API and D1 constraints

**Files:** `migrations/0002_transactions.sql`, `functions/api/transactions/`, `src/lib/api.js`, transaction server tests.

- [ ] Add failing tests for list filtering, create/edit/delete validation, pagination bound, invalid category/currency/date, and cross-business access denial.
- [ ] Create transactions table with integer minor amount, type check, nonempty description, business and creator foreign keys, date-only transaction date, timestamps, category key, optional note; index `(business_id, transaction_date DESC, created_at DESC)`.
- [ ] Add endpoints for list/filter/range, create, update and delete. Derive business/user scope only from session and server lookup, never trust client-supplied owner IDs.
- [ ] Validate request sizes/fields and return safe, consistent errors; do not return SQL details or tokens.
- [ ] Ensure delete/edit protections scoped by active owned business; add confirmation copy in UI later.
- [ ] Run local D1 integration tests including two-user isolation (seed two users/businesses and attempt cross-access).

**Security gate:** do not connect UI writes until ownership tests pass.

## Task 6: Useful manual transaction workflow

**Files:** `src/pages/TransactionsPage.jsx`, `src/components/transactions/*`, `src/lib/domain/transactions.js`, UI/API integration tests.

- [ ] Add failing component tests for empty/list/loading/error states, filter combinations, form validation, edit/cancel, and delete confirmation.
- [ ] Implement transaction list with date range, type, category filters and clear filter state; useful empty state includes primary “Add transaction” action.
- [ ] Implement add/edit form for money in/out, description, broad-business category, positive amount/currency, date, optional note.
- [ ] Render signs, currency and dates consistently; ensure categories vary appropriately by transaction type.
- [ ] Implement delete confirmation and restore UI on API failure; disable duplicate submissions.
- [ ] Support narrow screens with usable list/card treatment, keyboard and screen-reader labels.
- [ ] Verify create/edit/delete against D1-backed endpoints and refresh persistence.

**Deliverable:** owners can maintain their manual cash-flow ledger in a real account.

## Task 7: Dashboard with real data and polished empty/populated states

**Files:** `src/pages/DashboardPage.jsx`, `src/components/dashboard/*`, `src/lib/domain/dashboard.js`, CSS and tests.

- [ ] Add failing UI tests for current month default, period changes, correct totals, empty dashboard, chart series, recent activity, and API error/loading states.
- [ ] Keep the landing mockup's intended UI/UX language—not its demo values: product sidebar/navigation, greeting/business header, period control, compact Money in/Money out/Net cards, large chart panel, recent activity panel, typography, spacing and sage/cream palette.
- [ ] Load transactions and derive all metrics/chart/activity from actual persisted records in the chosen date range. Never reuse landing sample arrays, demo dates, trends, or made-up percent comparisons in the product dashboard.
- [ ] Period choices: This month (default), Last month, Last 30 days, This quarter, Custom range only if the UX remains clear; test period boundaries in business timezone.
- [ ] Show zero totals and honest empty explanations when no records exist; chart has empty baseline/CTA without false axis claims or synthetic line.
- [ ] Make the “Add transaction” action prominent from overview; opening/saving leads directly to refreshed metrics/activity.
- [ ] Clearly label figures as manually recorded and not a bank balance. No comparative percentages until there is reliable prior-period data, and then label comparison basis.
- [ ] Add business/category date insights only if computed from real entries (for example top expense category); omit when data is insufficient.
- [ ] Verify small-screen visual hierarchy, resize/table overflow, focus, reduced motion, and chart accessibility.

**Deliverable:** dashboard is a useful cash-flow control surface, visually consistent with the landing mockup while semantically truthful.

## Task 8: Settings, data rights, and launch safeguards

**Files:** `src/pages/SettingsPage.jsx`, export/deletion endpoints if approved, privacy copy, `README.md`, tests.

- [ ] Decide email verification delivery and Google-only account expectation before launch; document secure recovery path.
- [ ] Implement logout and account/business settings display.
- [ ] Implement CSV export if safe to scope; include date/type/description/category/amount/currency/note and UTF-8 headers; test values with commas/newlines and formula injection protection.
- [ ] Provide user-facing account deletion/support path; if full deletion is not implemented, do not invite public users and clearly scope support process.
- [ ] Add privacy notice describing account/business/transaction data, hosting/auth providers, retention and contact channel; get owner/legal review before public launch.
- [ ] Test logout/session expiry, data export, deletion cascade or support request, and ownership isolation.

## Task 9: Deployment and end-to-end release verification

**Files:** README, Pages/D1 settings, Google Cloud OAuth configuration, smoke tests.

- [ ] Create/bind D1 database, apply migrations, and verify backups/environment separation.
- [ ] Set Pages Function D1 binding; add Better Auth secret, Google client ID and secret as encrypted runtime secrets. Never commit values or paste secrets into chat.
- [ ] Register local and production callback URLs using exact Better Auth callback route for installed version; configure allowed origins and deployed app URL.
- [ ] Run all unit/integration tests, production build, dependency audit, and verify no secret string exists in client bundle/repository.
- [ ] Browser test Google sign-in/callback/session refresh/logout, onboarding, add/edit/delete transaction, filtering, dashboard period totals/chart, mobile display and authorization rejection.
- [ ] Deploy using GitHub-connected Cloudflare Pages; verify successful build/deploy stages and smoke-test production domain.
- [ ] Confirm user-facing copy does not call temporary demo or manual records a bank balance, accounting system, or financial advice.

## Execution Order (Implementation Plan)

Build the product as four independently useful releases; each release must pass tests/build before the next begins. Do not attempt to ship every module in one risky change.

### Phase 1 — Real cash ledger + actionable overview (implement first)

1. Define/test domain model for transactions, customers/vendors references, invoice/bill settlement hooks, INR formatting and period calculations.
2. Replace monolithic product flow with route-level modules and a consistent responsive app shell; preserve landing page.
3. Deliver ledger workflow: create/edit/delete categorized income/expense, search/filter/date range, clear empty/loading/error states, and persistent prototype storage explicitly labelled as browser-only until D1 is configured.
4. Deliver overview with period totals, real-entry trend/category analysis, recent activity and quick actions; empty states contain no invented financial content.
5. Add India-first currency default, including INR/Indian digit grouping; retain user currency choices.
6. Add CSV export and basic settings/data explanation; test export escaping/formula injection.
7. Verify desktop/mobile navigation and workflows; run tests/build; deploy to Pages; keep auth/data claims honest.

### Phase 2 — Invoices and receivables

1. Test invoice/payment/status domain rules, including partial payments, due/overdue boundaries, and cash-vs-receivable separation.
2. Add customer and invoice list/detail/create/edit workflows with line items, due date, status, record-payment flow, overdue action list and printable/send-ready output.
3. Ensure received payments appear once in cash totals; unpaid invoice value is shown separately as receivable.
4. Add persistence/API schema only after auth/D1 availability and ownership tests.

### Phase 3 — Bills and payables

1. Test vendor/bill/payment rules including partial payment, due/overdue and expense recognition dates.
2. Add vendor/bill workflows and upcoming/overdue obligations, without treating unpaid bills as historical cash expenses.
3. Surface payables on overview as due actions, separate from actual cash outflow.

### Phase 4 — Budgets and reports

1. Test category-period budgets and actual-vs-plan calculations, including no-data cases.
2. Add targets, threshold alerts, month/category reports and CSV exports.
3. Label comparison periods and require sufficient real entries; do not invent trend percentages.

### Shared release gates

- Preserve product visual consistency and responsive accessibility across every new module.
- No fake examples in signed-in product views. Demo/illustrative content must be explicitly labeled and opt-in.
- Cloud persistence/auth rollout is gated on Better Auth + D1 configuration and cross-user authorization tests. Until available, prototype persistence must be clearly disclosed and must not be described as accounts/cloud saves.
- Never imply GST compliance, bank synchronization, payment processing, or accounting/tax advice.

## Product Roadmap and Module Boundaries

### Release 1 — Real cash ledger and actionable overview

- Auth, one-business onboarding, manual income/expense ledger with categories, search/filter/edit/delete.
- Overview: selected-period money in/out/net, real-data trend, recent activity, expense-category breakdown, and clear empty states.
- CSV export and essential settings/data support path.

### Release 2 — Sales and receivables

- Customer directory (minimal contact details), invoice create/edit/send-ready PDF, line items, due date, status (draft/sent/part-paid/paid/overdue/cancelled), payment recording and reminders/tasks.
- Invoice amounts and payments flow into cash reporting only when received; outstanding invoices are shown as receivables, never mislabeled as cash.
- Tax fields only if required, configurable and informational; no GST rate recommendation or filing.

### Release 3 — Bills and payables

- Vendor directory, bill amount/due date/category/status, partial payments, upcoming/overdue queue, and cash-flow obligation view.
- Payments become expenses on payment date; unpaid bills appear as obligations, not historical cash outflow.

### Release 4 — Budgets and management reports

- Monthly category targets, actual-vs-budget, threshold warnings, monthly comparisons, income/expense/category reports, CSV export.
- Comparisons and alerts require sufficient real data; label basis and period and avoid false precision.

### Explicit later/never-by-default scope

- Bank feeds, payment processing, CSV import, recurring automation, payroll/inventory, multi-business/team accounts, GST/tax computation or filing, accounting reconciliation, and AI-generated financial advice. Revisit only with validated demand, secure provider choices, and qualified compliance review.

## Out of Scope for Initial Release

- Bank feeds, payment processing, CSV import, recurring automation, payroll/inventory, multi-business/team accounts, GST/tax computation or filing, and AI-generated financial advice.

## Acceptance Criteria

- An owner can authenticate, configure one India-first business (INR default), enter/edit/delete categorized transactions, and see them after reload.
- Release 1 is a cohesive, useful first slice: searchable/filterable ledger; selected-period overview; honest trend and category breakdown; quick actions; export path.
- Follow-on module plan specifies end-to-end invoices/receivables, bills/payables, budgets and reports, with correct cash-vs-accrual distinctions and no double counting.
- Overview totals, period filters, activity, charts, category insights and any alerts are derived exclusively from authorized stored records; blank accounts show honest empty states.
- Visual hierarchy/layout mirrors the landing-page dashboard mockup, with real app behavior and no pasted mockup data.
- Unauthorized and cross-user access are rejected by server/database behavior, not frontend hiding.
- Money is integer minor units, currency is explicit, and date periods have tested boundaries.
- Google auth and persistence are only represented as working after successful production end-to-end verification; secrets remain server-side.
- Deployment, tests, build and security checks pass; public launch additionally waits for email/support, privacy, export/deletion and operational readiness decisions.

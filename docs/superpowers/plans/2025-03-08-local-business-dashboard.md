# Local Business Dashboard MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a polished prototype dashboard for local businesses to review sales, expenses, and profit, and to record transactions using sample data.

**Architecture:** Start as a client-side web prototype with a clearly separated sample-data layer and typed transaction model. Use a Cloudflare-compatible frontend stack selected during implementation after checking current project tooling; avoid introducing authentication or server-side persistence in this MVP. Keep data operations structured so a later backend can replace the sample-data adapter.

**Tech Stack:** Choose maintainable Cloudflare-compatible defaults during implementation (recommended: React + TypeScript + Vite, deployable to Cloudflare Pages). Keep dependencies minimal and use the project’s package manager conventions once identified.

## Global Constraints

- Hosting target: Cloudflare.
- MVP is a prototype using sample data; no real accounts, authentication, or persistence.
- MVP scope: sales and expenses with summary metrics and transaction entry/review.
- Do not imply sample transactions are real business records.
- Make currency and date presentation explicit and easy to adapt; use a reasonable default and label it.
- Project directory was empty at planning time; verify current state before implementation.

---

## File Structure

Exact paths should follow the scaffold established in Task 1.

- `src/types/transaction.ts` — transaction and category types, with sales/expense distinction.
- `src/data/sampleTransactions.ts` — deterministic demo dataset and sample business settings.
- `src/lib/metrics.ts` — pure calculations for revenue, expenses, profit, and period comparison if supported.
- `src/components/` — focused dashboard UI components (summary cards, transaction list, chart, entry form).
- `src/App.tsx` — application composition and local prototype state.
- `src/index.css` (or equivalent) — responsive visual system and layout styling.
- Test files colocated or under `src/` according to the chosen test runner.
- Root configuration and deployment files — framework build scripts and Cloudflare Pages configuration only as required by the chosen setup.

## Task 1: Scaffold the Cloudflare-Compatible Frontend

**Files:** Create the app scaffold and configuration based on the empty repository; add a short README with local run/build instructions.

- [ ] Confirm repository state and available runtime/package manager.
- [ ] Scaffold a React + TypeScript + Vite app (unless environment constraints favor another Cloudflare-compatible default).
- [ ] Add the minimal test runner needed for pure metric tests.
- [ ] Add or verify scripts for development, testing, and production build.
- [ ] Document local setup and Cloudflare Pages deployment assumptions.
- [ ] Run the initial test command and production build.

## Task 2: Define Transaction Model and Deterministic Demo Data

**Files:** `src/types/transaction.ts`, `src/data/sampleTransactions.ts`, corresponding tests.

- [ ] Define transaction fields: stable id, type (`sale` or `expense`), description, category, amount in minor currency units, and ISO date.
- [ ] Add sample business settings including business name and currency code.
- [ ] Create believable sample transactions spanning enough days to populate the dashboard.
- [ ] Test that amounts are positive, dates parse, IDs are unique, and transaction types are valid.

## Task 3: Implement and Test Dashboard Metrics

**Files:** `src/lib/metrics.ts`, metric tests.

- [ ] Write tests for revenue, expenses, and net profit over a requested date range.
- [ ] Include boundary dates in the period and exclude transactions outside it.
- [ ] Define empty-period behavior (all totals are zero).
- [ ] Implement pure functions using integer minor currency units to avoid floating-point money errors.
- [ ] Run metric tests and confirm they pass.

## Task 4: Build the Dashboard Overview

**Files:** `src/App.tsx`, focused components under `src/components/`, styles.

- [ ] Compose a clear dashboard with business identity and a selected date range.
- [ ] Show revenue, expenses, and profit summary cards with currency formatting.
- [ ] Show a simple sales/expenses trend visualization using the demo dataset; provide a useful empty state if there is no data.
- [ ] Show recent transactions with type, category, date, and amount.
- [ ] Make the layout responsive for mobile and desktop, with readable contrast and accessible labels.
- [ ] Clearly signal that this is a demo/prototype using sample data.

## Task 5: Add Local Transaction Entry

**Files:** transaction form component, `src/App.tsx`, focused tests if practical.

- [ ] Add a transaction form with sale/expense type, description, category, amount, and date.
- [ ] Validate required fields and positive valid amounts; show actionable inline errors.
- [ ] Add submitted entries to in-memory app state and update dashboard metrics and recent activity immediately.
- [ ] Use accessible labels, keyboard-friendly controls, and clear success feedback.
- [ ] Confirm reload resets demo changes, and communicate that behavior in the UI or README.

## Task 6: Verify Prototype and Cloudflare Build

**Files:** existing app and docs as needed.

- [ ] Run the complete test suite and production build.
- [ ] Manually verify desktop and narrow mobile layouts, entry validation, transaction submission, and recalculated totals.
- [ ] Check for console errors and inaccessible controls.
- [ ] Verify the build output and document the Cloudflare Pages build command/output directory.
- [ ] Do not deploy or connect real customer data until explicitly requested.

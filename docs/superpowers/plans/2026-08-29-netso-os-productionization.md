# NETSO OS Productionization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship NETSO OS V1 reliably through Vercel with Supabase Auth/Postgres/RLS and a verified persistence smoke test.

**Architecture:** GitHub is source control; Vercel is the production build/deployment authority; Supabase provides Auth, PostgreSQL and RLS. GitHub Actions is a secondary quality gate only.

**Tech Stack:** Next.js, React, TypeScript, Supabase, Node test runner, GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-08-29-netso-os-productionization-design.md`

## Global Constraints

- Never expose or commit Supabase service-role credentials.
- RLS is the database security boundary.
- Vercel owns production deployment.
- No feature expansion until production smoke tests pass.

---

### Task 1: Repository and application contract

**Files:**
- Inspect/Modify: `package.json`, `app/layout.tsx`, `app/page.tsx`, `lib/supabase.ts`, `vercel.json`
- Test: `tests/architecture.test.js`

- [ ] Verify Next.js scripts and dependencies.
- [ ] Verify browser Supabase client is lazy and public-key-only.
- [ ] Verify required production files exist.
- [ ] Run architecture tests with `node --test tests/architecture.test.js`.
- [ ] Run `npm run build`.

### Task 2: Database contract

**Files:**
- Verify/Modify: `supabase/schema.sql`
- Verify: Supabase project schema/RLS

- [ ] Compare canonical schema with the live database.
- [ ] Verify required tables, enums, indexes and RLS.
- [ ] Verify no privileged browser credentials are required.
- [ ] Run schema/source checks.

### Task 3: CI quality gate

**Files:**
- Modify: `.github/workflows/validate.yml`

- [ ] Keep install, required-file, credential, test and production-build checks.
- [ ] Ensure workflow does not deploy to GitHub Pages.
- [ ] Trigger a fresh run.
- [ ] Treat only an actual successful run as CI verification.

### Task 4: Vercel production deployment

**Files:**
- Verify: `vercel.json`

- [ ] Import `tazwarmahtab/netso-operator` into the connected Vercel workspace.
- [ ] Configure required public Supabase environment variables.
- [ ] Deploy from `main`.
- [ ] Capture the production deployment URL and build result.

### Task 5: Production smoke test

**Files:**
- Modify only if required by observed failures.

- [ ] Verify application loads in production.
- [ ] Verify authentication.
- [ ] Verify dashboard reads Supabase data.
- [ ] Create a test task through the UI.
- [ ] Refresh and confirm persistence.
- [ ] Verify unauthorized access is blocked by RLS.
- [ ] Record completion evidence.

### Task 6: Final review and handoff

- [ ] Review changed files for unnecessary complexity.
- [ ] Confirm CI and Vercel roles remain separated.
- [ ] Confirm no credentials are committed.
- [ ] Record production status and remaining roadmap.
- [ ] Only then mark NETSO OS V1 productionized.

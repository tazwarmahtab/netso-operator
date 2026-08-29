# NETSO OS Productionization Design

**Date:** 2026-08-29
**Status:** Approved

## Goal
Ship NETSO OS V1 as a reliable internal operating system with GitHub as source control, Vercel as production hosting, and Supabase as authentication/data infrastructure.

## Architecture
GitHub is the source of truth. Vercel owns production builds and deployment through native Git integration. Supabase provides Auth, PostgreSQL, and Row Level Security. GitHub Actions remains a secondary quality gate for static checks and tests, but is not the production deployment mechanism.

## Scope
- Next.js production application shell and Supabase browser integration.
- Canonical Supabase schema and RLS boundaries.
- Deterministic tests and production build validation.
- Vercel deployment configuration and environment-variable contract.
- Authenticated smoke test covering login, dashboard read, task creation, and persistence.

## Out of Scope
CRM expansion, Notion synchronization, AI CEO/agent layer, advanced analytics, and additional feature modules until production deployment is verified.

## Security
Only public Supabase client configuration may reach browser code. Service-role credentials must never be committed or exposed to the client. Database authorization is enforced by RLS; UI checks are not the security boundary.

## Success Criteria
1. Production build succeeds in Vercel.
2. Production deployment serves the Next.js app.
3. Authenticated owner/admin/member access follows RLS policies.
4. A task can be created and remains after refresh.
5. No service-role credential is present in repository source.
6. GitHub CI provides useful pass/fail signals without owning deployment.

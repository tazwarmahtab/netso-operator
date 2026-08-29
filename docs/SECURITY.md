# NETSO OS Security Model

## Authentication

Supabase Auth is the identity provider. The browser may use only the publishable Supabase key. Service-role credentials must never be committed or exposed client-side.

## Authorization

`public.user_profiles` maps authenticated users to `owner`, `admin`, or `member` roles. Operational tables are readable only to authenticated users. Writes are restricted to owners/admins through `public.is_netso_admin()`.

## Evidence discipline

Operational records must preserve their evidence level. Never promote LOI, estimate, assumption, hypothesis, or unverified data to verified metrics without source evidence.

## Production requirements

Before production launch:
- Require email confirmation or an approved authentication policy.
- Create the founder account and promote it to `owner` using a controlled server-side/admin workflow.
- Do not expose service-role keys in GitHub, Vercel environment variables accessible to the browser, or frontend source.
- Add organization/team membership if external users will ever access the system.
- Review RLS policies after every schema change.
- Use environment variables for Supabase URL/key rather than hardcoding them in production source.

# NETSO OS — Production Architecture

## Objective

NETSO OS is the internal operating system for Netso Energy. The application must optimize founder decision velocity around the current strategic objective:

> MAKE NETSO FINANCEABLE AND DEPLOYABLE.

## System boundaries

- **Web app:** Next.js + TypeScript, deployed on Vercel.
- **Operational database:** Supabase/PostgreSQL. This is the source of truth for structured operational records.
- **Knowledge layer:** Notion and controlled document storage. This is the source of truth for strategy, research, SOPs and long-form knowledge.
- **AI layer:** ChatGPT/agents. AI may analyze and recommend, but must not silently overwrite verified operational facts.
- **Source control:** GitHub.

## Core entities

```text
Customer
  └── Project
       ├── Tasks
       ├── PPA / Contract
       ├── Financing Cases
       ├── Documents
       ├── Risks
       └── Portfolio Metrics

Founder Decisions
  └── may reference Customer / Project / Financing / Risk / Task
```

## Evidence discipline

Every material project or financial field should have a verification state:

- VERIFIED — supported by primary evidence.
- LOI — supported by a letter of intent but not an executed contract.
- ESTIMATE — modelled or estimated; not independently validated.
- ASSUMPTION — working assumption.
- UNVERIFIED — insufficient evidence.
- TBD — data not yet available.

The UI must never present estimates, assumptions or LOIs as executed/verified facts.

## Current seed record

Chittagong Grammar School is represented as an LOI-stage record:

- 80 kWp
- BOO/PPA structure
- 20-year term
- BDT 10/kWh LOI rate
- estimated generation ~115,632 kWh/year

These values are contextual seed data and must retain their evidence status. No additional pipeline project should receive invented capacity, generation, CAPEX or financial metrics.

## Strategic priority hierarchy

1. Executed customer contracts / PPAs
2. Bankability and technical validation
3. Financing close
4. First deployment
5. Repeatable acquisition and portfolio scale
6. Platform/NEOS expansion

Residential expansion, advanced storage/EV functionality and AI edge-compute concepts are strategic future options, not automatic current priorities.

## Decision taxonomy

Every strategic initiative should be classifiable as:

- SCALE
- EXPERIMENT
- SHRINK
- DEFER
- KILL

## Production requirements

- Authentication before exposing company data.
- Row-level security in Supabase.
- Audit fields (`created_at`, `updated_at`, `created_by`, `updated_by`).
- Soft deletion for operational records where appropriate.
- No secrets in GitHub.
- Environment variables for Supabase/Vercel configuration.
- Database migrations tracked in source control.
- Preview deployment for pull requests.
- Production deployment only from the protected main branch.
- Automated lint/typecheck/build before deployment.

## AI guardrails

AI-generated values must be explicitly marked as AI-derived until confirmed. AI can propose task priority, identify blockers, summarize documents and recommend actions. AI must not convert an assumption into a fact, create a fake customer/project, or mark financing as secured without primary evidence.

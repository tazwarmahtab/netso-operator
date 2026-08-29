# NETSO OS V1 Data Model

V1 uses local browser state. This document defines the stable entity boundary for a future Supabase adapter while Notion remains the knowledge/document layer.

## Entities

- `tasks`: id, name, priority, status, impact, workstream, classification, due, blocked, project_id.
- `projects`: id, name, customer_id, location, stage, capacity_kwp, generation_kwh_year, ppa_rate, ppa_term_years, capex, debt, equity, revenue, dscr, irr, evidence_status, truth_level, next_gate, blocker.
- `customers`: id, name, segment, location, contact, stage, probability, next_action, next_action_date.
- `financing_cases`: id, project_id, provider, type, stage, capital_required, debt, equity, security_requirement, next_action, blocker, deadline, evidence_status.
- `portfolio_assets`: id, project_id, commissioned_at, capacity_kwp, generation, revenue, opex, collections, performance_status.
- `risks`: id, title, probability, impact, owner, mitigation, status.
- `decisions`: id, title, date, rationale, alternatives, consequence, classification.
- `documents`: id, title, category, source, status, project_id, customer_id, financing_case_id.

## Relationships

`customers 1—N projects`; `projects 1—N tasks`; `projects 1—N financing_cases`; `projects 0—1 portfolio_assets`; all operational records may link to `documents`; `risks` and `decisions` may reference projects or workstreams.

## Evidence rule

Every material metric should carry an evidence/truth status. V1 uses explicit labels such as `LOI / needs execution`, `Unverified`, `Needs confirmation`, or `Not yet tracked`. Never turn an estimate or LOI into a verified operating metric.

## Future adapter contract

The UI should consume collections with stable IDs rather than depending on Notion page IDs or Supabase-specific query shapes. A future repository layer can implement `getTasks`, `getProjects`, `getCustomers`, `getFinancingCases`, `getPortfolio`, `getRisks`, `getDecisions`, and `getDocuments` without changing the presentation layer.

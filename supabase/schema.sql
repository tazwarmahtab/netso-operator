-- NETSO OS operational schema
-- Structured operational truth belongs in PostgreSQL/Supabase.
-- Run through a reviewed migration process; do not apply blindly to production.

create extension if not exists pgcrypto;

create type evidence_status as enum ('VERIFIED','LOI','ESTIMATE','ASSUMPTION','UNVERIFIED','TBD');
create type strategic_classification as enum ('SCALE','EXPERIMENT','SHRINK','DEFER','KILL');
create type project_stage as enum ('PROSPECT','QUALIFIED','SITE_SURVEY','TECHNICAL_QUALIFIED','PROPOSAL','LOI','PPA_NEGOTIATION','EXECUTED_PPA','FINANCING','PROCUREMENT','CONSTRUCTION','COMMISSIONED','OPERATING');
create type task_priority as enum ('P0','P1','P2','P3');
create type task_status as enum ('BACKLOG','ACTIVE','BLOCKED','DONE','DEFERRED');
create type financing_stage as enum ('RESEARCH','CONTACTED','REQUIREMENTS','SUBMITTED','DUE_DILIGENCE','APPROVED','DISBURSED','REJECTED');

create table customers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  segment text,
  location text,
  primary_contact text,
  email text,
  phone text,
  relationship_status text,
  notes text,
  evidence evidence_status not null default 'TBD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table projects (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references customers(id),
  name text not null,
  location text,
  stage project_stage not null default 'PROSPECT',
  evidence evidence_status not null default 'TBD',
  capacity_kw numeric,
  annual_generation_kwh numeric,
  ppa_rate_bdt_per_kwh numeric,
  ppa_term_years integer,
  capex_bdt numeric,
  debt_bdt numeric,
  equity_bdt numeric,
  annual_revenue_bdt numeric,
  dscr numeric,
  irr numeric,
  next_gate text,
  blocker text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  priority task_priority not null default 'P2',
  status task_status not null default 'BACKLOG',
  impact text,
  workstream text,
  classification strategic_classification,
  project_id uuid references projects(id),
  customer_id uuid references customers(id),
  owner_id uuid,
  due_at timestamptz,
  blocker text,
  evidence evidence_status not null default 'TBD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table financing_cases (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id),
  provider_name text not null,
  provider_type text,
  stage financing_stage not null default 'RESEARCH',
  capital_required_bdt numeric,
  debt_bdt numeric,
  equity_bdt numeric,
  security_requirement text,
  next_action text,
  blocker text,
  deadline timestamptz,
  evidence evidence_status not null default 'TBD',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table risks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  probability text,
  impact text,
  status text default 'OPEN',
  owner_id uuid,
  mitigation text,
  project_id uuid references projects(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table decisions (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  decision text not null,
  rationale text,
  alternatives text,
  consequence text,
  classification strategic_classification,
  project_id uuid references projects(id),
  decided_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table documents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  category text,
  source text,
  source_url text,
  evidence evidence_status not null default 'TBD',
  customer_id uuid references customers(id),
  project_id uuid references projects(id),
  financing_case_id uuid references financing_cases(id),
  status text default 'ACTIVE',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index projects_customer_idx on projects(customer_id);
create index projects_stage_idx on projects(stage);
create index tasks_project_idx on tasks(project_id);
create index tasks_status_priority_idx on tasks(status, priority);
create index financing_project_idx on financing_cases(project_id);
create index financing_stage_idx on financing_cases(stage);
create index risks_project_idx on risks(project_id);
create index documents_project_idx on documents(project_id);

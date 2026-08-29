-- NETSO OS canonical schema source. Mirrors the live Supabase core model.
create extension if not exists pgcrypto;
create type public.evidence_level as enum ('VERIFIED','LOI','ESTIMATE','ASSUMPTION','HYPOTHESIS','UNVERIFIED','TBD');
create type public.strategic_action as enum ('SCALE','EXPERIMENT','SHRINK','DEFER','KILL');
create type public.task_priority as enum ('P0','P1','P2','P3');
create type public.task_status as enum ('TODO','IN_PROGRESS','BLOCKED','DONE','CANCELLED');
create type public.project_stage as enum ('PROSPECT','QUALIFIED','SITE_SURVEY','TECHNICAL_QUALIFIED','PROPOSAL','LOI','PPA_NEGOTIATION','EXECUTED_PPA','FINANCING','PROCUREMENT','CONSTRUCTION','COMMISSIONED','OPERATING','LOST');
create type public.financing_stage as enum ('RESEARCH','CONTACTED','REQUIREMENTS','SUBMITTED','DUE_DILIGENCE','APPROVED','DISBURSED','REJECTED');
create type public.risk_status as enum ('OPEN','MITIGATING','ACCEPTED','CLOSED');

create table public.user_profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text, role text not null default 'member' check (role in ('owner','admin','member')), created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.customers (id uuid primary key default gen_random_uuid(), name text not null, segment text, location text, contact_name text, contact_email text, contact_phone text, commercial_status text, evidence_level public.evidence_level not null default 'TBD', notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.projects (id uuid primary key default gen_random_uuid(), customer_id uuid references public.customers(id) on delete set null, name text not null, location text, stage public.project_stage not null default 'PROSPECT', capacity_kw numeric, annual_generation_kwh numeric, ppa_rate_bdt_per_kwh numeric, ppa_term_years integer, capex_bdt numeric, debt_bdt numeric, equity_bdt numeric, annual_revenue_bdt numeric, dscr numeric, irr_percent numeric, probability_percent numeric, evidence_level public.evidence_level not null default 'TBD', next_gate text, blocker text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.tasks (id uuid primary key default gen_random_uuid(), title text not null, description text, priority public.task_priority not null default 'P2', status public.task_status not null default 'TODO', impact text, workstream text, owner text, project_id uuid references public.projects(id) on delete set null, due_date date, blocker text, strategic_action public.strategic_action, evidence_level public.evidence_level not null default 'TBD', notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.financing_cases (id uuid primary key default gen_random_uuid(), project_id uuid references public.projects(id) on delete set null, provider_name text not null, provider_type text, stage public.financing_stage not null default 'RESEARCH', capital_required_bdt numeric, debt_bdt numeric, equity_bdt numeric, guarantee_required boolean, guarantee_type text, next_action text, deadline date, blocker text, evidence_level public.evidence_level not null default 'TBD', notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.risks (id uuid primary key default gen_random_uuid(), title text not null, description text, probability text, impact text, status public.risk_status not null default 'OPEN', owner text, mitigation text, strategic_action public.strategic_action, evidence_level public.evidence_level not null default 'TBD', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table public.decisions (id uuid primary key default gen_random_uuid(), title text not null, decision text not null, rationale text, alternatives text, consequence text, decided_on date, strategic_action public.strategic_action, evidence_level public.evidence_level not null default 'TBD', created_at timestamptz not null default now());
create table public.documents (id uuid primary key default gen_random_uuid(), name text not null, category text, source text, project_id uuid references public.projects(id) on delete set null, customer_id uuid references public.customers(id) on delete set null, financing_case_id uuid references public.financing_cases(id) on delete set null, status text, evidence_level public.evidence_level not null default 'TBD', url text, notes text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

alter table public.user_profiles enable row level security;
alter table public.customers enable row level security;
alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.financing_cases enable row level security;
alter table public.risks enable row level security;
alter table public.decisions enable row level security;
alter table public.documents enable row level security;

-- Indexes used by the command center.
create index projects_stage_idx on public.projects(stage);
create index projects_customer_idx on public.projects(customer_id);
create index tasks_status_priority_idx on public.tasks(status, priority);
create index tasks_due_date_idx on public.tasks(due_date);
create index tasks_project_idx on public.tasks(project_id);
create index financing_stage_idx on public.financing_cases(stage);
create index financing_project_idx on public.financing_cases(project_id);
create index documents_project_idx on public.documents(project_id);
create index documents_financing_idx on public.documents(financing_case_id);

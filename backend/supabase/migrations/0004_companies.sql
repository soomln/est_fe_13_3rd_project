create table if not exists public.companies (
  id       uuid primary key default gen_random_uuid(),
  slug     text unique not null,
  name     text not null,
  logo_url text,

  industry_code   text,
  size_code       text,
  job_role_codes  text[] not null default '{}',

  tagline     text,
  description text,
  tags        text[] not null default '{}',
  homepage    text,
  hq_address  text,
  location    text,

  founded_on     date,
  ceo            text,
  employee_count int,
  capital_text   text,
  avg_salary_text text,

  rating numeric(2,1),
  rating_dimensions jsonb not null default '{}'::jsonb,
  salary_detail     jsonb not null default '{}'::jsonb,

  core_values jsonb not null default '[]'::jsonb,
  services    jsonb not null default '[]'::jsonb,
  benefits    jsonb not null default '[]'::jsonb,
  highlights  jsonb not null default '[]'::jsonb,
  news        jsonb not null default '[]'::jsonb,

  hiring_status text,
  view_count    int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint companies_rating_range check (rating is null or (rating >= 0 and rating <= 5))
);

create index if not exists idx_companies_name    on public.companies (name);
create index if not exists idx_companies_industry on public.companies (industry_code);
create index if not exists idx_companies_size     on public.companies (size_code);
create index if not exists idx_companies_roles    on public.companies using gin (job_role_codes);

alter table public.companies add column if not exists tags text[] not null default '{}';

drop trigger if exists trg_companies_updated_at on public.companies;
create trigger trg_companies_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

alter table public.companies enable row level security;

drop policy if exists "companies 누구나 읽기" on public.companies;
create policy "companies 누구나 읽기"
  on public.companies for select using (true);

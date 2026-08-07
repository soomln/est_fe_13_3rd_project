create table if not exists public.code_master (
  id          bigint generated always as identity primary key,
  group_name  text    not null,
  code        text    not null,
  label       text    not null,
  sort_order  int     not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),

  unique (group_name, code)
);

create index if not exists idx_code_master_group
  on public.code_master (group_name, sort_order)
  where is_active;

comment on table  public.code_master        is '드롭다운/필터 옵션 마스터';
comment on column public.code_master.group_name is
  'job_role | company_size | industry | tech_stack | interest_field | interview_channel | pass_result | difficulty | language_level | education_level | career_level | edu_status';

alter table public.code_master enable row level security;

drop policy if exists "code_master 누구나 읽기" on public.code_master;
create policy "code_master 누구나 읽기"
  on public.code_master for select
  using (true);

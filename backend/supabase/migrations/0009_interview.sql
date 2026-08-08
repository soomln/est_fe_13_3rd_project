create table if not exists public.interview_sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,

  resume_ids       uuid[] not null default '{}',
  cover_letter_ids uuid[] not null default '{}',

  interviewer_style text not null default 'neutral',

  selected_categories text[] not null default '{}',

  show_timer   boolean not null default true,
  duration_sec int not null default 0,

  status      text not null default 'ongoing',
  total_score int,
  sub_scores  jsonb not null default '{}'::jsonb,

  created_at  timestamptz not null default now(),
  finished_at timestamptz,

  constraint interview_sessions_style
    check (interviewer_style in ('friendly', 'neutral', 'pressure', 'technical')),
  constraint interview_sessions_status
    check (status in ('ongoing', 'finished'))
);

create index if not exists idx_sessions_user
  on public.interview_sessions (user_id, created_at desc);

alter table public.interview_sessions enable row level security;

drop policy if exists "interview_sessions 본인만" on public.interview_sessions;
create policy "interview_sessions 본인만"
  on public.interview_sessions for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create table if not exists public.interview_qas (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.interview_sessions(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,

  seq      int  not null default 0,
  category text,
  question text not null,
  answer   text,
  feedback jsonb not null default '{}'::jsonb,
  score    int,

  created_at timestamptz not null default now()
);

create index if not exists idx_qas_session
  on public.interview_qas (session_id, seq);
create index if not exists idx_qas_user
  on public.interview_qas (user_id, created_at desc);

alter table public.interview_qas enable row level security;

drop policy if exists "interview_qas 본인만" on public.interview_qas;
create policy "interview_qas 본인만"
  on public.interview_qas for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop trigger if exists trg_cleanup_reactions on public.interview_qas;
create trigger trg_cleanup_reactions after delete on public.interview_qas
  for each row execute function public.cleanup_reactions('interview_qa');

create table if not exists public.portfolios (
  id      uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,

  title       text not null default '제목 없음',
  category    text,
  thumbnail_url text,
  description text,

  content jsonb not null default '[]'::jsonb,

  bg_color text not null default '#F4FCFE',
  gap_px   int  not null default 16,

  status     text not null default 'draft',
  view_count int  not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint portfolios_status   check (status in ('draft', 'published')),
  constraint portfolios_category check (category is null or category in ('web', 'app'))
);

create index if not exists idx_portfolios_public
  on public.portfolios (created_at desc)
  where status = 'published';
create index if not exists idx_portfolios_user
  on public.portfolios (user_id, created_at desc);
create index if not exists idx_portfolios_category
  on public.portfolios (category);

drop trigger if exists trg_portfolios_updated_at on public.portfolios;
create trigger trg_portfolios_updated_at
  before update on public.portfolios
  for each row execute function public.set_updated_at();

alter table public.portfolios enable row level security;

drop policy if exists "portfolios 공개글 읽기" on public.portfolios;
drop policy if exists "portfolios 본인만 생성" on public.portfolios;
drop policy if exists "portfolios 본인만 수정" on public.portfolios;
drop policy if exists "portfolios 본인만 삭제" on public.portfolios;

create policy "portfolios 공개글 읽기"
  on public.portfolios for select
  using (status = 'published' or (select auth.uid()) = user_id);

create policy "portfolios 본인만 생성"
  on public.portfolios for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "portfolios 본인만 수정"
  on public.portfolios for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "portfolios 본인만 삭제"
  on public.portfolios for delete to authenticated
  using ((select auth.uid()) = user_id);

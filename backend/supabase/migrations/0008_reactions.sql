create table if not exists public.reactions (
  user_id     uuid not null references public.profiles(id) on delete cascade,
  target_type text not null,
  target_id   uuid not null,
  kind        text not null,
  created_at  timestamptz not null default now(),

  primary key (user_id, target_type, target_id, kind),

  constraint reactions_target_type
    check (target_type in ('portfolio', 'post', 'company', 'comment', 'interview_qa', 'template')),
  constraint reactions_kind
    check (kind in ('like', 'bookmark'))
);

alter table public.reactions drop constraint if exists reactions_target_type;
alter table public.reactions add constraint reactions_target_type
  check (target_type in ('portfolio', 'post', 'company', 'comment', 'interview_qa', 'template'));

create index if not exists idx_reactions_target
  on public.reactions (target_type, target_id, kind);
create index if not exists idx_reactions_mine
  on public.reactions (user_id, target_type, kind, created_at desc);

alter table public.reactions enable row level security;

drop policy if exists "reactions 누구나 읽기" on public.reactions;
drop policy if exists "reactions 본인만 생성" on public.reactions;
drop policy if exists "reactions 본인만 삭제" on public.reactions;

create policy "reactions 누구나 읽기"
  on public.reactions for select using (true);

create policy "reactions 본인만 생성"
  on public.reactions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "reactions 본인만 삭제"
  on public.reactions for delete to authenticated
  using ((select auth.uid()) = user_id);

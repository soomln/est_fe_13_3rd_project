create table if not exists public.portfolio_collaborators (
  portfolio_id uuid not null references public.portfolios(id) on delete cascade,
  user_id      uuid not null references public.profiles(id)   on delete cascade,
  sort_order   int  not null default 0,
  created_at   timestamptz not null default now(),

  primary key (portfolio_id, user_id)
);

create index if not exists idx_portfolio_collaborators_user
  on public.portfolio_collaborators (user_id);

comment on table public.portfolio_collaborators is
  '포트폴리오 공동작업자. 소유자만 넣고 뺄 수 있고, 공개된 포트폴리오의 목록만 남에게 보인다';

alter table public.portfolio_collaborators enable row level security;

drop policy if exists "portfolio_collaborators 공개글만 읽기" on public.portfolio_collaborators;
drop policy if exists "portfolio_collaborators 소유자만 쓰기" on public.portfolio_collaborators;

create policy "portfolio_collaborators 공개글만 읽기"
  on public.portfolio_collaborators for select
  using (
    exists (
      select 1 from public.portfolios p
       where p.id = portfolio_id
         and (p.status = 'published' or (select auth.uid()) = p.user_id)
    )
  );

create policy "portfolio_collaborators 소유자만 쓰기"
  on public.portfolio_collaborators for all to authenticated
  using (
    exists (
      select 1 from public.portfolios p
       where p.id = portfolio_id and p.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.portfolios p
       where p.id = portfolio_id and p.user_id = (select auth.uid())
    )
  );

grant select on public.portfolio_collaborators to anon, authenticated;
grant insert, update, delete on public.portfolio_collaborators to authenticated;

create or replace function public.find_member_by_email(p_email text)
returns table (id uuid, name text, avatar_url text)
language sql
stable
security definer
set search_path = ''
as $$
  select pr.id, pr.name, pr.avatar_url
    from auth.users u
    join public.profiles pr on pr.id = u.id
   where (select auth.uid()) is not null
     and u.email is not null
     and pg_catalog.lower(u.email) = pg_catalog.lower(pg_catalog.btrim(p_email))
   limit 1;
$$;

comment on function public.find_member_by_email(text) is
  '공동작업자 초대용 조회. 정확히 일치하는 이메일 하나만 찾고 이름·사진만 돌려준다. 이메일을 되돌려주지 않으므로 역방향 노출은 없다';

revoke execute on function public.find_member_by_email(text) from public, anon;
grant  execute on function public.find_member_by_email(text) to authenticated;

create or replace function public.save_portfolio_collaborators(
  p_portfolio_id uuid,
  p_user_ids     uuid[]
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'NOT_AUTHENTICATED' using hint = '로그인이 필요합니다.';
  end if;

  if not exists (
    select 1 from public.portfolios p where p.id = p_portfolio_id and p.user_id = uid
  ) then
    raise exception 'PORTFOLIO_NOT_MINE' using hint = '본인 포트폴리오만 수정할 수 있습니다.';
  end if;

  delete from public.portfolio_collaborators where portfolio_id = p_portfolio_id;

  insert into public.portfolio_collaborators (portfolio_id, user_id, sort_order)
  select p_portfolio_id, t.user_id, (t.ord - 1)::int
    from pg_catalog.unnest(coalesce(p_user_ids, '{}'::uuid[])) with ordinality as t(user_id, ord)
   where t.user_id is not null
     and t.user_id <> uid
  on conflict (portfolio_id, user_id) do nothing;
end;
$$;

comment on function public.save_portfolio_collaborators(uuid, uuid[]) is
  '공동작업자 목록을 한 트랜잭션에서 통째로 교체한다. 소유자 본인은 목록에서 제외하고 중복은 무시한다';

revoke execute on function public.save_portfolio_collaborators(uuid, uuid[]) from public, anon;
grant  execute on function public.save_portfolio_collaborators(uuid, uuid[]) to authenticated;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

create or replace function public.toggle_reaction(
  p_target_type text,
  p_target_id   uuid,
  p_kind        text default 'bookmark'
)
returns boolean
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'NOT_AUTHENTICATED' using hint = '로그인이 필요합니다.';
  end if;

  delete from public.reactions
   where user_id = uid
     and target_type = p_target_type
     and target_id   = p_target_id
     and kind        = p_kind;

  if found then
    return false;
  end if;

  insert into public.reactions (user_id, target_type, target_id, kind)
  values (uid, p_target_type, p_target_id, p_kind);

  return true;
end;
$$;

revoke execute on function public.toggle_reaction(text, uuid, text) from public, anon;
grant  execute on function public.toggle_reaction(text, uuid, text) to authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,

    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      new.raw_user_meta_data ->> 'user_name',
      new.raw_user_meta_data ->> 'preferred_username'
    ),
    coalesce(
      new.raw_user_meta_data ->> 'avatar_url',
      new.raw_user_meta_data ->> 'picture'
    )
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  'profiles 는 전체 공개 읽기다. 로그인 이메일을 자동 복사하면 본인 동의 없이 공개되므로 email 은 채우지 않는다. profiles.email 은 사용자가 이력서용 연락처로 직접 입력할 때만 값이 생긴다';

update public.profiles p
   set email = null
  from auth.users u
 where u.id = p.id
   and p.email = u.email;

revoke execute on function public.handle_new_user()        from public, anon, authenticated;
revoke execute on function public.cleanup_reactions()      from public, anon, authenticated;
revoke execute on function public.enforce_document_limit() from public, anon, authenticated;

create or replace view public.v_reaction_counts
with (security_invoker = off) as
select target_type, target_id, kind, count(*) as cnt
from public.reactions
group by target_type, target_id, kind;

comment on view public.v_reaction_counts is
  '좋아요·북마크 집계 전용. user_id 를 노출하지 않는다. reactions 는 본인 행만 읽을 수 있으므로 카운트는 반드시 이 뷰를 경유할 것';

grant select on public.v_reaction_counts to anon, authenticated;

drop policy if exists "reactions 누구나 읽기" on public.reactions;
drop policy if exists "reactions 본인만 읽기" on public.reactions;

create policy "reactions 본인만 읽기"
  on public.reactions for select to authenticated
  using ((select auth.uid()) = user_id);

drop view if exists public.v_portfolios cascade;
create view public.v_portfolios
with (security_invoker = on) as
select
  p.*,
  pr.name       as author_name,
  pr.avatar_url as author_avatar_url,
  pr.desired_role as author_desired_role,
  coalesce(l.cnt, 0) as like_count,
  coalesce(b.cnt, 0) as bookmark_count
from public.portfolios p
join public.profiles pr on pr.id = p.user_id
left join public.v_reaction_counts l
  on l.target_type = 'portfolio' and l.kind = 'like'     and l.target_id = p.id
left join public.v_reaction_counts b
  on b.target_type = 'portfolio' and b.kind = 'bookmark' and b.target_id = p.id;

comment on view public.v_portfolios is
  '포트폴리오 + 작성자 + 좋아요/북마크 수. 정렬: created_at(최신) / view_count(조회) / like_count(추천) / bookmark_count(스크랩)';

drop view if exists public.v_posts cascade;
create view public.v_posts
with (security_invoker = on) as
select
  p.*,
  pr.name       as author_name,
  pr.avatar_url as author_avatar_url,
  c.name        as company_name,
  c.logo_url    as company_logo_url,
  c.slug        as company_slug,
  coalesce(l.cnt, 0) as like_count,
  coalesce(b.cnt, 0) as scrap_count,
  coalesce(cm.cnt, 0) as comment_count
from public.posts p
join public.profiles pr on pr.id = p.user_id
left join public.companies c on c.id = p.company_id
left join public.v_reaction_counts l
  on l.target_type = 'post' and l.kind = 'like'     and l.target_id = p.id
left join public.v_reaction_counts b
  on b.target_type = 'post' and b.kind = 'bookmark' and b.target_id = p.id
left join (
  select post_id, count(*) as cnt from public.comments group by post_id
) cm on cm.post_id = p.id;

comment on view public.v_posts is
  '면접 후기(review) / 면접 족보(qbank) + 작성자 + 기업 + 도움돼요/퍼가요/댓글 수';

drop view if exists public.v_comments cascade;
create view public.v_comments
with (security_invoker = on) as
select
  c.*,
  pr.name       as author_name,
  pr.avatar_url as author_avatar_url,
  coalesce(l.cnt, 0) as like_count
from public.comments c
join public.profiles pr on pr.id = c.user_id
left join public.v_reaction_counts l
  on l.target_type = 'comment' and l.kind = 'like' and l.target_id = c.id;

comment on view public.v_comments is '댓글 + 작성자 + 좋아요 수. 정렬: 최신순(기본) / 추천순';

drop view if exists public.v_companies cascade;
create view public.v_companies
with (security_invoker = on) as
select
  c.*,
  coalesce(b.cnt, 0) as bookmark_count,
  coalesce(s.review_count, 0) as review_count,
  coalesce(s.qbank_count, 0)  as qbank_count,
  s.avg_difficulty,
  s.pass_rate
from public.companies c
left join public.v_reaction_counts b
  on b.target_type = 'company' and b.kind = 'bookmark' and b.target_id = c.id
left join (
  select
    company_id,
    count(*) filter (where post_type = 'review') as review_count,
    count(*) filter (where post_type = 'qbank')  as qbank_count,
    round(avg(difficulty_score), 1)              as avg_difficulty,

    round(
      100.0 * count(*) filter (where pass_result_code = 'pass')
            / nullif(count(*) filter (where pass_result_code in ('pass', 'fail')), 0)
    ) as pass_rate
  from public.posts
  where company_id is not null
  group by company_id
) s on s.company_id = c.id;

comment on view public.v_companies is
  '기업 + 관심회사 수 + 후기/족보 수 + 평균 난이도 + 합격률';

create or replace function public.get_recommended_companies(p_limit int default 6)
returns setof public.v_companies
language sql
stable
security invoker
set search_path = ''
as $$
  select * from public.v_companies
   order by bookmark_count desc, view_count desc, name asc
   limit greatest(1, least(p_limit, 50));
$$;

grant select   on public.v_portfolios to anon, authenticated;
grant select   on public.v_posts      to anon, authenticated;
grant select   on public.v_comments   to anon, authenticated;
grant select   on public.v_companies  to anon, authenticated;
grant execute  on function public.get_recommended_companies(int) to anon, authenticated;

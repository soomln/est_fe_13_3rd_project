create table if not exists public.reaction_counts (
  target_type text not null,
  target_id   uuid not null,
  kind        text not null,
  cnt         int  not null default 0,

  primary key (target_type, target_id, kind)
);

comment on table public.reaction_counts is
  '좋아요·북마크 집계. reactions 는 본인 행만 읽을 수 있으므로 카운트는 이 표를 경유한다. user_id 를 담지 않는다. 트리거가 갱신하므로 직접 쓰지 말 것';

alter table public.reaction_counts enable row level security;

drop policy if exists "reaction_counts 누구나 읽기" on public.reaction_counts;
create policy "reaction_counts 누구나 읽기"
  on public.reaction_counts for select using (true);

create or replace function public.sync_reaction_count()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.reaction_counts (target_type, target_id, kind, cnt)
    values (new.target_type, new.target_id, new.kind, 1)
    on conflict (target_type, target_id, kind)
    do update set cnt = public.reaction_counts.cnt + 1;

    return new;
  end if;

  update public.reaction_counts
     set cnt = cnt - 1
   where target_type = old.target_type
     and target_id   = old.target_id
     and kind        = old.kind;

  delete from public.reaction_counts
   where target_type = old.target_type
     and target_id   = old.target_id
     and kind        = old.kind
     and cnt <= 0;

  return old;
end;
$$;

comment on function public.sync_reaction_count() is
  'reactions AFTER INSERT/DELETE 트리거. reaction_counts 를 증감시킨다';

revoke execute on function public.sync_reaction_count() from public, anon, authenticated;

drop trigger if exists trg_sync_reaction_count on public.reactions;
create trigger trg_sync_reaction_count
  after insert or delete on public.reactions
  for each row execute function public.sync_reaction_count();

insert into public.reaction_counts (target_type, target_id, kind, cnt)
select target_type, target_id, kind, count(*)
from public.reactions
group by target_type, target_id, kind
on conflict (target_type, target_id, kind) do update set cnt = excluded.cnt;

drop view if exists public.v_reaction_counts cascade;

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
left join public.reaction_counts l
  on l.target_type = 'portfolio' and l.kind = 'like'     and l.target_id = p.id
left join public.reaction_counts b
  on b.target_type = 'portfolio' and b.kind = 'bookmark' and b.target_id = p.id;

comment on view public.v_portfolios is
  '포트폴리오 + 작성자 + 좋아요/북마크 수. 정렬: created_at(최신) / view_count(조회) / like_count(추천) / bookmark_count(스크랩)';

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
left join public.reaction_counts l
  on l.target_type = 'post' and l.kind = 'like'     and l.target_id = p.id
left join public.reaction_counts b
  on b.target_type = 'post' and b.kind = 'bookmark' and b.target_id = p.id
left join (
  select post_id, count(*) as cnt from public.comments group by post_id
) cm on cm.post_id = p.id;

comment on view public.v_posts is
  '면접 후기(review) / 면접 족보(qbank) + 작성자 + 기업 + 도움돼요/퍼가요/댓글 수';

create view public.v_comments
with (security_invoker = on) as
select
  c.*,
  pr.name       as author_name,
  pr.avatar_url as author_avatar_url,
  coalesce(l.cnt, 0) as like_count
from public.comments c
join public.profiles pr on pr.id = c.user_id
left join public.reaction_counts l
  on l.target_type = 'comment' and l.kind = 'like' and l.target_id = c.id;

comment on view public.v_comments is '댓글 + 작성자 + 좋아요 수. 정렬: 최신순(기본) / 추천순';

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
left join public.reaction_counts b
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

grant select   on public.reaction_counts to anon, authenticated;
grant select   on public.v_portfolios    to anon, authenticated;
grant select   on public.v_posts         to anon, authenticated;
grant select   on public.v_comments      to anon, authenticated;
grant select   on public.v_companies     to anon, authenticated;
grant execute  on function public.get_recommended_companies(int) to anon, authenticated;

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
left join (
  select target_id, count(*) as cnt from public.reactions
   where target_type = 'portfolio' and kind = 'like'     group by target_id
) l on l.target_id = p.id
left join (
  select target_id, count(*) as cnt from public.reactions
   where target_type = 'portfolio' and kind = 'bookmark' group by target_id
) b on b.target_id = p.id;

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
left join (
  select target_id, count(*) as cnt from public.reactions
   where target_type = 'post' and kind = 'like'     group by target_id
) l on l.target_id = p.id
left join (
  select target_id, count(*) as cnt from public.reactions
   where target_type = 'post' and kind = 'bookmark' group by target_id
) b on b.target_id = p.id
left join (
  select post_id, count(*) as cnt from public.comments group by post_id
) cm on cm.post_id = p.id;

comment on view public.v_posts is
  '면접 후기(review) / 면접 족보(qbank) + 작성자 + 기업 + 도움돼요/퍼가요/댓글 수';

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
left join (
  select target_id, count(*) as cnt from public.reactions
   where target_type = 'company' and kind = 'bookmark' group by target_id
) b on b.target_id = c.id
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
left join (
  select target_id, count(*) as cnt from public.reactions
   where target_type = 'comment' and kind = 'like' group by target_id
) l on l.target_id = c.id;

comment on view public.v_comments is '댓글 + 작성자 + 좋아요 수. 정렬: 최신순(기본) / 추천순';

drop view if exists public.v_profile_stats cascade;
create view public.v_profile_stats
with (security_invoker = on) as
select
  pr.id as user_id,
  (select count(*) from public.documents  d where d.user_id = pr.id) as doc_count,
  (select count(*) from public.portfolios p
    where p.user_id = pr.id and (p.status = 'published' or (select auth.uid()) = pr.id)) as portfolio_count,
  (select count(*) from public.reactions r
    where r.user_id = pr.id and r.target_type = 'interview_qa' and r.kind = 'bookmark') as interview_scrap_count
from public.profiles pr;

comment on view public.v_profile_stats is
  '프로필 상단 카운터. doc_count / interview_scrap_count 는 본인 조회 시에만 유효';

grant select on public.v_portfolios    to anon, authenticated;
grant select on public.v_posts         to anon, authenticated;
grant select on public.v_companies     to anon, authenticated;
grant select on public.v_comments      to anon, authenticated;
grant select on public.v_profile_stats to anon, authenticated;

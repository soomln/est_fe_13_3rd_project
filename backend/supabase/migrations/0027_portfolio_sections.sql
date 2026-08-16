alter table public.portfolios
  add column if not exists overview jsonb not null default '[]'::jsonb,
  add column if not exists document jsonb not null default '[]'::jsonb,
  add column if not exists code     jsonb not null default '[]'::jsonb;

drop view if exists public.v_portfolios;

alter table public.portfolios drop column if exists content;

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

comment on column public.portfolios.overview is
  '개요 탭의 블록 배열. content 를 탭별로 쪼갠 3개 중 하나';
comment on column public.portfolios.document is
  '문서 탭의 블록 배열';
comment on column public.portfolios.code is
  '코드 탭의 블록 배열';

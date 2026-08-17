drop view if exists public.v_posts;

do $$
begin
  if exists (
    select 1 from information_schema.columns
     where table_schema = 'public' and table_name = 'posts'
       and column_name = 'questions' and data_type = 'jsonb'
  ) then
    alter table public.posts add column questions_text text;

    update public.posts
       set questions_text = nullif(
             (select string_agg(q.value, E'\n') from jsonb_array_elements_text(questions) as q(value)),
             '');

    alter table public.posts drop column questions;
    alter table public.posts rename column questions_text to questions;
  end if;
end $$;

comment on column public.posts.questions is
  '족보 질문. 한 줄에 하나씩 적는 여러 줄 평문. question_count 는 빈 줄을 뺀 줄 수를 서버가 계산해 넣는다';

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

grant select on public.v_posts to anon, authenticated;

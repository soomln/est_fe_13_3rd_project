drop view if exists public.v_profile_stats cascade;
create view public.v_profile_stats
with (security_invoker = on) as
select
  pr.id as user_id,

  (select count(*) from public.documents d
    where d.user_id = pr.id) as doc_count,

  (select count(*) from public.portfolios p
    where p.user_id = pr.id
      and (p.status = 'published' or (select auth.uid()) = pr.id)) as portfolio_count,

  (select count(*) from public.portfolios p
    where p.user_id = pr.id and p.status = 'published') as published_portfolio_count,

  (select count(*) from public.portfolios p
    where p.user_id = pr.id and p.status = 'draft') as draft_portfolio_count,

  (select count(*) from public.reactions r
    where r.user_id = pr.id
      and r.target_type = 'interview_qa' and r.kind = 'bookmark') as interview_scrap_count,

  (select count(*) from public.reactions r
    where r.user_id = pr.id
      and r.target_type = 'company' and r.kind = 'bookmark') as scrapped_company_count,

  (select count(*) from public.reactions r
    where r.user_id = pr.id
      and r.target_type = 'post' and r.kind = 'bookmark') as scrapped_post_count,

  (select count(*) from public.reactions r
    where r.user_id = pr.id
      and r.target_type = 'portfolio' and r.kind = 'bookmark') as scrapped_portfolio_count,

  (select count(*) from public.posts p
    where p.user_id = pr.id and p.post_type = 'review') as my_review_count,

  (select count(*) from public.posts p
    where p.user_id = pr.id and p.post_type = 'qbank') as my_qbank_count,

  (select count(*) from public.interview_sessions s
    where s.user_id = pr.id and s.status = 'finished') as finished_interview_count

from public.profiles pr;

comment on view public.v_profile_stats is
  '프로필 상단 카운터 + 마이페이지 탭 카운터. 본인 조회 시에만 전부 유효(문서·초안·스크랩은 RLS로 타인에게 0)';

grant select on public.v_profile_stats to anon, authenticated;

create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'NOT_AUTHENTICATED' using hint = '로그인이 필요합니다.';
  end if;

  delete from storage.objects
   where bucket_id in ('avatars', 'portfolios')
     and (storage.foldername(name))[1] = uid::text;

  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant  execute on function public.delete_my_account() to authenticated;

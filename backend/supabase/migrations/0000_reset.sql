drop view if exists public.v_profile_stats cascade;
drop view if exists public.v_comments      cascade;
drop view if exists public.v_companies     cascade;
drop view if exists public.v_posts         cascade;
drop view if exists public.v_portfolios    cascade;

drop function if exists public.get_recommended_companies(int) cascade;
drop function if exists public.delete_my_account()            cascade;
drop function if exists public.increment_view(text, uuid)     cascade;
drop function if exists public.toggle_reaction(text, uuid, text) cascade;

drop table if exists public.interview_qas      cascade;
drop table if exists public.interview_sessions cascade;
drop table if exists public.reactions          cascade;
drop table if exists public.comments           cascade;
drop table if exists public.posts              cascade;
drop table if exists public.portfolios         cascade;
drop table if exists public.documents          cascade;
drop table if exists public.resume_templates   cascade;
drop table if exists public.companies          cascade;
drop table if exists public.profiles           cascade;
drop table if exists public.code_master        cascade;

drop trigger  if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user()         cascade;
drop function if exists public.enforce_document_limit()  cascade;
drop function if exists public.set_updated_at()          cascade;

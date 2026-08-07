create or replace function public.toggle_reaction(
  p_target_type text,
  p_target_id   uuid,
  p_kind        text default 'bookmark'
)
returns boolean
language plpgsql
security invoker
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

create or replace function public.increment_view(
  p_target_type text,
  p_target_id   uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_target_type = 'company' then
    update public.companies        set view_count = view_count + 1 where id = p_target_id;
  elsif p_target_type = 'portfolio' then
    update public.portfolios       set view_count = view_count + 1 where id = p_target_id;
  elsif p_target_type = 'post' then
    update public.posts            set view_count = view_count + 1 where id = p_target_id;
  elsif p_target_type = 'template' then
    update public.resume_templates set view_count = view_count + 1 where id = p_target_id;
  else
    raise exception 'UNKNOWN_TARGET_TYPE: %', p_target_type;
  end if;
end;
$$;

grant execute on function public.increment_view(text, uuid) to anon, authenticated;

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

  delete from auth.users where id = uid;
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant  execute on function public.delete_my_account() to authenticated;

create or replace function public.get_recommended_companies(p_limit int default 6)
returns setof public.v_companies
language sql
stable
security invoker
as $$
  select * from public.v_companies
   order by bookmark_count desc, view_count desc, name asc
   limit greatest(1, least(p_limit, 50));
$$;

grant execute on function public.get_recommended_companies(int) to anon, authenticated;

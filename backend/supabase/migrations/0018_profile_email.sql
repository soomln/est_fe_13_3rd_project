create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, name, avatar_url, email)
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
    ),
    new.email
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

comment on function public.handle_new_user() is
  '가입 시 profiles 행 생성. 소셜 계정 이메일을 채운다. 타인에게는 컬럼 권한으로 가려지므로 공개되지 않는다';

revoke execute on function public.handle_new_user() from public, anon, authenticated;

create or replace function public.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
     set email = new.email
   where id = new.id
     and email is null;

  return new;
end;
$$;

comment on function public.sync_profile_email() is
  '재로그인 시 비어 있는 profiles.email 을 소셜 계정 이메일로 채운다. 사용자가 직접 입력한 값은 덮어쓰지 않는다';

revoke execute on function public.sync_profile_email() from public, anon, authenticated;

drop trigger if exists on_auth_user_signed_in on auth.users;
create trigger on_auth_user_signed_in
  after update on auth.users
  for each row
  when (
    new.email is not null
    and old.last_sign_in_at is distinct from new.last_sign_in_at
  )
  execute function public.sync_profile_email();

revoke select on public.profiles from anon, authenticated;
grant select (
  id, name, avatar_url, desired_role, career_level, github_url, bio,
  educations, careers, awards, languages, skill_codes, interest_codes,
  created_at, updated_at
) on public.profiles to anon, authenticated;

comment on column public.profiles.email is
  '이력서용 연락처. 컬럼 SELECT 권한을 회수해 타인은 읽을 수 없다. 본인은 my_profile_email() 로 읽는다. 컬럼을 추가하면 위 grant 목록에도 넣어야 한다';

create or replace function public.my_profile_email()
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select email from public.profiles where id = (select auth.uid());
$$;

comment on function public.my_profile_email() is
  'profiles.email 은 컬럼 권한으로 막혀 있다. 본인이 자기 값을 읽는 유일한 통로';

revoke execute on function public.my_profile_email() from public, anon;
grant execute on function public.my_profile_email() to authenticated;

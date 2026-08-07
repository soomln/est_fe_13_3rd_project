create table if not exists public.profiles (
  id            uuid primary key references auth.users(id) on delete cascade,

  name          text,
  avatar_url    text,
  desired_role  text,
  career_level  text,
  email         text,
  github_url    text,
  bio           text,

  educations    jsonb not null default '[]'::jsonb,

  careers       jsonb not null default '[]'::jsonb,

  awards        jsonb not null default '[]'::jsonb,

  languages     jsonb not null default '[]'::jsonb,

  skill_codes    text[] not null default '{}',
  interest_codes text[] not null default '{}',

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_bio_len check (bio is null or char_length(bio) <= 1000)
);

create index if not exists idx_profiles_skills
  on public.profiles using gin (skill_codes);
create index if not exists idx_profiles_interests
  on public.profiles using gin (interest_codes);

drop trigger if exists trg_profiles_updated_at on public.profiles;
create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

alter table public.profiles enable row level security;

drop policy if exists "profiles 누구나 읽기"  on public.profiles;
drop policy if exists "profiles 본인만 생성"  on public.profiles;
drop policy if exists "profiles 본인만 수정"  on public.profiles;

create policy "profiles 누구나 읽기"
  on public.profiles for select using (true);

create policy "profiles 본인만 생성"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles 본인만 수정"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

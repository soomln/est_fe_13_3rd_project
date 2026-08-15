create table if not exists public.profile_educations (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  sort_order int  not null default 0,

  school_type text,
  school      text,
  major       text,
  status      text,
  admission   text,
  graduation  text,

  school_type_group text generated always as ('school_type'::text) stored,
  status_group      text generated always as ('edu_status'::text) stored,

  constraint profile_educations_school_type_fk
    foreign key (school_type_group, school_type)
    references public.code_master (group_name, code),

  constraint profile_educations_status_fk
    foreign key (status_group, status)
    references public.code_master (group_name, code)
);

create table if not exists public.profile_careers (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  sort_order int  not null default 0,

  started_on text,
  ended_on   text,
  company    text,
  job_role   text
);

create table if not exists public.profile_awards (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  sort_order int  not null default 0,

  awarded_on text,
  title      text
);

create table if not exists public.profile_languages (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  sort_order int  not null default 0,

  language text,
  level    text,
  detail   text,

  level_group text generated always as ('language_level'::text) stored,

  constraint profile_languages_level_fk
    foreign key (level_group, level)
    references public.code_master (group_name, code)
);

create index if not exists idx_profile_educations_user on public.profile_educations (user_id, sort_order);
create index if not exists idx_profile_careers_user    on public.profile_careers (user_id, sort_order);
create index if not exists idx_profile_awards_user     on public.profile_awards (user_id, sort_order);
create index if not exists idx_profile_languages_user  on public.profile_languages (user_id, sort_order);

comment on table public.profile_educations is
  '프로필 학력. jsonb 배열에서 승격. type→school_type, 나머지는 이름 그대로. 코드값은 code_master FK 로 강제';
comment on table public.profile_careers is
  '프로필 경력. JSON 의 start/end/role 은 예약어라 started_on/ended_on/job_role 로 저장';
comment on table public.profile_awards is
  '프로필 수상. JSON 의 date/name 은 awarded_on/title 로 저장';
comment on table public.profile_languages is
  '프로필 어학. level 은 code_master(language_level) FK';

do $$
declare t text;
begin
  foreach t in array array[
    'profile_educations', 'profile_careers', 'profile_awards', 'profile_languages'
  ] loop
    execute format('alter table public.%I enable row level security', t);

    execute format('drop policy if exists "%s 누구나 읽기" on public.%I', t, t);
    execute format('drop policy if exists "%s 본인만 생성" on public.%I', t, t);
    execute format('drop policy if exists "%s 본인만 수정" on public.%I', t, t);
    execute format('drop policy if exists "%s 본인만 삭제" on public.%I', t, t);

    execute format(
      'create policy "%s 누구나 읽기" on public.%I for select using (true)', t, t);
    execute format(
      'create policy "%s 본인만 생성" on public.%I for insert to authenticated
         with check ((select auth.uid()) = user_id)', t, t);
    execute format(
      'create policy "%s 본인만 수정" on public.%I for update to authenticated
         using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id)', t, t);
    execute format(
      'create policy "%s 본인만 삭제" on public.%I for delete to authenticated
         using ((select auth.uid()) = user_id)', t, t);

    execute format('grant select on public.%I to anon, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;

create or replace function public.save_profile_lists(
  p_educations jsonb default null,
  p_careers    jsonb default null,
  p_awards     jsonb default null,
  p_languages  jsonb default null
)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  uid uuid := (select auth.uid());
begin
  if uid is null then
    raise exception 'NOT_AUTHENTICATED' using hint = '로그인이 필요합니다.';
  end if;

  if p_educations is not null then
    delete from public.profile_educations where user_id = uid;
    insert into public.profile_educations
      (user_id, sort_order, school_type, school, major, status, admission, graduation)
    select uid, (ord - 1)::int,
           nullif(e ->> 'type', ''),
           nullif(e ->> 'school', ''),
           nullif(e ->> 'major', ''),
           nullif(e ->> 'status', ''),
           nullif(e ->> 'admission', ''),
           nullif(e ->> 'graduation', '')
      from pg_catalog.jsonb_array_elements(p_educations) with ordinality as t(e, ord);
  end if;

  if p_careers is not null then
    delete from public.profile_careers where user_id = uid;
    insert into public.profile_careers (user_id, sort_order, started_on, ended_on, company, job_role)
    select uid, (ord - 1)::int,
           nullif(c ->> 'start', ''),
           nullif(c ->> 'end', ''),
           nullif(c ->> 'company', ''),
           nullif(c ->> 'role', '')
      from pg_catalog.jsonb_array_elements(p_careers) with ordinality as t(c, ord);
  end if;

  if p_awards is not null then
    delete from public.profile_awards where user_id = uid;
    insert into public.profile_awards (user_id, sort_order, awarded_on, title)
    select uid, (ord - 1)::int,
           nullif(a ->> 'date', ''),
           nullif(a ->> 'name', '')
      from pg_catalog.jsonb_array_elements(p_awards) with ordinality as t(a, ord);
  end if;

  if p_languages is not null then
    delete from public.profile_languages where user_id = uid;
    insert into public.profile_languages (user_id, sort_order, language, level, detail)
    select uid, (ord - 1)::int,
           nullif(l ->> 'language', ''),
           nullif(l ->> 'level', ''),
           nullif(l ->> 'detail', '')
      from pg_catalog.jsonb_array_elements(p_languages) with ordinality as t(l, ord);
  end if;
end;
$$;

comment on function public.save_profile_lists(jsonb, jsonb, jsonb, jsonb) is
  '프로필 이력 4종을 한 트랜잭션에서 통째로 교체한다. 함수 하나가 곧 한 트랜잭션이라 지우고 못 넣는 중간 상태가 생기지 않는다. null 로 넘긴 목록은 건드리지 않는다';

revoke execute on function public.save_profile_lists(jsonb, jsonb, jsonb, jsonb) from public, anon;
grant  execute on function public.save_profile_lists(jsonb, jsonb, jsonb, jsonb) to authenticated;

insert into public.profile_educations
  (user_id, sort_order, school_type, school, major, status, admission, graduation)
select p.id, (ord - 1)::int,
       nullif(e ->> 'type', ''), nullif(e ->> 'school', ''), nullif(e ->> 'major', ''),
       nullif(e ->> 'status', ''), nullif(e ->> 'admission', ''), nullif(e ->> 'graduation', '')
  from public.profiles p, jsonb_array_elements(p.educations) with ordinality as t(e, ord)
 where not exists (select 1 from public.profile_educations x where x.user_id = p.id);

insert into public.profile_careers (user_id, sort_order, started_on, ended_on, company, job_role)
select p.id, (ord - 1)::int,
       nullif(c ->> 'start', ''), nullif(c ->> 'end', ''),
       nullif(c ->> 'company', ''), nullif(c ->> 'role', '')
  from public.profiles p, jsonb_array_elements(p.careers) with ordinality as t(c, ord)
 where not exists (select 1 from public.profile_careers x where x.user_id = p.id);

insert into public.profile_awards (user_id, sort_order, awarded_on, title)
select p.id, (ord - 1)::int, nullif(a ->> 'date', ''), nullif(a ->> 'name', '')
  from public.profiles p, jsonb_array_elements(p.awards) with ordinality as t(a, ord)
 where not exists (select 1 from public.profile_awards x where x.user_id = p.id);

insert into public.profile_languages (user_id, sort_order, language, level, detail)
select p.id, (ord - 1)::int,
       nullif(l ->> 'language', ''), nullif(l ->> 'level', ''), nullif(l ->> 'detail', '')
  from public.profiles p, jsonb_array_elements(p.languages) with ordinality as t(l, ord)
 where not exists (select 1 from public.profile_languages x where x.user_id = p.id);

alter table public.profiles drop column if exists educations;
alter table public.profiles drop column if exists careers;
alter table public.profiles drop column if exists awards;
alter table public.profiles drop column if exists languages;

update public.posts set channel_code = 'online' where channel_code = '온라인';

insert into public.code_master (group_name, code, label, sort_order, is_active) values
  ('template_category', 'basic',      '기본',         1, true),
  ('template_category', 'standard',   '표준',         2, true),
  ('template_category', 'newcomer',   '신입',         3, true),
  ('template_category', 'career',     '경력',         4, true),
  ('template_category', 'project',    '프로젝트 중심', 5, true),
  ('template_category', 'competency', '역량 중심',     6, true),
  ('template_category', 'portfolio',  '포트폴리오형',  7, true),
  ('template_category', 'english',    '영문',         8, true)
on conflict (group_name, code) do nothing;

alter table public.posts
  add column if not exists difficulty_group  text generated always as ('difficulty'::text) stored,
  add column if not exists pass_result_group text generated always as ('pass_result'::text) stored,
  add column if not exists channel_group     text generated always as ('interview_channel'::text) stored,
  add column if not exists education_group   text generated always as ('education_level'::text) stored;

alter table public.posts
  drop constraint if exists posts_difficulty_code_fkey,
  drop constraint if exists posts_pass_result_code_fkey,
  drop constraint if exists posts_channel_code_fkey,
  drop constraint if exists posts_education_level_fkey;

alter table public.posts
  add constraint posts_difficulty_code_fkey
    foreign key (difficulty_group, difficulty_code) references public.code_master (group_name, code),
  add constraint posts_pass_result_code_fkey
    foreign key (pass_result_group, pass_result_code) references public.code_master (group_name, code),
  add constraint posts_channel_code_fkey
    foreign key (channel_group, channel_code) references public.code_master (group_name, code),
  add constraint posts_education_level_fkey
    foreign key (education_group, education_level) references public.code_master (group_name, code);

alter table public.profiles
  add column if not exists career_group    text generated always as ('career_level'::text) stored,
  add column if not exists education_group text generated always as ('education_level'::text) stored;

alter table public.profiles
  drop constraint if exists profiles_career_level_fkey,
  drop constraint if exists profiles_education_level_fkey;

alter table public.profiles
  add constraint profiles_career_level_fkey
    foreign key (career_group, career_level) references public.code_master (group_name, code),
  add constraint profiles_education_level_fkey
    foreign key (education_group, education_level) references public.code_master (group_name, code);

alter table public.companies
  add column if not exists industry_group text generated always as ('industry'::text) stored,
  add column if not exists size_group     text generated always as ('company_size'::text) stored;

alter table public.companies
  drop constraint if exists companies_industry_code_fkey,
  drop constraint if exists companies_size_code_fkey;

alter table public.companies
  add constraint companies_industry_code_fkey
    foreign key (industry_group, industry_code) references public.code_master (group_name, code),
  add constraint companies_size_code_fkey
    foreign key (size_group, size_code) references public.code_master (group_name, code);

alter table public.portfolios
  add column if not exists category_group text generated always as ('portfolio_category'::text) stored;

alter table public.portfolios drop constraint if exists portfolios_category_fkey;
alter table public.portfolios
  add constraint portfolios_category_fkey
    foreign key (category_group, category) references public.code_master (group_name, code);

alter table public.resume_templates
  add column if not exists category_group text generated always as ('template_category'::text) stored;

alter table public.resume_templates drop constraint if exists resume_templates_category_code_fkey;
alter table public.resume_templates
  add constraint resume_templates_category_code_fkey
    foreign key (category_group, category_code) references public.code_master (group_name, code);

alter table public.interview_sessions
  add column if not exists style_group text generated always as ('interviewer_style'::text) stored;

alter table public.interview_sessions drop constraint if exists interview_sessions_style_fkey;
alter table public.interview_sessions
  add constraint interview_sessions_style_fkey
    foreign key (style_group, interviewer_style) references public.code_master (group_name, code);

alter table public.interview_qas
  add column if not exists category_group text generated always as ('interview_category'::text) stored;

alter table public.interview_qas drop constraint if exists interview_qas_category_fkey;
alter table public.interview_qas
  add constraint interview_qas_category_fkey
    foreign key (category_group, category) references public.code_master (group_name, code);

create or replace function public.assert_code_array()
returns trigger language plpgsql set search_path = '' as $$
declare
  grp  text := tg_argv[1];
  vals text[];
  bad  text;
begin
  execute pg_catalog.format('select ($1).%I', tg_argv[0]) into vals using new;
  if vals is null then return new; end if;

  select v into bad
  from pg_catalog.unnest(vals) v
  where not exists (
    select 1 from public.code_master m where m.group_name = grp and m.code = v
  )
  limit 1;

  if bad is not null then
    raise exception '% 는 code_master(%) 의 코드가 아닙니다', bad, grp using errcode = '23503';
  end if;
  return new;
end $$;

comment on function public.assert_code_array() is
  '배열 컬럼은 FK 를 걸 수 없어 트리거로 code_master 소속을 검사한다. tg_argv = (컬럼명, 그룹명)';

drop trigger if exists profiles_skill_codes_check on public.profiles;
create trigger profiles_skill_codes_check
  before insert or update of skill_codes on public.profiles
  for each row execute function public.assert_code_array('skill_codes', 'tech_stack');

drop trigger if exists profiles_interest_codes_check on public.profiles;
create trigger profiles_interest_codes_check
  before insert or update of interest_codes on public.profiles
  for each row execute function public.assert_code_array('interest_codes', 'interest_field');

drop trigger if exists companies_job_role_codes_check on public.companies;
create trigger companies_job_role_codes_check
  before insert or update of job_role_codes on public.companies
  for each row execute function public.assert_code_array('job_role_codes', 'job_role');

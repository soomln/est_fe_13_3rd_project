alter table public.profiles add column if not exists education_level text;

grant select (education_level) on public.profiles to anon, authenticated;

comment on column public.profiles.education_level is
  '최종 학력. code_master(education_level) 코드. 학교 구분은 educations[].type 에 code_master(school_type) 코드로 넣는다';

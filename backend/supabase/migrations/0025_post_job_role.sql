alter table public.posts
  add column if not exists job_role_group text generated always as ('job_role'::text) stored;

alter table public.posts drop constraint if exists posts_job_role_code_fkey;

alter table public.posts
  add constraint posts_job_role_code_fkey
  foreign key (job_role_group, job_role_code)
  references public.code_master (group_name, code);

comment on column public.posts.job_role_code is
  '면접 후기·족보의 직무. code_master(job_role) FK 로 강제. null 이면 미기입';

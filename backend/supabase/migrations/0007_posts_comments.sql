create table if not exists public.posts (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.profiles(id) on delete cascade,
  company_id uuid references public.companies(id) on delete set null,

  post_type text not null,

  title text,
  body  text,
  questions jsonb not null default '[]'::jsonb,

  difficulty_code  text,
  difficulty_score numeric(2,1),
  problem_score    numeric(2,1),
  question_count   int,

  pass_result_code text,

  channel_code text,
  channel_etc  text,

  job_role_code   text,
  position_level  text,
  education_level text,

  tags text[] not null default '{}',
  overall_comment text,

  view_count int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint posts_type check (post_type in ('review', 'qbank'))
);

create index if not exists idx_posts_company
  on public.posts (company_id, post_type, created_at desc);
create index if not exists idx_posts_user
  on public.posts (user_id, created_at desc);
create index if not exists idx_posts_title on public.posts (title);
create index if not exists idx_posts_tags  on public.posts using gin (tags);

drop trigger if exists trg_posts_updated_at on public.posts;
create trigger trg_posts_updated_at
  before update on public.posts
  for each row execute function public.set_updated_at();

alter table public.posts enable row level security;

drop policy if exists "posts 누구나 읽기"  on public.posts;
drop policy if exists "posts 본인만 생성"  on public.posts;
drop policy if exists "posts 본인만 수정"  on public.posts;
drop policy if exists "posts 본인만 삭제"  on public.posts;

create policy "posts 누구나 읽기"
  on public.posts for select using (true);

create policy "posts 본인만 생성"
  on public.posts for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "posts 본인만 수정"
  on public.posts for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "posts 본인만 삭제"
  on public.posts for delete to authenticated
  using ((select auth.uid()) = user_id);

create table if not exists public.comments (
  id      uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  body    text not null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint comments_body_len check (char_length(body) between 1 and 2000)
);

create index if not exists idx_comments_post
  on public.comments (post_id, created_at desc);

drop trigger if exists trg_comments_updated_at on public.comments;
create trigger trg_comments_updated_at
  before update on public.comments
  for each row execute function public.set_updated_at();

alter table public.comments enable row level security;

drop policy if exists "comments 누구나 읽기" on public.comments;
drop policy if exists "comments 본인만 생성" on public.comments;
drop policy if exists "comments 본인만 수정" on public.comments;
drop policy if exists "comments 본인만 삭제" on public.comments;

create policy "comments 누구나 읽기"
  on public.comments for select using (true);

create policy "comments 본인만 생성"
  on public.comments for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "comments 본인만 수정"
  on public.comments for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "comments 본인만 삭제"
  on public.comments for delete to authenticated
  using ((select auth.uid()) = user_id);

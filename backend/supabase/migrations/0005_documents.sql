create table if not exists public.resume_templates (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  doc_type      text not null,
  category_code text,
  thumbnail_url text,

  content       jsonb,
  content_html  text,

  view_count int not null default 0,
  is_active  boolean not null default true,
  sort_order int not null default 0,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint resume_templates_doc_type check (doc_type in ('resume', 'cover_letter'))
);

create index if not exists idx_templates_type
  on public.resume_templates (doc_type, sort_order)
  where is_active;

drop trigger if exists trg_templates_updated_at on public.resume_templates;
create trigger trg_templates_updated_at
  before update on public.resume_templates
  for each row execute function public.set_updated_at();

alter table public.resume_templates enable row level security;

drop policy if exists "templates 누구나 읽기" on public.resume_templates;
create policy "templates 누구나 읽기"
  on public.resume_templates for select using (is_active);

create table if not exists public.documents (
  id       uuid primary key default gen_random_uuid(),
  user_id  uuid not null references public.profiles(id) on delete cascade,

  doc_type    text not null,
  title       text not null default '제목 없음',
  template_id uuid references public.resume_templates(id) on delete set null,

  content      jsonb,
  content_html text,
  content_text text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint documents_doc_type check (doc_type in ('resume', 'cover_letter'))
);

create index if not exists idx_documents_user
  on public.documents (user_id, doc_type, updated_at desc);

create index if not exists idx_documents_title on public.documents (title);

drop trigger if exists trg_documents_updated_at on public.documents;
create trigger trg_documents_updated_at
  before update on public.documents
  for each row execute function public.set_updated_at();

create or replace function public.enforce_document_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  doc_count int;
  max_count constant int := 10;
begin
  select count(*) into doc_count
    from public.documents
   where user_id = new.user_id
     and doc_type = new.doc_type;

  if doc_count >= max_count then
    raise exception 'DOCUMENT_LIMIT_EXCEEDED'
      using hint = format('%s 는 최대 %s개까지 만들 수 있습니다.', new.doc_type, max_count);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_documents_limit on public.documents;
create trigger trg_documents_limit
  before insert on public.documents
  for each row execute function public.enforce_document_limit();

alter table public.documents enable row level security;

drop policy if exists "documents 본인만" on public.documents;
create policy "documents 본인만"
  on public.documents for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

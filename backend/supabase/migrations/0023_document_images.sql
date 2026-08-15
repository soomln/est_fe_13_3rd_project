insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('documents', 'documents', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "스토리지 공개 읽기" on storage.objects;
create policy "스토리지 공개 읽기"
  on storage.objects for select
  using (bucket_id in ('avatars', 'portfolios', 'company-logos', 'templates', 'documents'));

drop policy if exists "본인 폴더에만 업로드" on storage.objects;
create policy "본인 폴더에만 업로드"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('avatars', 'portfolios', 'documents')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "본인 파일만 교체" on storage.objects;
create policy "본인 파일만 교체"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('avatars', 'portfolios', 'documents')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id in ('avatars', 'portfolios', 'documents')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "본인 파일만 삭제" on storage.objects;
create policy "본인 파일만 삭제"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('avatars', 'portfolios', 'documents')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

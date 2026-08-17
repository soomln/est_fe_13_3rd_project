update storage.buckets set public = false where id = 'documents';

drop policy if exists "스토리지 공개 읽기" on storage.objects;
create policy "스토리지 공개 읽기"
  on storage.objects for select
  using (bucket_id in ('avatars', 'portfolios', 'company-logos', 'templates'));

drop policy if exists "본인 문서 이미지만 읽기" on storage.objects;
create policy "본인 문서 이미지만 읽기"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'documents'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "스토리지 공개 읽기" on storage.objects;
create policy "스토리지 공개 읽기"
  on storage.objects for select
  using (bucket_id in ('avatars', 'portfolios', 'company-logos', 'templates'));

drop policy if exists "본인 폴더에만 업로드" on storage.objects;
create policy "본인 폴더에만 업로드"
  on storage.objects for insert to authenticated
  with check (
    bucket_id in ('avatars', 'portfolios')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "본인 파일만 교체" on storage.objects;
create policy "본인 파일만 교체"
  on storage.objects for update to authenticated
  using (
    bucket_id in ('avatars', 'portfolios')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id in ('avatars', 'portfolios')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "본인 파일만 삭제" on storage.objects;
create policy "본인 파일만 삭제"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('avatars', 'portfolios')
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

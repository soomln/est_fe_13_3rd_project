create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

comment on function public.set_updated_at() is
  'BEFORE UPDATE 트리거용. updated_at 을 현재 시각으로 갱신';

create or replace function public.cleanup_reactions()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  delete from public.reactions
   where target_type = tg_argv[0]::text
     and target_id = old.id;
  return old;
end;
$$;

comment on function public.cleanup_reactions() is
  'AFTER DELETE 트리거용. reactions.target_id 는 다형성 참조라 FK 를 걸 수 없어 고아 행이 남는 것을 막는다';

import { SUPABASE_URL } from '../supabase/env';
import { defineRoute } from '../http/route';

async function check(label, fn) {
  try {
    return { label, ok: true, detail: await fn() };
  } catch (e) {
    return { label, ok: false, detail: e?.message ?? String(e) };
  }
}

export const GET = defineRoute(async ({ supabase, user }) => {
  const checks = [];

  checks.push(
    await check('환경변수', async () => {
      if (!SUPABASE_URL) throw new Error('NEXT_PUBLIC_SUPABASE_URL 없음 (.env.local 확인)');
      return SUPABASE_URL;
    })
  );

  checks.push(
    await check('로그인 상태', async () =>
      user ? `${user.email ?? '(이메일 없음)'} / ${user.id}` : '비로그인'
    )
  );

  checks.push(
    await check('code_master Seed', async () => {
      const { data, error, count } = await supabase
        .from('code_master')
        .select('group_name', { count: 'exact' });
      if (error) throw error;
      if (!count) throw new Error('0건 - Seed SQL 미실행');
      return `${count}건 / ${new Set(data.map((r) => r.group_name)).size}개 그룹`;
    })
  );

  checks.push(
    await check('companies 테이블', async () => {
      const { count, error } = await supabase
        .from('companies')
        .select('id', { count: 'exact' })
        .limit(1);
      if (error) throw error;
      return `${count ?? 0}건 (Seed 전이면 0이 정상)`;
    })
  );

  checks.push(
    await check('v_companies 뷰', async () => {
      const { error } = await supabase.from('v_companies').select('id').limit(1);
      if (error) throw error;
      return '조회 가능';
    })
  );

  checks.push(
    await check('RPC get_recommended_companies', async () => {
      const { data, error } = await supabase.rpc('get_recommended_companies', { p_limit: 3 });
      if (error) throw error;
      return `${data?.length ?? 0}건 반환`;
    })
  );

  checks.push(
    await check('Profile 자동 생성 트리거', async () => {
      if (!user) return '비로그인 - 건너뜀';
      const { data, error } = await supabase
        .from('profiles')
        .select('name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      if (error) throw error;
      if (!data) throw new Error('프로필 행 없음 - handle_new_user 트리거 확인 필요');
      return `name=${data.name ?? '(없음)'} / avatar=${data.avatar_url ? 'O' : 'X'}`;
    })
  );

  checks.push(
    await check('RLS - documents 는 본인 것만', async () => {
      const { count, error } = await supabase
        .from('documents')
        .select('id', { count: 'exact' })
        .limit(1);
      if (error) throw error;
      return user ? `내 문서 ${count ?? 0}건` : `비로그인 조회 ${count ?? 0}건 (0이어야 정상)`;
    })
  );

  return { user, checks };
});

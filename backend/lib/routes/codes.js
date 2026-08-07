import { badRequest } from '../http/errors';
import { defineRoute, unwrap } from '../http/route';

export const GET = defineRoute(async ({ request, supabase }) => {
  const groups = (request.nextUrl.searchParams.get('groups') ?? '')
    .split(',')
    .map((g) => g.trim())
    .filter(Boolean);

  if (groups.length === 0) {
    throw badRequest('groups 파라미터가 필요합니다. 예) /api/codes?groups=job_role');
  }

  const rows = unwrap(
    await supabase
      .from('code_master')
      .select('group_name, code, label')
      .in('group_name', groups)
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
  );

  const result = Object.fromEntries(groups.map((g) => [g, []]));
  for (const { group_name, code, label } of rows) {
    result[group_name]?.push({ code, label });
  }

  return result;
});

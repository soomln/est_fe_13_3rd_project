import { badRequest } from '../http/errors';
import { defineRoute, unwrap } from '../http/route';

const TARGET_TYPES = ['company', 'portfolio', 'post', 'template'];

export const POST = defineRoute(async ({ request, supabase }) => {
  let body;
  try {
    body = await request.json();
  } catch {
    throw badRequest('JSON 본문이 필요합니다.');
  }

  const { targetType, targetId } = body;
  if (!TARGET_TYPES.includes(targetType)) {
    throw badRequest(`targetType 은 ${TARGET_TYPES.join(' | ')} 중 하나여야 합니다.`);
  }
  if (!targetId) throw badRequest('targetId 가 필요합니다.');

  unwrap(await supabase.rpc('increment_view', { p_target_type: targetType, p_target_id: targetId }));
  return { ok: true };
});

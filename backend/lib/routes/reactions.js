import { badRequest } from '../http/errors';
import { defineRoute, unwrap } from '../http/route';

const TARGET_TYPES = ['portfolio', 'post', 'company', 'comment', 'interview_qa', 'template'];
const KINDS = ['like', 'bookmark'];

function assertTarget(targetType, kind) {
  if (!TARGET_TYPES.includes(targetType)) {
    throw badRequest(`targetType 은 ${TARGET_TYPES.join(' | ')} 중 하나여야 합니다.`);
  }
  if (!KINDS.includes(kind)) {
    throw badRequest(`kind 는 ${KINDS.join(' | ')} 중 하나여야 합니다.`);
  }
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw badRequest('JSON 본문이 필요합니다.');
  }
}

const NO_REACTIONS = { like: new Set(), bookmark: new Set() };

export async function loadScrapMarks(supabase, user, targetType) {
  const rows = unwrap(
    await supabase
      .from('reactions')
      .select('target_id, created_at')
      .eq('user_id', user.id)
      .eq('target_type', targetType)
      .eq('kind', 'bookmark')
  );

  return new Map((rows ?? []).map((r) => [r.target_id, r.created_at]));
}

export async function loadMyReactions(supabase, user, targetType, ids) {
  const targetIds = [...new Set(ids.filter(Boolean))];
  if (!user || targetIds.length === 0) return NO_REACTIONS;

  const rows = unwrap(
    await supabase
      .from('reactions')
      .select('target_id, kind')
      .eq('user_id', user.id)
      .eq('target_type', targetType)
      .in('target_id', targetIds)
  );

  const mine = { like: new Set(), bookmark: new Set() };
  for (const row of rows ?? []) mine[row.kind]?.add(row.target_id);
  return mine;
}

export const POST = defineRoute(
  async ({ request, supabase }) => {
    const { targetType, targetId, kind = 'bookmark' } = await readJson(request);
    assertTarget(targetType, kind);
    if (!targetId) throw badRequest('targetId 가 필요합니다.');

    const active = unwrap(
      await supabase.rpc('toggle_reaction', {
        p_target_type: targetType,
        p_target_id: targetId,
        p_kind: kind,
      })
    );

    return { active };
  },
  { auth: true }
);

export const GET = defineRoute(async ({ request, supabase, user }) => {
  const q = request.nextUrl.searchParams;
  const targetType = q.get('targetType');
  const kind = q.get('kind') ?? 'bookmark';
  assertTarget(targetType, kind);

  if (!user) return { targetIds: [] };

  const filter = q.get('targetIds');
  let query = supabase
    .from('reactions')
    .select('target_id, created_at')
    .eq('user_id', user.id)
    .eq('target_type', targetType)
    .eq('kind', kind)
    .order('created_at', { ascending: false });

  if (filter) {
    const ids = filter.split(',').map((s) => s.trim()).filter(Boolean);
    if (ids.length === 0) return { targetIds: [] };
    query = query.in('target_id', ids);
  }

  const rows = unwrap(await query);
  return { targetIds: rows.map((r) => r.target_id) };
});

export const DELETE = defineRoute(
  async ({ request, supabase, user }) => {
    const { targetType, kind = 'bookmark', targetIds } = await readJson(request);
    assertTarget(targetType, kind);

    if (!Array.isArray(targetIds) || targetIds.length === 0) {
      throw badRequest('targetIds 배열이 필요합니다.');
    }

    const rows = unwrap(
      await supabase
        .from('reactions')
        .delete()
        .eq('user_id', user.id)
        .eq('target_type', targetType)
        .eq('kind', kind)
        .in('target_id', targetIds)
        .select('target_id')
    );

    return { deleted: rows?.length ?? 0 };
  },
  { auth: true }
);

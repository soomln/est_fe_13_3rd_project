import { badRequest } from '../http/errors';
import { defineRoute, unwrap } from '../http/route';
import { attachQaMine, toQa } from './interviews';

const SORTS = {
  latest: { column: 'created_at', ascending: false },
  oldest: { column: 'created_at', ascending: true },
};

export const GET = defineRoute(
  async ({ request, supabase, user }) => {
    const q = request.nextUrl.searchParams;

    const page = Math.max(1, Number(q.get('page') ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(q.get('pageSize') ?? 6)));
    const sort = SORTS[q.get('sort') ?? 'latest'];
    if (!sort) throw badRequest(`sort 는 ${Object.keys(SORTS).join(' | ')} 중 하나여야 합니다.`);

    let scrappedIds = null;
    if (q.get('scrapped') === '1') {
      const rows = unwrap(
        await supabase
          .from('reactions')
          .select('target_id')
          .eq('user_id', user.id)
          .eq('target_type', 'interview_qa')
          .eq('kind', 'bookmark')
      );
      scrappedIds = rows.map((r) => r.target_id);
      if (scrappedIds.length === 0) return { items: [], total: 0, page, pageSize };
    }

    let query = supabase.from('interview_qas').select('*', { count: 'exact' }).eq('user_id', user.id);

    if (scrappedIds) query = query.in('id', scrappedIds);

    const sessionId = q.get('sessionId');
    if (sessionId) query = query.eq('session_id', sessionId);

    const keyword = q.get('q')?.trim();
    if (keyword) {
      const pattern = `"%${keyword.replace(/["\\]/g, '')}%"`;
      query = query.or(`question.ilike.${pattern},answer.ilike.${pattern}`);
    }

    const from = (page - 1) * pageSize;
    const { data, error, count } = await query
      .order(sort.column, { ascending: sort.ascending })
      .range(from, from + pageSize - 1);
    if (error) throw error;

    return {
      items: await attachQaMine((data ?? []).map(toQa), supabase, user),
      total: count ?? 0,
      page,
      pageSize,
    };
  },
  { auth: true }
);

export const DELETE = defineRoute(
  async ({ request, supabase, user }) => {
    let body;
    try {
      body = await request.json();
    } catch {
      throw badRequest('JSON 본문이 필요합니다.');
    }

    const { ids } = body;
    if (!Array.isArray(ids) || ids.length === 0) throw badRequest('ids 배열이 필요합니다.');

    const rows = unwrap(
      await supabase.from('interview_qas').delete().eq('user_id', user.id).in('id', ids).select('id')
    );
    return { deleted: rows?.length ?? 0 };
  },
  { auth: true }
);

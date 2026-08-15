import { badRequest, notFound } from '../http/errors';
import { defineRoute, unwrap } from '../http/route';
import { loadMyReactions } from './reactions';

const NO_MINE = { like: new Set(), bookmark: new Set() };

const withMine = (item, mine) => ({ ...item, likedByMe: mine.like.has(item.id) });

const SORTS = {
  latest: { column: 'created_at', ascending: false },
  popular: { column: 'like_count', ascending: false },
};

const formatDate = (iso) => (iso ? iso.slice(0, 10).replace(/-/g, '.') : '');

function toItem(row) {
  return {
    id: row.id,
    postId: row.post_id,
    body: row.body,
    authorId: row.user_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar_url,
    likeCount: row.like_count ?? 0,
    date: formatDate(row.created_at),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw badRequest('JSON 본문이 필요합니다.');
  }
}

export const GET = defineRoute(async ({ request, params, supabase, user }) => {
  const q = request.nextUrl.searchParams;

  const page = Math.max(1, Number(q.get('page') ?? 1));
  const pageSize = Math.min(100, Math.max(1, Number(q.get('pageSize') ?? 20)));
  const sort = SORTS[q.get('sort') ?? 'latest'];
  if (!sort) throw badRequest(`sort 는 ${Object.keys(SORTS).join(' | ')} 중 하나여야 합니다.`);

  const from = (page - 1) * pageSize;
  const { data, error, count } = await supabase
    .from('v_comments')
    .select('*', { count: 'exact' })
    .eq('post_id', params.id)
    .order(sort.column, { ascending: sort.ascending, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);
  if (error) throw error;

  const items = (data ?? []).map(toItem);
  const mine = await loadMyReactions(supabase, user, 'comment', items.map((i) => i.id));

  return { items: items.map((item) => withMine(item, mine)), total: count ?? 0, page, pageSize };
});

export const POST = defineRoute(
  async ({ request, params, supabase, user }) => {
    const { body } = await readJson(request);
    const text = body?.trim();
    if (!text) throw badRequest('댓글 내용을 입력해 주세요.');
    if (text.length > 2000) throw badRequest('댓글은 2000자까지 입력할 수 있습니다.');

    const inserted = unwrap(
      await supabase
        .from('comments')
        .insert({ post_id: params.id, user_id: user.id, body: text })
        .select('id')
        .single()
    );

    const row = unwrap(await supabase.from('v_comments').select('*').eq('id', inserted.id).single());
    return withMine(toItem(row), NO_MINE);
  },
  { auth: true }
);

export const PATCH_DETAIL = defineRoute(
  async ({ request, params, supabase, user }) => {
    const { body } = await readJson(request);
    const text = body?.trim();
    if (!text) throw badRequest('댓글 내용을 입력해 주세요.');
    if (text.length > 2000) throw badRequest('댓글은 2000자까지 입력할 수 있습니다.');

    const updated = unwrap(
      await supabase
        .from('comments')
        .update({ body: text })
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select('id')
        .maybeSingle()
    );
    if (!updated) throw notFound('댓글을 찾을 수 없습니다.');

    const row = unwrap(await supabase.from('v_comments').select('*').eq('id', updated.id).single());
    const mine = await loadMyReactions(supabase, user, 'comment', [row.id]);
    return withMine(toItem(row), mine);
  },
  { auth: true }
);

export const DELETE_DETAIL = defineRoute(
  async ({ params, supabase, user }) => {
    const rows = unwrap(
      await supabase.from('comments').delete().eq('id', params.id).eq('user_id', user.id).select('id')
    );
    if (!rows?.length) throw notFound('댓글을 찾을 수 없습니다.');
    return { deleted: 1 };
  },
  { auth: true }
);

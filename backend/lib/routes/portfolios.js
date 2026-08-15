import { badRequest, forbidden, notFound, unauthorized } from '../http/errors';
import { defineRoute, pageOf, unwrap } from '../http/route';
import { loadMyReactions, loadScrapMarks } from './reactions';

const NO_MINE = { like: new Set(), bookmark: new Set() };

const withMine = (item, mine) => ({
  ...item,
  likedByMe: mine.like.has(item.id),
  bookmarkedByMe: mine.bookmark.has(item.id),
});

export const COLLABORATOR_LIMIT = 20;

export async function loadCollaborators(supabase, portfolioIds) {
  const ids = [...new Set(portfolioIds.filter(Boolean))];
  if (ids.length === 0) return new Map();

  const links = unwrap(
    await supabase
      .from('portfolio_collaborators')
      .select('portfolio_id, user_id, sort_order')
      .in('portfolio_id', ids)
      .order('sort_order', { ascending: true })
  );

  const memberIds = [...new Set((links ?? []).map((l) => l.user_id))];
  if (memberIds.length === 0) return new Map();

  const members = unwrap(
    await supabase.from('profiles').select('id, name, avatar_url').in('id', memberIds)
  );

  const byId = new Map((members ?? []).map((m) => [m.id, m]));
  const grouped = new Map();

  for (const link of links ?? []) {
    const member = byId.get(link.user_id);
    if (!member) continue;
    if (!grouped.has(link.portfolio_id)) grouped.set(link.portfolio_id, []);
    grouped.get(link.portfolio_id).push({
      id: member.id,
      name: member.name,
      avatarUrl: member.avatar_url,
    });
  }

  return grouped;
}

async function attachMine(items, supabase, user) {
  const [mine, collaborators] = await Promise.all([
    loadMyReactions(supabase, user, 'portfolio', items.map((i) => i.id)),
    loadCollaborators(supabase, items.map((i) => i.id)),
  ]);

  return items.map((item) => ({
    ...withMine(item, mine),
    collaborators: collaborators.get(item.id) ?? [],
  }));
}

const CATEGORIES = ['web', 'app'];
const STATUSES = ['draft', 'published'];
const BLOCK_TYPES = ['image', 'video', 'text', 'code'];

const SORTS = {
  latest: { column: 'created_at', ascending: false },
  oldest: { column: 'created_at', ascending: true },
  title: { column: 'title', ascending: true },
  popular: { column: 'like_count', ascending: false },
  views: { column: 'view_count', ascending: false },
  bookmarks: { column: 'bookmark_count', ascending: false },
};

const SCRAP_SORTS = {
  latest: (a, b) => b.scrappedAt.localeCompare(a.scrappedAt),
  oldest: (a, b) => a.scrappedAt.localeCompare(b.scrappedAt),
  title: (a, b) => (a.title ?? '').localeCompare(b.title ?? ''),
};

function toItem(row) {
  return {
    id: row.id,
    title: row.title,
    thumbnailUrl: row.thumbnail_url ?? '',
    category: row.category,
    description: row.description,
    status: row.status,
    authorId: row.user_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar_url,
    authorRole: row.author_desired_role,
    likeCount: row.like_count ?? 0,
    bookmarkCount: row.bookmark_count ?? 0,
    viewCount: row.view_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function toDetail(row) {
  return {
    ...toItem(row),
    content: row.content ?? [],
    bgColor: row.bg_color,
    gapPx: row.gap_px,
  };
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw badRequest('JSON 본문이 필요합니다.');
  }
}

function validateCollaborators(ids) {
  if (ids === undefined) return undefined;
  if (!Array.isArray(ids)) throw badRequest('collaboratorIds 는 배열이어야 합니다.');
  if (ids.some((id) => typeof id !== 'string' || !id.trim())) {
    throw badRequest('collaboratorIds 는 사용자 id 문자열 배열이어야 합니다.');
  }
  if (new Set(ids).size > COLLABORATOR_LIMIT) {
    throw badRequest(`공동작업자는 최대 ${COLLABORATOR_LIMIT}명까지 추가할 수 있습니다.`);
  }
  return ids;
}

async function saveCollaborators(supabase, portfolioId, ids) {
  unwrap(
    await supabase.rpc('save_portfolio_collaborators', {
      p_portfolio_id: portfolioId,
      p_user_ids: ids,
    })
  );
}

async function detailWithExtras(row, supabase, user, mine) {
  const collaborators = await loadCollaborators(supabase, [row.id]);
  return { ...withMine(toDetail(row), mine), collaborators: collaborators.get(row.id) ?? [] };
}

function validateContent(content) {
  if (content === undefined) return undefined;
  if (!Array.isArray(content)) throw badRequest('content 는 블록 배열이어야 합니다.');

  const images = content.filter((b) => b?.type === 'image').length;
  if (images > 15) throw badRequest('이미지는 최대 15장까지 넣을 수 있습니다.');

  for (const block of content) {
    if (!BLOCK_TYPES.includes(block?.type)) {
      throw badRequest(`블록 type 은 ${BLOCK_TYPES.join(' | ')} 중 하나여야 합니다.`);
    }
  }
  return content;
}

async function listScrapped({ supabase, user, q, page, pageSize }) {
  const sortKey = q.get('sort') ?? 'latest';
  const compare = SCRAP_SORTS[sortKey];
  if (!compare) {
    throw badRequest(`스크랩 목록의 sort 는 ${Object.keys(SCRAP_SORTS).join(' | ')} 중 하나여야 합니다.`);
  }

  const marks = await loadScrapMarks(supabase, user, 'portfolio');
  if (marks.size === 0) return { items: [], total: 0, page, pageSize };

  const rows = unwrap(
    await supabase.from('v_portfolios').select('*').in('id', [...marks.keys()])
  );

  const scrapped = (rows ?? [])
    .map((row) => ({ ...toItem(row), scrappedAt: marks.get(row.id) ?? '' }))
    .sort(compare);

  const paged = pageOf(scrapped, page, pageSize);
  return { ...paged, items: await attachMine(paged.items, supabase, user) };
}

export const GET = defineRoute(async ({ request, supabase, user }) => {
  const q = request.nextUrl.searchParams;

  const page = Math.max(1, Number(q.get('page') ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(q.get('pageSize') ?? 20)));
  if (q.get('scrapped') === '1') {
    if (!user) throw unauthorized();
    return listScrapped({ supabase, user, q, page, pageSize });
  }

  const sort = SORTS[q.get('sort') ?? 'latest'];
  if (!sort) throw badRequest(`sort 는 ${Object.keys(SORTS).join(' | ')} 중 하나여야 합니다.`);

  const isMine = q.get('mine') === '1';
  if (isMine && !user) throw unauthorized();

  const status = q.get('status');
  if (status && !STATUSES.includes(status)) {
    throw badRequest(`status 는 ${STATUSES.join(' | ')} 중 하나여야 합니다.`);
  }

  const category = q.get('category');
  if (category && !CATEGORIES.includes(category)) {
    throw badRequest(`category 는 ${CATEGORIES.join(' | ')} 중 하나여야 합니다.`);
  }

  let query = supabase.from('v_portfolios').select('*', { count: 'exact' });

  if (isMine) {
    query = query.eq('user_id', user.id);
    if (status) query = query.eq('status', status);
  } else {
    const authorId = q.get('userId');
    if (authorId) query = query.eq('user_id', authorId);
    query = query.eq('status', 'published');
  }

  if (category) query = query.eq('category', category);

  const keyword = q.get('q')?.trim();
  if (keyword) query = query.ilike('title', `%${keyword}%`);

  const ids = q.get('ids');
  if (ids) {
    const list = ids.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) return { items: [], total: 0, page, pageSize };
    query = query.in('id', list);
  }

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query
    .order(sort.column, { ascending: sort.ascending, nullsFirst: false })
    .order('created_at', { ascending: false })
    .range(from, from + pageSize - 1);
  if (error) throw error;

  return {
    items: await attachMine((data ?? []).map(toItem), supabase, user),
    total: count ?? 0,
    page,
    pageSize,
  };
});

export const POST = defineRoute(
  async ({ request, supabase, user }) => {
    const body = await readJson(request);

    if (body.category && !CATEGORIES.includes(body.category)) {
      throw badRequest(`category 는 ${CATEGORIES.join(' | ')} 중 하나여야 합니다.`);
    }
    if (body.status && !STATUSES.includes(body.status)) {
      throw badRequest(`status 는 ${STATUSES.join(' | ')} 중 하나여야 합니다.`);
    }

    const collaboratorIds = validateCollaborators(body.collaboratorIds);

    const row = unwrap(
      await supabase
        .from('portfolios')
        .insert({
          user_id: user.id,
          title: body.title?.trim() || '제목 없음',
          category: body.category ?? null,
          thumbnail_url: body.thumbnailUrl ?? null,
          description: body.description ?? null,
          content: validateContent(body.content) ?? [],
          bg_color: body.bgColor ?? '#F4FCFE',
          gap_px: body.gapPx ?? 16,
          status: body.status ?? 'draft',
        })
        .select('*')
        .single()
    );

    if (collaboratorIds) await saveCollaborators(supabase, row.id, collaboratorIds);

    return detailWithExtras(
      { ...row, author_name: null, like_count: 0, bookmark_count: 0 },
      supabase,
      user,
      NO_MINE
    );
  },
  { auth: true }
);

export const DELETE = defineRoute(
  async ({ request, supabase, user }) => {
    const { ids } = await readJson(request);
    if (!Array.isArray(ids) || ids.length === 0) throw badRequest('ids 배열이 필요합니다.');

    const rows = unwrap(
      await supabase.from('portfolios').delete().eq('user_id', user.id).in('id', ids).select('id')
    );
    return { deleted: rows?.length ?? 0 };
  },
  { auth: true }
);

export const GET_DETAIL = defineRoute(async ({ params, supabase, user }) => {
  const row = unwrap(
    await supabase.from('v_portfolios').select('*').eq('id', params.id).maybeSingle()
  );
  if (!row) throw notFound('포트폴리오를 찾을 수 없습니다.');
  if (row.status !== 'published' && row.user_id !== user?.id) {
    throw notFound('포트폴리오를 찾을 수 없습니다.');
  }

  const mine = await loadMyReactions(supabase, user, 'portfolio', [row.id]);
  return detailWithExtras(row, supabase, user, mine);
});

export const PATCH_DETAIL = defineRoute(
  async ({ request, params, supabase, user }) => {
    const body = await readJson(request);

    const patch = {};
    if ('title' in body) patch.title = body.title?.trim() || '제목 없음';
    if ('description' in body) patch.description = body.description;
    if ('thumbnailUrl' in body) patch.thumbnail_url = body.thumbnailUrl;
    if ('bgColor' in body) patch.bg_color = body.bgColor;
    if ('gapPx' in body) patch.gap_px = body.gapPx;
    if ('content' in body) patch.content = validateContent(body.content);
    if ('category' in body) {
      if (body.category && !CATEGORIES.includes(body.category)) {
        throw badRequest(`category 는 ${CATEGORIES.join(' | ')} 중 하나여야 합니다.`);
      }
      patch.category = body.category;
    }
    if ('status' in body) {
      if (!STATUSES.includes(body.status)) {
        throw badRequest(`status 는 ${STATUSES.join(' | ')} 중 하나여야 합니다.`);
      }
      patch.status = body.status;
    }

    const collaboratorIds = validateCollaborators(body.collaboratorIds);

    if (Object.keys(patch).length === 0 && !collaboratorIds) {
      throw badRequest('수정할 내용이 없습니다.');
    }

    if (Object.keys(patch).length === 0) {
      const owned = unwrap(
        await supabase
          .from('portfolios')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .maybeSingle()
      );
      if (!owned) throw notFound('포트폴리오를 찾을 수 없습니다.');

      await saveCollaborators(supabase, owned.id, collaboratorIds);

      const mine = await loadMyReactions(supabase, user, 'portfolio', [owned.id]);
      return detailWithExtras(owned, supabase, user, mine);
    }

    const row = unwrap(
      await supabase
        .from('portfolios')
        .update(patch)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select('*')
        .maybeSingle()
    );
    if (!row) throw notFound('포트폴리오를 찾을 수 없습니다.');

    if (collaboratorIds) await saveCollaborators(supabase, row.id, collaboratorIds);

    const mine = await loadMyReactions(supabase, user, 'portfolio', [row.id]);
    return detailWithExtras(row, supabase, user, mine);
  },
  { auth: true }
);

export const DELETE_DETAIL = defineRoute(
  async ({ params, supabase, user }) => {
    const rows = unwrap(
      await supabase
        .from('portfolios')
        .delete()
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select('id')
    );
    if (!rows?.length) throw forbidden('본인 포트폴리오만 삭제할 수 있습니다.');
    return { deleted: 1 };
  },
  { auth: true }
);

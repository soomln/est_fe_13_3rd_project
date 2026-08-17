import { badRequest, notFound } from '../http/errors';
import { defineRoute, unwrap } from '../http/route';
import { loadMyReactions } from './reactions';

const withMine = (item, mine) => ({ ...item, bookmarkedByMe: mine.bookmark.has(item.id) });

const DOC_TYPES = ['resume', 'cover_letter'];

const SORTS = {
  popular: { column: 'view_count', ascending: false },
  latest: { column: 'created_at', ascending: false },
  title: { column: 'title', ascending: true },
  order: { column: 'sort_order', ascending: true },
};

function toItem(row) {
  return {
    id: row.id,
    title: row.title,
    docType: row.doc_type,
    category: row.category_code,
    thumbnail: row.thumbnail_url,
    views: row.view_count ?? 0,
  };
}

export const GET = defineRoute(async ({ request, supabase, user }) => {
  const q = request.nextUrl.searchParams;

  const page = Math.max(1, Number(q.get('page') ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(q.get('pageSize') ?? 16)));
  const sort = SORTS[q.get('sort') ?? 'popular'];
  if (!sort) throw badRequest(`sort 는 ${Object.keys(SORTS).join(' | ')} 중 하나여야 합니다.`);

  const docType = q.get('docType');
  if (docType && !DOC_TYPES.includes(docType)) {
    throw badRequest(`docType 은 ${DOC_TYPES.join(' | ')} 중 하나여야 합니다.`);
  }

  let query = supabase
    .from('resume_templates')
    .select('id, title, doc_type, category_code, thumbnail_url, view_count', { count: 'exact' })
    .eq('is_active', true);

  if (docType) query = query.eq('doc_type', docType);

  const keyword = q.get('q')?.trim();
  if (keyword) query = query.ilike('title', `%${keyword}%`);

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query
    .order(sort.column, { ascending: sort.ascending })
    .order('id', { ascending: true })
    .range(from, from + pageSize - 1);
  if (error) throw error;

  const all = unwrap(
    await supabase.from('resume_templates').select('doc_type').eq('is_active', true)
  );

  const items = (data ?? []).map(toItem);
  const mine = await loadMyReactions(supabase, user, 'template', items.map((i) => i.id));

  return {
    items: items.map((item) => withMine(item, mine)),
    total: count ?? 0,
    page,
    pageSize,
    counts: {
      all: all.length,
      resume: all.filter((r) => r.doc_type === 'resume').length,
      cover_letter: all.filter((r) => r.doc_type === 'cover_letter').length,
    },
  };
});

export const GET_DETAIL = defineRoute(async ({ params, supabase, user }) => {
  const row = unwrap(
    await supabase
      .from('resume_templates')
      .select('*')
      .eq('id', params.id)
      .eq('is_active', true)
      .maybeSingle()
  );
  if (!row) throw notFound('양식을 찾을 수 없습니다.');

  const mine = await loadMyReactions(supabase, user, 'template', [row.id]);

  return withMine(
    {
      ...toItem(row),
      content: row.content,
      contentHtml: row.content_html,
    },
    mine
  );
});

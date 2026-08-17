import { badRequest, notFound, unauthorized } from '../http/errors';
import { defineRoute, pageOf, unwrap } from '../http/route';
import { loadMyReactions, loadScrapMarks } from './reactions';

const withMine = (item, mine) => ({ ...item, bookmarkedByMe: mine.bookmark.has(item.id) });

const SCRAP_SORTS = {
  latest: (a, b) => b.scrappedAt.localeCompare(a.scrappedAt),
  oldest: (a, b) => a.scrappedAt.localeCompare(b.scrappedAt),
  name: (a, b) => (a.name ?? '').localeCompare(b.name ?? ''),
};

const SORTS = {
  popular: { column: 'bookmark_count', ascending: false },
  rating: { column: 'rating', ascending: false },
  views: { column: 'view_count', ascending: false },
  name: { column: 'name', ascending: true },
  latest: { column: 'created_at', ascending: false },
};

const LABEL_GROUPS = ['industry', 'company_size'];

async function loadLabels(supabase) {
  const rows = unwrap(
    await supabase.from('code_master').select('group_name, code, label').in('group_name', LABEL_GROUPS)
  );
  const map = Object.fromEntries(LABEL_GROUPS.map((g) => [g, {}]));
  for (const r of rows) map[r.group_name][r.code] = r.label;
  return map;
}

function toCard(row, labels) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logo: row.logo_url,
    category: labels.industry[row.industry_code] ?? row.industry_code,
    size: labels.company_size[row.size_code] ?? row.size_code ?? null,
    location: row.location,
    tags: row.tags ?? [],
    rating: row.rating,
    employees: row.employee_count,
    avgSalary: row.avg_salary_text,
    favorite: row.bookmark_count ?? 0,
    review: row.review_count ?? 0,
    jokbo: row.qbank_count ?? 0,
    passrate: row.pass_rate,
    difficulty: row.avg_difficulty,
  };
}

function toDetail(row, labels) {
  return {
    ...toCard(row, labels),
    industry: labels.industry[row.industry_code] ?? row.industry_code,
    tagline: row.tagline,
    intro: row.description,
    homepage: row.homepage,
    address: row.hq_address,
    founded: row.founded_on,
    ceo: row.ceo,
    capital: row.capital_text,
    hire: row.hiring_status,
    views: row.view_count ?? 0,
    ratings: row.rating_dimensions ?? {},
    salary: row.salary_detail ?? {},
    values: (row.core_values ?? []).map((v) => ({
      icon: v.icon,
      title: v.title,
      description: v.desc ?? v.description,
    })),
    services: (row.services ?? []).map((s) => ({
      name: s.name,
      description: s.name,
      logo: s.logo_url ?? null,
      link: s.link ?? null,
    })),
    benefits: (row.benefits ?? []).map((b) => ({
      icon: b.icon,
      title: b.title,
      description: b.desc ?? b.description,
    })),
    summary: (row.highlights ?? []).map((h) =>
      typeof h === 'string' ? { icon: 'check_circle', description: h } : h
    ),
    news: (row.news ?? []).map((n) => ({
      title: n.title,
      date: n.published_on ?? n.date,
      url: n.url ?? null,
    })),
  };
}

async function listScrapped({ supabase, user, q, page, pageSize }) {
  const compare = SCRAP_SORTS[q.get('sort') ?? 'latest'];
  if (!compare) {
    throw badRequest(`스크랩 목록의 sort 는 ${Object.keys(SCRAP_SORTS).join(' | ')} 중 하나여야 합니다.`);
  }

  const marks = await loadScrapMarks(supabase, user, 'company');
  if (marks.size === 0) return { items: [], total: 0, page, pageSize };

  const rows = unwrap(await supabase.from('v_companies').select('*').in('id', [...marks.keys()]));
  const labels = await loadLabels(supabase);

  const scrapped = (rows ?? [])
    .map((row) => ({ ...toCard(row, labels), scrappedAt: marks.get(row.id) ?? '' }))
    .sort(compare);

  const paged = pageOf(scrapped, page, pageSize);
  const mine = await loadMyReactions(supabase, user, 'company', paged.items.map((c) => c.id));

  return { ...paged, items: paged.items.map((item) => withMine(item, mine)) };
}

export const GET = defineRoute(async ({ request, supabase, user }) => {
  const q = request.nextUrl.searchParams;

  const page = Math.max(1, Number(q.get('page') ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(q.get('pageSize') ?? 20)));

  if (q.get('scrapped') === '1') {
    if (!user) throw unauthorized();
    return listScrapped({ supabase, user, q, page, pageSize });
  }

  const sortKey = q.get('sort') ?? 'popular';
  const sort = SORTS[sortKey];
  if (!sort) throw badRequest(`sort 는 ${Object.keys(SORTS).join(' | ')} 중 하나여야 합니다.`);

  let query = supabase.from('v_companies').select('*', { count: 'exact' });

  const keyword = q.get('q')?.trim();
  if (keyword) query = query.ilike('name', `%${keyword}%`);

  const industry = q.get('industry');
  if (industry) query = query.eq('industry_code', industry);

  const size = q.get('size');
  if (size) query = query.eq('size_code', size);

  const jobRole = q.get('jobRole');
  if (jobRole) query = query.contains('job_role_codes', [jobRole]);

  const ids = q.get('ids');
  if (ids) {
    const list = ids.split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) return { items: [], total: 0, page, pageSize };
    query = query.in('id', list);
  }

  const from = (page - 1) * pageSize;
  const { data, error, count } = await query
    .order(sort.column, { ascending: sort.ascending, nullsFirst: false })
    .order('name', { ascending: true })
    .range(from, from + pageSize - 1);
  if (error) throw error;

  const labels = await loadLabels(supabase);
  const items = (data ?? []).map((row) => toCard(row, labels));
  const mine = await loadMyReactions(supabase, user, 'company', items.map((i) => i.id));

  return {
    items: items.map((item) => withMine(item, mine)),
    total: count ?? 0,
    page,
    pageSize,
  };
});

export const GET_DETAIL = defineRoute(async ({ params, supabase, user }) => {
  const row = unwrap(
    await supabase.from('v_companies').select('*').eq('slug', params.slug).maybeSingle()
  );
  if (!row) throw notFound('기업을 찾을 수 없습니다.');

  const labels = await loadLabels(supabase);
  const mine = await loadMyReactions(supabase, user, 'company', [row.id]);
  return withMine(toDetail(row, labels), mine);
});

export const GET_RECOMMENDED = defineRoute(async ({ request, supabase, user }) => {
  const limit = Math.min(20, Math.max(1, Number(request.nextUrl.searchParams.get('limit') ?? 6)));
  const rows = unwrap(await supabase.rpc('get_recommended_companies', { p_limit: limit }));
  const labels = await loadLabels(supabase);
  const items = (rows ?? []).map((row) => toCard(row, labels));
  const mine = await loadMyReactions(supabase, user, 'company', items.map((i) => i.id));

  return { items: items.map((item) => withMine(item, mine)) };
});

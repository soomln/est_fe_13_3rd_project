import { badRequest, notFound } from '../http/errors';
import { defineRoute, unwrap } from '../http/route';

const SORTS = {
  popular: { column: 'bookmark_count', ascending: false },
  rating: { column: 'rating', ascending: false },
  views: { column: 'view_count', ascending: false },
  name: { column: 'name', ascending: true },
  latest: { column: 'created_at', ascending: false },
};

async function industryLabels(supabase) {
  const rows = unwrap(
    await supabase.from('code_master').select('code, label').eq('group_name', 'industry')
  );
  return Object.fromEntries(rows.map((r) => [r.code, r.label]));
}

function toCard(row, labels) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    logo: row.logo_url,
    category: labels[row.industry_code] ?? row.industry_code,
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
    industry: labels[row.industry_code] ?? row.industry_code,
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

export const GET = defineRoute(async ({ request, supabase }) => {
  const q = request.nextUrl.searchParams;

  const page = Math.max(1, Number(q.get('page') ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(q.get('pageSize') ?? 20)));
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

  const labels = await industryLabels(supabase);
  return {
    items: (data ?? []).map((row) => toCard(row, labels)),
    total: count ?? 0,
    page,
    pageSize,
  };
});

export const GET_DETAIL = defineRoute(async ({ params, supabase }) => {
  const row = unwrap(
    await supabase.from('v_companies').select('*').eq('slug', params.slug).maybeSingle()
  );
  if (!row) throw notFound('기업을 찾을 수 없습니다.');

  const labels = await industryLabels(supabase);
  return toDetail(row, labels);
});

export const GET_RECOMMENDED = defineRoute(async ({ request, supabase }) => {
  const limit = Math.min(20, Math.max(1, Number(request.nextUrl.searchParams.get('limit') ?? 6)));
  const rows = unwrap(await supabase.rpc('get_recommended_companies', { p_limit: limit }));
  const labels = await industryLabels(supabase);
  return { items: (rows ?? []).map((row) => toCard(row, labels)) };
});

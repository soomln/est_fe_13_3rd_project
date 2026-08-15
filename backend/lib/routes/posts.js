import { SCORE_SCALE } from '../constants';
import { badRequest, notFound, unauthorized } from '../http/errors';
import { defineRoute, unwrap } from '../http/route';
import { loadMyReactions } from './reactions';

const NO_MINE = { like: new Set(), bookmark: new Set() };

const withMine = (item, mine) => ({
  ...item,
  likedByMe: mine.like.has(item.id),
  scrappedByMe: mine.bookmark.has(item.id),
});

const POST_TYPES = ['review', 'qbank'];

const SORTS = {
  latest: { column: 'created_at', ascending: false },
  popular: { column: 'like_count', ascending: false },
  scraps: { column: 'scrap_count', ascending: false },
  comments: { column: 'comment_count', ascending: false },
  views: { column: 'view_count', ascending: false },
};

const LABEL_GROUPS = ['difficulty', 'pass_result', 'interview_channel', 'job_role', 'education_level'];

export async function loadLabels(supabase) {
  const rows = unwrap(
    await supabase.from('code_master').select('group_name, code, label').in('group_name', LABEL_GROUPS)
  );
  const map = Object.fromEntries(LABEL_GROUPS.map((g) => [g, {}]));
  for (const r of rows) map[r.group_name][r.code] = r.label;
  return map;
}

const formatDate = (iso) => (iso ? iso.slice(0, 10).replace(/-/g, '.') : '');

export const splitQuestions = (text) =>
  typeof text === 'string' ? text.split('\n').map((line) => line.trim()).filter(Boolean) : [];

function toItem(row, labels) {
  const label = (group, code) => (code ? labels[group]?.[code] ?? code : '');

  const jobInfo = [
    label('job_role', row.job_role_code),
    row.position_level,
    label('education_level', row.education_level),
  ]
    .filter(Boolean)
    .join(' / ');

  return {
    id: row.id,
    postType: row.post_type,

    companyId: row.company_id,
    companyName: row.company_name ?? '',
    companyLogo: row.company_logo_url ?? null,
    companySlug: row.company_slug ?? null,

    title: row.title ?? '',
    body: row.body ?? '',
    content: row.body ?? '',
    questions: row.questions ?? '',
    questionList: splitQuestions(row.questions),

    difficulty: label('difficulty', row.difficulty_code),
    difficultyScore: row.difficulty_score,
    problemScore: row.problem_score,
    questionCount: row.question_count,

    result: label('pass_result', row.pass_result_code),
    channel: row.channel_code === 'etc' ? row.channel_etc || '기타' : label('interview_channel', row.channel_code),
    route: row.channel_code === 'etc' ? row.channel_etc || '기타' : label('interview_channel', row.channel_code),

    jobRole: label('job_role', row.job_role_code),
    job: label('job_role', row.job_role_code),
    positionLevel: row.position_level,
    educationLevel: label('education_level', row.education_level),
    education: label('education_level', row.education_level),
    jobInfo,

    tags: row.tags ?? [],
    overallComment: row.overall_comment ?? '',

    authorId: row.user_id,
    authorName: row.author_name,
    authorAvatar: row.author_avatar_url,

    likeCount: row.like_count ?? 0,
    scrapCount: row.scrap_count ?? 0,
    saveCount: row.scrap_count ?? 0,
    bookmark: row.scrap_count ?? 0,
    commentCount: row.comment_count ?? 0,
    comment: row.comment_count ?? 0,
    viewCount: row.view_count ?? 0,

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

const WRITABLE = {
  companyId: 'company_id',
  title: 'title',
  body: 'body',
  questions: 'questions',
  difficultyCode: 'difficulty_code',
  difficultyScore: 'difficulty_score',
  problemScore: 'problem_score',
  passResultCode: 'pass_result_code',
  channelCode: 'channel_code',
  channelEtc: 'channel_etc',
  jobRoleCode: 'job_role_code',
  positionLevel: 'position_level',
  educationLevel: 'education_level',
  tags: 'tags',
  overallComment: 'overall_comment',
};

const SCORE_KEYS = ['difficultyScore', 'problemScore'];

const isScore = (value) =>
  value === null ||
  (Number.isInteger(value) && value >= SCORE_SCALE.min && value <= SCORE_SCALE.max);

function toColumns(body) {
  const patch = {};
  for (const [key, column] of Object.entries(WRITABLE)) {
    if (key in body) patch[column] = body[key];
  }
  if ('questions' in body) {
    if (typeof body.questions !== 'string') {
      throw badRequest('questions 는 줄바꿈으로 구분한 텍스트여야 합니다.');
    }
    patch.question_count = splitQuestions(body.questions).length;
  }
  if ('tags' in body && !Array.isArray(body.tags)) {
    throw badRequest('tags 는 배열이어야 합니다.');
  }
  for (const key of SCORE_KEYS) {
    if (key in body && !isScore(body[key])) {
      throw badRequest(`${key} 는 ${SCORE_SCALE.min}~${SCORE_SCALE.max} 사이의 정수여야 합니다.`);
    }
  }
  return patch;
}

export const GET = defineRoute(async ({ request, supabase, user }) => {
  const q = request.nextUrl.searchParams;

  const page = Math.max(1, Number(q.get('page') ?? 1));
  const pageSize = Math.min(50, Math.max(1, Number(q.get('pageSize') ?? 10)));
  const sort = SORTS[q.get('sort') ?? 'latest'];
  if (!sort) throw badRequest(`sort 는 ${Object.keys(SORTS).join(' | ')} 중 하나여야 합니다.`);

  const type = q.get('type');
  if (type && !POST_TYPES.includes(type)) {
    throw badRequest(`type 은 ${POST_TYPES.join(' | ')} 중 하나여야 합니다.`);
  }

  let query = supabase.from('v_posts').select('*', { count: 'exact' });

  if (type) query = query.eq('post_type', type);

  if (q.get('mine') === '1') {
    if (!user) throw unauthorized();
    query = query.eq('user_id', user.id);
  }

  const companyId = q.get('companyId');
  if (companyId) query = query.eq('company_id', companyId);

  const companySlug = q.get('companySlug');
  if (companySlug) query = query.eq('company_slug', companySlug);

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

  const labels = await loadLabels(supabase);
  const items = (data ?? []).map((r) => toItem(r, labels));
  const mine = await loadMyReactions(supabase, user, 'post', items.map((i) => i.id));

  return { items: items.map((item) => withMine(item, mine)), total: count ?? 0, page, pageSize };
});

export const POST = defineRoute(
  async ({ request, supabase, user }) => {
    const body = await readJson(request);

    if (!POST_TYPES.includes(body.postType)) {
      throw badRequest(`postType 은 ${POST_TYPES.join(' | ')} 중 하나여야 합니다.`);
    }

    const inserted = unwrap(
      await supabase
        .from('posts')
        .insert({ user_id: user.id, post_type: body.postType, ...toColumns(body) })
        .select('id')
        .single()
    );

    const row = unwrap(await supabase.from('v_posts').select('*').eq('id', inserted.id).single());
    return withMine(toItem(row, await loadLabels(supabase)), NO_MINE);
  },
  { auth: true }
);

export const DELETE = defineRoute(
  async ({ request, supabase, user }) => {
    const { ids } = await readJson(request);
    if (!Array.isArray(ids) || ids.length === 0) throw badRequest('ids 배열이 필요합니다.');

    const rows = unwrap(
      await supabase.from('posts').delete().eq('user_id', user.id).in('id', ids).select('id')
    );
    return { deleted: rows?.length ?? 0 };
  },
  { auth: true }
);

export const GET_DETAIL = defineRoute(async ({ params, supabase, user }) => {
  const row = unwrap(await supabase.from('v_posts').select('*').eq('id', params.id).maybeSingle());
  if (!row) throw notFound('글을 찾을 수 없습니다.');

  const mine = await loadMyReactions(supabase, user, 'post', [row.id]);
  return withMine(toItem(row, await loadLabels(supabase)), mine);
});

export const PATCH_DETAIL = defineRoute(
  async ({ request, params, supabase, user }) => {
    const patch = toColumns(await readJson(request));
    if (Object.keys(patch).length === 0) throw badRequest('수정할 내용이 없습니다.');

    const updated = unwrap(
      await supabase
        .from('posts')
        .update(patch)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select('id')
        .maybeSingle()
    );
    if (!updated) throw notFound('글을 찾을 수 없습니다.');

    const row = unwrap(await supabase.from('v_posts').select('*').eq('id', updated.id).single());
    const mine = await loadMyReactions(supabase, user, 'post', [row.id]);
    return withMine(toItem(row, await loadLabels(supabase)), mine);
  },
  { auth: true }
);

export const DELETE_DETAIL = defineRoute(
  async ({ params, supabase, user }) => {
    const rows = unwrap(
      await supabase.from('posts').delete().eq('id', params.id).eq('user_id', user.id).select('id')
    );
    if (!rows?.length) throw notFound('글을 찾을 수 없습니다.');
    return { deleted: 1 };
  },
  { auth: true }
);

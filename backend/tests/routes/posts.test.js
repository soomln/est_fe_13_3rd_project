import { beforeEach, describe, expect, it, vi } from 'vitest';

import { argsOf, createSupabaseStub, queriesFor } from '../helpers/supabase';
import { brokenJsonRequest, callRoute, makeRequest, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { DELETE, DELETE_DETAIL, GET, GET_DETAIL, PATCH_DETAIL, POST, loadLabels } = await import(
  '../../lib/routes/posts'
);

const url = (qs = '') => `http://localhost/api/posts${qs}`;

const CODES = {
  data: [
    { group_name: 'difficulty', code: 'hard', label: '어려움' },
    { group_name: 'pass_result', code: 'pass', label: '합격' },
    { group_name: 'interview_channel', code: 'online', label: '온라인 지원' },
    { group_name: 'job_role', code: 'fe', label: '프론트엔드' },
    { group_name: 'education_level', code: 'bachelor', label: '대졸' },
  ],
  error: null,
};

const ROW = {
  id: 'p1',
  post_type: 'review',
  company_id: 'c1',
  company_name: '네이버',
  company_logo_url: 'https://cdn/n.png',
  company_slug: 'naver',
  title: '면접 후기',
  body: '분위기 좋았어요',
  questions: ['REST 란?'],
  difficulty_code: 'hard',
  difficulty_score: 4,
  problem_score: 3,
  question_count: 5,
  pass_result_code: 'pass',
  channel_code: 'online',
  channel_etc: null,
  job_role_code: 'fe',
  position_level: '신입',
  education_level: 'bachelor',
  tags: ['#CS'],
  overall_comment: '준비 잘하세요',
  user_id: 'u2',
  author_name: '김프론트',
  author_avatar_url: 'https://cdn/a.png',
  like_count: 15,
  scrap_count: 7,
  comment_count: 30,
  view_count: 200,
  created_at: '2026-08-05T10:00:00Z',
  updated_at: '2026-08-06T10:00:00Z',
};

const listStub = (rows = [ROW], extra = {}) =>
  createSupabaseStub({
    tables: { v_posts: { data: rows, error: null, count: rows.length }, code_master: CODES },
    ...extra,
  });

let supabase;

beforeEach(() => {
  supabase = listStub();
  setSupabase(supabase);
});

describe('loadLabels', () => {
  it('builds a label map keyed by group', async () => {
    const stub = createSupabaseStub({ tables: { code_master: CODES } });

    await expect(loadLabels(stub)).resolves.toEqual({
      difficulty: { hard: '어려움' },
      pass_result: { pass: '합격' },
      interview_channel: { online: '온라인 지원' },
      job_role: { fe: '프론트엔드' },
      education_level: { bachelor: '대졸' },
    });
  });

  it('creates every group key even with no rows', async () => {
    const stub = createSupabaseStub({ tables: { code_master: { data: [], error: null } } });

    const labels = await loadLabels(stub);

    expect(Object.keys(labels)).toHaveLength(5);
    expect(labels.difficulty).toEqual({});
  });
});

describe('GET /api/posts', () => {
  it('maps a row into the shape the screen needs', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(200);
    expect(body.items[0]).toMatchObject({
      id: 'p1',
      postType: 'review',
      companyName: '네이버',
      difficulty: '어려움',
      result: '합격',
      channel: '온라인 지원',
      route: '온라인 지원',
      jobRole: '프론트엔드',
      job: '프론트엔드',
      jobInfo: '프론트엔드 / 신입 / 대졸',
      likeCount: 15,
      scrapCount: 7,
      saveCount: 7,
      bookmark: 7,
      commentCount: 30,
      comment: 30,
      viewCount: 200,
      date: '2026.08.05',
    });
  });

  it('exposes the body as both body and content', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0].body).toBe('분위기 좋았어요');
    expect(body.items[0].content).toBe('분위기 좋았어요');
  });

  it('uses the free text when the channel is etc', async () => {
    setSupabase(listStub([{ ...ROW, channel_code: 'etc', channel_etc: '잡코리아' }]));

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0].channel).toBe('잡코리아');
    expect(body.items[0].route).toBe('잡코리아');
  });

  it('falls back to the etc label when the free text is blank', async () => {
    setSupabase(listStub([{ ...ROW, channel_code: 'etc', channel_etc: '' }]));

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0].channel).toBe('기타');
  });

  it('turns the education code into its label', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0].educationLevel).toBe('대졸');
    expect(body.items[0].education).toBe('대졸');
  });

  it('shows an unknown education code as-is', async () => {
    setSupabase(listStub([{ ...ROW, education_level: 'phd' }]));

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0].educationLevel).toBe('phd');
    expect(body.items[0].jobInfo).toBe('프론트엔드 / 신입 / phd');
  });

  it('shows an unknown code as-is', async () => {
    setSupabase(listStub([{ ...ROW, difficulty_code: 'insane' }]));

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0].difficulty).toBe('insane');
  });

  it('is an empty string when the code is blank', async () => {
    setSupabase(listStub([{ ...ROW, difficulty_code: null, job_role_code: null }]));

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0].difficulty).toBe('');
    expect(body.items[0].jobRole).toBe('');
  });

  it('jobInfo joins only the parts that are present', async () => {
    setSupabase(listStub([{ ...ROW, position_level: null }]));

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0].jobInfo).toBe('프론트엔드 / 대졸');
  });

  it('fills nullable fields with defaults', async () => {
    setSupabase(listStub([{ id: 'p9', post_type: 'qbank' }]));

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0]).toMatchObject({
      companyName: '',
      companyLogo: null,
      title: '',
      body: '',
      questions: [],
      tags: [],
      overallComment: '',
      likeCount: 0,
      scrapCount: 0,
      commentCount: 0,
      viewCount: 0,
      date: '',
    });
  });

  it('sorts by latest by default', async () => {
    await callRoute(GET, { request: makeRequest(url()) });

    expect(argsOf(queriesFor(supabase, 'v_posts')[0], 'order')[0]).toEqual([
      'created_at',
      { ascending: false, nullsFirst: false },
    ]);
  });

  it.each([
    ['popular', 'like_count'],
    ['scraps', 'scrap_count'],
    ['comments', 'comment_count'],
    ['views', 'view_count'],
  ])('sort=%s orders by %s', async (sort, column) => {
    await callRoute(GET, { request: makeRequest(url(`?sort=${sort}`)) });

    expect(argsOf(queriesFor(supabase, 'v_posts')[0], 'order')[0]).toEqual([
      column,
      { ascending: false, nullsFirst: false },
    ]);
  });

  it('answers 400 for an unknown sort', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url('?sort=zzz')) });

    expect(status).toBe(400);
    expect(body.error.message).toContain('sort');
  });

  it.each(['review', 'qbank'])('filters by type=%s', async (type) => {
    await callRoute(GET, { request: makeRequest(url(`?type=${type}`)) });

    expect(argsOf(queriesFor(supabase, 'v_posts')[0], 'eq')).toContainEqual(['post_type', type]);
  });

  it('answers 400 for an unknown type', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url('?type=diary')) });

    expect(status).toBe(400);
    expect(body.error.message).toContain('type');
  });

  it('answers 401 for mine=1 while signed out', async () => {
    const { status } = await callRoute(GET, { request: makeRequest(url('?mine=1')) });

    expect(status).toBe(401);
  });

  it('mine=1 queries only my own posts', async () => {
    supabase = listStub([ROW], { user: { id: 'u1' } });
    setSupabase(supabase);

    await callRoute(GET, { request: makeRequest(url('?mine=1')) });

    expect(argsOf(queriesFor(supabase, 'v_posts')[0], 'eq')).toContainEqual(['user_id', 'u1']);
  });

  it('filters by company id and slug', async () => {
    await callRoute(GET, { request: makeRequest(url('?companyId=c1&companySlug=naver')) });

    const eqs = argsOf(queriesFor(supabase, 'v_posts')[0], 'eq');
    expect(eqs).toContainEqual(['company_id', 'c1']);
    expect(eqs).toContainEqual(['company_slug', 'naver']);
  });

  it('matches the keyword against the title', async () => {
    await callRoute(GET, { request: makeRequest(url('?q=%20후기%20')) });

    expect(argsOf(queriesFor(supabase, 'v_posts')[0], 'ilike')[0]).toEqual(['title', '%후기%']);
  });

  it('ignores a whitespace-only keyword', async () => {
    await callRoute(GET, { request: makeRequest(url('?q=%20')) });

    expect(argsOf(queriesFor(supabase, 'v_posts')[0], 'ilike')).toHaveLength(0);
  });

  it('can fetch specific posts by ids', async () => {
    await callRoute(GET, { request: makeRequest(url('?ids=p1, p2 ,')) });

    expect(argsOf(queriesFor(supabase, 'v_posts')[0], 'in')[0]).toEqual(['id', ['p1', 'p2']]);
  });

  it('returns an empty list without querying when ids is blank', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url('?ids=,,')) });

    expect(body).toEqual({ items: [], total: 0, page: 1, pageSize: 10 });
    expect(queriesFor(supabase, 'code_master')).toHaveLength(0);
  });

  it('computes the page range', async () => {
    await callRoute(GET, { request: makeRequest(url('?page=3&pageSize=10')) });

    expect(argsOf(queriesFor(supabase, 'v_posts')[0], 'range')[0]).toEqual([20, 29]);
  });

  it('caps pageSize at 50', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url('?pageSize=999')) });

    expect(body.pageSize).toBe(50);
  });

  it('propagates a DB error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setSupabase(
      createSupabaseStub({
        tables: { v_posts: { data: null, error: { code: 'X' } }, code_master: CODES },
      })
    );

    const { status } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(500);
    spy.mockRestore();
  });

  it('returns an empty list when data is null', async () => {
    setSupabase(
      createSupabaseStub({
        tables: { v_posts: { data: null, error: null, count: null }, code_master: CODES },
      })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body).toMatchObject({ items: [], total: 0 });
  });
});

describe('POST /api/posts', () => {
  const writeStub = () =>
    createSupabaseStub({
      user: { id: 'u1' },
      tables: {
        posts: { data: { id: 'p1' }, error: null },
        v_posts: { data: ROW, error: null },
        code_master: CODES,
      },
    });

  beforeEach(() => {
    supabase = writeStub();
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(listStub());

    const { status } = await callRoute(POST, {
      request: makeRequest(url(), { body: { postType: 'review' } }),
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(POST, { request: brokenJsonRequest(url()) });

    expect(status).toBe(400);
  });

  it('answers 400 when postType is missing', async () => {
    const { status, body } = await callRoute(POST, { request: makeRequest(url(), { body: {} }) });

    expect(status).toBe(400);
    expect(body.error.message).toContain('postType');
  });

  it('answers 400 for an unknown postType', async () => {
    const { status } = await callRoute(POST, {
      request: makeRequest(url(), { body: { postType: 'diary' } }),
    });

    expect(status).toBe(400);
  });

  it('answers 400 when questions is not an array', async () => {
    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { postType: 'qbank', questions: 'a' } }),
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('questions 는 배열이어야 합니다.');
  });

  it('answers 400 when tags is not an array', async () => {
    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { postType: 'review', tags: 'a' } }),
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('tags 는 배열이어야 합니다.');
  });

  it('maps camelCase input onto column names before saving', async () => {
    await callRoute(POST, {
      request: makeRequest(url(), {
        body: {
          postType: 'review',
          companyId: 'c1',
          title: '후기',
          body: '내용',
          difficultyCode: 'hard',
          difficultyScore: 4,
          problemScore: 3,
          passResultCode: 'pass',
          channelCode: 'etc',
          channelEtc: '잡코리아',
          jobRoleCode: 'fe',
          positionLevel: '신입',
          educationLevel: 'bachelor',
          tags: ['#CS'],
          overallComment: '총평',
          questions: ['Q1'],
        },
      }),
    });

    expect(argsOf(queriesFor(supabase, 'posts')[0], 'insert')[0][0]).toEqual({
      user_id: 'u1',
      post_type: 'review',
      company_id: 'c1',
      title: '후기',
      body: '내용',
      questions: ['Q1'],
      difficulty_code: 'hard',
      difficulty_score: 4,
      problem_score: 3,
      question_count: 1,
      pass_result_code: 'pass',
      channel_code: 'etc',
      channel_etc: '잡코리아',
      job_role_code: 'fe',
      position_level: '신입',
      education_level: 'bachelor',
      tags: ['#CS'],
      overall_comment: '총평',
    });
  });

  it.each([
    ['difficultyScore', 0],
    ['difficultyScore', 6],
    ['difficultyScore', 3.5],
    ['difficultyScore', -1],
    ['difficultyScore', '4'],
    ['problemScore', 0],
    ['problemScore', 6],
    ['problemScore', 4.5],
    ['problemScore', '3'],
  ])('answers 400 when %s is %p', async (key, value) => {
    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { postType: 'qbank', [key]: value } }),
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe(`${key} 는 1~5 사이의 정수여야 합니다.`);
  });

  it.each([1, 2, 3, 4, 5])('accepts whole point scores of %i', async (score) => {
    const { status } = await callRoute(POST, {
      request: makeRequest(url(), {
        body: { postType: 'qbank', difficultyScore: score, problemScore: score },
      }),
    });

    expect(status).toBe(200);
    expect(argsOf(queriesFor(supabase, 'posts')[0], 'insert')[0][0]).toMatchObject({
      difficulty_score: score,
      problem_score: score,
    });
  });

  it('accepts null to clear a score', async () => {
    const { status } = await callRoute(POST, {
      request: makeRequest(url(), {
        body: { postType: 'review', difficultyScore: null, problemScore: null },
      }),
    });

    expect(status).toBe(200);
    expect(argsOf(queriesFor(supabase, 'posts')[0], 'insert')[0][0]).toMatchObject({
      difficulty_score: null,
      problem_score: null,
    });
  });

  it('counts the questions instead of trusting the client', async () => {
    await callRoute(POST, {
      request: makeRequest(url(), {
        body: { postType: 'qbank', questions: ['Q1', 'Q2', 'Q3'], questionCount: 99 },
      }),
    });

    expect(argsOf(queriesFor(supabase, 'posts')[0], 'insert')[0][0]).toMatchObject({
      question_count: 3,
    });
  });

  it('ignores questionCount when no questions are sent', async () => {
    await callRoute(POST, {
      request: makeRequest(url(), { body: { postType: 'qbank', questionCount: 99 } }),
    });

    expect(argsOf(queriesFor(supabase, 'posts')[0], 'insert')[0][0]).toEqual({
      user_id: 'u1',
      post_type: 'qbank',
    });
  });

  it('counts an empty question list as zero', async () => {
    await callRoute(POST, {
      request: makeRequest(url(), { body: { postType: 'qbank', questions: [] } }),
    });

    expect(argsOf(queriesFor(supabase, 'posts')[0], 'insert')[0][0]).toMatchObject({
      question_count: 0,
    });
  });

  it('omits columns that were not sent', async () => {
    await callRoute(POST, {
      request: makeRequest(url(), { body: { postType: 'review', title: '후기' } }),
    });

    expect(argsOf(queriesFor(supabase, 'posts')[0], 'insert')[0][0]).toEqual({
      user_id: 'u1',
      post_type: 'review',
      title: '후기',
    });
  });

  it('reads the row back from the view after saving', async () => {
    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { postType: 'review' } }),
    });

    expect(status).toBe(200);
    expect(body).toMatchObject({ id: 'p1', difficulty: '어려움' });
  });
});

describe('DELETE /api/posts', () => {
  beforeEach(() => {
    supabase = createSupabaseStub({
      user: { id: 'u1' },
      tables: { posts: { data: [{ id: 'p1' }, { id: 'p2' }], error: null } },
    });
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: ['p1'] } }),
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(DELETE, { request: brokenJsonRequest(url()) });

    expect(status).toBe(400);
  });

  it('answers 400 when ids is not an array', async () => {
    const { status, body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: 'p1' } }),
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('ids 배열이 필요합니다.');
  });

  it('answers 400 when ids is empty', async () => {
    const { status } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: [] } }),
    });

    expect(status).toBe(400);
  });

  it('deletes only my own posts and returns the count', async () => {
    const { body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: ['p1', 'p2'] } }),
    });

    expect(body).toEqual({ deleted: 2 });
    expect(argsOf(queriesFor(supabase, 'posts')[0], 'eq')[0]).toEqual(['user_id', 'u1']);
  });

  it('answers 0 when the result is null', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { posts: { data: null, error: null } } })
    );

    const { body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: ['p1'] } }),
    });

    expect(body).toEqual({ deleted: 0 });
  });
});

describe('GET /api/posts/:id', () => {
  it('the detail is visible while signed out', async () => {
    setSupabase(
      createSupabaseStub({
        tables: { v_posts: { data: ROW, error: null }, code_master: CODES },
      })
    );

    const { status, body } = await callRoute(GET_DETAIL, { params: { id: 'p1' } });

    expect(status).toBe(200);
    expect(body).toMatchObject({ id: 'p1', title: '면접 후기' });
  });

  it('answers 404 for a missing post', async () => {
    setSupabase(
      createSupabaseStub({
        tables: { v_posts: { data: null, error: null }, code_master: CODES },
      })
    );

    const { status, body } = await callRoute(GET_DETAIL, { params: { id: 'nope' } });

    expect(status).toBe(404);
    expect(body.error.message).toBe('글을 찾을 수 없습니다.');
  });
});

describe('PATCH /api/posts/:id', () => {
  const stub = () =>
    createSupabaseStub({
      user: { id: 'u1' },
      tables: {
        posts: { data: { id: 'p1' }, error: null },
        v_posts: { data: ROW, error: null },
        code_master: CODES,
      },
    });

  beforeEach(() => {
    supabase = stub();
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(listStub());

    const { status } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { title: 'x' } }),
      params: { id: 'p1' },
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(PATCH_DETAIL, {
      request: brokenJsonRequest(url()),
      params: { id: 'p1' },
    });

    expect(status).toBe(400);
  });

  it('answers 400 when there is nothing to update', async () => {
    const { status, body } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { nope: 1 } }),
      params: { id: 'p1' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('수정할 내용이 없습니다.');
  });

  it('the questions check applies to updates too', async () => {
    const { status } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { questions: 'a' } }),
      params: { id: 'p1' },
    });

    expect(status).toBe(400);
  });

  it.each(['difficultyScore', 'problemScore'])(
    'the %s check applies to updates too',
    async (key) => {
      const { status, body } = await callRoute(PATCH_DETAIL, {
        request: makeRequest(url(), { body: { [key]: 4.5 } }),
        params: { id: 'p1' },
      });

      expect(status).toBe(400);
      expect(body.error.message).toBe(`${key} 는 1~5 사이의 정수여야 합니다.`);
    }
  );

  it('recounts the questions on update', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { questions: ['Q1', 'Q2'], questionCount: 99 } }),
      params: { id: 'p1' },
    });

    expect(argsOf(queriesFor(supabase, 'posts')[0], 'update')[0]).toEqual([
      { questions: ['Q1', 'Q2'], question_count: 2 },
    ]);
  });

  it('updates only my own post', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { title: '수정' } }),
      params: { id: 'p1' },
    });

    const query = queriesFor(supabase, 'posts')[0];
    expect(argsOf(query, 'update')[0]).toEqual([{ title: '수정' }]);
    expect(argsOf(query, 'eq')).toEqual([
      ['id', 'p1'],
      ['user_id', 'u1'],
    ]);
  });

  it('answers 404 when updating a post owned by someone else', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: {
          posts: { data: null, error: null },
          v_posts: { data: ROW, error: null },
          code_master: CODES,
        },
      })
    );

    const { status, body } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { title: 'x' } }),
      params: { id: 'other' },
    });

    expect(status).toBe(404);
    expect(body.error.message).toBe('글을 찾을 수 없습니다.');
  });

  it('reads the updated post back from the view', async () => {
    const { body } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { title: '수정' } }),
      params: { id: 'p1' },
    });

    expect(body).toMatchObject({ id: 'p1', difficulty: '어려움' });
  });
});

describe('DELETE /api/posts/:id', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(DELETE_DETAIL, { params: { id: 'p1' } });

    expect(status).toBe(401);
  });

  it('deletes my own post and reports one row', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { posts: { data: [{ id: 'p1' }], error: null } },
      })
    );

    const { status, body } = await callRoute(DELETE_DETAIL, { params: { id: 'p1' } });

    expect(status).toBe(200);
    expect(body).toEqual({ deleted: 1 });
  });

  it('answers 404 when nothing was deleted', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { posts: { data: [], error: null } } })
    );

    const { status, body } = await callRoute(DELETE_DETAIL, { params: { id: 'other' } });

    expect(status).toBe(404);
    expect(body.error.message).toBe('글을 찾을 수 없습니다.');
  });

  it('answers 404 when the result is null', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { posts: { data: null, error: null } } })
    );

    const { status } = await callRoute(DELETE_DETAIL, { params: { id: 'other' } });

    expect(status).toBe(404);
  });
});

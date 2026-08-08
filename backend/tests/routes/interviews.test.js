import { beforeEach, describe, expect, it, vi } from 'vitest';

import { argsOf, createSupabaseStub, queriesFor } from '../helpers/supabase';
import { brokenJsonRequest, callRoute, makeRequest, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { DELETE_DETAIL, GET, GET_DETAIL, PATCH_DETAIL, POST, POST_QAS, toQa } = await import(
  '../../lib/routes/interviews'
);

const url = (qs = '') => `http://localhost/api/interviews${qs}`;

const SESSION = {
  id: 's1',
  company_id: 'c1',
  resume_ids: ['d1'],
  cover_letter_ids: ['d2'],
  interviewer_style: 'pressure',
  selected_categories: ['자기소개'],
  show_timer: true,
  duration_sec: 600,
  status: 'finished',
  total_score: 82,
  sub_scores: { 논리성: 4 },
  created_at: '2026-08-05T10:00:00Z',
  finished_at: '2026-08-05T10:30:00Z',
};

const QA = {
  id: 'q1',
  session_id: 's1',
  seq: 1,
  category: '자기소개',
  question: '자기소개 해주세요',
  answer: '안녕하세요',
  feedback: { summary: '좋습니다' },
  score: 4,
  created_at: '2026-08-05T10:05:00Z',
};

let supabase;

beforeEach(() => {
  supabase = createSupabaseStub({
    user: { id: 'u1' },
    tables: {
      interview_sessions: { data: [SESSION], error: null, count: 1 },
      interview_qas: { data: [QA], error: null },
    },
  });
  setSupabase(supabase);
});

describe('toQa', () => {
  it('maps a row into the shape the screen needs', () => {
    expect(toQa(QA)).toEqual({
      id: 'q1',
      sessionId: 's1',
      seq: 1,
      category: '자기소개',
      question: '자기소개 해주세요',
      answer: '안녕하세요',
      feedback: { summary: '좋습니다' },
      feedbackText: '좋습니다',
      score: 4,
      date: '2026.08.05',
      createdAt: '2026-08-05T10:05:00Z',
    });
  });

  it('is an empty string when there is no feedback', () => {
    expect(toQa({ ...QA, feedback: null })).toMatchObject({ feedback: {}, feedbackText: '' });
  });

  it('uses a string feedback as-is', () => {
    expect(toQa({ ...QA, feedback: '한 줄 피드백' }).feedbackText).toBe('한 줄 피드백');
  });

  it('joins strengths and improvements when there is no summary', () => {
    const row = { ...QA, feedback: { strengths: ['논리적'], improvements: ['근거 부족'] } };

    expect(toQa(row).feedbackText).toBe('논리적 근거 부족');
  });

  it('joins even when only strengths are present', () => {
    expect(toQa({ ...QA, feedback: { strengths: ['좋음'] } }).feedbackText).toBe('좋음');
  });

  it('an empty feedback object yields an empty string', () => {
    expect(toQa({ ...QA, feedback: {} }).feedbackText).toBe('');
  });

  it('defaults a missing answer to an empty string', () => {
    expect(toQa({ ...QA, answer: null }).answer).toBe('');
  });

  it('leaves the date empty when created_at is missing', () => {
    expect(toQa({ ...QA, created_at: null }).date).toBe('');
  });
});

describe('GET /api/interviews', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(401);
  });

  it('queries only my own sessions, newest first', async () => {
    await callRoute(GET, { request: makeRequest(url()) });

    const query = queriesFor(supabase, 'interview_sessions')[0];
    expect(argsOf(query, 'eq')[0]).toEqual(['user_id', 'u1']);
    expect(argsOf(query, 'order')[0]).toEqual(['created_at', { ascending: false }]);
  });

  it('maps a session into the shape the screen needs', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(200);
    expect(body.items[0]).toEqual({
      id: 's1',
      companyId: 'c1',
      resumeIds: ['d1'],
      coverLetterIds: ['d2'],
      interviewerStyle: 'pressure',
      selectedCategories: ['자기소개'],
      showTimer: true,
      durationSec: 600,
      status: 'finished',
      totalScore: 82,
      subScores: { 논리성: 4 },
      date: '2026.08.05',
      createdAt: '2026-08-05T10:00:00Z',
      finishedAt: '2026-08-05T10:30:00Z',
    });
  });

  it('leaves the answers out of the list', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0]).not.toHaveProperty('qas');
  });

  it('fills nullable fields with defaults', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { interview_sessions: { data: [{ id: 's9' }], error: null, count: 1 } },
      })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0]).toMatchObject({
      resumeIds: [],
      coverLetterIds: [],
      selectedCategories: [],
      durationSec: 0,
      subScores: {},
      date: '',
    });
  });

  it('computes the page range', async () => {
    await callRoute(GET, { request: makeRequest(url('?page=2&pageSize=5')) });

    expect(argsOf(queriesFor(supabase, 'interview_sessions')[0], 'range')[0]).toEqual([5, 9]);
  });

  it('caps pageSize at 50', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url('?pageSize=999')) });

    expect(body.pageSize).toBe(50);
  });

  it('propagates a DB error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { interview_sessions: { data: null, error: { code: 'X' } } },
      })
    );

    const { status } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(500);
    spy.mockRestore();
  });

  it('returns an empty list when data is null', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { interview_sessions: { data: null, error: null, count: null } },
      })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body).toMatchObject({ items: [], total: 0 });
  });
});

describe('POST /api/interviews', () => {
  beforeEach(() => {
    supabase = createSupabaseStub({
      user: { id: 'u1' },
      tables: { interview_sessions: { data: SESSION, error: null } },
    });
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(POST, { request: makeRequest(url(), { body: {} }) });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(POST, { request: brokenJsonRequest(url()) });

    expect(status).toBe(400);
  });

  it.each(['friendly', 'neutral', 'pressure', 'technical'])(
    '%s is an allowed interviewer style',
    async (style) => {
      const { status } = await callRoute(POST, {
        request: makeRequest(url(), { body: { interviewerStyle: style } }),
      });

      expect(status).toBe(200);
    }
  );

  it('answers 400 for an unknown interviewer style', async () => {
    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { interviewerStyle: 'angry' } }),
    });

    expect(status).toBe(400);
    expect(body.error.message).toContain('interviewerStyle');
  });

  it('stores the row with defaults filled in', async () => {
    await callRoute(POST, { request: makeRequest(url(), { body: {} }) });

    expect(argsOf(queriesFor(supabase, 'interview_sessions')[0], 'insert')[0][0]).toEqual({
      user_id: 'u1',
      company_id: null,
      resume_ids: [],
      cover_letter_ids: [],
      interviewer_style: 'neutral',
      selected_categories: [],
      show_timer: true,
    });
  });

  it('stores the given values as-is', async () => {
    await callRoute(POST, {
      request: makeRequest(url(), {
        body: {
          companyId: 'c1',
          resumeIds: ['d1'],
          coverLetterIds: ['d2'],
          interviewerStyle: 'technical',
          selectedCategories: ['기술질문1'],
          showTimer: false,
        },
      }),
    });

    expect(argsOf(queriesFor(supabase, 'interview_sessions')[0], 'insert')[0][0]).toEqual({
      user_id: 'u1',
      company_id: 'c1',
      resume_ids: ['d1'],
      cover_letter_ids: ['d2'],
      interviewer_style: 'technical',
      selected_categories: ['기술질문1'],
      show_timer: false,
    });
  });

  it('a new session comes back with an empty qas list', async () => {
    const { status, body } = await callRoute(POST, { request: makeRequest(url(), { body: {} }) });

    expect(status).toBe(200);
    expect(body.qas).toEqual([]);
  });
});

describe('GET /api/interviews/:id', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(GET_DETAIL, { params: { id: 's1' } });

    expect(status).toBe(401);
  });

  it('returns the session together with its answers', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: {
          interview_sessions: { data: SESSION, error: null },
          interview_qas: { data: [QA], error: null },
        },
      })
    );

    const { status, body } = await callRoute(GET_DETAIL, { params: { id: 's1' } });

    expect(status).toBe(200);
    expect(body.id).toBe('s1');
    expect(body.qas).toHaveLength(1);
    expect(body.qas[0].question).toBe('자기소개 해주세요');
  });

  it('queries only my own session and reads answers in seq order', async () => {
    supabase = createSupabaseStub({
      user: { id: 'u1' },
      tables: {
        interview_sessions: { data: SESSION, error: null },
        interview_qas: { data: [QA], error: null },
      },
    });
    setSupabase(supabase);

    await callRoute(GET_DETAIL, { params: { id: 's1' } });

    expect(argsOf(queriesFor(supabase, 'interview_sessions')[0], 'eq')).toEqual([
      ['id', 's1'],
      ['user_id', 'u1'],
    ]);
    expect(argsOf(queriesFor(supabase, 'interview_qas')[0], 'order')[0]).toEqual([
      'seq',
      { ascending: true },
    ]);
  });

  it('answers 404 for a missing session', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { interview_sessions: { data: null, error: null } },
      })
    );

    const { status, body } = await callRoute(GET_DETAIL, { params: { id: 'nope' } });

    expect(status).toBe(404);
    expect(body.error.message).toBe('면접 기록을 찾을 수 없습니다.');
  });
});

describe('PATCH /api/interviews/:id', () => {
  beforeEach(() => {
    supabase = createSupabaseStub({
      user: { id: 'u1' },
      tables: { interview_sessions: { data: SESSION, error: null } },
    });
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { status: 'finished' } }),
      params: { id: 's1' },
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(PATCH_DETAIL, {
      request: brokenJsonRequest(url()),
      params: { id: 's1' },
    });

    expect(status).toBe(400);
  });

  it('answers 400 when there is nothing to update', async () => {
    const { status, body } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { nope: 1 } }),
      params: { id: 's1' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('수정할 내용이 없습니다.');
  });

  it('answers 400 for an unknown status', async () => {
    const { status, body } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { status: 'paused' } }),
      params: { id: 's1' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toContain('status');
  });

  it('records the finish time when moving to finished', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { status: 'finished' } }),
      params: { id: 's1' },
    });

    const patch = argsOf(queriesFor(supabase, 'interview_sessions')[0], 'update')[0][0];
    expect(patch.status).toBe('finished');
    expect(patch.finished_at).toEqual(expect.any(String));
    expect(Number.isNaN(Date.parse(patch.finished_at))).toBe(false);
  });

  it('leaves the finish time alone when moving to ongoing', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { status: 'ongoing' } }),
      params: { id: 's1' },
    });

    expect(argsOf(queriesFor(supabase, 'interview_sessions')[0], 'update')[0][0]).toEqual({
      status: 'ongoing',
    });
  });

  it('can update duration and scores independently', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), {
        body: { durationSec: 900, totalScore: 90, subScores: { 태도: 5 }, companyId: 'c2' },
      }),
      params: { id: 's1' },
    });

    expect(argsOf(queriesFor(supabase, 'interview_sessions')[0], 'update')[0][0]).toEqual({
      duration_sec: 900,
      total_score: 90,
      sub_scores: { 태도: 5 },
      company_id: 'c2',
    });
  });

  it('updates only my own session', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { totalScore: 1 } }),
      params: { id: 's1' },
    });

    expect(argsOf(queriesFor(supabase, 'interview_sessions')[0], 'eq')).toEqual([
      ['id', 's1'],
      ['user_id', 'u1'],
    ]);
  });

  it('answers 404 when updating a session owned by someone else', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { interview_sessions: { data: null, error: null } },
      })
    );

    const { status } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { totalScore: 1 } }),
      params: { id: 'other' },
    });

    expect(status).toBe(404);
  });

  it('the update result carries no qas', async () => {
    const { body } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { totalScore: 1 } }),
      params: { id: 's1' },
    });

    expect(body).not.toHaveProperty('qas');
  });
});

describe('DELETE /api/interviews/:id', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(DELETE_DETAIL, { params: { id: 's1' } });

    expect(status).toBe(401);
  });

  it('deletes my own session and reports one row', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { interview_sessions: { data: [{ id: 's1' }], error: null } },
      })
    );

    const { status, body } = await callRoute(DELETE_DETAIL, { params: { id: 's1' } });

    expect(status).toBe(200);
    expect(body).toEqual({ deleted: 1 });
  });

  it('answers 404 when nothing was deleted', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { interview_sessions: { data: [], error: null } },
      })
    );

    const { status } = await callRoute(DELETE_DETAIL, { params: { id: 'other' } });

    expect(status).toBe(404);
  });

  it('answers 404 when the result is null', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { interview_sessions: { data: null, error: null } },
      })
    );

    const { status } = await callRoute(DELETE_DETAIL, { params: { id: 'other' } });

    expect(status).toBe(404);
  });
});

describe('POST /api/interviews/:id/qas', () => {
  const stub = () =>
    createSupabaseStub({
      user: { id: 'u1' },
      tables: {
        interview_sessions: { data: { id: 's1' }, error: null },
        interview_qas: { data: [QA], error: null },
      },
    });

  beforeEach(() => {
    supabase = stub();
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(POST_QAS, {
      request: makeRequest(url(), { body: { qas: [{ question: 'Q' }] } }),
      params: { id: 's1' },
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(POST_QAS, {
      request: brokenJsonRequest(url()),
      params: { id: 's1' },
    });

    expect(status).toBe(400);
  });

  it('accepts a bare array body', async () => {
    const { status } = await callRoute(POST_QAS, {
      request: makeRequest(url(), { body: [{ question: 'Q1' }] }),
      params: { id: 's1' },
    });

    expect(status).toBe(200);
  });

  it('answers 400 when qas is not an array', async () => {
    const { status, body } = await callRoute(POST_QAS, {
      request: makeRequest(url(), { body: { qas: 'nope' } }),
      params: { id: 's1' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('qas 배열이 필요합니다.');
  });

  it('answers 400 when qas is empty', async () => {
    const { status } = await callRoute(POST_QAS, {
      request: makeRequest(url(), { body: { qas: [] } }),
      params: { id: 's1' },
    });

    expect(status).toBe(400);
  });

  it('answers 404 for a session owned by someone else', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { interview_sessions: { data: null, error: null } },
      })
    );

    const { status, body } = await callRoute(POST_QAS, {
      request: makeRequest(url(), { body: { qas: [{ question: 'Q' }] } }),
      params: { id: 'other' },
    });

    expect(status).toBe(404);
    expect(body.error.message).toBe('면접 기록을 찾을 수 없습니다.');
  });

  it('answers 400 when question is blank', async () => {
    const { status, body } = await callRoute(POST_QAS, {
      request: makeRequest(url(), { body: { qas: [{ question: '   ' }] } }),
      params: { id: 's1' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('question 은 필수입니다.');
  });

  it('answers 400 when question is missing entirely', async () => {
    const { status } = await callRoute(POST_QAS, {
      request: makeRequest(url(), { body: { qas: [{ answer: 'A' }] } }),
      params: { id: 's1' },
    });

    expect(status).toBe(400);
  });

  it('numbers the rows when seq is omitted', async () => {
    await callRoute(POST_QAS, {
      request: makeRequest(url(), { body: { qas: [{ question: 'Q1' }, { question: 'Q2' }] } }),
      params: { id: 's1' },
    });

    const rows = argsOf(queriesFor(supabase, 'interview_qas')[0], 'insert')[0][0];
    expect(rows.map((r) => r.seq)).toEqual([1, 2]);
  });

  it('uses the given seq as-is', async () => {
    await callRoute(POST_QAS, {
      request: makeRequest(url(), { body: { qas: [{ question: 'Q1', seq: 7 }] } }),
      params: { id: 's1' },
    });

    expect(argsOf(queriesFor(supabase, 'interview_qas')[0], 'insert')[0][0][0].seq).toBe(7);
  });

  it('stamps the session and user id and fills blanks with defaults', async () => {
    await callRoute(POST_QAS, {
      request: makeRequest(url(), { body: { qas: [{ question: 'Q1' }] } }),
      params: { id: 's1' },
    });

    expect(argsOf(queriesFor(supabase, 'interview_qas')[0], 'insert')[0][0][0]).toEqual({
      session_id: 's1',
      user_id: 'u1',
      seq: 1,
      category: null,
      question: 'Q1',
      answer: null,
      feedback: {},
      score: null,
    });
  });

  it('stores the given values as-is', async () => {
    await callRoute(POST_QAS, {
      request: makeRequest(url(), {
        body: {
          qas: [
            {
              question: 'Q1',
              category: '기술질문1',
              answer: 'A1',
              feedback: { summary: '좋음' },
              score: 5,
            },
          ],
        },
      }),
      params: { id: 's1' },
    });

    expect(argsOf(queriesFor(supabase, 'interview_qas')[0], 'insert')[0][0][0]).toMatchObject({
      category: '기술질문1',
      answer: 'A1',
      feedback: { summary: '좋음' },
      score: 5,
    });
  });

  it('returns the saved count and the rows', async () => {
    const { status, body } = await callRoute(POST_QAS, {
      request: makeRequest(url(), { body: { qas: [{ question: 'Q1' }] } }),
      params: { id: 's1' },
    });

    expect(status).toBe(200);
    expect(body.saved).toBe(1);
    expect(body.items[0]).toMatchObject({ id: 'q1', feedbackText: '좋습니다' });
  });
});

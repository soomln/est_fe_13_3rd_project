import { beforeEach, describe, expect, it, vi } from 'vitest';

import { argsOf, createSupabaseStub, queriesFor } from '../helpers/supabase';
import { brokenJsonRequest, callRoute, makeRequest, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { DELETE, GET } = await import('../../lib/routes/interviewQas');

const url = (qs = '') => `http://localhost/api/interview-qas${qs}`;

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

const stub = (extra = {}) =>
  createSupabaseStub({
    user: { id: 'u1' },
    tables: {
      interview_qas: { data: [QA], error: null, count: 1 },
      reactions: { data: [{ target_id: 'q1' }], error: null },
    },
    ...extra,
  });

let supabase;

beforeEach(() => {
  supabase = stub();
  setSupabase(supabase);
});

describe('GET /api/interview-qas', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(401);
  });

  it('queries only my own answers', async () => {
    await callRoute(GET, { request: makeRequest(url()) });

    expect(argsOf(queriesFor(supabase, 'interview_qas')[0], 'eq')[0]).toEqual(['user_id', 'u1']);
  });

  it('maps rows into the shape the screen needs', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(200);
    expect(body.items[0]).toMatchObject({
      id: 'q1',
      question: '자기소개 해주세요',
      feedbackText: '좋습니다',
      date: '2026.08.05',
    });
  });

  it('defaults pageSize to 6', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.pageSize).toBe(6);
  });

  it('caps pageSize at 50', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url('?pageSize=999')) });

    expect(body.pageSize).toBe(50);
  });

  it('sorts by latest by default', async () => {
    await callRoute(GET, { request: makeRequest(url()) });

    expect(argsOf(queriesFor(supabase, 'interview_qas')[0], 'order')[0]).toEqual([
      'created_at',
      { ascending: false },
    ]);
  });

  it('supports sorting by oldest', async () => {
    await callRoute(GET, { request: makeRequest(url('?sort=oldest')) });

    expect(argsOf(queriesFor(supabase, 'interview_qas')[0], 'order')[0]).toEqual([
      'created_at',
      { ascending: true },
    ]);
  });

  it('answers 400 for an unknown sort', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url('?sort=zzz')) });

    expect(status).toBe(400);
    expect(body.error.message).toContain('sort');
  });

  it('queries only scrapped rows when scrapped=1', async () => {
    await callRoute(GET, { request: makeRequest(url('?scrapped=1')) });

    const reactions = queriesFor(supabase, 'reactions')[0];
    expect(argsOf(reactions, 'eq')).toEqual([
      ['user_id', 'u1'],
      ['target_type', 'interview_qa'],
      ['kind', 'bookmark'],
    ]);
    expect(argsOf(queriesFor(supabase, 'interview_qas')[0], 'in')[0]).toEqual(['id', ['q1']]);
  });

  it('returns an empty list without querying when nothing is scrapped', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: {
          interview_qas: { data: [QA], error: null, count: 1 },
          reactions: { data: [], error: null },
        },
      })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url('?scrapped=1')) });

    expect(body).toEqual({ items: [], total: 0, page: 1, pageSize: 6 });
  });

  it('filters by sessionId', async () => {
    await callRoute(GET, { request: makeRequest(url('?sessionId=s1')) });

    expect(argsOf(queriesFor(supabase, 'interview_qas')[0], 'eq')).toContainEqual([
      'session_id',
      's1',
    ]);
  });

  it('matches the keyword against both question and answer', async () => {
    await callRoute(GET, { request: makeRequest(url('?q=%20REST%20')) });

    expect(argsOf(queriesFor(supabase, 'interview_qas')[0], 'or')[0]).toEqual([
      'question.ilike."%REST%",answer.ilike."%REST%"',
    ]);
  });

  it('strips quotes and backslashes from the keyword', async () => {
    await callRoute(GET, { request: makeRequest(url('?q=a%22b%5Cc')) });

    expect(argsOf(queriesFor(supabase, 'interview_qas')[0], 'or')[0]).toEqual([
      'question.ilike."%abc%",answer.ilike."%abc%"',
    ]);
  });

  it('ignores a whitespace-only keyword', async () => {
    await callRoute(GET, { request: makeRequest(url('?q=%20')) });

    expect(argsOf(queriesFor(supabase, 'interview_qas')[0], 'or')).toHaveLength(0);
  });

  it('computes the page range', async () => {
    await callRoute(GET, { request: makeRequest(url('?page=3&pageSize=6')) });

    expect(argsOf(queriesFor(supabase, 'interview_qas')[0], 'range')[0]).toEqual([12, 17]);
  });

  it('propagates a DB error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { interview_qas: { data: null, error: { code: 'X' } } },
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
        tables: { interview_qas: { data: null, error: null, count: null } },
      })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body).toMatchObject({ items: [], total: 0 });
  });
});

describe('DELETE /api/interview-qas', () => {
  beforeEach(() => {
    supabase = createSupabaseStub({
      user: { id: 'u1' },
      tables: { interview_qas: { data: [{ id: 'q1' }, { id: 'q2' }], error: null } },
    });
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: ['q1'] } }),
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status, body } = await callRoute(DELETE, { request: brokenJsonRequest(url()) });

    expect(status).toBe(400);
    expect(body.error.message).toBe('JSON 본문이 필요합니다.');
  });

  it('answers 400 when ids is not an array', async () => {
    const { status, body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: 'q1' } }),
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

  it('deletes only my own rows and returns the count', async () => {
    const { status, body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: ['q1', 'q2'] } }),
    });

    expect(status).toBe(200);
    expect(body).toEqual({ deleted: 2 });

    const query = queriesFor(supabase, 'interview_qas')[0];
    expect(argsOf(query, 'eq')[0]).toEqual(['user_id', 'u1']);
    expect(argsOf(query, 'in')[0]).toEqual(['id', ['q1', 'q2']]);
  });

  it('answers 0 when the result is null', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { interview_qas: { data: null, error: null } },
      })
    );

    const { body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: ['q1'] } }),
    });

    expect(body).toEqual({ deleted: 0 });
  });
});

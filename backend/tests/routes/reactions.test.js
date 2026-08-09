import { beforeEach, describe, expect, it, vi } from 'vitest';

import { argsOf, createSupabaseStub, queryFor } from '../helpers/supabase';
import { brokenJsonRequest, callRoute, makeRequest, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { DELETE, GET, POST } = await import('../../lib/routes/reactions');

const url = (qs = '') => `http://localhost/api/reactions${qs}`;

const REACTION_ROWS = {
  data: [
    { target_id: 'a', created_at: '2026-08-02' },
    { target_id: 'b', created_at: '2026-08-01' },
  ],
  error: null,
};

let supabase;

beforeEach(() => {
  supabase = createSupabaseStub({
    user: { id: 'u1' },
    tables: { reactions: REACTION_ROWS },
    rpc: { toggle_reaction: { data: true, error: null } },
  });
  setSupabase(supabase);
});

describe('POST /api/reactions', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub({ rpc: { toggle_reaction: { data: true, error: null } } }));

    const { status } = await callRoute(POST, {
      request: makeRequest(url(), { body: { targetType: 'post', targetId: 'p1' } }),
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status, body } = await callRoute(POST, { request: brokenJsonRequest(url()) });

    expect(status).toBe(400);
    expect(body.error.message).toBe('JSON 본문이 필요합니다.');
  });

  it.each(['portfolio', 'post', 'company', 'comment', 'interview_qa', 'template'])(
    '%s is an allowed targetType',
    async (targetType) => {
      const { status } = await callRoute(POST, {
        request: makeRequest(url(), { body: { targetType, targetId: 't1' } }),
      });

      expect(status).toBe(200);
    }
  );

  it('answers 400 for an unknown targetType', async () => {
    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { targetType: 'user', targetId: 't1' } }),
    });

    expect(status).toBe(400);
    expect(body.error.message).toContain('targetType');
  });

  it('answers 400 for an unknown kind', async () => {
    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { targetType: 'post', targetId: 't1', kind: 'hate' } }),
    });

    expect(status).toBe(400);
    expect(body.error.message).toContain('kind');
  });

  it('answers 400 when targetId is missing', async () => {
    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { targetType: 'post' } }),
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('targetId 가 필요합니다.');
  });

  it('toggles a bookmark when kind is omitted', async () => {
    await callRoute(POST, {
      request: makeRequest(url(), { body: { targetType: 'company', targetId: 'c1' } }),
    });

    expect(supabase.rpcCalls[0]).toEqual({
      name: 'toggle_reaction',
      args: { p_target_type: 'company', p_target_id: 'c1', p_kind: 'bookmark' },
    });
  });

  it('returns the RPC result as active', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        rpc: { toggle_reaction: { data: false, error: null } },
      })
    );

    const { body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { targetType: 'post', targetId: 'p1', kind: 'like' } }),
    });

    expect(body).toEqual({ active: false });
  });
});

describe('GET /api/reactions', () => {
  it('answers 400 when targetType is missing', async () => {
    const { status } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(400);
  });

  it('returns an empty list when signed out', async () => {
    setSupabase(createSupabaseStub({ tables: { reactions: REACTION_ROWS } }));

    const { status, body } = await callRoute(GET, {
      request: makeRequest(url('?targetType=post')),
    });

    expect(status).toBe(200);
    expect(body).toEqual({ targetIds: [] });
  });

  it('returns only my target ids, newest first', async () => {
    const { body } = await callRoute(GET, {
      request: makeRequest(url('?targetType=post&kind=like')),
    });

    expect(body).toEqual({ targetIds: ['a', 'b'] });

    const query = queryFor(supabase, 'reactions');
    expect(argsOf(query, 'eq')).toEqual([
      ['user_id', 'u1'],
      ['target_type', 'post'],
      ['kind', 'like'],
    ]);
    expect(argsOf(query, 'order')[0]).toEqual(['created_at', { ascending: false }]);
  });

  it('can narrow the query with targetIds', async () => {
    await callRoute(GET, {
      request: makeRequest(url('?targetType=post&targetIds=a, b ,')),
    });

    expect(argsOf(queryFor(supabase, 'reactions'), 'in')[0]).toEqual(['target_id', ['a', 'b']]);
  });

  it('returns an empty list without querying when targetIds is blank', async () => {
    const { body } = await callRoute(GET, {
      request: makeRequest(url('?targetType=post&targetIds=,,')),
    });

    expect(body).toEqual({ targetIds: [] });
  });

  it('defaults kind to bookmark', async () => {
    await callRoute(GET, { request: makeRequest(url('?targetType=company')) });

    expect(argsOf(queryFor(supabase, 'reactions'), 'eq')[2]).toEqual(['kind', 'bookmark']);
  });
});

describe('DELETE /api/reactions', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub({ tables: { reactions: REACTION_ROWS } }));

    const { status } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { targetType: 'post', targetIds: ['a'] } }),
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(DELETE, { request: brokenJsonRequest(url()) });

    expect(status).toBe(400);
  });

  it('validates targetType first', async () => {
    const { status, body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { targetType: 'user', targetIds: ['a'] } }),
    });

    expect(status).toBe(400);
    expect(body.error.message).toContain('targetType');
  });

  it('answers 400 when targetIds is not an array', async () => {
    const { status, body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { targetType: 'post', targetIds: 'a' } }),
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('targetIds 배열이 필요합니다.');
  });

  it('answers 400 when targetIds is empty', async () => {
    const { status } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { targetType: 'post', targetIds: [] } }),
    });

    expect(status).toBe(400);
  });

  it('deletes only my own reactions and returns the count', async () => {
    const { status, body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { targetType: 'post', targetIds: ['a', 'b'] } }),
    });

    expect(status).toBe(200);
    expect(body).toEqual({ deleted: 2 });

    const query = queryFor(supabase, 'reactions');
    expect(argsOf(query, 'eq')[0]).toEqual(['user_id', 'u1']);
    expect(argsOf(query, 'in')[0]).toEqual(['target_id', ['a', 'b']]);
  });

  it('answers 0 when the delete result is null', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { reactions: { data: null, error: null } },
      })
    );

    const { body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { targetType: 'post', targetIds: ['a'] } }),
    });

    expect(body).toEqual({ deleted: 0 });
  });
});

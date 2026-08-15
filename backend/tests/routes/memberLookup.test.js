import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSupabaseStub } from '../helpers/supabase';
import { callRoute, makeRequest, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { GET } = await import('../../lib/routes/memberLookup');

const url = (qs = '') => `http://localhost/api/members/lookup${qs}`;

const MEMBER = { id: 'u2', name: '김프론트', avatar_url: 'https://cdn/a.png' };

const stub = (data = [MEMBER]) =>
  createSupabaseStub({
    user: { id: 'u1' },
    rpc: { find_member_by_email: { data, error: null } },
  });

let supabase;

beforeEach(() => {
  supabase = stub();
  setSupabase(supabase);
});

describe('GET /api/members/lookup', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub({ rpc: { find_member_by_email: { data: [], error: null } } }));

    const { status } = await callRoute(GET, {
      request: makeRequest(url('?email=a@b.com')),
    });

    expect(status).toBe(401);
  });

  it('returns only the name and photo', async () => {
    const { status, body } = await callRoute(GET, {
      request: makeRequest(url('?email=a@b.com')),
    });

    expect(status).toBe(200);
    expect(body).toEqual({
      member: { id: 'u2', name: '김프론트', avatarUrl: 'https://cdn/a.png' },
    });
  });

  it('passes the trimmed email to the lookup', async () => {
    await callRoute(GET, { request: makeRequest(url('?email=%20a@b.com%20')) });

    expect(supabase.rpcCalls[0]).toEqual({
      name: 'find_member_by_email',
      args: { p_email: 'a@b.com' },
    });
  });

  it('answers null when nobody matches', async () => {
    setSupabase(stub([]));

    const { status, body } = await callRoute(GET, {
      request: makeRequest(url('?email=a@b.com')),
    });

    expect(status).toBe(200);
    expect(body).toEqual({ member: null });
  });

  it('answers null when the RPC returns nothing at all', async () => {
    setSupabase(stub(null));

    const { body } = await callRoute(GET, { request: makeRequest(url('?email=a@b.com')) });

    expect(body).toEqual({ member: null });
  });

  it('answers 400 without an email', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(400);
    expect(body.error.message).toBe('email 파라미터가 필요합니다.');
  });

  it.each(['nope', 'a@b', 'a b@c.com', '@b.com'])('answers 400 for %s', async (email) => {
    const { status, body } = await callRoute(GET, {
      request: makeRequest(url(`?email=${encodeURIComponent(email)}`)),
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('이메일 형식이 올바르지 않습니다.');
  });

  it('never queries a table directly', async () => {
    await callRoute(GET, { request: makeRequest(url('?email=a@b.com')) });

    expect(supabase.queries.filter((q) => !q.table.startsWith('rpc:'))).toEqual([]);
  });
});

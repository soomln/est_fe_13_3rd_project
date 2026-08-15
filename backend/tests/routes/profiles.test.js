import { beforeEach, describe, expect, it, vi } from 'vitest';

import { argsOf, createSupabaseStub, queryFor } from '../helpers/supabase';
import { brokenJsonRequest, callRoute, makeRequest, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { GET, PATCH } = await import('../../lib/routes/profiles');

const url = 'http://localhost/api/profiles/me';

const PROFILE = { id: 'u1', name: '장도담', bio: '안녕하세요', skill_codes: ['react'] };

const patchRequest = (body) => makeRequest(url, { body });

let supabase;

beforeEach(() => {
  supabase = createSupabaseStub({
    user: { id: 'u1' },
    tables: { profiles: { data: PROFILE, error: null } },
    rpc: { my_profile_email: { data: 'me@example.com', error: null } },
  });
  setSupabase(supabase);
});

describe('GET /api/profiles/:userId', () => {
  it('adds my own contact email to my profile', async () => {
    const { status, body } = await callRoute(GET, { params: { userId: 'u1' } });

    expect(status).toBe(200);
    expect(body).toEqual({ ...PROFILE, email: 'me@example.com' });
  });

  it('hides the contact email of someone else', async () => {
    const { status, body } = await callRoute(GET, { params: { userId: 'u2' } });

    expect(status).toBe(200);
    expect(body).toEqual({ ...PROFILE, email: null });
    expect(supabase.rpcCalls).toEqual([]);
  });

  it('hides the contact email while signed out', async () => {
    setSupabase(
      createSupabaseStub({ tables: { profiles: { data: PROFILE, error: null } } })
    );

    const { body } = await callRoute(GET, { params: { userId: 'u1' } });

    expect(body.email).toBeNull();
  });

  it('never selects the email column from the table', async () => {
    await callRoute(GET, { params: { userId: 'u1' } });

    expect(argsOf(queryFor(supabase, 'profiles'), 'select')[0][0]).not.toContain('email');
  });

  it("resolves 'me' to the signed-in user before querying", async () => {
    await callRoute(GET, { params: { userId: 'me' } });

    expect(argsOf(queryFor(supabase, 'profiles'), 'eq')[0]).toEqual(['id', 'u1']);
  });

  it('answers 404 for a missing profile', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { profiles: { data: null, error: null } } })
    );

    const { status, body } = await callRoute(GET, { params: { userId: 'u9' } });

    expect(status).toBe(404);
    expect(body.error.message).toBe('프로필을 찾을 수 없습니다.');
  });

  it('signed-out visitors can read another user profile', async () => {
    setSupabase(createSupabaseStub({ tables: { profiles: { data: PROFILE, error: null } } }));

    const { status } = await callRoute(GET, { params: { userId: 'u1' } });

    expect(status).toBe(200);
  });

  it("answers 401 when a signed-out caller asks for 'me'", async () => {
    setSupabase(createSupabaseStub({ tables: { profiles: { data: PROFILE, error: null } } }));

    const { status } = await callRoute(GET, { params: { userId: 'me' } });

    expect(status).toBe(401);
  });
});

describe('PATCH /api/profiles/:userId', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub({ tables: { profiles: { data: PROFILE, error: null } } }));

    const { status } = await callRoute(PATCH, {
      request: patchRequest({ name: 'x' }),
      params: { userId: 'me' },
    });

    expect(status).toBe(401);
  });

  it('answers 403 for a profile owned by someone else', async () => {
    const { status, body } = await callRoute(PATCH, {
      request: patchRequest({ name: 'x' }),
      params: { userId: 'u2' },
    });

    expect(status).toBe(403);
    expect(body.error.message).toBe('본인 프로필만 수정할 수 있습니다.');
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status, body } = await callRoute(PATCH, {
      request: brokenJsonRequest(url),
      params: { userId: 'me' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('JSON 본문이 필요합니다.');
  });

  it('answers 400 when no editable column is present', async () => {
    const { status, body } = await callRoute(PATCH, {
      request: patchRequest({ id: 'hack', created_at: 'now' }),
      params: { userId: 'me' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('수정할 내용이 없습니다.');
  });

  it('answers 400 beyond 1000 characters of bio', async () => {
    const { status, body } = await callRoute(PATCH, {
      request: patchRequest({ bio: 'ㄱ'.repeat(1001) }),
      params: { userId: 'me' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toContain('1000자');
  });

  it('accepts exactly 1000 characters of bio', async () => {
    const { status } = await callRoute(PATCH, {
      request: patchRequest({ bio: 'ㄱ'.repeat(1000) }),
      params: { userId: 'me' },
    });

    expect(status).toBe(200);
  });

  it('skips the length check when bio is not a string', async () => {
    const { status } = await callRoute(PATCH, {
      request: patchRequest({ bio: null }),
      params: { userId: 'me' },
    });

    expect(status).toBe(200);
  });

  it.each(['educations', 'careers', 'awards', 'languages', 'skill_codes', 'interest_codes'])(
    'answers 400 when %s is not an array',
    async (field) => {
      const { status, body } = await callRoute(PATCH, {
        request: patchRequest({ [field]: 'not-an-array' }),
        params: { userId: 'me' },
      });

      expect(status).toBe(400);
      expect(body.error.message).toBe(`${field} 는 배열이어야 합니다.`);
    }
  );

  it('saves only the editable columns', async () => {
    await callRoute(PATCH, {
      request: patchRequest({ name: '새이름', id: 'hack', bio: '소개' }),
      params: { userId: 'me' },
    });

    const query = queryFor(supabase, 'profiles');
    expect(argsOf(query, 'update')[0]).toEqual([{ name: '새이름', bio: '소개' }]);
    expect(argsOf(query, 'eq')[0]).toEqual(['id', 'u1']);
  });

  it('returns the updated profile with my contact email', async () => {
    const { status, body } = await callRoute(PATCH, {
      request: patchRequest({ name: '새이름' }),
      params: { userId: 'me' },
    });

    expect(status).toBe(200);
    expect(body).toEqual({ ...PROFILE, email: 'me@example.com' });
    expect(supabase.rpcCalls).toEqual([{ name: 'my_profile_email', args: undefined }]);
  });
});

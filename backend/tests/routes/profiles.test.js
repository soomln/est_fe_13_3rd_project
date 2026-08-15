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

const EMPTY_LISTS = { educations: [], careers: [], awards: [], languages: [] };

const patchRequest = (body) => makeRequest(url, { body });

const stub = (extra = {}) =>
  createSupabaseStub({
    user: { id: 'u1' },
    tables: { profiles: { data: PROFILE, error: null } },
    rpc: {
      my_profile_email: { data: 'me@example.com', error: null },
      save_profile_lists: { data: null, error: null },
    },
    ...extra,
  });

let supabase;

beforeEach(() => {
  supabase = stub();
  setSupabase(supabase);
});

describe('GET /api/profiles/:userId', () => {
  it('adds my own contact email to my profile', async () => {
    const { status, body } = await callRoute(GET, { params: { userId: 'u1' } });

    expect(status).toBe(200);
    expect(body).toEqual({ ...PROFILE, ...EMPTY_LISTS, email: 'me@example.com' });
  });

  it('hides the contact email of someone else', async () => {
    const { status, body } = await callRoute(GET, { params: { userId: 'u2' } });

    expect(status).toBe(200);
    expect(body).toEqual({ ...PROFILE, ...EMPTY_LISTS, email: null });
    expect(supabase.rpcCalls).toEqual([]);
  });

  it('rebuilds each list from its own table in sort order', async () => {
    setSupabase(
      stub({
        tables: {
          profiles: { data: PROFILE, error: null },
          profile_educations: {
            data: [
              {
                sort_order: 0,
                school_type: 'university',
                school: 'OO대학교',
                major: '컴퓨터공학',
                status: 'graduated',
                admission: '2015-03',
                graduation: '2019-02',
              },
            ],
            error: null,
          },
          profile_careers: {
            data: [{ sort_order: 0, started_on: '2020-01', ended_on: '재직 중', company: '토스', job_role: '백엔드' }],
            error: null,
          },
          profile_awards: { data: [{ sort_order: 0, awarded_on: '2023-05', title: '대상' }], error: null },
          profile_languages: {
            data: [{ sort_order: 0, language: '영어', level: 'high', detail: 'OPIc AL' }],
            error: null,
          },
        },
      })
    );

    const { body } = await callRoute(GET, { params: { userId: 'u1' } });

    expect(body.educations).toEqual([
      {
        type: 'university',
        school: 'OO대학교',
        major: '컴퓨터공학',
        status: 'graduated',
        admission: '2015-03',
        graduation: '2019-02',
      },
    ]);
    expect(body.careers).toEqual([
      { start: '2020-01', end: '재직 중', company: '토스', role: '백엔드' },
    ]);
    expect(body.awards).toEqual([{ date: '2023-05', name: '대상' }]);
    expect(body.languages).toEqual([{ language: '영어', level: 'high', detail: 'OPIc AL' }]);
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

  it('saves the education level chosen from the dropdown', async () => {
    await callRoute(PATCH, {
      request: patchRequest({ education_level: 'master' }),
      params: { userId: 'me' },
    });

    expect(argsOf(queryFor(supabase, 'profiles'), 'update')[0]).toEqual([
      { education_level: 'master' },
    ]);
  });

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
    expect(body).toEqual({ ...PROFILE, ...EMPTY_LISTS, email: 'me@example.com' });
    expect(supabase.rpcCalls).toEqual([{ name: 'my_profile_email', args: undefined }]);
  });

  it('hands every list to one save call so nothing is half written', async () => {
    await callRoute(PATCH, {
      request: patchRequest({ educations: [{ school: 'OO대' }], awards: [] }),
      params: { userId: 'me' },
    });

    expect(supabase.rpcCalls[0]).toEqual({
      name: 'save_profile_lists',
      args: {
        p_educations: [{ school: 'OO대' }],
        p_careers: null,
        p_awards: [],
        p_languages: null,
      },
    });
  });

  it('does not touch the profile row when only lists were sent', async () => {
    await callRoute(PATCH, {
      request: patchRequest({ careers: [{ company: '토스' }] }),
      params: { userId: 'me' },
    });

    const steps = supabase.queries
      .filter((q) => q.table === 'profiles')
      .flatMap((q) => q.steps.map((s) => s.method));

    expect(steps).not.toContain('update');
    expect(steps).toContain('select');
  });

  it('never calls the list save when no list was sent', async () => {
    await callRoute(PATCH, {
      request: patchRequest({ name: '새이름' }),
      params: { userId: 'me' },
    });

    expect(supabase.rpcCalls.map((c) => c.name)).not.toContain('save_profile_lists');
  });

});

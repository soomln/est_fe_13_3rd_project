import { beforeEach, describe, expect, it, vi } from 'vitest';

import { argsOf, createSupabaseStub, queryFor } from '../helpers/supabase';
import { callRoute, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { DELETE, GET, GET_ACCOUNT, GET_SUMMARY } = await import('../../lib/routes/me');

const PROFILE = { id: 'u1', name: '장도담' };

const STATS_ROW = {
  doc_count: 4,
  portfolio_count: 3,
  published_portfolio_count: 2,
  draft_portfolio_count: 1,
  interview_scrap_count: 6,
  scrapped_company_count: 9,
  scrapped_post_count: 8,
  scrapped_portfolio_count: 7,
  my_review_count: 5,
  my_qbank_count: 4,
  finished_interview_count: 3,
};

const loggedIn = (extra = {}) =>
  createSupabaseStub({
    user: { id: 'u1', email: 'a@b.c' },
    tables: {
      profiles: { data: PROFILE, error: null },
      v_profile_stats: { data: STATS_ROW, error: null },
    },
    rpc: { delete_my_account: { data: null, error: null } },
    ...extra,
  });

let supabase;

beforeEach(() => {
  supabase = loggedIn();
  setSupabase(supabase);
});

describe('GET /api/me', () => {
  it('returns the user when signed in', async () => {
    const { status, body } = await callRoute(GET);

    expect(status).toBe(200);
    expect(body).toEqual({ user: { id: 'u1', email: 'a@b.c' } });
  });

  it('answers 200 with a null user when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status, body } = await callRoute(GET);

    expect(status).toBe(200);
    expect(body).toEqual({ user: null });
  });
});

describe('DELETE /api/me', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(DELETE);

    expect(status).toBe(401);
  });

  it('calls the account deletion RPC and returns the result', async () => {
    const { status, body } = await callRoute(DELETE);

    expect(status).toBe(200);
    expect(body).toEqual({ deleted: true });
    expect(supabase.rpcCalls).toEqual([{ name: 'delete_my_account', args: undefined }]);
  });

  it('turns an RPC failure into an error response', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        rpc: { delete_my_account: { data: null, error: { code: '42501' } } },
      })
    );

    const { status } = await callRoute(DELETE);

    expect(status).toBe(403);
  });
});

describe('GET /api/me/account', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(GET_ACCOUNT);

    expect(status).toBe(401);
  });

  it('reads the account through getUser', async () => {
    setSupabase(
      loggedIn({
        auth: {
          getClaims: { data: { claims: { sub: 'u1', email: 'a@b.c' } } },
          getUser: {
            data: {
              user: {
                id: 'u1',
                email: 'a@b.c',
                created_at: '2026-08-01T00:00:00Z',
                last_sign_in_at: '2026-08-08T09:00:00Z',
                app_metadata: { providers: ['github', 'google'] },
              },
            },
            error: null,
          },
        },
      })
    );

    const { status, body } = await callRoute(GET_ACCOUNT);

    expect(status).toBe(200);
    expect(body).toEqual({
      id: 'u1',
      email: 'a@b.c',
      createdAt: '2026-08-01T00:00:00Z',
      lastSignInAt: '2026-08-08T09:00:00Z',
      providers: ['github', 'google'],
    });
  });

  it('wraps a single provider in an array when providers is missing', async () => {
    setSupabase(
      loggedIn({
        auth: {
          getClaims: { data: { claims: { sub: 'u1' } } },
          getUser: {
            data: { user: { id: 'u1', app_metadata: { provider: 'kakao' } } },
            error: null,
          },
        },
      })
    );

    const { body } = await callRoute(GET_ACCOUNT);

    expect(body.providers).toEqual(['kakao']);
  });

  it('providers is an empty array when app_metadata is missing', async () => {
    setSupabase(
      loggedIn({
        auth: {
          getClaims: { data: { claims: { sub: 'u1' } } },
          getUser: { data: { user: { id: 'u1' } }, error: null },
        },
      })
    );

    const { body } = await callRoute(GET_ACCOUNT);

    expect(body).toEqual({
      id: 'u1',
      email: null,
      createdAt: null,
      lastSignInAt: null,
      providers: [],
    });
  });

  it('answers 401 when getUser returns an error', async () => {
    setSupabase(
      loggedIn({
        auth: {
          getClaims: { data: { claims: { sub: 'u1' } } },
          getUser: { data: { user: { id: 'u1' } }, error: { message: 'expired' } },
        },
      })
    );

    const { status } = await callRoute(GET_ACCOUNT);

    expect(status).toBe(401);
  });

  it('answers 401 when getUser returns no user', async () => {
    setSupabase(
      loggedIn({
        auth: {
          getClaims: { data: { claims: { sub: 'u1' } } },
          getUser: { data: null, error: null },
        },
      })
    );

    const { status } = await callRoute(GET_ACCOUNT);

    expect(status).toBe(401);
  });
});

describe('GET /api/me/summary', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(GET_SUMMARY);

    expect(status).toBe(401);
  });

  it('returns the profile and counters in one call', async () => {
    const { status, body } = await callRoute(GET_SUMMARY);

    expect(status).toBe(200);
    expect(body.profile).toEqual(PROFILE);
    expect(body.stats).toMatchObject({ docCount: 4, finishedInterviewCount: 3 });
  });

  it('queries only my own rows', async () => {
    await callRoute(GET_SUMMARY);

    expect(argsOf(queryFor(supabase, 'profiles'), 'eq')[0]).toEqual(['id', 'u1']);
    expect(argsOf(queryFor(supabase, 'v_profile_stats'), 'eq')[0]).toEqual(['user_id', 'u1']);
  });

  it('every counter is 0 when the stats row is missing', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: {
          profiles: { data: PROFILE, error: null },
          v_profile_stats: { data: null, error: null },
        },
      })
    );

    const { body } = await callRoute(GET_SUMMARY);

    expect(Object.values(body.stats).every((v) => v === 0)).toBe(true);
  });

  it('fills null stat columns with 0', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: {
          profiles: { data: PROFILE, error: null },
          v_profile_stats: { data: { doc_count: null, my_qbank_count: 2 }, error: null },
        },
      })
    );

    const { body } = await callRoute(GET_SUMMARY);

    expect(body.stats.docCount).toBe(0);
    expect(body.stats.myQbankCount).toBe(2);
  });

  it('fills the remaining counters with 0 when only some are set', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: {
          profiles: { data: PROFILE, error: null },
          v_profile_stats: { data: { doc_count: 7 }, error: null },
        },
      })
    );

    const { body } = await callRoute(GET_SUMMARY);

    expect(body.stats).toEqual({
      docCount: 7,
      portfolioCount: 0,
      publishedPortfolioCount: 0,
      draftPortfolioCount: 0,
      interviewScrapCount: 0,
      scrappedCompanyCount: 0,
      scrappedPostCount: 0,
      scrappedPortfolioCount: 0,
      myReviewCount: 0,
      myQbankCount: 0,
      finishedInterviewCount: 0,
    });
  });

  it('turns a failing profile query into an error response', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: {
          profiles: { data: null, error: { code: 'PGRST116' } },
          v_profile_stats: { data: STATS_ROW, error: null },
        },
      })
    );

    const { status } = await callRoute(GET_SUMMARY);

    expect(status).toBe(404);
  });
});

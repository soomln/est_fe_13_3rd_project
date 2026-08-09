import { beforeEach, describe, expect, it, vi } from 'vitest';

import { argsOf, createSupabaseStub, queryFor } from '../helpers/supabase';
import { callRoute, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { GET } = await import('../../lib/routes/profileStats');

const FULL_ROW = {
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

let supabase;

beforeEach(() => {
  supabase = createSupabaseStub({
    user: { id: 'u1' },
    tables: { v_profile_stats: { data: FULL_ROW, error: null } },
  });
  setSupabase(supabase);
});

describe('GET /api/profiles/:userId/stats', () => {
  it('returns all eleven counters in camelCase', async () => {
    const { status, body } = await callRoute(GET, { params: { userId: 'u2' } });

    expect(status).toBe(200);
    expect(body).toEqual({
      docCount: 4,
      portfolioCount: 3,
      publishedPortfolioCount: 2,
      draftPortfolioCount: 1,
      interviewScrapCount: 6,
      scrappedCompanyCount: 9,
      scrappedPostCount: 8,
      scrappedPortfolioCount: 7,
      myReviewCount: 5,
      myQbankCount: 4,
      finishedInterviewCount: 3,
    });
  });

  it("queries with the signed-in user id for 'me'", async () => {
    await callRoute(GET, { params: { userId: 'me' } });

    expect(argsOf(queryFor(supabase, 'v_profile_stats'), 'eq')[0]).toEqual(['user_id', 'u1']);
  });

  it('uses another user id as-is', async () => {
    await callRoute(GET, { params: { userId: 'u2' } });

    expect(argsOf(queryFor(supabase, 'v_profile_stats'), 'eq')[0]).toEqual(['user_id', 'u2']);
  });

  it('every counter is 0 when there is no row', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { v_profile_stats: { data: null, error: null } },
      })
    );

    const { body } = await callRoute(GET, { params: { userId: 'me' } });

    expect(Object.values(body).every((v) => v === 0)).toBe(true);
    expect(Object.keys(body)).toHaveLength(11);
  });

  it('fills null columns with 0', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { v_profile_stats: { data: { doc_count: 2 }, error: null } },
      })
    );

    const { body } = await callRoute(GET, { params: { userId: 'me' } });

    expect(body.docCount).toBe(2);
    expect(body.portfolioCount).toBe(0);
  });

  it("answers 401 when a signed-out caller asks for 'me'", async () => {
    setSupabase(createSupabaseStub({ tables: { v_profile_stats: { data: null, error: null } } }));

    const { status, body } = await callRoute(GET, { params: { userId: 'me' } });

    expect(status).toBe(401);
    expect(body.error.code).toBe('NOT_AUTHENTICATED');
  });

  it('signed-out visitors can read another user stats', async () => {
    setSupabase(createSupabaseStub({ tables: { v_profile_stats: { data: FULL_ROW, error: null } } }));

    const { status } = await callRoute(GET, { params: { userId: 'u2' } });

    expect(status).toBe(200);
  });
});

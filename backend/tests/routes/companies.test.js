import { beforeEach, describe, expect, it, vi } from 'vitest';

import { argsOf, createSupabaseStub, queriesFor } from '../helpers/supabase';
import { callRoute, makeRequest, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { GET, GET_DETAIL, GET_RECOMMENDED } = await import('../../lib/routes/companies');

const url = (qs = '') => `http://localhost/api/companies${qs}`;

const CODES = {
  data: [
    { code: 'it', label: 'IT·소프트웨어' },
    { code: 'game', label: '게임' },
  ],
  error: null,
};

const ROW = {
  id: 'c1',
  slug: 'naver',
  name: '네이버',
  logo_url: 'https://cdn/naver.png',
  industry_code: 'it',
  location: '분당',
  tags: ['플랫폼'],
  rating: 4.3,
  employee_count: 4500,
  avg_salary_text: '5,240만원',
  bookmark_count: 12,
  review_count: 8,
  qbank_count: 5,
  pass_rate: 75,
  avg_difficulty: 3.6,
};

const DETAIL_ROW = {
  ...ROW,
  tagline: '연결의 힘',
  description: '검색 포털',
  homepage: 'https://naver.com',
  hq_address: '경기 성남시',
  founded_on: '1999-06-02',
  ceo: '최수연',
  capital_text: '82억',
  hiring_status: '상시 채용',
  view_count: 300,
  rating_dimensions: { salary: 4.5 },
  salary_detail: { overall: 5240 },
  core_values: [
    { icon: 'star', title: '도전', desc: '설명A' },
    { icon: 'bolt', title: '속도', description: '설명B' },
  ],
  services: [{ name: '지식iN', logo_url: 'https://cdn/kin.png', link: 'https://kin.naver.com' }],
  benefits: [
    { icon: 'gift', title: '복지1', desc: '설명1' },
    { icon: 'home', title: '복지2', description: '설명2' },
  ],
  highlights: ['AI 중심 기업', { icon: 'flag', description: '객체형' }],
  news: [
    { title: '뉴스A', published_on: '2026-08-01', url: 'https://n/1' },
    { title: '뉴스B', date: '2026-07-01' },
  ],
};

let supabase;

beforeEach(() => {
  supabase = createSupabaseStub({
    tables: {
      v_companies: { data: [ROW], error: null, count: 1 },
      code_master: CODES,
    },
  });
  setSupabase(supabase);
});

describe('GET /api/companies', () => {
  it('maps the industry code to a label and returns a card', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(200);
    expect(body.items[0]).toEqual({
      id: 'c1',
      slug: 'naver',
      name: '네이버',
      logo: 'https://cdn/naver.png',
      category: 'IT·소프트웨어',
      location: '분당',
      tags: ['플랫폼'],
      rating: 4.3,
      employees: 4500,
      avgSalary: '5,240만원',
      favorite: 12,
      review: 8,
      jokbo: 5,
      passrate: 75,
      difficulty: 3.6,
    });
  });

  it('shows an unknown industry code as-is', async () => {
    setSupabase(
      createSupabaseStub({
        tables: {
          v_companies: { data: [{ ...ROW, industry_code: 'unknown' }], error: null, count: 1 },
          code_master: CODES,
        },
      })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0].category).toBe('unknown');
  });

  it('defaults missing counts to 0 and tags to an empty array', async () => {
    setSupabase(
      createSupabaseStub({
        tables: {
          v_companies: { data: [{ id: 'c9', industry_code: 'it' }], error: null, count: 1 },
          code_master: CODES,
        },
      })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0]).toMatchObject({ favorite: 0, review: 0, jokbo: 0, tags: [] });
  });

  it('sorts by popular by default', async () => {
    await callRoute(GET, { request: makeRequest(url()) });

    expect(argsOf(queriesFor(supabase, 'v_companies')[0], 'order')[0]).toEqual([
      'bookmark_count',
      { ascending: false, nullsFirst: false },
    ]);
  });

  it.each([
    ['rating', 'rating', false],
    ['views', 'view_count', false],
    ['name', 'name', true],
    ['latest', 'created_at', false],
  ])('sort=%s orders by %s', async (sort, column, ascending) => {
    await callRoute(GET, { request: makeRequest(url(`?sort=${sort}`)) });

    expect(argsOf(queriesFor(supabase, 'v_companies')[0], 'order')[0]).toEqual([
      column,
      { ascending, nullsFirst: false },
    ]);
  });

  it('answers 400 for an unknown sort', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url('?sort=zzz')) });

    expect(status).toBe(400);
    expect(body.error.message).toContain('sort');
  });

  it('matches the keyword against the company name', async () => {
    await callRoute(GET, { request: makeRequest(url('?q=%20네이버%20')) });

    expect(argsOf(queriesFor(supabase, 'v_companies')[0], 'ilike')[0]).toEqual(['name', '%네이버%']);
  });

  it('ignores a whitespace-only keyword', async () => {
    await callRoute(GET, { request: makeRequest(url('?q=%20')) });

    expect(argsOf(queriesFor(supabase, 'v_companies')[0], 'ilike')).toHaveLength(0);
  });

  it('applies the industry and size filters', async () => {
    await callRoute(GET, { request: makeRequest(url('?industry=it&size=large')) });

    const eqs = argsOf(queriesFor(supabase, 'v_companies')[0], 'eq');
    expect(eqs).toContainEqual(['industry_code', 'it']);
    expect(eqs).toContainEqual(['size_code', 'large']);
  });

  it('applies the job role filter with array containment', async () => {
    await callRoute(GET, { request: makeRequest(url('?jobRole=fe')) });

    expect(argsOf(queriesFor(supabase, 'v_companies')[0], 'contains')[0]).toEqual([
      'job_role_codes',
      ['fe'],
    ]);
  });

  it('can fetch specific companies by ids', async () => {
    await callRoute(GET, { request: makeRequest(url('?ids=c1, c2 ,')) });

    expect(argsOf(queriesFor(supabase, 'v_companies')[0], 'in')[0]).toEqual(['id', ['c1', 'c2']]);
  });

  it('returns an empty list without querying when ids is blank', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url('?ids=,,')) });

    expect(body).toEqual({ items: [], total: 0, page: 1, pageSize: 20 });
    expect(queriesFor(supabase, 'code_master')).toHaveLength(0);
  });

  it('computes the page range', async () => {
    await callRoute(GET, { request: makeRequest(url('?page=2&pageSize=20')) });

    expect(argsOf(queriesFor(supabase, 'v_companies')[0], 'range')[0]).toEqual([20, 39]);
  });

  it('propagates a DB error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setSupabase(
      createSupabaseStub({
        tables: { v_companies: { data: null, error: { code: 'X' } }, code_master: CODES },
      })
    );

    const { status } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(500);
    spy.mockRestore();
  });

  it('returns an empty list when data is null', async () => {
    setSupabase(
      createSupabaseStub({
        tables: {
          v_companies: { data: null, error: null, count: null },
          code_master: CODES,
        },
      })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body).toMatchObject({ items: [], total: 0 });
  });
});

describe('GET /api/companies/:slug', () => {
  beforeEach(() => {
    supabase = createSupabaseStub({
      tables: { v_companies: { data: DETAIL_ROW, error: null }, code_master: CODES },
    });
    setSupabase(supabase);
  });

  it('looks up by slug', async () => {
    await callRoute(GET_DETAIL, { params: { slug: 'naver' } });

    expect(argsOf(queriesFor(supabase, 'v_companies')[0], 'eq')[0]).toEqual(['slug', 'naver']);
  });

  it('answers 404 for a missing company', async () => {
    setSupabase(
      createSupabaseStub({
        tables: { v_companies: { data: null, error: null }, code_master: CODES },
      })
    );

    const { status, body } = await callRoute(GET_DETAIL, { params: { slug: 'nope' } });

    expect(status).toBe(404);
    expect(body.error.message).toBe('기업을 찾을 수 없습니다.');
  });

  it('carries both card and detail fields', async () => {
    const { status, body } = await callRoute(GET_DETAIL, { params: { slug: 'naver' } });

    expect(status).toBe(200);
    expect(body).toMatchObject({
      name: '네이버',
      industry: 'IT·소프트웨어',
      tagline: '연결의 힘',
      intro: '검색 포털',
      address: '경기 성남시',
      hire: '상시 채용',
      views: 300,
    });
  });

  it('core values accept both desc and description', async () => {
    const { body } = await callRoute(GET_DETAIL, { params: { slug: 'naver' } });

    expect(body.values).toEqual([
      { icon: 'star', title: '도전', description: '설명A' },
      { icon: 'bolt', title: '속도', description: '설명B' },
    ]);
  });

  it('benefits accept both desc and description too', async () => {
    const { body } = await callRoute(GET_DETAIL, { params: { slug: 'naver' } });

    expect(body.benefits[0].description).toBe('설명1');
    expect(body.benefits[1].description).toBe('설명2');
  });

  it('highlights wrap plain strings in an icon object', async () => {
    const { body } = await callRoute(GET_DETAIL, { params: { slug: 'naver' } });

    expect(body.summary).toEqual([
      { icon: 'check_circle', description: 'AI 중심 기업' },
      { icon: 'flag', description: '객체형' },
    ]);
  });

  it('news accepts both published_on and date', async () => {
    const { body } = await callRoute(GET_DETAIL, { params: { slug: 'naver' } });

    expect(body.news).toEqual([
      { title: '뉴스A', date: '2026-08-01', url: 'https://n/1' },
      { title: '뉴스B', date: '2026-07-01', url: null },
    ]);
  });

  it('normalizes the link and logo of each service', async () => {
    const { body } = await callRoute(GET_DETAIL, { params: { slug: 'naver' } });

    expect(body.services).toEqual([
      {
        name: '지식iN',
        description: '지식iN',
        logo: 'https://cdn/kin.png',
        link: 'https://kin.naver.com',
      },
    ]);
  });

  it('the detail also shows an unknown industry code as-is', async () => {
    setSupabase(
      createSupabaseStub({
        tables: {
          v_companies: { data: { ...DETAIL_ROW, industry_code: 'unknown' }, error: null },
          code_master: CODES,
        },
      })
    );

    const { body } = await callRoute(GET_DETAIL, { params: { slug: 'naver' } });

    expect(body.industry).toBe('unknown');
  });

  it('fills missing service logo and link with null', async () => {
    setSupabase(
      createSupabaseStub({
        tables: {
          v_companies: {
            data: { ...DETAIL_ROW, services: [{ name: '웨일' }] },
            error: null,
          },
          code_master: CODES,
        },
      })
    );

    const { body } = await callRoute(GET_DETAIL, { params: { slug: 'naver' } });

    expect(body.services).toEqual([
      { name: '웨일', description: '웨일', logo: null, link: null },
    ]);
  });

  it('does not throw when the JSONB columns are empty', async () => {
    setSupabase(
      createSupabaseStub({
        tables: {
          v_companies: { data: { id: 'c9', slug: 's', industry_code: 'it' }, error: null },
          code_master: CODES,
        },
      })
    );

    const { status, body } = await callRoute(GET_DETAIL, { params: { slug: 's' } });

    expect(status).toBe(200);
    expect(body).toMatchObject({
      values: [],
      services: [],
      benefits: [],
      summary: [],
      news: [],
      ratings: {},
      salary: {},
      views: 0,
    });
  });
});

describe('GET /api/companies/recommended', () => {
  beforeEach(() => {
    supabase = createSupabaseStub({
      rpc: { get_recommended_companies: { data: [ROW], error: null } },
      tables: { code_master: CODES },
    });
    setSupabase(supabase);
  });

  it('requests 6 by default', async () => {
    await callRoute(GET_RECOMMENDED, { request: makeRequest(url('/recommended')) });

    expect(supabase.rpcCalls[0]).toEqual({
      name: 'get_recommended_companies',
      args: { p_limit: 6 },
    });
  });

  it('caps limit at 20', async () => {
    await callRoute(GET_RECOMMENDED, { request: makeRequest(url('/recommended?limit=100')) });

    expect(supabase.rpcCalls[0].args).toEqual({ p_limit: 20 });
  });

  it('raises a limit of 0 or less to 1', async () => {
    await callRoute(GET_RECOMMENDED, { request: makeRequest(url('/recommended?limit=0')) });

    expect(supabase.rpcCalls[0].args).toEqual({ p_limit: 1 });
  });

  it('returns them mapped into cards', async () => {
    const { status, body } = await callRoute(GET_RECOMMENDED, {
      request: makeRequest(url('/recommended')),
    });

    expect(status).toBe(200);
    expect(body.items[0]).toMatchObject({ name: '네이버', category: 'IT·소프트웨어' });
  });

  it('returns an empty list when the RPC gives null', async () => {
    setSupabase(
      createSupabaseStub({
        rpc: { get_recommended_companies: { data: null, error: null } },
        tables: { code_master: CODES },
      })
    );

    const { body } = await callRoute(GET_RECOMMENDED, {
      request: makeRequest(url('/recommended')),
    });

    expect(body).toEqual({ items: [] });
  });

  it('turns an RPC failure into an error response', async () => {
    setSupabase(
      createSupabaseStub({
        rpc: { get_recommended_companies: { data: null, error: { code: 'PGRST202' } } },
        tables: { code_master: CODES },
      })
    );
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { status, body } = await callRoute(GET_RECOMMENDED, {
      request: makeRequest(url('/recommended')),
    });

    expect(status).toBe(500);
    expect(body.error.code).toBe('SCHEMA_NOT_READY');
    spy.mockRestore();
  });
});

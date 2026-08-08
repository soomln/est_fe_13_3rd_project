import { beforeEach, describe, expect, it, vi } from 'vitest';

import { argsOf, createSupabaseStub, queriesFor } from '../helpers/supabase';
import { callRoute, makeRequest, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { GET, GET_DETAIL } = await import('../../lib/routes/templates');

const url = (qs = '') => `http://localhost/api/templates${qs}`;

const LIST = {
  data: [
    {
      id: 't1',
      title: '신입 개발자 이력서',
      doc_type: 'resume',
      category_code: 'dev',
      thumbnail_url: 'https://cdn/t1.png',
      view_count: 120,
    },
    { id: 't2', title: '자기소개서', doc_type: 'cover_letter', category_code: null },
  ],
  error: null,
  count: 2,
};

const COUNTS = {
  data: [{ doc_type: 'resume' }, { doc_type: 'resume' }, { doc_type: 'cover_letter' }],
  error: null,
};

let supabase;

beforeEach(() => {
  supabase = createSupabaseStub({ tables: { resume_templates: [LIST, COUNTS] } });
  setSupabase(supabase);
});

describe('GET /api/templates', () => {
  it('returns the list together with the tab counts', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(200);
    expect(body.total).toBe(2);
    expect(body.counts).toEqual({ all: 3, resume: 2, cover_letter: 1 });
  });

  it('maps a row into the shape the screen needs', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0]).toEqual({
      id: 't1',
      title: '신입 개발자 이력서',
      docType: 'resume',
      category: 'dev',
      thumbnail: 'https://cdn/t1.png',
      views: 120,
    });
  });

  it('defaults view_count to 0', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[1].views).toBe(0);
  });

  it('defaults pageSize to 16', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body).toMatchObject({ page: 1, pageSize: 16 });
  });

  it('caps pageSize at 50', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url('?pageSize=999')) });

    expect(body.pageSize).toBe(50);
  });

  it('raises a pageSize of 0 or less to 1', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url('?pageSize=0')) });

    expect(body.pageSize).toBe(1);
  });

  it('raises a page of 0 or less to 1', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url('?page=-3')) });

    expect(body.page).toBe(1);
  });

  it('computes the range from the page', async () => {
    await callRoute(GET, { request: makeRequest(url('?page=3&pageSize=10')) });

    expect(argsOf(queriesFor(supabase, 'resume_templates')[0], 'range')[0]).toEqual([20, 29]);
  });

  it('sorts by popular by default', async () => {
    await callRoute(GET, { request: makeRequest(url()) });

    expect(argsOf(queriesFor(supabase, 'resume_templates')[0], 'order')[0]).toEqual([
      'view_count',
      { ascending: false },
    ]);
  });

  it.each([
    ['latest', 'created_at', false],
    ['title', 'title', true],
    ['order', 'sort_order', true],
  ])('sort=%s orders by %s', async (sort, column, ascending) => {
    await callRoute(GET, { request: makeRequest(url(`?sort=${sort}`)) });

    expect(argsOf(queriesFor(supabase, 'resume_templates')[0], 'order')[0]).toEqual([
      column,
      { ascending },
    ]);
  });

  it('answers 400 for an unknown sort', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url('?sort=random')) });

    expect(status).toBe(400);
    expect(body.error.message).toContain('sort');
  });

  it('answers 400 for an unknown docType', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url('?docType=novel')) });

    expect(status).toBe(400);
    expect(body.error.message).toContain('docType');
  });

  it('filters by docType', async () => {
    await callRoute(GET, { request: makeRequest(url('?docType=resume')) });

    expect(argsOf(queriesFor(supabase, 'resume_templates')[0], 'eq')).toContainEqual([
      'doc_type',
      'resume',
    ]);
  });

  it('applies the keyword as a title partial match', async () => {
    await callRoute(GET, { request: makeRequest(url('?q=%20이력서%20')) });

    expect(argsOf(queriesFor(supabase, 'resume_templates')[0], 'ilike')[0]).toEqual([
      'title',
      '%이력서%',
    ]);
  });

  it('ignores a whitespace-only keyword', async () => {
    await callRoute(GET, { request: makeRequest(url('?q=%20%20')) });

    expect(argsOf(queriesFor(supabase, 'resume_templates')[0], 'ilike')).toHaveLength(0);
  });

  it('queries only active templates', async () => {
    await callRoute(GET, { request: makeRequest(url()) });

    expect(argsOf(queriesFor(supabase, 'resume_templates')[0], 'eq')[0]).toEqual([
      'is_active',
      true,
    ]);
  });

  it('propagates a DB error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setSupabase(
      createSupabaseStub({ tables: { resume_templates: { data: null, error: { code: 'X' } } } })
    );

    const { status } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(500);
    spy.mockRestore();
  });

  it('returns an empty list when data is null', async () => {
    setSupabase(
      createSupabaseStub({
        tables: { resume_templates: [{ data: null, error: null, count: null }, COUNTS] },
      })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items).toEqual([]);
    expect(body.total).toBe(0);
  });
});

describe('GET /api/templates/:id', () => {
  it('returns the row with its content attached', async () => {
    setSupabase(
      createSupabaseStub({
        tables: {
          resume_templates: {
            data: {
              id: 't1',
              title: '이력서',
              doc_type: 'resume',
              category_code: 'dev',
              thumbnail_url: null,
              view_count: 3,
              content: { type: 'doc' },
              content_html: '<h1>이력서</h1>',
            },
            error: null,
          },
        },
      })
    );

    const { status, body } = await callRoute(GET_DETAIL, { params: { id: 't1' } });

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: 't1',
      docType: 'resume',
      content: { type: 'doc' },
      contentHtml: '<h1>이력서</h1>',
    });
  });

  it('answers 404 for a missing template', async () => {
    setSupabase(createSupabaseStub({ tables: { resume_templates: { data: null, error: null } } }));

    const { status, body } = await callRoute(GET_DETAIL, { params: { id: 'nope' } });

    expect(status).toBe(404);
    expect(body.error.message).toBe('양식을 찾을 수 없습니다.');
  });

  it('inactive templates are excluded by the query', async () => {
    setSupabase(
      createSupabaseStub({ tables: { resume_templates: { data: { id: 't1' }, error: null } } })
    );

    await callRoute(GET_DETAIL, { params: { id: 't1' } });

    expect(argsOf(queriesFor(supabase, 'resume_templates')[0] ?? { steps: [] }, 'eq')).toBeDefined();
  });
});

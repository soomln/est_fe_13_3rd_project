import { beforeEach, describe, expect, it, vi } from 'vitest';

import { argsOf, createSupabaseStub, queriesFor } from '../helpers/supabase';
import { brokenJsonRequest, callRoute, makeRequest, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { DELETE, DELETE_DETAIL, GET, GET_DETAIL, PATCH_DETAIL, POST } = await import(
  '../../lib/routes/documents'
);

const url = (qs = '') => `http://localhost/api/documents${qs}`;

const LIST = {
  data: [
    {
      id: 'd1',
      doc_type: 'resume',
      title: '내 이력서',
      template_id: 't1',
      created_at: '2026-08-01T00:00:00Z',
      updated_at: '2026-08-02T00:00:00Z',
    },
  ],
  error: null,
  count: 1,
};

const ALL = {
  data: [{ doc_type: 'resume' }, { doc_type: 'resume' }, { doc_type: 'cover_letter' }],
  error: null,
};

const DETAIL = {
  data: {
    id: 'd1',
    doc_type: 'resume',
    title: '내 이력서',
    template_id: null,
    content: { type: 'doc' },
    content_html: '<p>hi</p>',
    content_text: 'hi',
    created_at: '2026-08-01T00:00:00Z',
    updated_at: '2026-08-02T00:00:00Z',
  },
  error: null,
};

const listStub = () =>
  createSupabaseStub({ user: { id: 'u1' }, tables: { documents: [LIST, ALL] } });

let supabase;

beforeEach(() => {
  supabase = listStub();
  setSupabase(supabase);
});

describe('GET /api/documents', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub({ tables: { documents: [LIST, ALL] } }));

    const { status } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(401);
  });

  it('queries only my own documents', async () => {
    await callRoute(GET, { request: makeRequest(url()) });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'eq')[0]).toEqual(['user_id', 'u1']);
  });

  it('returns the list together with the tab counts', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(200);
    expect(body.items).toEqual([
      {
        id: 'd1',
        docType: 'resume',
        title: '내 이력서',
        templateId: 't1',
        createdAt: '2026-08-01T00:00:00Z',
        updatedAt: '2026-08-02T00:00:00Z',
      },
    ]);
    expect(body.counts).toEqual({ all: 3, resume: 2, cover_letter: 1 });
  });

  it('leaves the content out of the list', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0]).not.toHaveProperty('content');
  });

  it('sorts by updated_at descending by default', async () => {
    await callRoute(GET, { request: makeRequest(url()) });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'order')[0]).toEqual([
      'updated_at',
      { ascending: false },
    ]);
  });

  it.each([
    ['created', 'created_at', false],
    ['title', 'title', true],
  ])('sort=%s orders by %s', async (sort, column, ascending) => {
    await callRoute(GET, { request: makeRequest(url(`?sort=${sort}`)) });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'order')[0]).toEqual([
      column,
      { ascending },
    ]);
  });

  it('answers 400 for an unknown sort', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url('?sort=zzz')) });

    expect(status).toBe(400);
    expect(body.error.message).toContain('sort');
  });

  it('answers 400 for an unknown docType', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url('?docType=novel')) });

    expect(status).toBe(400);
    expect(body.error.message).toContain('docType');
  });

  it('filters by docType', async () => {
    await callRoute(GET, { request: makeRequest(url('?docType=cover_letter')) });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'eq')).toContainEqual([
      'doc_type',
      'cover_letter',
    ]);
  });

  it('applies the keyword as a title partial match', async () => {
    await callRoute(GET, { request: makeRequest(url('?q=%20이력서%20')) });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'ilike')[0]).toEqual(['title', '%이력서%']);
  });

  it('ignores a whitespace-only keyword', async () => {
    await callRoute(GET, { request: makeRequest(url('?q=%20')) });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'ilike')).toHaveLength(0);
  });

  it('computes the page range', async () => {
    await callRoute(GET, { request: makeRequest(url('?page=2&pageSize=5')) });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'range')[0]).toEqual([5, 9]);
  });

  it('propagates a DB error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { documents: [{ data: null, error: { code: 'X' } }, ALL] },
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
        tables: { documents: [{ data: null, error: null, count: null }, ALL] },
      })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items).toEqual([]);
    expect(body.total).toBe(0);
  });
});

describe('POST /api/documents', () => {
  const createStub = () =>
    createSupabaseStub({ user: { id: 'u1' }, tables: { documents: DETAIL } });

  beforeEach(() => {
    supabase = createStub();
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub({ tables: { documents: DETAIL } }));

    const { status } = await callRoute(POST, {
      request: makeRequest(url(), { body: { docType: 'resume' } }),
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(POST, { request: brokenJsonRequest(url()) });

    expect(status).toBe(400);
  });

  it('answers 400 when docType is missing', async () => {
    const { status, body } = await callRoute(POST, { request: makeRequest(url(), { body: {} }) });

    expect(status).toBe(400);
    expect(body.error.message).toContain('docType');
  });

  it('answers 400 for an unknown docType', async () => {
    const { status } = await callRoute(POST, {
      request: makeRequest(url(), { body: { docType: 'novel' } }),
    });

    expect(status).toBe(400);
  });

  it('stamps my own id on the row', async () => {
    await callRoute(POST, {
      request: makeRequest(url(), { body: { docType: 'resume', title: '  새 이력서  ' } }),
    });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'insert')[0][0]).toMatchObject({
      user_id: 'u1',
      doc_type: 'resume',
      title: '새 이력서',
    });
  });

  it('falls back to the placeholder title when the title is blank', async () => {
    await callRoute(POST, {
      request: makeRequest(url(), { body: { docType: 'resume', title: '   ' } }),
    });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'insert')[0][0].title).toBe('제목 없음');
  });

  it('falls back to the placeholder title when no title is sent', async () => {
    await callRoute(POST, {
      request: makeRequest(url(), { body: { docType: 'resume' } }),
    });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'insert')[0][0].title).toBe('제목 없음');
  });

  it('fills the three content fields with null when they are omitted', async () => {
    await callRoute(POST, { request: makeRequest(url(), { body: { docType: 'resume' } }) });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'insert')[0][0]).toMatchObject({
      template_id: null,
      content: null,
      content_html: null,
      content_text: null,
    });
  });

  it('stores the three content fields as given', async () => {
    await callRoute(POST, {
      request: makeRequest(url(), {
        body: {
          docType: 'resume',
          templateId: 't1',
          content: { type: 'doc' },
          contentHtml: '<p>hi</p>',
          contentText: 'hi',
        },
      }),
    });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'insert')[0][0]).toMatchObject({
      template_id: 't1',
      content: { type: 'doc' },
      content_html: '<p>hi</p>',
      content_text: 'hi',
    });
  });

  it('returns the row including its content', async () => {
    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { docType: 'resume' } }),
    });

    expect(status).toBe(200);
    expect(body).toMatchObject({ id: 'd1', contentText: 'hi' });
  });

  it('answers 409 when the document limit trigger fires', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: {
          documents: { data: null, error: { message: 'DOCUMENT_LIMIT_EXCEEDED', code: 'P0001' } },
        },
      })
    );

    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { docType: 'resume' } }),
    });

    expect(status).toBe(409);
    expect(body.error.code).toBe('DOCUMENT_LIMIT_EXCEEDED');
  });
});

describe('DELETE /api/documents', () => {
  beforeEach(() => {
    supabase = createSupabaseStub({
      user: { id: 'u1' },
      tables: { documents: { data: [{ id: 'd1' }, { id: 'd2' }], error: null } },
    });
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: ['d1'] } }),
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(DELETE, { request: brokenJsonRequest(url()) });

    expect(status).toBe(400);
  });

  it('answers 400 when ids is not an array', async () => {
    const { status, body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: 'd1' } }),
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

  it('deletes only my own documents and returns the count', async () => {
    const { status, body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: ['d1', 'd2'] } }),
    });

    expect(status).toBe(200);
    expect(body).toEqual({ deleted: 2 });

    const query = queriesFor(supabase, 'documents')[0];
    expect(argsOf(query, 'eq')[0]).toEqual(['user_id', 'u1']);
    expect(argsOf(query, 'in')[0]).toEqual(['id', ['d1', 'd2']]);
  });

  it('answers 0 when the result is null', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { documents: { data: null, error: null } } })
    );

    const { body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: ['d1'] } }),
    });

    expect(body).toEqual({ deleted: 0 });
  });
});

describe('GET /api/documents/:id', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub({ tables: { documents: DETAIL } }));

    const { status } = await callRoute(GET_DETAIL, { params: { id: 'd1' } });

    expect(status).toBe(401);
  });

  it('returns the row including its content', async () => {
    setSupabase(createSupabaseStub({ user: { id: 'u1' }, tables: { documents: DETAIL } }));

    const { status, body } = await callRoute(GET_DETAIL, { params: { id: 'd1' } });

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: 'd1',
      docType: 'resume',
      content: { type: 'doc' },
      contentHtml: '<p>hi</p>',
      contentText: 'hi',
    });
  });

  it('queries only my own documents', async () => {
    supabase = createSupabaseStub({ user: { id: 'u1' }, tables: { documents: DETAIL } });
    setSupabase(supabase);

    await callRoute(GET_DETAIL, { params: { id: 'd1' } });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'eq')).toEqual([
      ['id', 'd1'],
      ['user_id', 'u1'],
    ]);
  });

  it('answers 404 for a missing document', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { documents: { data: null, error: null } } })
    );

    const { status, body } = await callRoute(GET_DETAIL, { params: { id: 'nope' } });

    expect(status).toBe(404);
    expect(body.error.message).toBe('문서를 찾을 수 없습니다.');
  });
});

describe('PATCH /api/documents/:id', () => {
  beforeEach(() => {
    supabase = createSupabaseStub({ user: { id: 'u1' }, tables: { documents: DETAIL } });
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub({ tables: { documents: DETAIL } }));

    const { status } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { title: 'x' } }),
      params: { id: 'd1' },
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(PATCH_DETAIL, {
      request: brokenJsonRequest(url()),
      params: { id: 'd1' },
    });

    expect(status).toBe(400);
  });

  it('answers 400 when there is nothing to update', async () => {
    const { status, body } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { nope: 1 } }),
      params: { id: 'd1' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('수정할 내용이 없습니다.');
  });

  it('a blank title becomes the placeholder title', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { title: '  ' } }),
      params: { id: 'd1' },
    });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'update')[0]).toEqual([
      { title: '제목 없음' },
    ]);
  });

  it('can clear templateId to null', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { templateId: undefined } }),
      params: { id: 'd1' },
    });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'update')[0]).toEqual([
      { template_id: null },
    ]);
  });

  it('can update each of the three content fields', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), {
        body: { content: { a: 1 }, contentHtml: '<p>x</p>', contentText: 'x' },
      }),
      params: { id: 'd1' },
    });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'update')[0]).toEqual([
      { content: { a: 1 }, content_html: '<p>x</p>', content_text: 'x' },
    ]);
  });

  it('updates only my own document', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { title: 'x' } }),
      params: { id: 'd1' },
    });

    expect(argsOf(queriesFor(supabase, 'documents')[0], 'eq')).toEqual([
      ['id', 'd1'],
      ['user_id', 'u1'],
    ]);
  });

  it('answers 404 when updating a document owned by someone else', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { documents: { data: null, error: null } } })
    );

    const { status, body } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { title: 'x' } }),
      params: { id: 'other' },
    });

    expect(status).toBe(404);
    expect(body.error.message).toBe('문서를 찾을 수 없습니다.');
  });
});

describe('DELETE /api/documents/:id', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(DELETE_DETAIL, { params: { id: 'd1' } });

    expect(status).toBe(401);
  });

  it('deletes my own document and reports one row', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { documents: { data: [{ id: 'd1' }], error: null } },
      })
    );

    const { status, body } = await callRoute(DELETE_DETAIL, { params: { id: 'd1' } });

    expect(status).toBe(200);
    expect(body).toEqual({ deleted: 1 });
  });

  it('answers 404 when nothing was deleted', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { documents: { data: [], error: null } } })
    );

    const { status, body } = await callRoute(DELETE_DETAIL, { params: { id: 'other' } });

    expect(status).toBe(404);
    expect(body.error.message).toBe('문서를 찾을 수 없습니다.');
  });

  it('answers 404 when the result is null', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { documents: { data: null, error: null } } })
    );

    const { status } = await callRoute(DELETE_DETAIL, { params: { id: 'other' } });

    expect(status).toBe(404);
  });
});

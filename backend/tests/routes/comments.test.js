import { beforeEach, describe, expect, it, vi } from 'vitest';

import { argsOf, createSupabaseStub, queriesFor } from '../helpers/supabase';
import { brokenJsonRequest, callRoute, makeRequest, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { DELETE_DETAIL, GET, PATCH_DETAIL, POST } = await import('../../lib/routes/comments');

const url = (qs = '') => `http://localhost/api/posts/p1/comments${qs}`;

const ROW = {
  id: 'c1',
  post_id: 'p1',
  body: '좋은 후기네요',
  user_id: 'u2',
  author_name: '김프론트',
  author_avatar_url: 'https://cdn/a.png',
  like_count: 3,
  created_at: '2026-08-05T10:00:00Z',
  updated_at: '2026-08-05T11:00:00Z',
};

let supabase;

beforeEach(() => {
  supabase = createSupabaseStub({
    user: { id: 'u1' },
    tables: {
      v_comments: { data: [ROW], error: null, count: 1 },
      comments: { data: { id: 'c1' }, error: null },
    },
  });
  setSupabase(supabase);
});

describe('GET /api/posts/:id/comments', () => {
  it('maps comments into the shape the screen needs', async () => {
    const { status, body } = await callRoute(GET, {
      request: makeRequest(url()),
      params: { id: 'p1' },
    });

    expect(status).toBe(200);
    expect(body.items[0]).toEqual({
      id: 'c1',
      postId: 'p1',
      body: '좋은 후기네요',
      authorId: 'u2',
      authorName: '김프론트',
      authorAvatar: 'https://cdn/a.png',
      likeCount: 3,
      likedByMe: false,
      date: '2026.08.05',
      createdAt: '2026-08-05T10:00:00Z',
      updatedAt: '2026-08-05T11:00:00Z',
    });
  });

  it('lets signed-out visitors read comments', async () => {
    setSupabase(
      createSupabaseStub({ tables: { v_comments: { data: [ROW], error: null, count: 1 } } })
    );

    const { status } = await callRoute(GET, { request: makeRequest(url()), params: { id: 'p1' } });

    expect(status).toBe(200);
  });

  it('defaults like_count to 0', async () => {
    setSupabase(
      createSupabaseStub({
        tables: { v_comments: { data: [{ ...ROW, like_count: null }], error: null, count: 1 } },
      })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url()), params: { id: 'p1' } });

    expect(body.items[0].likeCount).toBe(0);
  });

  it('leaves the date empty when created_at is missing', async () => {
    setSupabase(
      createSupabaseStub({
        tables: { v_comments: { data: [{ ...ROW, created_at: null }], error: null, count: 1 } },
      })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url()), params: { id: 'p1' } });

    expect(body.items[0].date).toBe('');
  });

  it('filters by post id', async () => {
    await callRoute(GET, { request: makeRequest(url()), params: { id: 'p1' } });

    expect(argsOf(queriesFor(supabase, 'v_comments')[0], 'eq')[0]).toEqual(['post_id', 'p1']);
  });

  it('sorts by latest by default', async () => {
    await callRoute(GET, { request: makeRequest(url()), params: { id: 'p1' } });

    expect(argsOf(queriesFor(supabase, 'v_comments')[0], 'order')[0]).toEqual([
      'created_at',
      { ascending: false, nullsFirst: false },
    ]);
  });

  it('supports sorting by popular', async () => {
    await callRoute(GET, { request: makeRequest(url('?sort=popular')), params: { id: 'p1' } });

    expect(argsOf(queriesFor(supabase, 'v_comments')[0], 'order')[0]).toEqual([
      'like_count',
      { ascending: false, nullsFirst: false },
    ]);
  });

  it('answers 400 for an unknown sort', async () => {
    const { status, body } = await callRoute(GET, {
      request: makeRequest(url('?sort=zzz')),
      params: { id: 'p1' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toContain('sort');
  });

  it('defaults pageSize to 20 and caps it at 100', async () => {
    const first = await callRoute(GET, { request: makeRequest(url()), params: { id: 'p1' } });
    expect(first.body.pageSize).toBe(20);

    setSupabase(supabase);
    const capped = await callRoute(GET, {
      request: makeRequest(url('?pageSize=500')),
      params: { id: 'p1' },
    });
    expect(capped.body.pageSize).toBe(100);
  });

  it('propagates a DB error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setSupabase(createSupabaseStub({ tables: { v_comments: { data: null, error: { code: 'X' } } } }));

    const { status } = await callRoute(GET, { request: makeRequest(url()), params: { id: 'p1' } });

    expect(status).toBe(500);
    spy.mockRestore();
  });

  it('returns an empty list when data is null', async () => {
    setSupabase(
      createSupabaseStub({ tables: { v_comments: { data: null, error: null, count: null } } })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url()), params: { id: 'p1' } });

    expect(body).toMatchObject({ items: [], total: 0 });
  });
});

describe('POST /api/posts/:id/comments', () => {
  const stub = () =>
    createSupabaseStub({
      user: { id: 'u1' },
      tables: {
        comments: { data: { id: 'c1' }, error: null },
        v_comments: { data: ROW, error: null },
      },
    });

  beforeEach(() => {
    supabase = stub();
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(POST, {
      request: makeRequest(url(), { body: { body: '댓글' } }),
      params: { id: 'p1' },
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(POST, {
      request: brokenJsonRequest(url()),
      params: { id: 'p1' },
    });

    expect(status).toBe(400);
  });

  it('answers 400 when the body is blank', async () => {
    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { body: '   ' } }),
      params: { id: 'p1' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('댓글 내용을 입력해 주세요.');
  });

  it('answers 400 when the body is missing entirely', async () => {
    const { status } = await callRoute(POST, {
      request: makeRequest(url(), { body: {} }),
      params: { id: 'p1' },
    });

    expect(status).toBe(400);
  });

  it('answers 400 beyond 2000 characters', async () => {
    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { body: 'ㄱ'.repeat(2001) } }),
      params: { id: 'p1' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toContain('2000자');
  });

  it('accepts exactly 2000 characters', async () => {
    const { status } = await callRoute(POST, {
      request: makeRequest(url(), { body: { body: 'ㄱ'.repeat(2000) } }),
      params: { id: 'p1' },
    });

    expect(status).toBe(200);
  });

  it('trims surrounding whitespace before saving', async () => {
    await callRoute(POST, {
      request: makeRequest(url(), { body: { body: '  댓글입니다  ' } }),
      params: { id: 'p1' },
    });

    expect(argsOf(queriesFor(supabase, 'comments')[0], 'insert')[0][0]).toEqual({
      post_id: 'p1',
      user_id: 'u1',
      body: '댓글입니다',
    });
  });

  it('reads the row back from the view after saving', async () => {
    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { body: '댓글' } }),
      params: { id: 'p1' },
    });

    expect(status).toBe(200);
    expect(body.id).toBe('c1');
    expect(body.authorName).toBe('김프론트');
  });
});

describe('PATCH /api/comments/:id', () => {
  const stub = () =>
    createSupabaseStub({
      user: { id: 'u1' },
      tables: {
        comments: { data: { id: 'c1' }, error: null },
        v_comments: { data: ROW, error: null },
      },
    });

  beforeEach(() => {
    supabase = stub();
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { body: '수정' } }),
      params: { id: 'c1' },
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(PATCH_DETAIL, {
      request: brokenJsonRequest(url()),
      params: { id: 'c1' },
    });

    expect(status).toBe(400);
  });

  it('answers 400 when the body is blank', async () => {
    const { status } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { body: '' } }),
      params: { id: 'c1' },
    });

    expect(status).toBe(400);
  });

  it('answers 400 beyond 2000 characters', async () => {
    const { status } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { body: 'ㄱ'.repeat(2001) } }),
      params: { id: 'c1' },
    });

    expect(status).toBe(400);
  });

  it('updates only my own comment', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { body: '수정됨' } }),
      params: { id: 'c1' },
    });

    const query = queriesFor(supabase, 'comments')[0];
    expect(argsOf(query, 'update')[0]).toEqual([{ body: '수정됨' }]);
    expect(argsOf(query, 'eq')).toEqual([
      ['id', 'c1'],
      ['user_id', 'u1'],
    ]);
  });

  it('answers 404 when updating a comment owned by someone else', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { comments: { data: null, error: null }, v_comments: { data: ROW, error: null } },
      })
    );

    const { status, body } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { body: '수정' } }),
      params: { id: 'other' },
    });

    expect(status).toBe(404);
    expect(body.error.message).toBe('댓글을 찾을 수 없습니다.');
  });

  it('reads the updated comment back from the view', async () => {
    const { body } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { body: '수정됨' } }),
      params: { id: 'c1' },
    });

    expect(body.id).toBe('c1');
  });
});

describe('DELETE /api/comments/:id', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(DELETE_DETAIL, { params: { id: 'c1' } });

    expect(status).toBe(401);
  });

  it('deletes my own comment and reports one row', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { comments: { data: [{ id: 'c1' }], error: null } },
      })
    );

    const { status, body } = await callRoute(DELETE_DETAIL, { params: { id: 'c1' } });

    expect(status).toBe(200);
    expect(body).toEqual({ deleted: 1 });
  });

  it('answers 404 when nothing was deleted', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { comments: { data: [], error: null } } })
    );

    const { status, body } = await callRoute(DELETE_DETAIL, { params: { id: 'other' } });

    expect(status).toBe(404);
    expect(body.error.message).toBe('댓글을 찾을 수 없습니다.');
  });

  it('answers 404 when the result is null', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { comments: { data: null, error: null } } })
    );

    const { status } = await callRoute(DELETE_DETAIL, { params: { id: 'other' } });

    expect(status).toBe(404);
  });
});

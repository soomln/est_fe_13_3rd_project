import { beforeEach, describe, expect, it, vi } from 'vitest';

import { argsOf, createSupabaseStub, queriesFor } from '../helpers/supabase';
import { brokenJsonRequest, callRoute, makeRequest, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { DELETE, DELETE_DETAIL, GET, GET_DETAIL, PATCH_DETAIL, POST } = await import(
  '../../lib/routes/portfolios'
);

const url = (qs = '') => `http://localhost/api/portfolios${qs}`;

const ROW = {
  id: 'f1',
  title: '포트폴리오',
  thumbnail_url: 'https://cdn/t.png',
  category: 'web',
  description: '설명',
  status: 'published',
  user_id: 'u2',
  author_name: '김프론트',
  author_avatar_url: 'https://cdn/a.png',
  author_desired_role: '프론트엔드 개발자',
  like_count: 12,
  bookmark_count: 4,
  view_count: 88,
  content: [{ type: 'image', url: 'https://cdn/1.png' }],
  bg_color: '#F4FCFE',
  gap_px: 16,
  created_at: '2026-08-01T00:00:00Z',
  updated_at: '2026-08-02T00:00:00Z',
};

const listStub = (rows = [ROW], extra = {}) =>
  createSupabaseStub({
    tables: { v_portfolios: { data: rows, error: null, count: rows.length } },
    ...extra,
  });

let supabase;

beforeEach(() => {
  supabase = listStub();
  setSupabase(supabase);
});

describe('GET /api/portfolios', () => {
  it('maps a row into a card', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(200);
    expect(body.items[0]).toEqual({
      id: 'f1',
      title: '포트폴리오',
      thumbnailUrl: 'https://cdn/t.png',
      category: 'web',
      description: '설명',
      status: 'published',
      authorId: 'u2',
      authorName: '김프론트',
      authorAvatar: 'https://cdn/a.png',
      authorRole: '프론트엔드 개발자',
      likeCount: 12,
      likedByMe: false,
      bookmarkCount: 4,
      bookmarkedByMe: false,
      collaborators: [],
      viewCount: 88,
      createdAt: '2026-08-01T00:00:00Z',
      updatedAt: '2026-08-02T00:00:00Z',
    });
  });

  it('leaves the block content out of the list', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0]).not.toHaveProperty('content');
  });

  it('fills missing thumbnail and counts with defaults', async () => {
    setSupabase(listStub([{ id: 'f9', title: 'x' }]));

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0]).toMatchObject({
      thumbnailUrl: '',
      likeCount: 0,
      bookmarkCount: 0,
      viewCount: 0,
    });
  });

  it('the signed-out list queries only published rows', async () => {
    await callRoute(GET, { request: makeRequest(url()) });

    expect(argsOf(queriesFor(supabase, 'v_portfolios')[0], 'eq')).toContainEqual([
      'status',
      'published',
    ]);
  });

  it('can browse another user gallery by userId', async () => {
    await callRoute(GET, { request: makeRequest(url('?userId=u2')) });

    const eqs = argsOf(queriesFor(supabase, 'v_portfolios')[0], 'eq');
    expect(eqs).toContainEqual(['user_id', 'u2']);
    expect(eqs).toContainEqual(['status', 'published']);
  });

  it('answers 401 for mine=1 while signed out', async () => {
    const { status } = await callRoute(GET, { request: makeRequest(url('?mine=1')) });

    expect(status).toBe(401);
  });

  it('mine=1 queries my own rows including drafts', async () => {
    supabase = listStub([ROW], { user: { id: 'u1' } });
    setSupabase(supabase);

    await callRoute(GET, { request: makeRequest(url('?mine=1')) });

    const eqs = argsOf(queriesFor(supabase, 'v_portfolios')[0], 'eq');
    expect(eqs).toContainEqual(['user_id', 'u1']);
    expect(eqs).not.toContainEqual(['status', 'published']);
  });

  it('can filter mine=1 down to drafts with status', async () => {
    supabase = listStub([ROW], { user: { id: 'u1' } });
    setSupabase(supabase);

    await callRoute(GET, { request: makeRequest(url('?mine=1&status=draft')) });

    expect(argsOf(queriesFor(supabase, 'v_portfolios')[0], 'eq')).toContainEqual([
      'status',
      'draft',
    ]);
  });

  it('answers 400 for an unknown status', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url('?status=zzz')) });

    expect(status).toBe(400);
    expect(body.error.message).toContain('status');
  });

  it('answers 400 for an unknown category', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url('?category=vr')) });

    expect(status).toBe(400);
    expect(body.error.message).toContain('category');
  });

  it.each(['web', 'app'])('filters by category=%s', async (category) => {
    await callRoute(GET, { request: makeRequest(url(`?category=${category}`)) });

    expect(argsOf(queriesFor(supabase, 'v_portfolios')[0], 'eq')).toContainEqual([
      'category',
      category,
    ]);
  });

  it('sorts by latest by default', async () => {
    await callRoute(GET, { request: makeRequest(url()) });

    expect(argsOf(queriesFor(supabase, 'v_portfolios')[0], 'order')[0]).toEqual([
      'created_at',
      { ascending: false, nullsFirst: false },
    ]);
  });

  it.each([
    ['popular', 'like_count'],
    ['views', 'view_count'],
    ['bookmarks', 'bookmark_count'],
  ])('sort=%s orders by %s', async (sort, column) => {
    await callRoute(GET, { request: makeRequest(url(`?sort=${sort}`)) });

    expect(argsOf(queriesFor(supabase, 'v_portfolios')[0], 'order')[0]).toEqual([
      column,
      { ascending: false, nullsFirst: false },
    ]);
  });

  it('answers 400 for an unknown sort', async () => {
    const { status } = await callRoute(GET, { request: makeRequest(url('?sort=zzz')) });

    expect(status).toBe(400);
  });

  it('can fetch specific portfolios by ids', async () => {
    await callRoute(GET, { request: makeRequest(url('?ids=f1, f2 ,')) });

    expect(argsOf(queriesFor(supabase, 'v_portfolios')[0], 'in')[0]).toEqual(['id', ['f1', 'f2']]);
  });

  it('returns an empty list without querying when ids is blank', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url('?ids=,,')) });

    expect(body).toEqual({ items: [], total: 0, page: 1, pageSize: 20 });
  });

  it('computes the page range', async () => {
    await callRoute(GET, { request: makeRequest(url('?page=2&pageSize=9')) });

    expect(argsOf(queriesFor(supabase, 'v_portfolios')[0], 'range')[0]).toEqual([9, 17]);
  });

  it('propagates a DB error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setSupabase(createSupabaseStub({ tables: { v_portfolios: { data: null, error: { code: 'X' } } } }));

    const { status } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(500);
    spy.mockRestore();
  });

  it('returns an empty list when data is null', async () => {
    setSupabase(
      createSupabaseStub({ tables: { v_portfolios: { data: null, error: null, count: null } } })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body).toMatchObject({ items: [], total: 0 });
  });
});

describe('POST /api/portfolios', () => {
  const writeStub = () =>
    createSupabaseStub({ user: { id: 'u1' }, tables: { portfolios: { data: ROW, error: null } } });

  beforeEach(() => {
    supabase = writeStub();
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(POST, { request: makeRequest(url(), { body: {} }) });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(POST, { request: brokenJsonRequest(url()) });

    expect(status).toBe(400);
  });

  it('answers 400 for an unknown category', async () => {
    const { status } = await callRoute(POST, {
      request: makeRequest(url(), { body: { category: 'vr' } }),
    });

    expect(status).toBe(400);
  });

  it('answers 400 for an unknown status', async () => {
    const { status } = await callRoute(POST, {
      request: makeRequest(url(), { body: { status: 'zzz' } }),
    });

    expect(status).toBe(400);
  });

  it('stores the row with defaults filled in', async () => {
    await callRoute(POST, { request: makeRequest(url(), { body: {} }) });

    expect(argsOf(queriesFor(supabase, 'portfolios')[0], 'insert')[0][0]).toEqual({
      user_id: 'u1',
      title: '제목 없음',
      category: null,
      thumbnail_url: null,
      description: null,
      content: [],
      bg_color: '#F4FCFE',
      gap_px: 16,
      status: 'draft',
    });
  });

  it('trims whitespace around the title', async () => {
    await callRoute(POST, { request: makeRequest(url(), { body: { title: '  내 작업  ' } }) });

    expect(argsOf(queriesFor(supabase, 'portfolios')[0], 'insert')[0][0].title).toBe('내 작업');
  });

  it('stores the given values as-is', async () => {
    await callRoute(POST, {
      request: makeRequest(url(), {
        body: {
          title: '작업',
          category: 'app',
          thumbnailUrl: 'https://cdn/x.png',
          description: '설명',
          content: [{ type: 'text', html: '<p>hi</p>' }],
          bgColor: '#FFFFFF',
          gapPx: 24,
          status: 'published',
        },
      }),
    });

    expect(argsOf(queriesFor(supabase, 'portfolios')[0], 'insert')[0][0]).toMatchObject({
      category: 'app',
      bg_color: '#FFFFFF',
      gap_px: 24,
      status: 'published',
      content: [{ type: 'text', html: '<p>hi</p>' }],
    });
  });

  it('answers 400 when content is not an array', async () => {
    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { content: 'nope' } }),
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('content 는 블록 배열이어야 합니다.');
  });

  it('answers 400 for a block type outside the allow list', async () => {
    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { content: [{ type: 'audio' }] } }),
    });

    expect(status).toBe(400);
    expect(body.error.message).toContain('블록 type');
  });

  it('answers 400 for a block with no type', async () => {
    const { status } = await callRoute(POST, {
      request: makeRequest(url(), { body: { content: [{}] } }),
    });

    expect(status).toBe(400);
  });

  it.each(['image', 'video', 'text', 'code'])('a %s block is allowed', async (type) => {
    const { status } = await callRoute(POST, {
      request: makeRequest(url(), { body: { content: [{ type }] } }),
    });

    expect(status).toBe(200);
  });

  it('accepts 15 image blocks', async () => {
    const content = Array.from({ length: 15 }, () => ({ type: 'image' }));

    const { status } = await callRoute(POST, { request: makeRequest(url(), { body: { content } }) });

    expect(status).toBe(200);
  });

  it('answers 400 at 16 image blocks', async () => {
    const content = Array.from({ length: 16 }, () => ({ type: 'image' }));

    const { status, body } = await callRoute(POST, {
      request: makeRequest(url(), { body: { content } }),
    });

    expect(status).toBe(400);
    expect(body.error.message).toContain('15장');
  });

  it('returns a detail with the author fields blank', async () => {
    const { status, body } = await callRoute(POST, { request: makeRequest(url(), { body: {} }) });

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: 'f1',
      authorName: null,
      likeCount: 0,
      bookmarkCount: 0,
      bgColor: '#F4FCFE',
      gapPx: 16,
    });
  });
});

describe('DELETE /api/portfolios', () => {
  beforeEach(() => {
    supabase = createSupabaseStub({
      user: { id: 'u1' },
      tables: { portfolios: { data: [{ id: 'f1' }], error: null } },
    });
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: ['f1'] } }),
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(DELETE, { request: brokenJsonRequest(url()) });

    expect(status).toBe(400);
  });

  it('answers 400 when ids is not an array', async () => {
    const { status } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: 'f1' } }),
    });

    expect(status).toBe(400);
  });

  it('answers 400 when ids is empty', async () => {
    const { status } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: [] } }),
    });

    expect(status).toBe(400);
  });

  it('deletes only my own portfolios and returns the count', async () => {
    const { body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: ['f1'] } }),
    });

    expect(body).toEqual({ deleted: 1 });
    expect(argsOf(queriesFor(supabase, 'portfolios')[0], 'eq')[0]).toEqual(['user_id', 'u1']);
  });

  it('answers 0 when the result is null', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { portfolios: { data: null, error: null } } })
    );

    const { body } = await callRoute(DELETE, {
      request: makeRequest(url(), { body: { ids: ['f1'] } }),
    });

    expect(body).toEqual({ deleted: 0 });
  });
});

describe('GET /api/portfolios/:id', () => {
  it('a published portfolio is visible while signed out', async () => {
    setSupabase(createSupabaseStub({ tables: { v_portfolios: { data: ROW, error: null } } }));

    const { status, body } = await callRoute(GET_DETAIL, { params: { id: 'f1' } });

    expect(status).toBe(200);
    expect(body).toMatchObject({
      id: 'f1',
      content: [{ type: 'image', url: 'https://cdn/1.png' }],
      bgColor: '#F4FCFE',
      gapPx: 16,
    });
  });

  it('defaults missing content to an empty array', async () => {
    setSupabase(
      createSupabaseStub({
        tables: { v_portfolios: { data: { ...ROW, content: null }, error: null } },
      })
    );

    const { body } = await callRoute(GET_DETAIL, { params: { id: 'f1' } });

    expect(body.content).toEqual([]);
  });

  it('answers 404 for a missing portfolio', async () => {
    setSupabase(createSupabaseStub({ tables: { v_portfolios: { data: null, error: null } } }));

    const { status, body } = await callRoute(GET_DETAIL, { params: { id: 'nope' } });

    expect(status).toBe(404);
    expect(body.error.message).toBe('포트폴리오를 찾을 수 없습니다.');
  });

  it('hides a draft owned by someone else behind a 404', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { v_portfolios: { data: { ...ROW, status: 'draft', user_id: 'u2' }, error: null } },
      })
    );

    const { status } = await callRoute(GET_DETAIL, { params: { id: 'f1' } });

    expect(status).toBe(404);
  });

  it('a draft is 404 for signed-out visitors too', async () => {
    setSupabase(
      createSupabaseStub({
        tables: { v_portfolios: { data: { ...ROW, status: 'draft' }, error: null } },
      })
    );

    const { status } = await callRoute(GET_DETAIL, { params: { id: 'f1' } });

    expect(status).toBe(404);
  });

  it('my own draft is visible', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u2' },
        tables: { v_portfolios: { data: { ...ROW, status: 'draft', user_id: 'u2' }, error: null } },
      })
    );

    const { status, body } = await callRoute(GET_DETAIL, { params: { id: 'f1' } });

    expect(status).toBe(200);
    expect(body.status).toBe('draft');
  });
});

describe('PATCH /api/portfolios/:id', () => {
  const stub = () =>
    createSupabaseStub({ user: { id: 'u1' }, tables: { portfolios: { data: ROW, error: null } } });

  beforeEach(() => {
    supabase = stub();
    setSupabase(supabase);
  });

  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { title: 'x' } }),
      params: { id: 'f1' },
    });

    expect(status).toBe(401);
  });

  it('answers 400 for a broken JSON body', async () => {
    const { status } = await callRoute(PATCH_DETAIL, {
      request: brokenJsonRequest(url()),
      params: { id: 'f1' },
    });

    expect(status).toBe(400);
  });

  it('answers 400 when there is nothing to update', async () => {
    const { status, body } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { nope: 1 } }),
      params: { id: 'f1' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe('수정할 내용이 없습니다.');
  });

  it('a blank title falls back to the placeholder title', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { title: '  ' } }),
      params: { id: 'f1' },
    });

    expect(argsOf(queriesFor(supabase, 'portfolios')[0], 'update')[0]).toEqual([
      { title: '제목 없음' },
    ]);
  });

  it('can update description, thumbnail, background and gap independently', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), {
        body: { description: '설명', thumbnailUrl: 'https://cdn/y.png', bgColor: '#FFF', gapPx: 8 },
      }),
      params: { id: 'f1' },
    });

    expect(argsOf(queriesFor(supabase, 'portfolios')[0], 'update')[0]).toEqual([
      { description: '설명', thumbnail_url: 'https://cdn/y.png', bg_color: '#FFF', gap_px: 8 },
    ]);
  });

  it('content is validated on update too', async () => {
    const { status } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { content: [{ type: 'audio' }] } }),
      params: { id: 'f1' },
    });

    expect(status).toBe(400);
  });

  it('can clear category to null', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { category: null } }),
      params: { id: 'f1' },
    });

    expect(argsOf(queriesFor(supabase, 'portfolios')[0], 'update')[0]).toEqual([
      { category: null },
    ]);
  });

  it('answers 400 for an unknown category', async () => {
    const { status } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { category: 'vr' } }),
      params: { id: 'f1' },
    });

    expect(status).toBe(400);
  });

  it('answers 400 when status is present but empty', async () => {
    const { status } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { status: null } }),
      params: { id: 'f1' },
    });

    expect(status).toBe(400);
  });

  it('can publish by setting status to published', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { status: 'published' } }),
      params: { id: 'f1' },
    });

    expect(argsOf(queriesFor(supabase, 'portfolios')[0], 'update')[0]).toEqual([
      { status: 'published' },
    ]);
  });

  it('updates only my own portfolio', async () => {
    await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { title: 'x' } }),
      params: { id: 'f1' },
    });

    expect(argsOf(queriesFor(supabase, 'portfolios')[0], 'eq')).toEqual([
      ['id', 'f1'],
      ['user_id', 'u1'],
    ]);
  });

  it('answers 404 when updating a portfolio owned by someone else', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { portfolios: { data: null, error: null } } })
    );

    const { status, body } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { title: 'x' } }),
      params: { id: 'other' },
    });

    expect(status).toBe(404);
    expect(body.error.message).toBe('포트폴리오를 찾을 수 없습니다.');
  });
});

describe('DELETE /api/portfolios/:id', () => {
  it('answers 401 when signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(DELETE_DETAIL, { params: { id: 'f1' } });

    expect(status).toBe(401);
  });

  it('deletes my own portfolio and reports one row', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { portfolios: { data: [{ id: 'f1' }], error: null } },
      })
    );

    const { status, body } = await callRoute(DELETE_DETAIL, { params: { id: 'f1' } });

    expect(status).toBe(200);
    expect(body).toEqual({ deleted: 1 });
  });

  it('answers 403 when nothing was deleted', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { portfolios: { data: [], error: null } } })
    );

    const { status, body } = await callRoute(DELETE_DETAIL, { params: { id: 'other' } });

    expect(status).toBe(403);
    expect(body.error.message).toBe('본인 포트폴리오만 삭제할 수 있습니다.');
  });

  it('answers 403 when the result is null', async () => {
    setSupabase(
      createSupabaseStub({ user: { id: 'u1' }, tables: { portfolios: { data: null, error: null } } })
    );

    const { status } = await callRoute(DELETE_DETAIL, { params: { id: 'other' } });

    expect(status).toBe(403);
  });
});

describe('portfolio collaborators', () => {
  const LINKS = [
    { portfolio_id: 'f1', user_id: 'u9', sort_order: 0 },
    { portfolio_id: 'f1', user_id: 'u8', sort_order: 1 },
  ];
  const MEMBERS = [
    { id: 'u9', name: '김공동', avatar_url: 'https://cdn/9.png' },
    { id: 'u8', name: '박공동', avatar_url: null },
  ];

  const withLinks = (extra = {}) =>
    createSupabaseStub({
      user: { id: 'u1' },
      tables: {
        v_portfolios: { data: [ROW], error: null, count: 1 },
        portfolios: { data: ROW, error: null },
        portfolio_collaborators: { data: LINKS, error: null },
        profiles: { data: MEMBERS, error: null },
      },
      rpc: { save_portfolio_collaborators: { data: null, error: null } },
      ...extra,
    });

  it('builds the collaborator list in saved order', async () => {
    setSupabase(withLinks());

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0].collaborators).toEqual([
      { id: 'u9', name: '김공동', avatarUrl: 'https://cdn/9.png' },
      { id: 'u8', name: '박공동', avatarUrl: null },
    ]);
  });

  it('skips a link whose member row is gone', async () => {
    setSupabase(
      withLinks({
        tables: {
          v_portfolios: { data: [ROW], error: null, count: 1 },
          portfolio_collaborators: { data: LINKS, error: null },
          profiles: { data: [MEMBERS[0]], error: null },
        },
      })
    );

    const { body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(body.items[0].collaborators.map((c) => c.id)).toEqual(['u9']);
  });

  it('saves the list when the patch carries nothing else', async () => {
    const supabaseWithLinks = withLinks();
    setSupabase(supabaseWithLinks);

    const { status } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { collaboratorIds: ['u9'] } }),
      params: { id: 'f1' },
    });

    expect(status).toBe(200);
    expect(supabaseWithLinks.rpcCalls[0]).toEqual({
      name: 'save_portfolio_collaborators',
      args: { p_portfolio_id: 'f1', p_user_ids: ['u9'] },
    });
  });

  it('answers 404 when the collaborator-only patch is for someone else portfolio', async () => {
    setSupabase(
      createSupabaseStub({
        user: { id: 'u1' },
        tables: { portfolios: { data: null, error: null } },
      })
    );

    const { status } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { collaboratorIds: ['u9'] } }),
      params: { id: 'f1' },
    });

    expect(status).toBe(404);
  });

  it.each([
    ['nope', 'collaboratorIds 는 배열이어야 합니다.'],
    [[''], 'collaboratorIds 는 사용자 id 문자열 배열이어야 합니다.'],
    [[1, 2], 'collaboratorIds 는 사용자 id 문자열 배열이어야 합니다.'],
  ])('answers 400 for %p', async (collaboratorIds, message) => {
    setSupabase(withLinks());

    const { status, body } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), { body: { collaboratorIds } }),
      params: { id: 'f1' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toBe(message);
  });

  it('answers 400 beyond twenty collaborators', async () => {
    setSupabase(withLinks());

    const { status, body } = await callRoute(PATCH_DETAIL, {
      request: makeRequest(url(), {
        body: { collaboratorIds: Array.from({ length: 21 }, (_, i) => `u${i}`) },
      }),
      params: { id: 'f1' },
    });

    expect(status).toBe(400);
    expect(body.error.message).toContain('20명');
  });
});

describe('portfolio sorting and search', () => {
  it.each([
    ['oldest', 'created_at', true],
    ['title', 'title', true],
  ])('sort=%s orders by %s', async (sort, column, ascending) => {
    await callRoute(GET, { request: makeRequest(url(`?sort=${sort}`)) });

    expect(argsOf(queriesFor(supabase, 'v_portfolios')[0], 'order')[0]).toEqual([
      column,
      { ascending, nullsFirst: false },
    ]);
  });

  it('searches the title only', async () => {
    await callRoute(GET, { request: makeRequest(url('?q=%20협업%20')) });

    expect(argsOf(queriesFor(supabase, 'v_portfolios')[0], 'ilike')[0]).toEqual([
      'title',
      '%협업%',
    ]);
  });

  it('skips the search when q is blank', async () => {
    await callRoute(GET, { request: makeRequest(url('?q=%20%20')) });

    expect(argsOf(queriesFor(supabase, 'v_portfolios')[0], 'ilike')).toEqual([]);
  });
});

describe('GET /api/portfolios?scrapped=1', () => {
  const MARKS = [
    { target_id: 'f1', created_at: '2026-08-03T00:00:00Z' },
    { target_id: 'f2', created_at: '2026-08-01T00:00:00Z' },
  ];
  const ROWS = [
    { ...ROW, id: 'f1', title: '나중에 담은 것' },
    { ...ROW, id: 'f2', title: '가장 먼저 담은 것' },
  ];

  const scrapStub = (marks = MARKS, rows = ROWS) =>
    createSupabaseStub({
      user: { id: 'u1' },
      tables: {
        reactions: { data: marks, error: null },
        v_portfolios: { data: rows, error: null },
      },
    });

  it('answers 401 while signed out', async () => {
    setSupabase(createSupabaseStub());

    const { status } = await callRoute(GET, { request: makeRequest(url('?scrapped=1')) });

    expect(status).toBe(401);
  });

  it('puts the most recently scrapped first', async () => {
    setSupabase(scrapStub());

    const { body } = await callRoute(GET, { request: makeRequest(url('?scrapped=1')) });

    expect(body.items.map((p) => p.id)).toEqual(['f1', 'f2']);
    expect(body.total).toBe(2);
  });

  it('sort=oldest flips it to the first one scrapped', async () => {
    setSupabase(scrapStub());

    const { body } = await callRoute(GET, { request: makeRequest(url('?scrapped=1&sort=oldest')) });

    expect(body.items.map((p) => p.id)).toEqual(['f2', 'f1']);
  });

  it('sort=title orders by name', async () => {
    setSupabase(scrapStub());

    const { body } = await callRoute(GET, { request: makeRequest(url('?scrapped=1&sort=title')) });

    expect(body.items.map((p) => p.title)).toEqual(['가장 먼저 담은 것', '나중에 담은 것']);
  });

  it('answers 400 for a sort the scrap list does not have', async () => {
    setSupabase(scrapStub());

    const { status, body } = await callRoute(GET, {
      request: makeRequest(url('?scrapped=1&sort=popular')),
    });

    expect(status).toBe(400);
    expect(body.error.message).toContain('스크랩 목록');
  });

  it('pages the sorted list', async () => {
    setSupabase(scrapStub());

    const { body } = await callRoute(GET, {
      request: makeRequest(url('?scrapped=1&page=2&pageSize=1')),
    });

    expect(body).toMatchObject({ total: 2, page: 2, pageSize: 1 });
    expect(body.items.map((p) => p.id)).toEqual(['f2']);
  });

  it('answers an empty list when nothing is scrapped', async () => {
    setSupabase(scrapStub([], []));

    const { body } = await callRoute(GET, { request: makeRequest(url('?scrapped=1')) });

    expect(body).toEqual({ items: [], total: 0, page: 1, pageSize: 20 });
  });

  it('leaves out a portfolio that is no longer visible', async () => {
    setSupabase(scrapStub(MARKS, [ROWS[1]]));

    const { body } = await callRoute(GET, { request: makeRequest(url('?scrapped=1')) });

    expect(body.items.map((p) => p.id)).toEqual(['f2']);
    expect(body.total).toBe(1);
  });
});

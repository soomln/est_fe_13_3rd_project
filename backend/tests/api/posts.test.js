import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockApiFetch } from '../helpers/routeHarness';

vi.mock('../../lib/api/_fetch', () => ({ apiFetch: vi.fn() }));

const { apiFetch } = await import('../../lib/api/_fetch');
const {
  createPost,
  deletePost,
  deletePosts,
  getMyPostReactions,
  getPost,
  incrementPostView,
  listMyPosts,
  listMyScrappedPosts,
  listPosts,
  removePostScraps,
  removeScraps,
  togglePostLike,
  togglePostScrap,
  updatePost,
} = await import('../../lib/api/posts');

beforeEach(() => {
  apiFetch.mockReset();
});

describe('listPosts', () => {
  it('reviews default to 10 per page sorted by latest', async () => {
    mockApiFetch(apiFetch, { 'GET /api/posts': { items: [] } });

    await listPosts();

    expect(apiFetch.mock.calls[0][1].query).toEqual({
      type: undefined,
      companyId: undefined,
      companySlug: undefined,
      q: undefined,
      sort: 'latest',
      page: 1,
      pageSize: 10,
    });
  });

  it('qbank posts also list 10 per page', async () => {
    mockApiFetch(apiFetch, { 'GET /api/posts': { items: [] } });

    await listPosts({ type: 'qbank' });

    expect(apiFetch.mock.calls[0][1].query.pageSize).toBe(10);
  });

  it('uses an explicit pageSize when given', async () => {
    mockApiFetch(apiFetch, { 'GET /api/posts': { items: [] } });

    await listPosts({ type: 'qbank', pageSize: 4 });

    expect(apiFetch.mock.calls[0][1].query.pageSize).toBe(4);
  });

  it('forwards company and keyword filters', async () => {
    mockApiFetch(apiFetch, { 'GET /api/posts': { items: [] } });

    await listPosts({ companyId: 'c1', companySlug: 'naver', q: '면접', sort: 'popular', page: 2 });

    expect(apiFetch.mock.calls[0][1].query).toMatchObject({
      companyId: 'c1',
      companySlug: 'naver',
      q: '면접',
      sort: 'popular',
      page: 2,
    });
  });
});

describe('listMyPosts', () => {
  it('requests 4 per page with mine=1', async () => {
    mockApiFetch(apiFetch, { 'GET /api/posts': { items: [] } });

    await listMyPosts();

    expect(apiFetch.mock.calls[0][1].query).toEqual({
      mine: 1,
      type: undefined,
      sort: 'latest',
      page: 1,
      pageSize: 4,
    });
  });
});

describe('read, create, update and delete', () => {
  it('encodes the id for the detail request', async () => {
    mockApiFetch(apiFetch, { 'GET /api/posts/p%201': { id: 'p 1' } });

    await getPost('p 1');

    expect(apiFetch.mock.calls[0][0]).toBe('/api/posts/p%201');
  });

  it('can be created with no input', async () => {
    mockApiFetch(apiFetch, { 'POST /api/posts': { id: 'p1' } });

    await createPost();

    expect(apiFetch).toHaveBeenCalledWith('/api/posts', { method: 'POST', body: {} });
  });

  it('updates with PATCH', async () => {
    mockApiFetch(apiFetch, { 'PATCH /api/posts/p1': { id: 'p1' } });

    await updatePost('p1', { title: '수정' });

    expect(apiFetch.mock.calls[0][1]).toEqual({ method: 'PATCH', body: { title: '수정' } });
  });

  it('deletes a single item with DELETE', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/posts/p1': { deleted: 1 } });

    await deletePost('p1');

    expect(apiFetch).toHaveBeenCalledWith('/api/posts/p1', { method: 'DELETE' });
  });

  it('returns how many were deleted in bulk', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/posts': { deleted: 2 } });

    await expect(deletePosts(['p1', 'p2'])).resolves.toBe(2);
  });

  it('skips the request when there is nothing to delete', async () => {
    await expect(deletePosts([])).resolves.toBe(0);
    await expect(deletePosts()).resolves.toBe(0);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('increments the view count through the views route', async () => {
    mockApiFetch(apiFetch, { 'POST /api/views': { ok: true } });

    await incrementPostView('p1');

    expect(apiFetch.mock.calls[0][1].body).toEqual({ targetType: 'post', targetId: 'p1' });
  });
});

describe('reactions', () => {
  it('toggles helpful with like', async () => {
    mockApiFetch(apiFetch, { 'POST /api/reactions': { active: true } });

    await togglePostLike('p1');

    expect(apiFetch.mock.calls[0][1].body).toEqual({
      targetType: 'post',
      targetId: 'p1',
      kind: 'like',
    });
  });

  it('toggles scrap with bookmark', async () => {
    mockApiFetch(apiFetch, { 'POST /api/reactions': { active: true } });

    await togglePostScrap('p1');

    expect(apiFetch.mock.calls[0][1].body.kind).toBe('bookmark');
  });

  it('fetches likes and scraps together', async () => {
    apiFetch.mockResolvedValue({ targetIds: ['p1'] });

    const result = await getMyPostReactions(['p1']);

    expect([...result.liked]).toEqual(['p1']);
    expect([...result.scrapped]).toEqual(['p1']);
  });

  it('returns how many scraps were removed', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/reactions': { deleted: 1 } });

    await expect(removePostScraps(['p1'])).resolves.toBe(1);
  });

  it('removeScraps is an alias of removePostScraps', () => {
    expect(removeScraps).toBe(removePostScraps);
  });
});

describe('listMyScrappedPosts', () => {
  it('makes no further request when nothing is scrapped', async () => {
    mockApiFetch(apiFetch, { 'GET /api/reactions': { targetIds: [] } });

    await expect(listMyScrappedPosts()).resolves.toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: 10,
    });
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it('keeps the scrapped order', async () => {
    mockApiFetch(apiFetch, {
      'GET /api/reactions': { targetIds: ['c', 'a', 'b'] },
      'GET /api/posts': { items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
    });

    const result = await listMyScrappedPosts();

    expect(result.items.map((i) => i.id)).toEqual(['c', 'a', 'b']);
    expect(result.total).toBe(3);
  });

  it('fetches everything then slices the page on the client', async () => {
    mockApiFetch(apiFetch, {
      'GET /api/reactions': { targetIds: ['a', 'b', 'c'] },
      'GET /api/posts': { items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
    });

    const result = await listMyScrappedPosts({ page: 2, pageSize: 2 });

    expect(apiFetch.mock.calls[1][1].query.pageSize).toBe(50);
    expect(result.items.map((i) => i.id)).toEqual(['c']);
    expect(result.total).toBe(3);
  });

  it('can filter by type as well', async () => {
    mockApiFetch(apiFetch, {
      'GET /api/reactions': { targetIds: ['a'] },
      'GET /api/posts': { items: [{ id: 'a' }] },
    });

    await listMyScrappedPosts({ type: 'qbank' });

    expect(apiFetch.mock.calls[1][1].query).toEqual({ ids: 'a', type: 'qbank', pageSize: 50 });
  });
});

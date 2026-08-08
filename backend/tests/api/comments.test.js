import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockApiFetch } from '../helpers/routeHarness';

vi.mock('../../lib/api/_fetch', () => ({ apiFetch: vi.fn() }));

const { apiFetch } = await import('../../lib/api/_fetch');
const {
  createComment,
  deleteComment,
  getMyCommentLikes,
  listComments,
  toggleCommentLike,
  updateComment,
} = await import('../../lib/api/comments');

beforeEach(() => {
  apiFetch.mockReset();
});

describe('listComments', () => {
  it('defaults to 20 per page sorted by latest', async () => {
    mockApiFetch(apiFetch, { 'GET /api/posts/p1/comments': { items: [] } });

    await listComments('p1');

    expect(apiFetch).toHaveBeenCalledWith('/api/posts/p1/comments', {
      query: { sort: 'latest', page: 1, pageSize: 20 },
    });
  });

  it('accepts popular sort and a page', async () => {
    mockApiFetch(apiFetch, { 'GET /api/posts/p1/comments': { items: [] } });

    await listComments('p1', { sort: 'popular', page: 2, pageSize: 5 });

    expect(apiFetch.mock.calls[0][1].query).toEqual({ sort: 'popular', page: 2, pageSize: 5 });
  });

  it('encodes the post id', async () => {
    mockApiFetch(apiFetch, { 'GET /api/posts/p%201/comments': { items: [] } });

    await listComments('p 1');

    expect(apiFetch.mock.calls[0][0]).toBe('/api/posts/p%201/comments');
  });
});

describe('createComment', () => {
  it('posts only the body', async () => {
    mockApiFetch(apiFetch, { 'POST /api/posts/p1/comments': { id: 'c1' } });

    await createComment('p1', '좋은 후기네요');

    expect(apiFetch).toHaveBeenCalledWith('/api/posts/p1/comments', {
      method: 'POST',
      body: { body: '좋은 후기네요' },
    });
  });
});

describe('updateComment', () => {
  it('patches through the comment path', async () => {
    mockApiFetch(apiFetch, { 'PATCH /api/comments/c1': { id: 'c1' } });

    await updateComment('c1', '수정했어요');

    expect(apiFetch).toHaveBeenCalledWith('/api/comments/c1', {
      method: 'PATCH',
      body: { body: '수정했어요' },
    });
  });
});

describe('deleteComment', () => {
  it('deletes through the comment path', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/comments/c1': { deleted: 1 } });

    await deleteComment('c1');

    expect(apiFetch).toHaveBeenCalledWith('/api/comments/c1', { method: 'DELETE' });
  });
});

describe('comment likes', () => {
  it('toggles with comment and like', async () => {
    mockApiFetch(apiFetch, { 'POST /api/reactions': { active: false } });

    await expect(toggleCommentLike('c1')).resolves.toBe(false);
    expect(apiFetch.mock.calls[0][1].body).toEqual({
      targetType: 'comment',
      targetId: 'c1',
      kind: 'like',
    });
  });

  it('returns liked comment ids as a Set', async () => {
    mockApiFetch(apiFetch, { 'GET /api/reactions': { targetIds: ['c1'] } });

    const result = await getMyCommentLikes(['c1', 'c2']);

    expect([...result]).toEqual(['c1']);
  });
});

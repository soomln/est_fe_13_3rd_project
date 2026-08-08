import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockApiFetch } from '../helpers/routeHarness';

vi.mock('../../lib/api/_fetch', () => ({ apiFetch: vi.fn() }));

const { apiFetch } = await import('../../lib/api/_fetch');
const {
  getMyReactionIds,
  hasMyReaction,
  listMyReactionTargetIds,
  removeReactions,
  toggleReaction,
} = await import('../../lib/api/reactions');

beforeEach(() => {
  apiFetch.mockReset();
});

describe('toggleReaction', () => {
  it('toggles with a POST and unwraps active', async () => {
    mockApiFetch(apiFetch, { 'POST /api/reactions': { active: true } });

    await expect(toggleReaction('post', 'like', 'p1')).resolves.toBe(true);
    expect(apiFetch).toHaveBeenCalledWith('/api/reactions', {
      method: 'POST',
      body: { targetType: 'post', targetId: 'p1', kind: 'like' },
    });
  });

  it('returns false when the reaction is cancelled', async () => {
    mockApiFetch(apiFetch, { 'POST /api/reactions': { active: false } });

    await expect(toggleReaction('company', 'bookmark', 'c1')).resolves.toBe(false);
  });
});

describe('getMyReactionIds', () => {
  it('returns the id list as a Set', async () => {
    mockApiFetch(apiFetch, { 'GET /api/reactions': { targetIds: ['a', 'b'] } });

    const result = await getMyReactionIds('post', 'like', ['a', 'b', 'c']);

    expect(result).toBeInstanceOf(Set);
    expect([...result]).toEqual(['a', 'b']);
    expect(apiFetch).toHaveBeenCalledWith('/api/reactions', {
      query: { targetType: 'post', kind: 'like', targetIds: 'a,b,c' },
    });
  });

  it('skips the request for an empty array', async () => {
    await expect(getMyReactionIds('post', 'like', [])).resolves.toEqual(new Set());
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('skips the request when the argument is undefined', async () => {
    await expect(getMyReactionIds('post', 'like')).resolves.toEqual(new Set());
    expect(apiFetch).not.toHaveBeenCalled();
  });
});

describe('hasMyReaction', () => {
  it('is true for a target I reacted to', async () => {
    mockApiFetch(apiFetch, { 'GET /api/reactions': { targetIds: ['p1'] } });

    await expect(hasMyReaction('post', 'like', 'p1')).resolves.toBe(true);
  });

  it('is false for a target I did not react to', async () => {
    mockApiFetch(apiFetch, { 'GET /api/reactions': { targetIds: [] } });

    await expect(hasMyReaction('post', 'like', 'p1')).resolves.toBe(false);
  });
});

describe('listMyReactionTargetIds', () => {
  it('fetches every id without a filter', async () => {
    mockApiFetch(apiFetch, { 'GET /api/reactions': { targetIds: ['a', 'b'] } });

    await expect(listMyReactionTargetIds('company', 'bookmark')).resolves.toEqual(['a', 'b']);
    expect(apiFetch).toHaveBeenCalledWith('/api/reactions', {
      query: { targetType: 'company', kind: 'bookmark' },
    });
  });
});

describe('removeReactions', () => {
  it('removes with a DELETE and returns the count', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/reactions': { deleted: 2 } });

    await expect(removeReactions('post', 'bookmark', ['a', 'b'])).resolves.toBe(2);
    expect(apiFetch).toHaveBeenCalledWith('/api/reactions', {
      method: 'DELETE',
      body: { targetType: 'post', kind: 'bookmark', targetIds: ['a', 'b'] },
    });
  });

  it('returns 0 without a request for an empty array', async () => {
    await expect(removeReactions('post', 'bookmark', [])).resolves.toBe(0);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('returns 0 when the argument is undefined', async () => {
    await expect(removeReactions('post', 'bookmark')).resolves.toBe(0);
    expect(apiFetch).not.toHaveBeenCalled();
  });
});

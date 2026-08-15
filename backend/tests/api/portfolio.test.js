import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createStorageStub } from '../helpers/supabase';
import { mockApiFetch } from '../helpers/routeHarness';

vi.mock('../../lib/api/_fetch', () => ({ apiFetch: vi.fn() }));
vi.mock('../../lib/supabase/client', () => ({ createClient: vi.fn() }));
vi.mock('../../lib/api/auth', () => ({ getCurrentUser: vi.fn() }));

const { apiFetch } = await import('../../lib/api/_fetch');
const { createClient } = await import('../../lib/supabase/client');
const { getCurrentUser } = await import('../../lib/api/auth');
const {
  createPortfolio,
  deletePortfolio,
  deletePortfolios,
  findMemberByEmail,
  setPortfolioCollaborators,
  getMyPortfolioReactions,
  getPortfolio,
  incrementPortfolioView,
  listMyBookmarkedPortfolios,
  listMyPortfolios,
  listPortfolios,
  publishPortfolio,
  removePortfolioBookmarks,
  togglePortfolioBookmark,
  togglePortfolioLike,
  updatePortfolio,
  uploadPortfolioImage,
  uploadPortfolioImages,
} = await import('../../lib/api/portfolio');

const file = ({ type = 'image/png', size = 1024, name = 'shot.PNG' } = {}) => ({
  type,
  size,
  name,
});

let storage;

beforeEach(() => {
  apiFetch.mockReset();
  getCurrentUser.mockResolvedValue({ id: 'u1' });
  storage = createStorageStub();
  createClient.mockReturnValue({ storage });
});

describe('list lookup', () => {
  it('the gallery defaults to 20 per page sorted by latest', async () => {
    mockApiFetch(apiFetch, { 'GET /api/portfolios': { items: [] } });

    await listPortfolios();

    expect(apiFetch).toHaveBeenCalledWith('/api/portfolios', {
      query: {
        category: undefined,
        userId: undefined,
        sort: 'latest',
        page: 1,
        pageSize: 20,
      },
    });
  });

  it('accepts filters and a page', async () => {
    mockApiFetch(apiFetch, { 'GET /api/portfolios': { items: [] } });

    await listPortfolios({ category: 'app', userId: 'u2', sort: 'popular', page: 3, pageSize: 5 });

    expect(apiFetch.mock.calls[0][1].query).toEqual({
      category: 'app',
      userId: 'u2',
      sort: 'popular',
      page: 3,
      pageSize: 5,
    });
  });

  it('requests my portfolios 9 per page with mine=1', async () => {
    mockApiFetch(apiFetch, { 'GET /api/portfolios': { items: [] } });

    await listMyPortfolios();

    expect(apiFetch.mock.calls[0][1].query).toEqual({
      mine: 1,
      status: undefined,
      sort: 'latest',
      page: 1,
      pageSize: 9,
    });
  });

  it('can filter down to my drafts', async () => {
    mockApiFetch(apiFetch, { 'GET /api/portfolios': { items: [] } });

    await listMyPortfolios({ status: 'draft' });

    expect(apiFetch.mock.calls[0][1].query.status).toBe('draft');
  });

  it('encodes the id when requesting the detail', async () => {
    mockApiFetch(apiFetch, { 'GET /api/portfolios/f%201': { id: 'f 1' } });

    await getPortfolio('f 1');

    expect(apiFetch.mock.calls[0][0]).toBe('/api/portfolios/f%201');
  });
});

describe('create, update and delete', () => {
  it('can be created with no input', async () => {
    mockApiFetch(apiFetch, { 'POST /api/portfolios': { id: 'f1' } });

    await createPortfolio();

    expect(apiFetch).toHaveBeenCalledWith('/api/portfolios', { method: 'POST', body: {} });
  });

  it('updates with a PATCH', async () => {
    mockApiFetch(apiFetch, { 'PATCH /api/portfolios/f1': { id: 'f1' } });

    await updatePortfolio('f1', { title: '새 제목' });

    expect(apiFetch).toHaveBeenCalledWith('/api/portfolios/f1', {
      method: 'PATCH',
      body: { title: '새 제목' },
    });
  });

  it('publishing is an update that only changes status', async () => {
    mockApiFetch(apiFetch, { 'PATCH /api/portfolios/f1': { id: 'f1' } });

    await publishPortfolio('f1');

    expect(apiFetch.mock.calls[0][1].body).toEqual({ status: 'published' });
  });

  it('deletes a single item with DELETE', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/portfolios/f1': { deleted: 1 } });

    await deletePortfolio('f1');

    expect(apiFetch).toHaveBeenCalledWith('/api/portfolios/f1', { method: 'DELETE' });
  });

  it('returns how many were deleted in bulk', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/portfolios': { deleted: 3 } });

    await expect(deletePortfolios(['a', 'b', 'c'])).resolves.toBe(3);
  });

  it('skips the request when there is nothing to delete', async () => {
    await expect(deletePortfolios([])).resolves.toBe(0);
    await expect(deletePortfolios()).resolves.toBe(0);
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it('increments the view count through the views route', async () => {
    mockApiFetch(apiFetch, { 'POST /api/views': { ok: true } });

    await incrementPortfolioView('f1');

    expect(apiFetch).toHaveBeenCalledWith('/api/views', {
      method: 'POST',
      body: { targetType: 'portfolio', targetId: 'f1' },
    });
  });
});

describe('reactions', () => {
  it('toggles a like with portfolio and like', async () => {
    mockApiFetch(apiFetch, { 'POST /api/reactions': { active: true } });

    await expect(togglePortfolioLike('f1')).resolves.toBe(true);
    expect(apiFetch.mock.calls[0][1].body).toEqual({
      targetType: 'portfolio',
      targetId: 'f1',
      kind: 'like',
    });
  });

  it('toggles a bookmark with portfolio and bookmark', async () => {
    mockApiFetch(apiFetch, { 'POST /api/reactions': { active: false } });

    await expect(togglePortfolioBookmark('f1')).resolves.toBe(false);
    expect(apiFetch.mock.calls[0][1].body.kind).toBe('bookmark');
  });

  it('fetches likes and bookmarks together', async () => {
    apiFetch.mockResolvedValue({ targetIds: ['f1'] });

    const result = await getMyPortfolioReactions(['f1', 'f2']);

    expect([...result.liked]).toEqual(['f1']);
    expect([...result.bookmarked]).toEqual(['f1']);
    expect(apiFetch).toHaveBeenCalledTimes(2);
  });

  it('removes bookmarks through a reactions DELETE', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/reactions': { deleted: 1 } });

    await expect(removePortfolioBookmarks(['f1'])).resolves.toBe(1);
    expect(apiFetch.mock.calls[0][1].body).toEqual({
      targetType: 'portfolio',
      kind: 'bookmark',
      targetIds: ['f1'],
    });
  });
});

describe('listMyBookmarkedPortfolios', () => {
  it('makes no further request when nothing is scrapped', async () => {
    mockApiFetch(apiFetch, { 'GET /api/reactions': { targetIds: [] } });

    await expect(listMyBookmarkedPortfolios()).resolves.toEqual({
      items: [],
      total: 0,
      page: 1,
      pageSize: 9,
    });
    expect(apiFetch).toHaveBeenCalledTimes(1);
  });

  it('returns items sorted in the scrapped order', async () => {
    mockApiFetch(apiFetch, {
      'GET /api/reactions': { targetIds: ['c', 'a', 'b'] },
      'GET /api/portfolios': { items: [{ id: 'a' }, { id: 'b' }, { id: 'c' }] },
    });

    const result = await listMyBookmarkedPortfolios();

    expect(result.items.map((i) => i.id)).toEqual(['c', 'a', 'b']);
    expect(result.total).toBe(3);
  });

  it('fetches only the ids on the requested page', async () => {
    mockApiFetch(apiFetch, {
      'GET /api/reactions': { targetIds: ['a', 'b', 'c', 'd'] },
      'GET /api/portfolios': { items: [{ id: 'c' }, { id: 'd' }] },
    });

    const result = await listMyBookmarkedPortfolios({ page: 2, pageSize: 2 });

    expect(apiFetch.mock.calls[1][1].query).toEqual({ ids: 'c,d', pageSize: 2 });
    expect(result).toMatchObject({ total: 4, page: 2, pageSize: 2 });
  });
});

describe('uploadPortfolioImage', () => {
  it('rejects with 401 when signed out', async () => {
    getCurrentUser.mockResolvedValue(null);

    await expect(uploadPortfolioImage('f1', file())).rejects.toMatchObject({ status: 401 });
  });

  it('rejects a disallowed file type', async () => {
    await expect(uploadPortfolioImage('f1', file({ type: 'image/svg+xml' }))).rejects.toThrowError(
      'JPG, PNG, WEBP, GIF 이미지만 올릴 수 있습니다.'
    );
  });

  it.each(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])(
    '%s is allowed',
    async (type) => {
      await expect(uploadPortfolioImage('f1', file({ type }))).resolves.toEqual(
        expect.any(String)
      );
    }
  );

  it('rejects a file larger than 5MB', async () => {
    await expect(uploadPortfolioImage('f1', file({ size: 5 * 1024 * 1024 + 1 }))).rejects.toThrowError(
      '이미지는 5MB 이하만 올릴 수 있습니다.'
    );
  });

  it('accepts a file of exactly 5MB', async () => {
    await expect(uploadPortfolioImage('f1', file({ size: 5 * 1024 * 1024 }))).resolves.toEqual(
      expect.any(String)
    );
  });

  it('stores under the user and portfolio folder', async () => {
    await uploadPortfolioImage('f1', file({ name: 'shot.JPEG' }));

    expect(storage.buckets).toEqual(['portfolios', 'portfolios']);
    expect(storage.uploads[0].path).toMatch(/^u1\/f1\/\d+-\d+\.jpeg$/);
  });

  it('falls back to png when there is no extension', async () => {
    await uploadPortfolioImage('f1', file({ name: '' }));

    expect(storage.uploads[0].path).toMatch(/\.png$/);
  });

  it('wraps an upload failure in ApiError', async () => {
    storage = createStorageStub({ uploadError: { message: 'too large' } });
    createClient.mockReturnValue({ storage });

    await expect(uploadPortfolioImage('f1', file())).rejects.toThrowError(
      '이미지 업로드에 실패했습니다: too large'
    );
  });

  it('returns the public url', async () => {
    const url = await uploadPortfolioImage('f1', file());

    expect(url).toContain('https://cdn.test/x.png#u1/f1/');
  });
});

describe('uploadPortfolioImages', () => {
  it('uploads each file in turn and returns the urls', async () => {
    const urls = await uploadPortfolioImages('f1', [file(), file()]);

    expect(urls).toHaveLength(2);
    expect(storage.uploads).toHaveLength(2);
  });

  it('returns an empty array when files is missing', async () => {
    await expect(uploadPortfolioImages('f1')).resolves.toEqual([]);
    expect(storage.uploads).toHaveLength(0);
  });

  it('accepts 15 files', async () => {
    const files = Array.from({ length: 15 }, () => file());

    await expect(uploadPortfolioImages('f1', files)).resolves.toHaveLength(15);
  });

  it('rejects 16 files without uploading any', async () => {
    const files = Array.from({ length: 16 }, () => file());

    await expect(uploadPortfolioImages('f1', files)).rejects.toThrowError(
      '이미지는 최대 15장까지 올릴 수 있습니다.'
    );
    expect(storage.uploads).toHaveLength(0);
  });
});

describe('findMemberByEmail', () => {
  it('asks the lookup endpoint with the email', async () => {
    mockApiFetch(apiFetch, {
      'GET /api/members/lookup': { member: { id: 'u2', name: '김프론트', avatarUrl: null } },
    });

    await expect(findMemberByEmail('a@b.com')).resolves.toEqual({
      id: 'u2',
      name: '김프론트',
      avatarUrl: null,
    });
    expect(apiFetch).toHaveBeenCalledWith('/api/members/lookup', { query: { email: 'a@b.com' } });
  });

  it('unwraps a miss into null', async () => {
    mockApiFetch(apiFetch, { 'GET /api/members/lookup': { member: null } });

    await expect(findMemberByEmail('nobody@b.com')).resolves.toBeNull();
  });
});

describe('setPortfolioCollaborators', () => {
  it('patches the portfolio with the id list', async () => {
    mockApiFetch(apiFetch, { 'PATCH /api/portfolios/f1': { id: 'f1', collaborators: [] } });

    await setPortfolioCollaborators('f1', ['u2', 'u3']);

    expect(apiFetch).toHaveBeenCalledWith('/api/portfolios/f1', {
      method: 'PATCH',
      body: { collaboratorIds: ['u2', 'u3'] },
    });
  });
});

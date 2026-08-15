import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockApiFetch } from '../helpers/routeHarness';

vi.mock('../../lib/api/_fetch', () => ({ apiFetch: vi.fn() }));

const { apiFetch } = await import('../../lib/api/_fetch');
const {
  getCompany,
  getMyBookmarkedCompanyIds,
  getRecommendedCompanies,
  incrementCompanyView,
  listCompanies,
  listMyBookmarkedCompanies,
  removeCompanyBookmarks,
  toggleCompanyBookmark,
} = await import('../../lib/api/companies');

beforeEach(() => {
  apiFetch.mockReset();
});

describe('listCompanies', () => {
  it('defaults to 20 per page sorted by popular', async () => {
    mockApiFetch(apiFetch, { 'GET /api/companies': { items: [] } });

    await listCompanies();

    expect(apiFetch.mock.calls[0][1].query).toEqual({
      q: undefined,
      industry: undefined,
      size: undefined,
      jobRole: undefined,
      sort: 'popular',
      page: 1,
      pageSize: 20,
    });
  });

  it('forwards the keyword and filters as-is', async () => {
    mockApiFetch(apiFetch, { 'GET /api/companies': { items: [] } });

    await listCompanies({ q: '네이버', industry: 'it', size: 'large', jobRole: 'fe', sort: 'rating' });

    expect(apiFetch.mock.calls[0][1].query).toMatchObject({
      q: '네이버',
      industry: 'it',
      size: 'large',
      jobRole: 'fe',
      sort: 'rating',
    });
  });
});

describe('getCompany', () => {
  it('encodes the slug before fetching', async () => {
    mockApiFetch(apiFetch, { 'GET /api/companies/%EB%84%A4%EC%9D%B4%EB%B2%84': { id: 'c1' } });

    await getCompany('네이버');

    expect(apiFetch.mock.calls[0][0]).toBe('/api/companies/%EB%84%A4%EC%9D%B4%EB%B2%84');
  });
});

describe('getRecommendedCompanies', () => {
  it('unwraps and returns only items', async () => {
    mockApiFetch(apiFetch, { 'GET /api/companies/recommended': { items: [{ id: 'c1' }] } });

    await expect(getRecommendedCompanies()).resolves.toEqual([{ id: 'c1' }]);
    expect(apiFetch.mock.calls[0][1].query).toEqual({ limit: 6 });
  });

  it('accepts a custom limit', async () => {
    mockApiFetch(apiFetch, { 'GET /api/companies/recommended': { items: [] } });

    await getRecommendedCompanies(3);

    expect(apiFetch.mock.calls[0][1].query).toEqual({ limit: 3 });
  });
});

describe('bookmarked companies', () => {
  it('increments the view count through the views route', async () => {
    mockApiFetch(apiFetch, { 'POST /api/views': { ok: true } });

    await incrementCompanyView('c1');

    expect(apiFetch.mock.calls[0][1].body).toEqual({ targetType: 'company', targetId: 'c1' });
  });

  it('toggles a company with bookmark', async () => {
    mockApiFetch(apiFetch, { 'POST /api/reactions': { active: true } });

    await expect(toggleCompanyBookmark('c1')).resolves.toBe(true);
    expect(apiFetch.mock.calls[0][1].body).toEqual({
      targetType: 'company',
      targetId: 'c1',
      kind: 'bookmark',
    });
  });

  it('returns bookmarked company ids as a Set', async () => {
    mockApiFetch(apiFetch, { 'GET /api/reactions': { targetIds: ['c1'] } });

    const result = await getMyBookmarkedCompanyIds(['c1', 'c2']);

    expect(result.has('c1')).toBe(true);
    expect(result.has('c2')).toBe(false);
  });

  it('returns how many bookmarks were removed', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/reactions': { deleted: 2 } });

    await expect(removeCompanyBookmarks(['c1', 'c2'])).resolves.toBe(2);
  });
});

describe('listMyBookmarkedCompanies', () => {
  it('asks the server for my scrapped companies', async () => {
    mockApiFetch(apiFetch, {
      'GET /api/companies': { items: [{ id: 'a' }], total: 1, page: 1, pageSize: 9 },
    });

    const result = await listMyBookmarkedCompanies();

    expect(apiFetch).toHaveBeenCalledWith('/api/companies', {
      query: { scrapped: 1, sort: 'latest', page: 1, pageSize: 9 },
    });
    expect(result.total).toBe(1);
  });

  it('passes the chosen sort and page through', async () => {
    mockApiFetch(apiFetch, { 'GET /api/companies': { items: [], total: 0 } });

    await listMyBookmarkedCompanies({ sort: 'name', page: 2, pageSize: 5 });

    expect(apiFetch).toHaveBeenCalledWith('/api/companies', {
      query: { scrapped: 1, sort: 'name', page: 2, pageSize: 5 },
    });
  });

  it('needs only one request', async () => {
    mockApiFetch(apiFetch, { 'GET /api/companies': { items: [], total: 0 } });

    await listMyBookmarkedCompanies();

    expect(apiFetch).toHaveBeenCalledTimes(1);
  });
});

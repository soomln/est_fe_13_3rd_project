import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockApiFetch } from '../helpers/routeHarness';

vi.mock('../../lib/api/_fetch', () => ({ apiFetch: vi.fn() }));
vi.mock('../../lib/supabase/client', () => ({ createClient: vi.fn() }));

const { apiFetch } = await import('../../lib/api/_fetch');
const mypage = await import('../../lib/api/mypage');
const auth = await import('../../lib/api/auth');
const companies = await import('../../lib/api/companies');
const documents = await import('../../lib/api/documents');
const interview = await import('../../lib/api/interview');
const portfolio = await import('../../lib/api/portfolio');
const posts = await import('../../lib/api/posts');
const profile = await import('../../lib/api/profile');

beforeEach(() => {
  apiFetch.mockReset();
});

describe('account information', () => {
  it('fetches the account settings', async () => {
    mockApiFetch(apiFetch, { 'GET /api/me/account': { id: 'u1', providers: ['github'] } });

    await expect(mypage.getMyAccount()).resolves.toMatchObject({ providers: ['github'] });
  });

  it('fetches the profile and counters together', async () => {
    mockApiFetch(apiFetch, { 'GET /api/me/summary': { profile: { id: 'u1' }, stats: {} } });

    await expect(mypage.getMySummary()).resolves.toHaveProperty('profile.id', 'u1');
  });
});

describe('scrap lists', () => {
  it('lists scrapped companies 9 per page', async () => {
    mockApiFetch(apiFetch, { 'GET /api/companies': { items: [], total: 0, page: 1, pageSize: 9 } });

    await expect(mypage.listMyScrappedCompanies()).resolves.toMatchObject({ pageSize: 9 });
  });

  it('passes sort and page for scrapped companies', async () => {
    mockApiFetch(apiFetch, { 'GET /api/companies': { items: [], total: 0, page: 2, pageSize: 3 } });

    await mypage.listMyScrappedCompanies({ sort: 'oldest', page: 2, pageSize: 3 });

    expect(apiFetch).toHaveBeenCalledWith('/api/companies', {
      query: { scrapped: 1, sort: 'oldest', page: 2, pageSize: 3 },
    });
  });

  it('lists scrapped portfolios 9 per page', async () => {
    mockApiFetch(apiFetch, { 'GET /api/portfolios': { items: [], total: 0, page: 1, pageSize: 9 } });

    await expect(mypage.listMyScrappedPortfolios()).resolves.toMatchObject({ pageSize: 9 });
  });

  it('passes sort and page for scrapped portfolios', async () => {
    mockApiFetch(apiFetch, { 'GET /api/portfolios': { items: [], total: 0, page: 2, pageSize: 3 } });

    await mypage.listMyScrappedPortfolios({ sort: 'title', page: 2, pageSize: 3 });

    expect(apiFetch).toHaveBeenCalledWith('/api/portfolios', {
      query: { scrapped: 1, sort: 'title', page: 2, pageSize: 3 },
    });
  });
});

describe('my activity', () => {
  it('fetches only qbank posts 4 per page', async () => {
    mockApiFetch(apiFetch, { 'GET /api/posts': { items: [] } });

    await mypage.listMyQbanks();

    expect(apiFetch.mock.calls[0][1].query).toMatchObject({
      mine: 1,
      type: 'qbank',
      pageSize: 4,
    });
  });

  it('fetches only review posts 10 per page', async () => {
    mockApiFetch(apiFetch, { 'GET /api/posts': { items: [] } });

    await mypage.listMyReviews();

    expect(apiFetch.mock.calls[0][1].query).toMatchObject({
      mine: 1,
      type: 'review',
      pageSize: 10,
    });
  });

  it('accepts a page for my qbank posts', async () => {
    mockApiFetch(apiFetch, { 'GET /api/posts': { items: [] } });

    await mypage.listMyQbanks({ page: 2, pageSize: 8 });

    expect(apiFetch.mock.calls[0][1].query).toMatchObject({ page: 2, pageSize: 8 });
  });

  it('accepts a page for my review posts', async () => {
    mockApiFetch(apiFetch, { 'GET /api/posts': { items: [] } });

    await mypage.listMyReviews({ page: 4, pageSize: 2 });

    expect(apiFetch.mock.calls[0][1].query).toMatchObject({ page: 4, pageSize: 2 });
  });
});

describe('re-exports', () => {
  it.each([
    ['deleteDocuments', () => documents.deleteDocuments],
    ['listMyDocuments', () => documents.listMyDocuments],
    ['deleteMyAccount', () => auth.deleteMyAccount],
    ['deletePortfolios', () => portfolio.deletePortfolios],
    ['listMyPortfolios', () => portfolio.listMyPortfolios],
    ['removePortfolioBookmarks', () => portfolio.removePortfolioBookmarks],
    ['deletePosts', () => posts.deletePosts],
    ['listMyScrappedPosts', () => posts.listMyScrappedPosts],
    ['removePostScraps', () => posts.removePostScraps],
    ['deleteQas', () => interview.deleteQas],
    ['listMyScraps', () => interview.listMyScraps],
    ['removeQaScraps', () => interview.removeQaScraps],
    ['removeCompanyBookmarks', () => companies.removeCompanyBookmarks],
    ['getMyProfile', () => profile.getMyProfile],
    ['getMyProfileStats', () => profile.getMyProfileStats],
    ['removeAvatar', () => profile.removeAvatar],
    ['updateProfile', () => profile.updateProfile],
    ['uploadAvatar', () => profile.uploadAvatar],
  ])('%s re-exports the original function', (name, getOriginal) => {
    expect(mypage[name]).toBe(getOriginal());
  });

  it('exposes every function the mypage screen needs', () => {
    expect(Object.keys(mypage).sort()).toEqual(
      [
        'deleteDocuments',
        'deleteMyAccount',
        'deletePortfolios',
        'deletePosts',
        'deleteQas',
        'getMyAccount',
        'getMyProfile',
        'getMyProfileStats',
        'getMySummary',
        'listMyDocuments',
        'listMyPortfolios',
        'listMyQbanks',
        'listMyReviews',
        'listMyScrappedCompanies',
        'listMyScrappedPortfolios',
        'listMyScrappedPosts',
        'listMyScraps',
        'removeAvatar',
        'removeCompanyBookmarks',
        'removePortfolioBookmarks',
        'removePostScraps',
        'removeQaScraps',
        'updateProfile',
        'uploadAvatar',
      ].sort()
    );
  });
});

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { resetWorld, signInAs, startWorld, stopWorld, USERS } from './support/harness';
import { rows } from './support/database';
import {
  getCompany,
  getMyBookmarkedCompanyIds,
  getRecommendedCompanies,
  incrementCompanyView,
  listCompanies,
  listMyBookmarkedCompanies,
  removeCompanyBookmarks,
  toggleCompanyBookmark,
} from '@backend/lib/api/companies';
import { listMyScrappedCompanies } from '@backend/lib/api/mypage';
import { createPost } from '@backend/lib/api/posts';
import { getCodeGroups, labelOf } from '@backend/lib/api/codes';

const naver = () => rows('companies')[0];
const kakao = () => rows('companies')[1];

beforeAll(startWorld);
afterAll(stopWorld);
beforeEach(resetWorld);

describe('browsing companies', () => {
  it('lists every company as a card', async () => {
    const page = await listCompanies();

    expect(page).toMatchObject({ total: 3, page: 1, pageSize: 20 });
    expect(page.items[0]).toMatchObject({
      slug: 'naver',
      name: '네이버',
      category: 'IT·소프트웨어',
      location: '분당',
    });
  });

  it('searches by company name', async () => {
    const page = await listCompanies({ q: '카카오' });

    expect(page.items.map((c) => c.slug)).toEqual(['kakao']);
  });

  it('finds nothing for an unmatched keyword', async () => {
    const page = await listCompanies({ q: 'ZZZ존재하지않음' });

    expect(page).toMatchObject({ items: [], total: 0 });
  });

  it('filters by industry', async () => {
    const page = await listCompanies({ industry: 'game' });

    expect(page.items.map((c) => c.slug)).toEqual(['kakao']);
  });

  it('filters by company size', async () => {
    const page = await listCompanies({ size: 'large' });

    expect(page.total).toBe(2);
  });

  it('filters by job role', async () => {
    const page = await listCompanies({ jobRole: 'fe' });

    expect(page.items.map((c) => c.slug)).toEqual(['naver']);
  });

  it('sorts by rating', async () => {
    const page = await listCompanies({ sort: 'rating' });

    expect(page.items.map((c) => c.slug)).toEqual(['naver', 'kakao', 'sparse']);
  });

  it('sorts by name', async () => {
    const page = await listCompanies({ sort: 'name' });

    expect(page.items.map((c) => c.name)).toEqual(['네이버', '정보없는회사', '카카오']);
  });

  it('rejects an unknown sort', async () => {
    await expect(listCompanies({ sort: 'random' })).rejects.toMatchObject({
      status: 400,
      code: 'BAD_REQUEST',
    });
  });

  it('splits results across pages', async () => {
    const first = await listCompanies({ pageSize: 1, page: 1 });
    const second = await listCompanies({ pageSize: 1, page: 2 });

    expect(first.items).toHaveLength(1);
    expect(second.items).toHaveLength(1);
    expect(first.items[0].id).not.toBe(second.items[0].id);
    expect(second.total).toBe(3);
  });
});

describe('company detail', () => {
  it('shows the full profile of a company', async () => {
    const company = await getCompany('naver');

    expect(company).toMatchObject({
      name: '네이버',
      industry: 'IT·소프트웨어',
      tagline: '연결의 힘',
      ceo: '최수연',
      hire: '상시 채용',
    });
    expect(company.values[0]).toEqual({ icon: 'star', title: '도전', description: '설명A' });
    expect(company.summary[0]).toEqual({ icon: 'check_circle', description: 'AI 중심 기업' });
    expect(company.news[0]).toEqual({
      title: '뉴스A',
      date: '2026-08-01',
      url: 'https://n.test/1',
    });
  });

  it('answers 404 for an unknown slug', async () => {
    await expect(getCompany('no-such-company')).rejects.toMatchObject({
      status: 404,
      code: 'NOT_FOUND',
    });
  });

  it('counts a visit', async () => {
    const before = (await getCompany('naver')).views;

    await incrementCompanyView(naver().id);

    expect((await getCompany('naver')).views).toBe(before + 1);
  });

  it('lets a signed-out visitor read and count a visit', async () => {
    await incrementCompanyView(naver().id);

    await expect(getCompany('naver')).resolves.toMatchObject({ slug: 'naver' });
  });

  it('reflects interview posts in the company statistics', async () => {
    signInAs(USERS.a);
    await createPost({
      postType: 'review',
      companyId: naver().id,
      title: '면접 후기',
      passResultCode: 'pass',
      difficultyScore: 4,
    });
    await createPost({
      postType: 'qbank',
      companyId: naver().id,
      passResultCode: 'fail',
      difficultyScore: 2,
    });

    const company = await getCompany('naver');

    expect(company).toMatchObject({ review: 1, jokbo: 1, passrate: 50, difficulty: 3 });
  });
});

describe('recommended companies', () => {
  it('returns the most bookmarked first', async () => {
    signInAs(USERS.a);
    await toggleCompanyBookmark(kakao().id);

    const recommended = await getRecommendedCompanies();

    expect(recommended[0].slug).toBe('kakao');
  });

  it('honours the requested size', async () => {
    const recommended = await getRecommendedCompanies(1);

    expect(recommended).toHaveLength(1);
  });
});

describe('bookmarking a company', () => {
  it('requires a signed-in member', async () => {
    await expect(toggleCompanyBookmark(naver().id)).rejects.toMatchObject({ status: 401 });
  });

  it('turns on and off again', async () => {
    signInAs(USERS.a);

    await expect(toggleCompanyBookmark(naver().id)).resolves.toBe(true);
    await expect(toggleCompanyBookmark(naver().id)).resolves.toBe(false);
  });

  it('shows up in the company card count', async () => {
    signInAs(USERS.a);
    await toggleCompanyBookmark(naver().id);

    const page = await listCompanies({ q: '네이버' });

    expect(page.items[0].favorite).toBe(1);
  });

  it('marks which cards the member already bookmarked', async () => {
    signInAs(USERS.a);
    await toggleCompanyBookmark(naver().id);

    const mine = await getMyBookmarkedCompanyIds([naver().id, kakao().id]);

    expect(mine.has(naver().id)).toBe(true);
    expect(mine.has(kakao().id)).toBe(false);
  });

  it('keeps one member bookmarks invisible to another', async () => {
    signInAs(USERS.a);
    await toggleCompanyBookmark(naver().id);

    signInAs(USERS.b);
    const mine = await getMyBookmarkedCompanyIds([naver().id]);

    expect(mine.size).toBe(0);
  });

  it('still shows the shared count to everyone', async () => {
    signInAs(USERS.a);
    await toggleCompanyBookmark(naver().id);

    signInAs(USERS.b);
    const page = await listCompanies({ q: '네이버' });

    expect(page.items[0].favorite).toBe(1);
  });
});

describe('my bookmarked companies', () => {
  it('is empty before anything is bookmarked', async () => {
    signInAs(USERS.a);

    await expect(listMyBookmarkedCompanies()).resolves.toMatchObject({ items: [], total: 0 });
  });

  it('lists them newest bookmark first', async () => {
    signInAs(USERS.a);
    await toggleCompanyBookmark(naver().id);
    await toggleCompanyBookmark(kakao().id);

    const page = await listMyScrappedCompanies();

    expect(page.items.map((c) => c.slug)).toEqual(['kakao', 'naver']);
    expect(page.total).toBe(2);
  });

  it('pages through the list', async () => {
    signInAs(USERS.a);
    await toggleCompanyBookmark(naver().id);
    await toggleCompanyBookmark(kakao().id);

    const page = await listMyBookmarkedCompanies({ page: 2, pageSize: 1 });

    expect(page.items.map((c) => c.slug)).toEqual(['naver']);
    expect(page).toMatchObject({ total: 2, page: 2, pageSize: 1 });
  });

  it('removes several bookmarks at once', async () => {
    signInAs(USERS.a);
    await toggleCompanyBookmark(naver().id);
    await toggleCompanyBookmark(kakao().id);

    await expect(removeCompanyBookmarks([naver().id, kakao().id])).resolves.toBe(2);
    await expect(listMyBookmarkedCompanies()).resolves.toMatchObject({ total: 0 });
  });

  it('does nothing when the selection is empty', async () => {
    signInAs(USERS.a);

    await expect(removeCompanyBookmarks([])).resolves.toBe(0);
  });
});

describe('filter options', () => {
  it('serves several code groups in one round trip', async () => {
    const groups = await getCodeGroups(['job_role', 'industry']);

    expect(groups.job_role).toHaveLength(2);
    expect(groups.industry).toHaveLength(2);
  });

  it('resolves a single label', async () => {
    await expect(labelOf('industry', 'it')).resolves.toBe('IT·소프트웨어');
  });

  it('falls back to the code when it is unknown', async () => {
    await expect(labelOf('industry', 'nope')).resolves.toBe('nope');
  });
});

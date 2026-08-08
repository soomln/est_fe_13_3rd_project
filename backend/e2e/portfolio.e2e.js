import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { resetWorld, signInAs, startWorld, stopWorld, USERS } from './support/harness';
import { failNextUpload, browserState } from './support/browser';
import {
  createPortfolio,
  deletePortfolio,
  deletePortfolios,
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
} from '@backend/lib/api/portfolio';
import { listMyScrappedPortfolios } from '@backend/lib/api/mypage';

const imageFile = (name = 'shot.PNG', type = 'image/png', size = 1024) => ({ name, type, size });

const publish = async (title, extra = {}) => {
  const draft = await createPortfolio({ title, ...extra });
  await publishPortfolio(draft.id);
  return draft;
};

beforeAll(startWorld);
afterAll(stopWorld);
beforeEach(resetWorld);

describe('building a portfolio', () => {
  beforeEach(() => signInAs(USERS.a));

  it('starts as a private draft', async () => {
    const draft = await createPortfolio({ title: '내 작업' });

    expect(draft).toMatchObject({
      title: '내 작업',
      status: 'draft',
      bgColor: '#F4FCFE',
      gapPx: 16,
      content: [],
    });
  });

  it('falls back to a placeholder title', async () => {
    const draft = await createPortfolio({ title: '  ' });

    expect(draft.title).toBe('제목 없음');
  });

  it('rejects an unknown category', async () => {
    await expect(createPortfolio({ category: 'vr' })).rejects.toMatchObject({ status: 400 });
  });

  it('accepts the four block types', async () => {
    const draft = await createPortfolio({
      content: [
        { type: 'image', url: 'https://cdn.test/1.png' },
        { type: 'video', youtube_url: 'https://youtu.be/x' },
        { type: 'text', html: '<p>hi</p>' },
        { type: 'code', lang: 'js', body: 'const a = 1;' },
      ],
    });

    expect(draft.content).toHaveLength(4);
  });

  it('rejects an unsupported block', async () => {
    await expect(createPortfolio({ content: [{ type: 'audio' }] })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('allows fifteen images', async () => {
    const content = Array.from({ length: 15 }, () => ({ type: 'image' }));

    await expect(createPortfolio({ content })).resolves.toMatchObject({ status: 'draft' });
  });

  it('stops at sixteen images', async () => {
    const content = Array.from({ length: 16 }, () => ({ type: 'image' }));

    await expect(createPortfolio({ content })).rejects.toMatchObject({ status: 400 });
  });

  it('edits the canvas settings', async () => {
    const draft = await createPortfolio({ title: '작업' });

    const saved = await updatePortfolio(draft.id, {
      description: '설명',
      bgColor: '#FFFFFF',
      gapPx: 24,
      category: 'app',
    });

    expect(saved).toMatchObject({
      description: '설명',
      bgColor: '#FFFFFF',
      gapPx: 24,
      category: 'app',
    });
  });

  it('rejects an update with nothing in it', async () => {
    const draft = await createPortfolio({ title: '작업' });

    await expect(updatePortfolio(draft.id, {})).rejects.toMatchObject({ status: 400 });
  });

  it('publishes the draft to the gallery', async () => {
    const draft = await createPortfolio({ title: '작업' });

    const published = await publishPortfolio(draft.id);

    expect(published.status).toBe('published');
  });
});

describe('uploading portfolio images', () => {
  beforeEach(() => signInAs(USERS.a));

  it('stores the file under the member and portfolio folder', async () => {
    const draft = await createPortfolio({ title: '작업' });

    const url = await uploadPortfolioImage(draft.id, imageFile());

    expect(browserState().uploads[0]).toMatchObject({ bucket: 'portfolios' });
    expect(browserState().uploads[0].path).toMatch(
      new RegExp(`^${USERS.a.id}/${draft.id}/\\d+-\\d+\\.png$`)
    );
    expect(url).toContain('https://storage.test/portfolios/');
  });

  it('rejects a file type outside the allow list', async () => {
    await expect(
      uploadPortfolioImage('f1', imageFile('a.svg', 'image/svg+xml'))
    ).rejects.toThrowError(/JPG, PNG, WEBP, GIF/);
  });

  it('rejects a file over five megabytes', async () => {
    await expect(
      uploadPortfolioImage('f1', imageFile('a.png', 'image/png', 5 * 1024 * 1024 + 1))
    ).rejects.toThrowError(/5MB/);
  });

  it('uploads a batch in order', async () => {
    const draft = await createPortfolio({ title: '작업' });

    const urls = await uploadPortfolioImages(draft.id, [imageFile(), imageFile('b.jpg', 'image/jpeg')]);

    expect(urls).toHaveLength(2);
    expect(browserState().uploads.map((u) => u.type)).toEqual(['image/png', 'image/jpeg']);
  });

  it('refuses a batch over fifteen files', async () => {
    const files = Array.from({ length: 16 }, () => imageFile());

    await expect(uploadPortfolioImages('f1', files)).rejects.toThrowError(/15장/);
    expect(browserState().uploads).toHaveLength(0);
  });

  it('surfaces a storage failure', async () => {
    failNextUpload({ message: 'quota exceeded' });

    await expect(uploadPortfolioImage('f1', imageFile())).rejects.toThrowError(/quota exceeded/);
  });

  it('turns a visitor away', async () => {
    signInAs(USERS.b);
    browserState().uploads.length = 0;
    const { signOutOfBrowser } = await import('./support/harness');
    signOutOfBrowser();

    await expect(uploadPortfolioImage('f1', imageFile())).rejects.toMatchObject({ status: 401 });
  });
});

describe('the public gallery', () => {
  it('shows published work to a visitor', async () => {
    signInAs(USERS.a);
    await publish('공개 작업');
    await createPortfolio({ title: '비공개 초안' });

    const { signOutOfBrowser } = await import('./support/harness');
    signOutOfBrowser();
    const gallery = await listPortfolios();

    expect(gallery.items.map((p) => p.title)).toEqual(['공개 작업']);
  });

  it('hides a draft from other members', async () => {
    signInAs(USERS.a);
    const draft = await createPortfolio({ title: '비공개 초안' });

    signInAs(USERS.b);

    await expect(getPortfolio(draft.id)).rejects.toMatchObject({ status: 404 });
  });

  it('shows the author their own draft', async () => {
    signInAs(USERS.a);
    const draft = await createPortfolio({ title: '비공개 초안' });

    await expect(getPortfolio(draft.id)).resolves.toMatchObject({ status: 'draft' });
  });

  it('filters by category', async () => {
    signInAs(USERS.a);
    await publish('웹', { category: 'web' });
    await publish('앱', { category: 'app' });

    const gallery = await listPortfolios({ category: 'app' });

    expect(gallery.items.map((p) => p.title)).toEqual(['앱']);
  });

  it('rejects an unknown category filter', async () => {
    await expect(listPortfolios({ category: 'vr' })).rejects.toMatchObject({ status: 400 });
  });

  it('browses another member gallery', async () => {
    signInAs(USERS.a);
    await publish('A 작업');

    signInAs(USERS.b);
    const gallery = await listPortfolios({ userId: USERS.a.id });

    expect(gallery.items.map((p) => p.title)).toEqual(['A 작업']);
  });

  it('counts a visit', async () => {
    signInAs(USERS.a);
    const item = await publish('작업');

    await incrementPortfolioView(item.id);

    await expect(getPortfolio(item.id)).resolves.toMatchObject({ viewCount: 1 });
  });

  it('sorts by views', async () => {
    signInAs(USERS.a);
    const first = await publish('첫번째');
    await publish('두번째');
    await incrementPortfolioView(first.id);

    const gallery = await listPortfolios({ sort: 'views' });

    expect(gallery.items[0].title).toBe('첫번째');
  });

  it('rejects an unknown sort', async () => {
    await expect(listPortfolios({ sort: 'random' })).rejects.toMatchObject({ status: 400 });
  });

  it('answers 404 for work that does not exist', async () => {
    await expect(getPortfolio('missing')).rejects.toMatchObject({ status: 404 });
  });
});

describe('reacting to portfolios', () => {
  it('requires a signed-in member', async () => {
    await expect(togglePortfolioLike('f1')).rejects.toMatchObject({ status: 401 });
  });

  it('counts likes and bookmarks separately', async () => {
    signInAs(USERS.a);
    const item = await publish('작업');

    await togglePortfolioLike(item.id);
    await togglePortfolioBookmark(item.id);

    const gallery = await listPortfolios();
    expect(gallery.items[0]).toMatchObject({ likeCount: 1, bookmarkCount: 1 });
  });

  it('marks which cards the member already reacted to', async () => {
    signInAs(USERS.a);
    const item = await publish('작업');
    await togglePortfolioLike(item.id);

    const mine = await getMyPortfolioReactions([item.id]);

    expect(mine.liked.has(item.id)).toBe(true);
    expect(mine.bookmarked.has(item.id)).toBe(false);
  });

  it('sorts the gallery by likes', async () => {
    signInAs(USERS.a);
    await publish('조용한 작업');
    const loud = await publish('인기 작업');
    await togglePortfolioLike(loud.id);

    const gallery = await listPortfolios({ sort: 'popular' });

    expect(gallery.items[0].title).toBe('인기 작업');
  });

  it('sorts the gallery by bookmarks', async () => {
    signInAs(USERS.a);
    await publish('조용한 작업');
    const saved = await publish('스크랩된 작업');
    await togglePortfolioBookmark(saved.id);

    const gallery = await listPortfolios({ sort: 'bookmarks' });

    expect(gallery.items[0].title).toBe('스크랩된 작업');
  });
});

describe('my portfolios and scraps', () => {
  it('lists drafts and published work together', async () => {
    signInAs(USERS.a);
    await publish('공개');
    await createPortfolio({ title: '초안' });

    const mine = await listMyPortfolios();

    expect(mine.total).toBe(2);
  });

  it('filters down to drafts', async () => {
    signInAs(USERS.a);
    await publish('공개');
    await createPortfolio({ title: '초안' });

    const drafts = await listMyPortfolios({ status: 'draft' });

    expect(drafts.items.map((p) => p.title)).toEqual(['초안']);
  });

  it('rejects an unknown status filter', async () => {
    signInAs(USERS.a);

    await expect(listMyPortfolios({ status: 'archived' })).rejects.toMatchObject({ status: 400 });
  });

  it('turns a visitor away from the private list', async () => {
    await expect(listMyPortfolios()).rejects.toMatchObject({ status: 401 });
  });

  it('collects bookmarked work newest first', async () => {
    signInAs(USERS.a);
    const first = await publish('첫번째');
    const second = await publish('두번째');

    signInAs(USERS.b);
    await togglePortfolioBookmark(first.id);
    await togglePortfolioBookmark(second.id);

    const scraps = await listMyScrappedPortfolios();

    expect(scraps.items.map((p) => p.title)).toEqual(['두번째', '첫번째']);
  });

  it('pages through the bookmarks', async () => {
    signInAs(USERS.a);
    const first = await publish('첫번째');
    const second = await publish('두번째');
    await togglePortfolioBookmark(first.id);
    await togglePortfolioBookmark(second.id);

    const page = await listMyBookmarkedPortfolios({ page: 2, pageSize: 1 });

    expect(page.items.map((p) => p.title)).toEqual(['첫번째']);
  });

  it('is empty before anything is bookmarked', async () => {
    signInAs(USERS.a);

    await expect(listMyBookmarkedPortfolios()).resolves.toMatchObject({ total: 0 });
  });

  it('removes bookmarks in bulk', async () => {
    signInAs(USERS.a);
    const item = await publish('작업');
    await togglePortfolioBookmark(item.id);

    await expect(removePortfolioBookmarks([item.id])).resolves.toBe(1);
    await expect(listMyBookmarkedPortfolios()).resolves.toMatchObject({ total: 0 });
  });
});

describe('deleting portfolios', () => {
  it('deletes my own work', async () => {
    signInAs(USERS.a);
    const item = await createPortfolio({ title: '작업' });

    await expect(deletePortfolio(item.id)).resolves.toEqual({ deleted: 1 });
    await expect(listMyPortfolios()).resolves.toMatchObject({ total: 0 });
  });

  it('deletes a selection at once', async () => {
    signInAs(USERS.a);
    const a = await createPortfolio({ title: 'a' });
    const b = await createPortfolio({ title: 'b' });

    await expect(deletePortfolios([a.id, b.id])).resolves.toBe(2);
  });

  it('ignores an empty selection', async () => {
    signInAs(USERS.a);

    await expect(deletePortfolios([])).resolves.toBe(0);
  });

  it('refuses to delete work owned by someone else', async () => {
    signInAs(USERS.a);
    const item = await publish('A 작업');

    signInAs(USERS.b);
    await expect(deletePortfolio(item.id)).rejects.toMatchObject({ status: 403 });

    signInAs(USERS.a);
    await expect(getPortfolio(item.id)).resolves.toMatchObject({ title: 'A 작업' });
  });

  it('refuses a cross-account edit', async () => {
    signInAs(USERS.a);
    const item = await publish('A 작업');

    signInAs(USERS.b);

    await expect(updatePortfolio(item.id, { title: 'stolen' })).rejects.toMatchObject({
      status: 404,
    });
  });

  it('takes the likes down with the work', async () => {
    signInAs(USERS.a);
    const item = await publish('작업');
    await togglePortfolioLike(item.id);

    await deletePortfolio(item.id);

    await expect(listMyBookmarkedPortfolios()).resolves.toMatchObject({ total: 0 });
  });
});

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockApiFetch } from '../helpers/routeHarness';

vi.mock('../../lib/api/_fetch', () => ({ apiFetch: vi.fn() }));

const { apiFetch } = await import('../../lib/api/_fetch');
const {
  getMyBookmarkedTemplateIds,
  getTemplate,
  incrementTemplateView,
  listMyBookmarkedTemplateIds,
  listTemplates,
  toggleTemplateBookmark,
} = await import('../../lib/api/templates');

beforeEach(() => {
  apiFetch.mockReset();
});

describe('listTemplates', () => {
  it('defaults to 16 per page sorted by popular', async () => {
    mockApiFetch(apiFetch, { 'GET /api/templates': { items: [] } });

    await listTemplates();

    expect(apiFetch.mock.calls[0][1].query).toEqual({
      docType: undefined,
      q: undefined,
      sort: 'popular',
      page: 1,
      pageSize: 16,
    });
  });

  it('accepts a doc type and a keyword', async () => {
    mockApiFetch(apiFetch, { 'GET /api/templates': { items: [] } });

    await listTemplates({ docType: 'cover_letter', q: '자소서', sort: 'latest', page: 2 });

    expect(apiFetch.mock.calls[0][1].query).toMatchObject({
      docType: 'cover_letter',
      q: '자소서',
      sort: 'latest',
      page: 2,
    });
  });
});

describe('getTemplate', () => {
  it('encodes the id before fetching', async () => {
    mockApiFetch(apiFetch, { 'GET /api/templates/t%201': { id: 't 1' } });

    await getTemplate('t 1');

    expect(apiFetch.mock.calls[0][0]).toBe('/api/templates/t%201');
  });
});

describe('views and bookmarks', () => {
  it('increments the view count through the views route', async () => {
    mockApiFetch(apiFetch, { 'POST /api/views': { ok: true } });

    await incrementTemplateView('t1');

    expect(apiFetch.mock.calls[0][1].body).toEqual({ targetType: 'template', targetId: 't1' });
  });

  it('toggles a template bookmark', async () => {
    mockApiFetch(apiFetch, { 'POST /api/reactions': { active: true } });

    await expect(toggleTemplateBookmark('t1')).resolves.toBe(true);
    expect(apiFetch.mock.calls[0][1].body).toEqual({
      targetType: 'template',
      targetId: 't1',
      kind: 'bookmark',
    });
  });

  it('returns bookmarked template ids as a Set', async () => {
    mockApiFetch(apiFetch, { 'GET /api/reactions': { targetIds: ['t1'] } });

    const result = await getMyBookmarkedTemplateIds(['t1', 't2']);

    expect([...result]).toEqual(['t1']);
  });

  it('returns every bookmarked template id as an array', async () => {
    mockApiFetch(apiFetch, { 'GET /api/reactions': { targetIds: ['t1', 't2'] } });

    await expect(listMyBookmarkedTemplateIds()).resolves.toEqual(['t1', 't2']);
    expect(apiFetch.mock.calls[0][1].query).toEqual({
      targetType: 'template',
      kind: 'bookmark',
    });
  });
});

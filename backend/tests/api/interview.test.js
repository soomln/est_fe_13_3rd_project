import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockApiFetch } from '../helpers/routeHarness';

vi.mock('../../lib/api/_fetch', () => ({ apiFetch: vi.fn() }));

const { apiFetch } = await import('../../lib/api/_fetch');
const {
  createSession,
  deleteQas,
  deleteSession,
  finishSession,
  getMyScrappedQaIds,
  getSession,
  listMyQas,
  listMyScraps,
  listMySessions,
  listSessionQas,
  removeQaScraps,
  removeScraps,
  saveQas,
  toggleQaScrap,
} = await import('../../lib/api/interview');

beforeEach(() => {
  apiFetch.mockReset();
});

describe('createSession', () => {
  it('creates a session with default settings', async () => {
    mockApiFetch(apiFetch, { 'POST /api/interviews': { id: 's1' } });

    await createSession();

    expect(apiFetch).toHaveBeenCalledWith('/api/interviews', {
      method: 'POST',
      body: {
        companyId: null,
        resumeIds: [],
        coverLetterIds: [],
        interviewerStyle: 'neutral',
        selectedCategories: [],
        showTimer: true,
      },
    });
  });

  it('forwards the settings as-is', async () => {
    mockApiFetch(apiFetch, { 'POST /api/interviews': { id: 's1' } });

    await createSession({
      companyId: 'c1',
      resumeIds: ['d1'],
      coverLetterIds: ['d2'],
      interviewerStyle: 'pressure',
      selectedCategories: ['자기소개'],
      showTimer: false,
    });

    expect(apiFetch.mock.calls[0][1].body).toEqual({
      companyId: 'c1',
      resumeIds: ['d1'],
      coverLetterIds: ['d2'],
      interviewerStyle: 'pressure',
      selectedCategories: ['자기소개'],
      showTimer: false,
    });
  });
});

describe('session lookup', () => {
  it('lists 10 per page by default', async () => {
    mockApiFetch(apiFetch, { 'GET /api/interviews': { items: [] } });

    await listMySessions();

    expect(apiFetch.mock.calls[0][1].query).toEqual({ page: 1, pageSize: 10 });
  });

  it('encodes the id for the detail request', async () => {
    mockApiFetch(apiFetch, { 'GET /api/interviews/s%201': { id: 's 1' } });

    await getSession('s 1');

    expect(apiFetch.mock.calls[0][0]).toBe('/api/interviews/s%201');
  });
});

describe('saving questions and answers', () => {
  it('posts the array to the session subpath', async () => {
    mockApiFetch(apiFetch, { 'POST /api/interviews/s1/qas': { saved: 2 } });

    await saveQas('s1', [{ question: 'Q1' }, { question: 'Q2' }]);

    expect(apiFetch).toHaveBeenCalledWith('/api/interviews/s1/qas', {
      method: 'POST',
      body: { qas: [{ question: 'Q1' }, { question: 'Q2' }] },
    });
  });
});

describe('finishing and deleting a session', () => {
  it('sends status, duration and scores together', async () => {
    mockApiFetch(apiFetch, { 'PATCH /api/interviews/s1': { id: 's1' } });

    await finishSession('s1', { durationSec: 600, totalScore: 82, subScores: { 태도: 5 } });

    expect(apiFetch.mock.calls[0][1].body).toEqual({
      status: 'finished',
      durationSec: 600,
      totalScore: 82,
      subScores: { 태도: 5 },
    });
  });

  it('can finish without scores', async () => {
    mockApiFetch(apiFetch, { 'PATCH /api/interviews/s1': { id: 's1' } });

    await finishSession('s1');

    expect(apiFetch.mock.calls[0][1].body).toEqual({
      status: 'finished',
      durationSec: undefined,
      totalScore: undefined,
      subScores: undefined,
    });
  });

  it('deletes a session with DELETE', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/interviews/s1': { deleted: 1 } });

    await deleteSession('s1');

    expect(apiFetch).toHaveBeenCalledWith('/api/interviews/s1', { method: 'DELETE' });
  });
});

describe('question and answer lists', () => {
  it('lists scraps 6 per page with scrapped=1', async () => {
    mockApiFetch(apiFetch, { 'GET /api/interview-qas': { items: [] } });

    await listMyScraps();

    expect(apiFetch.mock.calls[0][1].query).toEqual({
      scrapped: 1,
      q: undefined,
      sort: 'latest',
      page: 1,
      pageSize: 6,
    });
  });

  it('can search within scraps', async () => {
    mockApiFetch(apiFetch, { 'GET /api/interview-qas': { items: [] } });

    await listMyScraps({ q: 'REST', sort: 'oldest', page: 2, pageSize: 3 });

    expect(apiFetch.mock.calls[0][1].query).toMatchObject({
      q: 'REST',
      sort: 'oldest',
      page: 2,
      pageSize: 3,
    });
  });

  it('lists all my answers 20 per page', async () => {
    mockApiFetch(apiFetch, { 'GET /api/interview-qas': { items: [] } });

    await listMyQas();

    expect(apiFetch.mock.calls[0][1].query).toEqual({
      q: undefined,
      sessionId: undefined,
      sort: 'latest',
      page: 1,
      pageSize: 20,
    });
  });

  it('fetches up to 50 answers of a session at once', async () => {
    mockApiFetch(apiFetch, { 'GET /api/interview-qas': { items: [] } });

    await listSessionQas('s1');

    expect(apiFetch.mock.calls[0][1].query).toEqual({ sessionId: 's1', pageSize: 50 });
  });
});

describe('scraps', () => {
  it('toggles a question scrap', async () => {
    mockApiFetch(apiFetch, { 'POST /api/reactions': { active: true } });

    await expect(toggleQaScrap('q1')).resolves.toBe(true);
    expect(apiFetch.mock.calls[0][1].body).toEqual({
      targetType: 'interview_qa',
      targetId: 'q1',
      kind: 'bookmark',
    });
  });

  it('returns scrapped question ids as a Set', async () => {
    mockApiFetch(apiFetch, { 'GET /api/reactions': { targetIds: ['q1'] } });

    const result = await getMyScrappedQaIds(['q1', 'q2']);

    expect([...result]).toEqual(['q1']);
  });

  it('returns how many scraps were removed', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/reactions': { deleted: 2 } });

    await expect(removeQaScraps(['q1', 'q2'])).resolves.toBe(2);
  });

  it('removeScraps is an alias of removeQaScraps', () => {
    expect(removeScraps).toBe(removeQaScraps);
  });
});

describe('deleteQas', () => {
  it('returns the deleted count', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/interview-qas': { deleted: 2 } });

    await expect(deleteQas(['q1', 'q2'])).resolves.toBe(2);
    expect(apiFetch.mock.calls[0][1].body).toEqual({ ids: ['q1', 'q2'] });
  });

  it('skips the request when there is nothing to delete', async () => {
    await expect(deleteQas([])).resolves.toBe(0);
    await expect(deleteQas()).resolves.toBe(0);
    expect(apiFetch).not.toHaveBeenCalled();
  });
});

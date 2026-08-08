import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { resetWorld, signInAs, signOutOfBrowser, startWorld, stopWorld, USERS } from './support/harness';
import { rows } from './support/database';
import {
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
  saveQas,
  toggleQaScrap,
} from '@backend/lib/api/interview';
import { createDocument } from '@backend/lib/api/documents';
import { getMySummary } from '@backend/lib/api/mypage';

const naver = () => rows('companies')[0];

const startSession = () => createSession({ companyId: naver().id, interviewerStyle: 'pressure' });

const answers = [
  { seq: 1, category: '자기소개', question: '자기소개 해주세요', answer: '안녕하세요', score: 4, feedback: { summary: '좋습니다' } },
  { seq: 2, category: '기술질문1', question: 'REST API 란?', answer: 'HTTP 기반입니다', score: 3, feedback: { strengths: ['정확함'], improvements: ['예시 부족'] } },
];

beforeAll(startWorld);
afterAll(stopWorld);
beforeEach(resetWorld);

describe('setting up a mock interview', () => {
  beforeEach(() => signInAs(USERS.a));

  it('starts a session with the chosen settings', async () => {
    const resume = await createDocument({ docType: 'resume', title: '이력서' });

    const session = await createSession({
      companyId: naver().id,
      resumeIds: [resume.id],
      interviewerStyle: 'technical',
      selectedCategories: ['자기소개', '기술질문1'],
      showTimer: false,
    });

    expect(session).toMatchObject({
      companyId: naver().id,
      resumeIds: [resume.id],
      interviewerStyle: 'technical',
      selectedCategories: ['자기소개', '기술질문1'],
      showTimer: false,
      status: 'ongoing',
      qas: [],
    });
  });

  it('falls back to a neutral interviewer', async () => {
    const session = await createSession();

    expect(session.interviewerStyle).toBe('neutral');
  });

  it('rejects an unknown interviewer style', async () => {
    await expect(createSession({ interviewerStyle: 'angry' })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('turns a visitor away', async () => {
    signOutOfBrowser();

    await expect(createSession()).rejects.toMatchObject({ status: 401 });
  });
});

describe('finishing an interview', () => {
  beforeEach(() => signInAs(USERS.a));

  it('stores the questions, answers and feedback in one go', async () => {
    const session = await startSession();

    const saved = await saveQas(session.id, answers);

    expect(saved.saved).toBe(2);
    expect(saved.items[0]).toMatchObject({
      seq: 1,
      question: '자기소개 해주세요',
      feedbackText: '좋습니다',
    });
    expect(saved.items[1].feedbackText).toBe('정확함 예시 부족');
  });

  it('numbers the answers when the client omits the order', async () => {
    const session = await startSession();

    const saved = await saveQas(session.id, [{ question: 'Q1' }, { question: 'Q2' }]);

    expect(saved.items.map((q) => q.seq)).toEqual([1, 2]);
  });

  it('rejects an answer with no question', async () => {
    const session = await startSession();

    await expect(saveQas(session.id, [{ answer: 'A' }])).rejects.toMatchObject({ status: 400 });
  });

  it('rejects an empty batch', async () => {
    const session = await startSession();

    await expect(saveQas(session.id, [])).rejects.toMatchObject({ status: 400 });
  });

  it('refuses to write into another member session', async () => {
    const session = await startSession();

    signInAs(USERS.b);

    await expect(saveQas(session.id, [{ question: 'Q' }])).rejects.toMatchObject({ status: 404 });
  });

  it('records the score and the finish time', async () => {
    const session = await startSession();
    await saveQas(session.id, answers);

    const finished = await finishSession(session.id, {
      durationSec: 600,
      totalScore: 82,
      subScores: { 논리성: 4 },
    });

    expect(finished).toMatchObject({
      status: 'finished',
      durationSec: 600,
      totalScore: 82,
      subScores: { 논리성: 4 },
    });
    expect(finished.finishedAt).toEqual(expect.any(String));
  });

  it('can finish without any scores', async () => {
    const session = await startSession();

    const finished = await finishSession(session.id);

    expect(finished).toMatchObject({ status: 'finished', totalScore: null });
  });

  it('refuses to finish another member session', async () => {
    const session = await startSession();

    signInAs(USERS.b);

    await expect(finishSession(session.id, { totalScore: 99 })).rejects.toMatchObject({
      status: 404,
    });
  });
});

describe('reviewing past interviews', () => {
  beforeEach(() => signInAs(USERS.a));

  it('lists my sessions newest first', async () => {
    await startSession();
    await startSession();

    const page = await listMySessions();

    expect(page.total).toBe(2);
    expect(page.items[0].createdAt >= page.items[1].createdAt).toBe(true);
  });

  it('opens a session with its answers attached', async () => {
    const session = await startSession();
    await saveQas(session.id, answers);

    const detail = await getSession(session.id);

    expect(detail.qas.map((q) => q.seq)).toEqual([1, 2]);
  });

  it('answers 404 for a session that does not exist', async () => {
    await expect(getSession('missing')).rejects.toMatchObject({ status: 404 });
  });

  it('hides another member session', async () => {
    const session = await startSession();

    signInAs(USERS.b);

    await expect(getSession(session.id)).rejects.toMatchObject({ status: 404 });
    await expect(listMySessions()).resolves.toMatchObject({ total: 0 });
  });

  it('deletes a session and its answers', async () => {
    const session = await startSession();
    await saveQas(session.id, answers);

    await expect(deleteSession(session.id)).resolves.toEqual({ deleted: 1 });
    expect(rows('interview_qas')).toHaveLength(0);
  });

  it('refuses a cross-account session delete', async () => {
    const session = await startSession();

    signInAs(USERS.b);

    await expect(deleteSession(session.id)).rejects.toMatchObject({ status: 404 });
  });

  it('counts finished interviews on the profile', async () => {
    const session = await startSession();
    await finishSession(session.id, { totalScore: 80 });

    await expect(getMySummary()).resolves.toMatchObject({
      stats: { finishedInterviewCount: 1 },
    });
  });
});

describe('scrapping interview questions', () => {
  let session;

  beforeEach(async () => {
    signInAs(USERS.a);
    session = await startSession();
    await saveQas(session.id, answers);
  });

  it('lists every answer of a session', async () => {
    const page = await listSessionQas(session.id);

    expect(page.total).toBe(2);
  });

  it('lists all my answers across sessions', async () => {
    const page = await listMyQas();

    expect(page.total).toBe(2);
  });

  it('searches questions and answers together', async () => {
    await expect(listMyQas({ q: 'REST' })).resolves.toMatchObject({ total: 1 });
    await expect(listMyQas({ q: '안녕하세요' })).resolves.toMatchObject({ total: 1 });
    await expect(listMyQas({ q: '없는내용' })).resolves.toMatchObject({ total: 0 });
  });

  it('survives quotes in the search box', async () => {
    await expect(listMyQas({ q: 'REST"' })).resolves.toMatchObject({ total: 1 });
  });

  it('sorts oldest first when asked', async () => {
    const page = await listMyQas({ sort: 'oldest' });

    expect(page.items[0].seq).toBe(1);
  });

  it('rejects an unknown sort', async () => {
    await expect(listMyQas({ sort: 'random' })).rejects.toMatchObject({ status: 400 });
  });

  it('is empty until something is scrapped', async () => {
    await expect(listMyScraps()).resolves.toMatchObject({ total: 0, items: [] });
  });

  it('collects the scrapped questions only', async () => {
    const [first] = (await listMyQas()).items;
    await toggleQaScrap(first.id);

    const scraps = await listMyScraps();

    expect(scraps.total).toBe(1);
    expect(scraps.items[0].id).toBe(first.id);
  });

  it('marks which questions are already scrapped', async () => {
    const [first] = (await listMyQas()).items;
    await toggleQaScrap(first.id);

    const mine = await getMyScrappedQaIds([first.id]);

    expect(mine.has(first.id)).toBe(true);
  });

  it('shows the scrap count on the profile', async () => {
    const [first] = (await listMyQas()).items;
    await toggleQaScrap(first.id);

    await expect(getMySummary()).resolves.toMatchObject({
      stats: { interviewScrapCount: 1 },
    });
  });

  it('searches inside the scrapped list', async () => {
    for (const qa of (await listMyQas()).items) await toggleQaScrap(qa.id);

    await expect(listMyScraps({ q: 'REST' })).resolves.toMatchObject({ total: 1 });
  });

  it('removes scraps in bulk', async () => {
    const [first] = (await listMyQas()).items;
    await toggleQaScrap(first.id);

    await expect(removeQaScraps([first.id])).resolves.toBe(1);
    await expect(listMyScraps()).resolves.toMatchObject({ total: 0 });
  });

  it('deletes answers in bulk', async () => {
    const ids = (await listMyQas()).items.map((q) => q.id);

    await expect(deleteQas(ids)).resolves.toBe(2);
    await expect(listMyQas()).resolves.toMatchObject({ total: 0 });
  });

  it('ignores an empty delete selection', async () => {
    await expect(deleteQas([])).resolves.toBe(0);
  });

  it('refuses to delete another member answers', async () => {
    const ids = (await listMyQas()).items.map((q) => q.id);

    signInAs(USERS.b);
    await expect(deleteQas(ids)).resolves.toBe(0);

    signInAs(USERS.a);
    await expect(listMyQas()).resolves.toMatchObject({ total: 2 });
  });

  it('turns a visitor away from the scrap list', async () => {
    signOutOfBrowser();

    await expect(listMyScraps()).rejects.toMatchObject({ status: 401 });
  });
});

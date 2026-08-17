import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { resetWorld, signInAs, signOutOfBrowser, startWorld, stopWorld, USERS } from './support/harness';
import { failNextAuth, failNextQuery, failNextRpc } from './support/supabase';
import { rows } from './support/database';
import { apiFetch } from '@backend/lib/api/_fetch';
import { getCompany, getRecommendedCompanies, listCompanies } from '@backend/lib/api/companies';
import { getTemplate, listTemplates } from '@backend/lib/api/templates';
import { getMyAccount, getMySummary } from '@backend/lib/api/mypage';
import { createPost, getPost, listPosts } from '@backend/lib/api/posts';
import { createPortfolio, getPortfolio, listMyPortfolios, updatePortfolio } from '@backend/lib/api/portfolio';
import { createSession, getSession, saveQas } from '@backend/lib/api/interview';
import { listComments } from '@backend/lib/api/comments';
import { listMyDocuments } from '@backend/lib/api/documents';
import { getCurrentUser } from '@backend/lib/api/auth';

const sparseCompany = () => rows('companies')[2];
const sparseTemplate = () => rows('resume_templates')[2];

const send = (path, init = {}) =>
  fetch(path, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init.headers ?? {}) },
  });

beforeAll(startWorld);
afterAll(stopWorld);
beforeEach(resetWorld);

describe('records with almost nothing filled in', () => {
  it('renders a company that has no optional data', async () => {
    const company = await getCompany('sparse');

    expect(company).toMatchObject({
      name: '정보없는회사',
      category: 'unknown_code',
      industry: 'unknown_code',
      tags: [],
      values: [],
      services: [],
      benefits: [],
      summary: [],
      news: [],
      ratings: {},
      salary: {},
      views: 0,
      favorite: 0,
      review: 0,
      jokbo: 0,
    });
  });

  it('lists a sparse company alongside the rest', async () => {
    const page = await listCompanies({ sort: 'name' });

    expect(page.total).toBe(3);
  });

  it('recommends a sparse company without crashing', async () => {
    const recommended = await getRecommendedCompanies(10);

    expect(recommended).toHaveLength(3);
  });

  it('renders a template that has no thumbnail or body', async () => {
    const template = await getTemplate(sparseTemplate().id);

    expect(template).toMatchObject({
      title: '정보없는 양식',
      thumbnail: null,
      views: 0,
      content: null,
      contentHtml: null,
    });
  });

  it('lists a sparse template with a zero view count', async () => {
    const page = await listTemplates({ sort: 'order' });

    expect(page.items.at(-1)).toMatchObject({ title: '정보없는 양식', views: 0, category: null });
  });

  it('renders a post that only has the required fields', async () => {
    signInAs(USERS.a);
    const post = await createPost({ postType: 'qbank' });

    const fetched = await getPost(post.id);

    expect(fetched).toMatchObject({
      postType: 'qbank',
      companyId: null,
      companyName: '',
      companyLogo: null,
      title: '',
      body: '',
      questions: '',
      questionList: [],
      tags: [],
      overallComment: '',
      difficulty: '',
      result: '',
      channel: '',
      jobInfo: '',
      likeCount: 0,
      scrapCount: 0,
      commentCount: 0,
      viewCount: 0,
    });
  });

  it('renders a portfolio that only has a title', async () => {
    signInAs(USERS.a);
    const draft = await createPortfolio({});

    const fetched = await getPortfolio(draft.id);

    expect(fetched).toMatchObject({
      title: '제목 없음',
      thumbnailUrl: '',
      category: null,
      description: null,
      likeCount: 0,
      bookmarkCount: 0,
      viewCount: 0,
      overview: [],
      document: [],
      code: [],
    });
  });

  it('renders an interview answer with no score or feedback', async () => {
    signInAs(USERS.a);
    const session = await createSession();
    await saveQas(session.id, [{ question: '질문만 있습니다' }]);

    const detail = await getSession(session.id);

    expect(detail.qas[0]).toMatchObject({
      answer: '',
      feedback: {},
      feedbackText: '',
      score: null,
      category: null,
    });
  });

  it('reads plain text feedback as-is', async () => {
    signInAs(USERS.a);
    const session = await createSession();
    await saveQas(session.id, [{ question: 'Q', feedback: '한 줄 피드백' }]);

    const detail = await getSession(session.id);

    expect(detail.qas[0].feedbackText).toBe('한 줄 피드백');
  });

  it('joins strengths and improvements when there is no summary', async () => {
    signInAs(USERS.a);
    const session = await createSession();
    await saveQas(session.id, [
      { question: 'Q', feedback: { strengths: ['논리적'], improvements: ['근거 부족'] } },
    ]);

    const detail = await getSession(session.id);

    expect(detail.qas[0].feedbackText).toBe('논리적 근거 부족');
  });
});

describe('a member with a bare account', () => {
  it('shows an account with no email and no provider list', async () => {
    signInAs(USERS.minimal);

    await expect(getMyAccount()).resolves.toMatchObject({
      id: USERS.minimal.id,
      email: null,
      providers: [],
    });
  });

  it('still reports the member on the health page', async () => {
    signInAs(USERS.minimal);

    const report = await apiFetch('/api/health');

    expect(report.checks.find((c) => c.label === '로그인 상태').detail).toContain('(이메일 없음)');
    expect(report.checks.find((c) => c.label === 'Profile 자동 생성 트리거').detail).toBe(
      'name=(없음) / avatar=X'
    );
  });

  it('wraps a single provider into a list', async () => {
    signInAs(USERS.legacy);

    await expect(getMyAccount()).resolves.toMatchObject({
      email: 'legacy@callback.test',
      providers: ['kakao'],
    });
  });

  it('copes with an account that has no timestamps', async () => {
    signInAs(USERS.legacy);

    await expect(getMyAccount()).resolves.toMatchObject({
      createdAt: null,
      lastSignInAt: null,
    });
  });

  it('returns an empty summary once the profile row is gone', async () => {
    signInAs(USERS.minimal);
    rows('profiles').length = 0;

    const summary = await getMySummary();

    expect(summary.profile).toBeNull();
    expect(Object.values(summary.stats).every((v) => v === 0)).toBe(true);
  });
});

describe('malformed request bodies', () => {
  beforeEach(() => signInAs(USERS.a));

  it.each([
    ['/api/posts', 'POST'],
    ['/api/portfolios', 'POST'],
    ['/api/documents', 'POST'],
    ['/api/interviews', 'POST'],
    ['/api/reactions', 'POST'],
    ['/api/views', 'POST'],
    ['/api/profiles/me', 'PATCH'],
  ])('rejects a broken json body on %s', async (path, method) => {
    const response = await send(path, { method, body: '{"broken"' });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      error: { message: 'JSON 본문이 필요합니다.' },
    });
  });

  it.each([
    ['/api/posts', 'DELETE'],
    ['/api/portfolios', 'DELETE'],
    ['/api/documents', 'DELETE'],
    ['/api/reactions', 'DELETE'],
    ['/api/interview-qas', 'DELETE'],
  ])('rejects a broken json body on %s %s', async (path, method) => {
    const response = await send(path, { method, body: 'nope' });

    expect(response.status).toBe(400);
  });

  it('rejects a broken json body when saving interview answers', async () => {
    const session = await createSession();

    const response = await send(`/api/interviews/${session.id}/qas`, {
      method: 'POST',
      body: 'nope',
    });

    expect(response.status).toBe(400);
  });

  it('rejects a broken json body when editing an interview', async () => {
    const session = await createSession();

    const response = await send(`/api/interviews/${session.id}`, { method: 'PATCH', body: 'nope' });

    expect(response.status).toBe(400);
  });

  it('rejects a broken json body when commenting', async () => {
    const post = await createPost({ postType: 'review', title: '후기' });

    const response = await send(`/api/posts/${post.id}/comments`, { method: 'POST', body: 'nope' });

    expect(response.status).toBe(400);
  });

  it('rejects a broken json body when editing a comment', async () => {
    const post = await createPost({ postType: 'review', title: '후기' });
    const created = await apiFetch(`/api/posts/${post.id}/comments`, {
      method: 'POST',
      body: { body: '댓글' },
    });

    const response = await send(`/api/comments/${created.id}`, { method: 'PATCH', body: 'nope' });

    expect(response.status).toBe(400);
  });

  it('rejects a broken json body when editing a post', async () => {
    const post = await createPost({ postType: 'review', title: '후기' });

    const response = await send(`/api/posts/${post.id}`, { method: 'PATCH', body: 'nope' });

    expect(response.status).toBe(400);
  });

  it('rejects a broken json body when editing a portfolio', async () => {
    const draft = await createPortfolio({ title: '작업' });

    const response = await send(`/api/portfolios/${draft.id}`, { method: 'PATCH', body: 'nope' });

    expect(response.status).toBe(400);
  });

  it('rejects a broken json body when editing a document', async () => {
    const { createDocument } = await import('@backend/lib/api/documents');
    const doc = await createDocument({ docType: 'resume', title: '이력서' });

    const response = await send(`/api/documents/${doc.id}`, { method: 'PATCH', body: 'nope' });

    expect(response.status).toBe(400);
  });
});

describe('missing or invalid query parameters', () => {
  it('rejects a codes request with no groups', async () => {
    await expect(apiFetch('/api/codes')).rejects.toMatchObject({ status: 400 });
  });

  it('rejects a reaction lookup with no target type', async () => {
    signInAs(USERS.a);

    await expect(apiFetch('/api/reactions')).rejects.toMatchObject({ status: 400 });
  });

  it('clamps a page size that is far too large', async () => {
    const page = await apiFetch('/api/templates', { query: { pageSize: 500 } });

    expect(page.pageSize).toBe(50);
  });

  it('clamps a page size of zero', async () => {
    const page = await apiFetch('/api/templates', { query: { pageSize: 0 } });

    expect(page.pageSize).toBe(1);
  });

  it('clamps a negative page number', async () => {
    const page = await apiFetch('/api/templates', { query: { page: -5 } });

    expect(page.page).toBe(1);
  });

  it('returns an empty page when the id filter is blank', async () => {
    const posts = await apiFetch('/api/posts', { query: { ids: ',,' } });
    const portfolios = await apiFetch('/api/portfolios', { query: { ids: ',,' } });
    const companies = await apiFetch('/api/companies', { query: { ids: ',,' } });

    expect([posts.total, portfolios.total, companies.total]).toEqual([0, 0, 0]);
  });

  it('rejects a comment whose body is missing entirely', async () => {
    signInAs(USERS.a);
    const post = await createPost({ postType: 'review', title: '후기' });

    await expect(
      apiFetch(`/api/posts/${post.id}/comments`, { method: 'POST', body: { body: null } })
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects a comment edit whose body is missing entirely', async () => {
    signInAs(USERS.a);
    const post = await createPost({ postType: 'review', title: '후기' });
    const comment = await apiFetch(`/api/posts/${post.id}/comments`, {
      method: 'POST',
      body: { body: '댓글' },
    });

    await expect(
      apiFetch(`/api/comments/${comment.id}`, { method: 'PATCH', body: { body: null } })
    ).rejects.toMatchObject({ status: 400 });
  });

  it('refuses to edit a profile that belongs to someone else', async () => {
    signInAs(USERS.a);

    await expect(
      apiFetch(`/api/profiles/${USERS.b.id}`, { method: 'PATCH', body: { name: 'stolen' } })
    ).rejects.toMatchObject({ status: 403 });
  });

  it('rejects an unknown document type on the shelf', async () => {
    signInAs(USERS.a);

    await expect(
      apiFetch('/api/documents', { query: { docType: 'novel' } })
    ).rejects.toMatchObject({ status: 400 });
  });

  it('falls back to a placeholder when a portfolio title is cleared', async () => {
    signInAs(USERS.a);
    const draft = await createPortfolio({ title: '작업' });

    const saved = await updatePortfolio(draft.id, { title: null });

    expect(saved.title).toBe('제목 없음');
  });

  it('rejects an unknown status when editing a portfolio', async () => {
    signInAs(USERS.a);
    const draft = await createPortfolio({ title: '작업' });

    await expect(updatePortfolio(draft.id, { status: 'archived' })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('rejects an unknown category when editing a portfolio', async () => {
    signInAs(USERS.a);
    const draft = await createPortfolio({ title: '작업' });

    await expect(updatePortfolio(draft.id, { category: 'vr' })).rejects.toMatchObject({
      status: 400,
    });
  });

  it('rejects an unknown status when creating a portfolio', async () => {
    signInAs(USERS.a);

    await expect(createPortfolio({ status: 'archived' })).rejects.toMatchObject({ status: 400 });
  });

  it('rejects a reaction removal without a list of targets', async () => {
    signInAs(USERS.a);

    await expect(
      apiFetch('/api/reactions', {
        method: 'DELETE',
        body: { targetType: 'company', targetIds: 'not-a-list' },
      })
    ).rejects.toMatchObject({ status: 400 });
  });

  it('falls back to a placeholder when a document title is cleared', async () => {
    signInAs(USERS.a);
    const { createDocument, updateDocument } = await import('@backend/lib/api/documents');
    const doc = await createDocument({ docType: 'resume', title: '이력서' });

    const saved = await updateDocument(doc.id, { title: null });

    expect(saved.title).toBe('제목 없음');
  });

  it('rejects an unknown status when editing an interview', async () => {
    signInAs(USERS.a);
    const session = await createSession();

    await expect(
      apiFetch(`/api/interviews/${session.id}`, { method: 'PATCH', body: { status: 'paused' } })
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects an interview edit with nothing in it', async () => {
    signInAs(USERS.a);
    const session = await createSession();

    await expect(
      apiFetch(`/api/interviews/${session.id}`, { method: 'PATCH', body: {} })
    ).rejects.toMatchObject({ status: 400 });
  });

  it('accepts a bare array of interview answers', async () => {
    signInAs(USERS.a);
    const session = await createSession();

    const saved = await apiFetch(`/api/interviews/${session.id}/qas`, {
      method: 'POST',
      body: [{ question: 'Q1' }],
    });

    expect(saved.saved).toBe(1);
  });
});

describe('when the database misbehaves', () => {
  beforeEach(() => signInAs(USERS.a));

  it.each([
    ['23505', 409, 'DUPLICATE'],
    ['23503', 400, 'INVALID_REFERENCE'],
    ['23514', 400, 'INVALID_VALUE'],
    ['42501', 403, 'FORBIDDEN'],
    ['PGRST301', 403, 'FORBIDDEN'],
    ['PGRST116', 404, 'NOT_FOUND'],
  ])('turns Postgres error %s into a %d for the user', async (code, status, expected) => {
    failNextQuery('posts', { code, message: `db said ${code}` });

    await expect(createPost({ postType: 'review', title: '후기' })).rejects.toMatchObject({
      status,
      code: expected,
    });
  });

  it.each(['PGRST202', 'PGRST205'])(
    'explains that the migration has not run yet for %s',
    async (code) => {
      failNextQuery('v_posts', { code, message: 'schema cache' });

      await expect(listPosts()).rejects.toMatchObject({
        status: 500,
        code: 'SCHEMA_NOT_READY',
      });
    }
  );

  it('falls back to a generic server error for anything else', async () => {
    failNextQuery('v_posts', { code: 'XX000', message: 'internal' });

    await expect(listPosts()).rejects.toMatchObject({ status: 500, code: 'INTERNAL_ERROR' });
  });

  it('reports a failing comment query', async () => {
    const post = await createPost({ postType: 'review', title: '후기' });
    failNextQuery('v_comments', { code: 'XX000' });

    await expect(listComments(post.id)).rejects.toMatchObject({ status: 500 });
  });

  it('reports a failing document query', async () => {
    failNextQuery('documents', { code: 'XX000' });

    await expect(listMyDocuments()).rejects.toMatchObject({ status: 500 });
  });

  it('reports a failing portfolio query', async () => {
    failNextQuery('v_portfolios', { code: 'XX000' });

    await expect(listMyPortfolios()).rejects.toMatchObject({ status: 500 });
  });

  it('reports a failing company query', async () => {
    failNextQuery('v_companies', { code: 'XX000' });

    await expect(listCompanies()).rejects.toMatchObject({ status: 500 });
  });

  it('reports a failing template query', async () => {
    failNextQuery('resume_templates', { code: 'XX000' });

    await expect(listTemplates()).rejects.toMatchObject({ status: 500 });
  });

  it('reports a failing interview query', async () => {
    failNextQuery('interview_sessions', { code: 'XX000' });

    await expect(apiFetch('/api/interviews')).rejects.toMatchObject({ status: 500 });
  });

  it('reports a failing interview answer query', async () => {
    failNextQuery('interview_qas', { code: 'XX000' });

    await expect(apiFetch('/api/interview-qas')).rejects.toMatchObject({ status: 500 });
  });

  it('reports a failing recommendation call', async () => {
    failNextRpc('get_recommended_companies', { code: 'XX000' });

    await expect(getRecommendedCompanies()).rejects.toMatchObject({ status: 500 });
  });

  it('reports a failing account deletion', async () => {
    failNextRpc('delete_my_account', { code: '42501' });

    await expect(apiFetch('/api/me', { method: 'DELETE' })).rejects.toMatchObject({ status: 403 });
  });

  it('treats an unreachable auth service as signed out', async () => {
    failNextAuth();

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it('surfaces the document limit trigger message', async () => {
    failNextQuery('documents', { code: 'P0001', message: 'DOCUMENT_LIMIT_EXCEEDED' });

    const { createDocument } = await import('@backend/lib/api/documents');

    await expect(createDocument({ docType: 'resume', title: '이력서' })).rejects.toMatchObject({
      status: 409,
      code: 'DOCUMENT_LIMIT_EXCEEDED',
    });
  });
});

describe('when the health page finds problems', () => {
  it.each([
    ['companies 테이블', 'companies'],
    ['v_companies 뷰', 'v_companies'],
  ])('flags %s as broken', async (label, table) => {
    failNextQuery(table, { message: '조회 실패' });

    const report = await apiFetch('/api/health');

    expect(report.checks.find((c) => c.label === label)).toMatchObject({
      ok: false,
      detail: '조회 실패',
    });
  });

  it('stringifies an error that carries no message', async () => {
    failNextQuery('companies', 'connection refused');

    const report = await apiFetch('/api/health');

    expect(report.checks.find((c) => c.label === 'companies 테이블')).toMatchObject({
      ok: false,
      detail: 'connection refused',
    });
  });

  it('flags a failing recommendation call', async () => {
    failNextRpc('get_recommended_companies', { message: '함수 없음' });

    const report = await apiFetch('/api/health');

    expect(report.checks.find((c) => c.label === 'RPC get_recommended_companies').ok).toBe(false);
  });

  it('flags a missing profile row as a trigger problem', async () => {
    signInAs(USERS.a);
    rows('profiles').length = 0;

    const report = await apiFetch('/api/health');

    expect(report.checks.find((c) => c.label === 'Profile 자동 생성 트리거').detail).toContain(
      'handle_new_user'
    );
  });

  it('flags a failing profile query', async () => {
    signInAs(USERS.a);
    failNextQuery('profiles', { message: 'RLS 차단' });

    const report = await apiFetch('/api/health');

    expect(report.checks.find((c) => c.label === 'Profile 자동 생성 트리거').detail).toBe('RLS 차단');
  });

  it('flags a failing document query', async () => {
    failNextQuery('documents', { message: '차단' });

    const report = await apiFetch('/api/health');

    expect(report.checks.find((c) => c.label === 'RLS - documents 는 본인 것만').ok).toBe(false);
  });

  it('explains that zero documents is expected while signed out', async () => {
    signOutOfBrowser();

    const report = await apiFetch('/api/health');

    expect(report.checks.find((c) => c.label === 'RLS - documents 는 본인 것만').detail).toContain(
      '0이어야 정상'
    );
  });
});

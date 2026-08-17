import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { resetWorld, signInAs, signOutOfBrowser, startWorld, stopWorld, USERS } from './support/harness';
import { rows } from './support/database';
import { apiFetch } from '@backend/lib/api/_fetch';
import {
  getMyReactionIds,
  hasMyReaction,
  listMyReactionTargetIds,
  removeReactions,
  toggleReaction,
} from '@backend/lib/api/reactions';
import { getCodes } from '@backend/lib/api/codes';
import { listCompanies } from '@backend/lib/api/companies';
import { listPosts } from '@backend/lib/api/posts';
import { listPortfolios } from '@backend/lib/api/portfolio';
import { listTemplates } from '@backend/lib/api/templates';
import { listMyDocuments } from '@backend/lib/api/documents';
import { listMySessions } from '@backend/lib/api/interview';
import { listMyQas } from '@backend/lib/api/interview';

const naver = () => rows('companies')[0];

beforeAll(startWorld);
afterAll(stopWorld);
beforeEach(resetWorld);

describe('health check', () => {
  it('reports every subsystem for a visitor', async () => {
    const report = await apiFetch('/api/health');

    expect(report.user).toBeNull();
    expect(report.checks.map((c) => c.label)).toEqual([
      '환경변수',
      '로그인 상태',
      'code_master Seed',
      'companies 테이블',
      'v_companies 뷰',
      'RPC get_recommended_companies',
      'Profile 자동 생성 트리거',
      'RLS - documents 는 본인 것만',
    ]);
  });

  it('passes every check once the seed data is in place', async () => {
    const report = await apiFetch('/api/health');

    expect(report.checks.every((c) => c.ok)).toBe(true);
  });

  it('skips the trigger check while signed out', async () => {
    const report = await apiFetch('/api/health');

    expect(report.checks.find((c) => c.label === 'Profile 자동 생성 트리거').detail).toBe(
      '비로그인 - 건너뜀'
    );
  });

  it('reports the signed-in member and their profile row', async () => {
    signInAs(USERS.a);

    const report = await apiFetch('/api/health');

    expect(report.user).toMatchObject({ id: USERS.a.id });
    expect(report.checks.find((c) => c.label === '로그인 상태').detail).toContain(USERS.a.email);
    expect(report.checks.find((c) => c.label === 'Profile 자동 생성 트리거').detail).toContain(
      'name=User A'
    );
  });

  it('flags a missing seed', async () => {
    rows('code_master').length = 0;

    const report = await apiFetch('/api/health');

    expect(report.checks.find((c) => c.label === 'code_master Seed')).toMatchObject({ ok: false });
  });
});

describe('the shared reaction endpoint', () => {
  beforeEach(() => signInAs(USERS.a));

  it('rejects a target type it does not know', async () => {
    await expect(toggleReaction('user', 'like', 'x')).rejects.toMatchObject({ status: 400 });
  });

  it('rejects a reaction kind it does not know', async () => {
    await expect(toggleReaction('post', 'hate', 'x')).rejects.toMatchObject({ status: 400 });
  });

  it('rejects a missing target id', async () => {
    await expect(toggleReaction('post', 'like', '')).rejects.toMatchObject({ status: 400 });
  });

  it('rejects an unknown target type when listing', async () => {
    await expect(listMyReactionTargetIds('user', 'like')).rejects.toMatchObject({ status: 400 });
  });

  it('rejects an unknown target type when removing', async () => {
    await expect(removeReactions('user', 'like', ['x'])).rejects.toMatchObject({ status: 400 });
  });

  it('answers whether a single target is already marked', async () => {
    await expect(hasMyReaction('company', 'bookmark', naver().id)).resolves.toBe(false);

    await toggleReaction('company', 'bookmark', naver().id);

    await expect(hasMyReaction('company', 'bookmark', naver().id)).resolves.toBe(true);
  });

  it('asks for nothing when the id list is empty', async () => {
    await expect(getMyReactionIds('company', 'bookmark', [])).resolves.toEqual(new Set());
  });

  it('gives a visitor an empty list rather than an error', async () => {
    signOutOfBrowser();

    await expect(listMyReactionTargetIds('company', 'bookmark')).resolves.toEqual([]);
  });
});

describe('the shared view counter', () => {
  it('rejects a target type it does not know', async () => {
    await expect(
      apiFetch('/api/views', { method: 'POST', body: { targetType: 'comment', targetId: 'x' } })
    ).rejects.toMatchObject({ status: 400 });
  });

  it('rejects a missing target id', async () => {
    await expect(
      apiFetch('/api/views', { method: 'POST', body: { targetType: 'post' } })
    ).rejects.toMatchObject({ status: 400 });
  });
});

describe('what a signed-out visitor may see', () => {
  beforeEach(async () => {
    signInAs(USERS.a);
    const { createPost } = await import('@backend/lib/api/posts');
    const { createPortfolio, publishPortfolio } = await import('@backend/lib/api/portfolio');
    const { createDocument } = await import('@backend/lib/api/documents');

    await createPost({ postType: 'review', companyId: naver().id, title: '공개 후기' });
    const draft = await createPortfolio({ title: '공개 작업' });
    await publishPortfolio(draft.id);
    await createDocument({ docType: 'resume', title: '비공개 이력서' });

    signOutOfBrowser();
  });

  it('may browse companies', async () => {
    await expect(listCompanies()).resolves.toMatchObject({ total: 3 });
  });

  it('may read the community board', async () => {
    await expect(listPosts()).resolves.toMatchObject({ total: 1 });
  });

  it('may browse the published gallery', async () => {
    await expect(listPortfolios()).resolves.toMatchObject({ total: 1 });
  });

  it('may browse free templates', async () => {
    await expect(listTemplates()).resolves.toMatchObject({ total: 3 });
  });

  it('sees no template bookmark of its own', async () => {
    const { items } = await listTemplates();

    expect(items.every((t) => t.bookmarkedByMe === false)).toBe(true);
  });

  it('may read the filter options', async () => {
    await expect(getCodes('job_role')).resolves.toHaveLength(2);
  });

  it('may not read anyone documents', async () => {
    await expect(listMyDocuments()).rejects.toMatchObject({ status: 401 });
  });

  it('may not read anyone interview sessions', async () => {
    await expect(listMySessions()).rejects.toMatchObject({ status: 401 });
  });

  it('may not read anyone interview answers', async () => {
    await expect(listMyQas()).rejects.toMatchObject({ status: 401 });
  });
});

describe('malformed requests', () => {
  beforeEach(() => signInAs(USERS.a));

  it('rejects a body that is not json', async () => {
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'not json at all',
    });

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({ error: { code: 'BAD_REQUEST' } });
  });

  it('rejects a bulk delete without a list', async () => {
    await expect(
      apiFetch('/api/documents', { method: 'DELETE', body: { ids: 'not-a-list' } })
    ).rejects.toMatchObject({ status: 400 });
  });

  it('answers 404 for an endpoint that does not exist', async () => {
    const response = await fetch('/api/nope');

    expect(response.status).toBe(404);
  });

  it('answers 405 for a method the endpoint does not serve', async () => {
    const response = await fetch('/api/codes', { method: 'DELETE' });

    expect(response.status).toBe(405);
  });
});

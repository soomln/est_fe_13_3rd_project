import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { resetWorld, signInAs, startWorld, stopWorld, USERS } from './support/harness';
import { rows } from './support/database';
import {
  createDocument,
  createDocumentFromTemplate,
  deleteDocument,
  deleteDocuments,
  getDocument,
  listMyDocuments,
  updateDocument,
} from '@backend/lib/api/documents';
import {
  getMyBookmarkedTemplateIds,
  getTemplate,
  incrementTemplateView,
  listMyBookmarkedTemplateIds,
  listTemplates,
  toggleTemplateBookmark,
} from '@backend/lib/api/templates';
import { updateProfile } from '@backend/lib/api/profile';
import {
  buildResumeHtmlFromMyProfile,
  buildResumeHtmlFromProfile,
} from '@backend/lib/api/resumeFill';

const resumeTemplate = () => rows('resume_templates')[0];

beforeAll(startWorld);
afterAll(stopWorld);
beforeEach(resetWorld);

describe('free template gallery', () => {
  it('lists only active templates with tab counts', async () => {
    const page = await listTemplates();

    expect(page.items.map((t) => t.title)).toEqual([
      '신입 개발자 이력서',
      '자기소개서 양식',
      '정보없는 양식',
    ]);
    expect(page.counts).toEqual({ all: 3, resume: 2, cover_letter: 1 });
  });

  it('filters by document type', async () => {
    const page = await listTemplates({ docType: 'cover_letter' });

    expect(page.items.map((t) => t.docType)).toEqual(['cover_letter']);
  });

  it('rejects an unknown document type', async () => {
    await expect(listTemplates({ docType: 'novel' })).rejects.toMatchObject({ status: 400 });
  });

  it('searches by title', async () => {
    const page = await listTemplates({ q: '자기소개서' });

    expect(page.items).toHaveLength(1);
  });

  it('sorts by newest', async () => {
    const page = await listTemplates({ sort: 'latest' });

    expect(page.items[0].title).toBe('정보없는 양식');
  });

  it('rejects an unknown sort', async () => {
    await expect(listTemplates({ sort: 'random' })).rejects.toMatchObject({ status: 400 });
  });

  it('opens a template with its body', async () => {
    const template = await getTemplate(resumeTemplate().id);

    expect(template).toMatchObject({
      title: '신입 개발자 이력서',
      docType: 'resume',
      contentHtml: '<h1>이력서</h1>',
    });
  });

  it('hides a deactivated template', async () => {
    const inactive = rows('resume_templates').find((t) => !t.is_active);

    await expect(getTemplate(inactive.id)).rejects.toMatchObject({ status: 404 });
  });

  it('counts a template view', async () => {
    await incrementTemplateView(resumeTemplate().id);

    expect((await getTemplate(resumeTemplate().id)).views).toBe(121);
  });

  it('bookmarks a template for later', async () => {
    signInAs(USERS.a);

    await expect(toggleTemplateBookmark(resumeTemplate().id)).resolves.toBe(true);
    await expect(listMyBookmarkedTemplateIds()).resolves.toEqual([resumeTemplate().id]);
    await expect(getMyBookmarkedTemplateIds([resumeTemplate().id])).resolves.toEqual(
      new Set([resumeTemplate().id])
    );
  });
});

describe('writing a resume', () => {
  beforeEach(() => signInAs(USERS.a));

  it('requires a signed-in member to list documents', async () => {
    signInAs(USERS.b);
    const listed = await listMyDocuments();

    expect(listed.items).toEqual([]);
  });

  it('starts from a blank document', async () => {
    const created = await createDocument({ docType: 'resume', title: '내 이력서' });

    expect(created).toMatchObject({ docType: 'resume', title: '내 이력서', content: null });
  });

  it('falls back to a placeholder title', async () => {
    const created = await createDocument({ docType: 'resume', title: '   ' });

    expect(created.title).toBe('제목 없음');
  });

  it('rejects an unknown document type', async () => {
    await expect(createDocument({ docType: 'novel' })).rejects.toMatchObject({ status: 400 });
  });

  it('starts from a template and copies its body', async () => {
    const created = await createDocumentFromTemplate(resumeTemplate().id);

    expect(created).toMatchObject({
      docType: 'resume',
      title: '신입 개발자 이력서',
      templateId: resumeTemplate().id,
      contentHtml: '<h1>이력서</h1>',
    });
  });

  it('lets the member rename the copy', async () => {
    const created = await createDocumentFromTemplate(resumeTemplate().id, '나의 이력서');

    expect(created.title).toBe('나의 이력서');
  });

  it('saves the three editor payloads together', async () => {
    const created = await createDocument({ docType: 'resume', title: '이력서' });

    const saved = await updateDocument(created.id, {
      content: { type: 'doc' },
      contentHtml: '<p>hello</p>',
      contentText: 'hello',
    });

    expect(saved).toMatchObject({
      content: { type: 'doc' },
      contentHtml: '<p>hello</p>',
      contentText: 'hello',
    });
  });

  it('reopens the document with everything intact', async () => {
    const created = await createDocument({
      docType: 'resume',
      title: '이력서',
      content: { type: 'doc' },
      contentHtml: '<p>hi</p>',
      contentText: 'hi',
    });

    await expect(getDocument(created.id)).resolves.toMatchObject({
      id: created.id,
      contentText: 'hi',
    });
  });

  it('rejects an update with nothing in it', async () => {
    const created = await createDocument({ docType: 'resume', title: '이력서' });

    await expect(updateDocument(created.id, {})).rejects.toMatchObject({ status: 400 });
  });
});

describe('the document shelf', () => {
  beforeEach(() => signInAs(USERS.a));

  it('keeps the body out of the list payload', async () => {
    await createDocument({ docType: 'resume', title: '이력서', contentText: 'secret' });

    const listed = await listMyDocuments();

    expect(listed.items[0]).not.toHaveProperty('contentText');
  });

  it('counts each tab', async () => {
    await createDocument({ docType: 'resume', title: 'r1' });
    await createDocument({ docType: 'cover_letter', title: 'c1' });

    const listed = await listMyDocuments();

    expect(listed.counts).toEqual({ all: 2, resume: 1, cover_letter: 1 });
  });

  it('filters by tab', async () => {
    await createDocument({ docType: 'resume', title: 'r1' });
    await createDocument({ docType: 'cover_letter', title: 'c1' });

    const listed = await listMyDocuments({ docType: 'cover_letter' });

    expect(listed.items.map((d) => d.title)).toEqual(['c1']);
  });

  it('searches by title only', async () => {
    await createDocument({ docType: 'resume', title: '백엔드 이력서', contentText: '프론트엔드' });

    await expect(listMyDocuments({ q: '백엔드' })).resolves.toMatchObject({ total: 1 });
    await expect(listMyDocuments({ q: '프론트엔드' })).resolves.toMatchObject({ total: 0 });
  });

  it('sorts by title', async () => {
    await createDocument({ docType: 'resume', title: 'b' });
    await createDocument({ docType: 'resume', title: 'a' });

    const listed = await listMyDocuments({ sort: 'title' });

    expect(listed.items.map((d) => d.title)).toEqual(['a', 'b']);
  });

  it('rejects an unknown sort', async () => {
    await expect(listMyDocuments({ sort: 'random' })).rejects.toMatchObject({ status: 400 });
  });

  it('pages through a long shelf', async () => {
    for (let i = 0; i < 3; i += 1) await createDocument({ docType: 'resume', title: `d${i}` });

    const page = await listMyDocuments({ page: 2, pageSize: 2 });

    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(3);
  });

  it('stops the member at ten documents per type', async () => {
    for (let i = 0; i < 10; i += 1) await createDocument({ docType: 'resume', title: `r${i}` });

    await expect(createDocument({ docType: 'resume', title: 'r10' })).rejects.toMatchObject({
      status: 409,
      code: 'DOCUMENT_LIMIT_EXCEEDED',
    });
  });

  it('counts the two types separately', async () => {
    for (let i = 0; i < 10; i += 1) await createDocument({ docType: 'resume', title: `r${i}` });

    await expect(createDocument({ docType: 'cover_letter', title: 'c0' })).resolves.toMatchObject({
      docType: 'cover_letter',
    });
  });

  it('deletes one document', async () => {
    const created = await createDocument({ docType: 'resume', title: 'r' });

    await expect(deleteDocument(created.id)).resolves.toEqual({ deleted: 1 });
    await expect(listMyDocuments()).resolves.toMatchObject({ total: 0 });
  });

  it('deletes a selection at once', async () => {
    const a = await createDocument({ docType: 'resume', title: 'r1' });
    const b = await createDocument({ docType: 'resume', title: 'r2' });

    await expect(deleteDocuments([a.id, b.id])).resolves.toBe(2);
  });

  it('ignores an empty selection', async () => {
    await expect(deleteDocuments([])).resolves.toBe(0);
  });

  it('answers 404 when deleting something already gone', async () => {
    await expect(deleteDocument('missing-id')).rejects.toMatchObject({ status: 404 });
  });
});

describe('documents are private', () => {
  it('hides one member documents from another', async () => {
    signInAs(USERS.a);
    const mine = await createDocument({ docType: 'resume', title: 'A only' });

    signInAs(USERS.b);

    await expect(listMyDocuments()).resolves.toMatchObject({ total: 0 });
    await expect(getDocument(mine.id)).rejects.toMatchObject({ status: 404 });
  });

  it('refuses a cross-account edit', async () => {
    signInAs(USERS.a);
    const mine = await createDocument({ docType: 'resume', title: 'A only' });

    signInAs(USERS.b);

    await expect(updateDocument(mine.id, { title: 'stolen' })).rejects.toMatchObject({
      status: 404,
    });
  });

  it('refuses a cross-account delete', async () => {
    signInAs(USERS.a);
    const mine = await createDocument({ docType: 'resume', title: 'A only' });

    signInAs(USERS.b);
    await expect(deleteDocuments([mine.id])).resolves.toBe(0);

    signInAs(USERS.a);
    await expect(getDocument(mine.id)).resolves.toMatchObject({ title: 'A only' });
  });

  it('turns a visitor away from the shelf', async () => {
    await expect(listMyDocuments()).rejects.toMatchObject({ status: 401 });
  });
});

describe('loading my profile into the editor', () => {
  it('builds nothing without a profile', () => {
    expect(buildResumeHtmlFromProfile(null)).toBe('');
  });

  it('escapes anything the member typed', () => {
    const html = buildResumeHtmlFromProfile({ name: '<script>alert(1)</script>' });

    expect(html).toBe('<h1>&lt;script&gt;alert(1)&lt;/script&gt;</h1>');
  });

  it('returns an empty document for a visitor', async () => {
    await expect(buildResumeHtmlFromMyProfile()).resolves.toBe('');
  });

  it('assembles the saved profile with readable labels', async () => {
    signInAs(USERS.a);
    await updateProfile({
      name: '장도담',
      desired_role: '백엔드 개발자',
      career_level: 'junior',
      email: 'resume@callback.test',
      github_url: 'https://github.com/dodam',
      bio: '안녕하세요',
      educations: [{ school: '한국대', major: '컴공', status: 'graduated', admission: '2016.03', graduation: '2020.02' }],
      careers: [{ start: '2020.03', end: '재직 중', company: '옵티미', role: '백엔드' }],
      awards: [{ date: '2025.11', name: '해커톤 대상' }],
      languages: [{ language: '영어', level: 'high', detail: 'TOEIC 900' }],
      skill_codes: ['react', 'next'],
    });

    const html = await buildResumeHtmlFromMyProfile();

    expect(html).toContain('<h1>장도담</h1>');
    expect(html).toContain('백엔드 개발자 · 신입');
    expect(html).toContain('졸업');
    expect(html).toContain('<li>React</li>');
    expect(html).toContain('TOEIC 900');
    expect(html).toContain('해커톤 대상');
  });
});

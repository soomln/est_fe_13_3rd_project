import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createStorageStub } from '../helpers/supabase';
import { mockApiFetch } from '../helpers/routeHarness';

vi.mock('../../lib/api/_fetch', () => ({ apiFetch: vi.fn() }));
vi.mock('../../lib/api/templates', () => ({ getTemplate: vi.fn() }));
vi.mock('../../lib/supabase/client', () => ({ createClient: vi.fn() }));
vi.mock('../../lib/api/auth', () => ({ getCurrentUser: vi.fn() }));

const { apiFetch } = await import('../../lib/api/_fetch');
const { getTemplate } = await import('../../lib/api/templates');
const { createClient } = await import('../../lib/supabase/client');
const { getCurrentUser } = await import('../../lib/api/auth');
const {
  createDocument,
  createDocumentFromTemplate,
  deleteDocument,
  deleteDocuments,
  getDocument,
  listMyDocuments,
  updateDocument,
  createDocumentDraftId,
  removeDocumentImages,
  uploadDocumentImage,
  uploadDocumentImages,
} = await import('../../lib/api/documents');

const file = ({ type = 'image/png', size = 1024, name = 'shot.PNG' } = {}) => ({
  type,
  size,
  name,
});

let storage;

beforeEach(() => {
  apiFetch.mockReset();
  getTemplate.mockReset();
  getCurrentUser.mockResolvedValue({ id: 'u1' });
  storage = createStorageStub();
  createClient.mockReturnValue({ storage });
});

describe('listMyDocuments', () => {
  it('defaults to 10 per page sorted by latest', async () => {
    mockApiFetch(apiFetch, { 'GET /api/documents': { items: [] } });

    await listMyDocuments();

    expect(apiFetch.mock.calls[0][1].query).toEqual({
      docType: undefined,
      q: undefined,
      sort: 'latest',
      page: 1,
      pageSize: 10,
    });
  });

  it('accepts a doc type and a keyword', async () => {
    mockApiFetch(apiFetch, { 'GET /api/documents': { items: [] } });

    await listMyDocuments({ docType: 'resume', q: '이력서', sort: 'title', page: 2, pageSize: 5 });

    expect(apiFetch.mock.calls[0][1].query).toEqual({
      docType: 'resume',
      q: '이력서',
      sort: 'title',
      page: 2,
      pageSize: 5,
    });
  });
});

describe('getDocument', () => {
  it('encodes the id before fetching', async () => {
    mockApiFetch(apiFetch, { 'GET /api/documents/d%201': { id: 'd 1' } });

    await getDocument('d 1');

    expect(apiFetch.mock.calls[0][0]).toBe('/api/documents/d%201');
  });
});

describe('createDocument', () => {
  it('sends all three content fields as null', async () => {
    mockApiFetch(apiFetch, { 'POST /api/documents': { id: 'd1' } });

    await createDocument({ docType: 'resume', title: '내 이력서' });

    expect(apiFetch).toHaveBeenCalledWith('/api/documents', {
      method: 'POST',
      body: {
        id: null,
        docType: 'resume',
        title: '내 이력서',
        templateId: null,
        content: null,
        contentHtml: null,
        contentText: null,
      },
    });
  });

  it('does not throw when called without arguments', async () => {
    mockApiFetch(apiFetch, { 'POST /api/documents': { id: 'd1' } });

    await createDocument();

    expect(apiFetch.mock.calls[0][1].body.docType).toBeUndefined();
  });

  it('forwards all three content fields as given', async () => {
    mockApiFetch(apiFetch, { 'POST /api/documents': { id: 'd1' } });

    await createDocument({
      docType: 'cover_letter',
      title: '자소서',
      templateId: 't1',
      content: { type: 'doc' },
      contentHtml: '<p>hi</p>',
      contentText: 'hi',
    });

    expect(apiFetch.mock.calls[0][1].body).toMatchObject({
      templateId: 't1',
      content: { type: 'doc' },
      contentHtml: '<p>hi</p>',
      contentText: 'hi',
    });
  });
});

describe('createDocumentFromTemplate', () => {
  it('copies the template content into a new document', async () => {
    getTemplate.mockResolvedValue({
      id: 't1',
      title: '신입 이력서 양식',
      docType: 'resume',
      content: { type: 'doc' },
      contentHtml: '<h1>이력서</h1>',
    });
    mockApiFetch(apiFetch, { 'POST /api/documents': { id: 'd1' } });

    await createDocumentFromTemplate('t1');

    expect(getTemplate).toHaveBeenCalledWith('t1');
    expect(apiFetch.mock.calls[0][1].body).toEqual({
      id: null,
      docType: 'resume',
      title: '신입 이력서 양식',
      templateId: 't1',
      content: { type: 'doc' },
      contentHtml: '<h1>이력서</h1>',
      contentText: null,
    });
  });

  it('accepts an explicit title', async () => {
    getTemplate.mockResolvedValue({ id: 't1', title: '양식', docType: 'resume' });
    mockApiFetch(apiFetch, { 'POST /api/documents': { id: 'd1' } });

    await createDocumentFromTemplate('t1', '내 이력서');

    expect(apiFetch.mock.calls[0][1].body.title).toBe('내 이력서');
  });
});

describe('updateDocument', () => {
  it('sends a PATCH', async () => {
    mockApiFetch(apiFetch, { 'PATCH /api/documents/d1': { id: 'd1' } });

    await updateDocument('d1', { title: '수정' });

    expect(apiFetch.mock.calls[0][1]).toEqual({ method: 'PATCH', body: { title: '수정' } });
  });
});

describe('deletion', () => {
  it('deletes a single item with DELETE', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/documents/d1': { deleted: 1 } });

    await deleteDocument('d1');

    expect(apiFetch).toHaveBeenCalledWith('/api/documents/d1', { method: 'DELETE' });
  });

  it('returns how many were deleted in bulk', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/documents': { deleted: 3 } });

    await expect(deleteDocuments(['d1', 'd2', 'd3'])).resolves.toBe(3);
  });

  it('skips the request when there is nothing to delete', async () => {
    await expect(deleteDocuments([])).resolves.toBe(0);
    await expect(deleteDocuments()).resolves.toBe(0);
    expect(apiFetch).not.toHaveBeenCalled();
  });
});

describe('uploadDocumentImage', () => {
  it('rejects with 401 when signed out', async () => {
    getCurrentUser.mockResolvedValue(null);

    await expect(uploadDocumentImage('d1', file())).rejects.toMatchObject({ status: 401 });
  });

  it('rejects a disallowed file type', async () => {
    await expect(uploadDocumentImage('d1', file({ type: 'application/pdf' }))).rejects.toThrowError(
      'JPG, PNG, WEBP, GIF 이미지만 올릴 수 있습니다.'
    );
  });

  it.each(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])('%s is allowed', async (type) => {
    await expect(uploadDocumentImage('d1', file({ type }))).resolves.toEqual(expect.any(String));
  });

  it('rejects a file larger than 5MB', async () => {
    await expect(
      uploadDocumentImage('d1', file({ size: 5 * 1024 * 1024 + 1 }))
    ).rejects.toThrowError('이미지는 5MB 이하만 올릴 수 있습니다.');
  });

  it('accepts a file of exactly 5MB', async () => {
    await expect(uploadDocumentImage('d1', file({ size: 5 * 1024 * 1024 }))).resolves.toEqual(
      expect.any(String)
    );
  });

  it('stores under the user and document folder in the documents bucket', async () => {
    await uploadDocumentImage('d1', file({ name: 'photo.JPEG' }));

    expect(storage.buckets).toEqual(['documents']);
    expect(storage.uploads[0].path).toMatch(/^u1\/d1\/\d+-\d+\.jpeg$/);
  });

  it('falls back to png when there is no extension', async () => {
    await uploadDocumentImage('d1', file({ name: '' }));

    expect(storage.uploads[0].path).toMatch(/\.png$/);
  });

  it('wraps an upload failure in ApiError', async () => {
    storage = createStorageStub({ uploadError: { message: 'too large' } });
    createClient.mockReturnValue({ storage });

    await expect(uploadDocumentImage('d1', file())).rejects.toThrowError(
      '이미지 업로드에 실패했습니다: too large'
    );
  });

  it('returns an app url that never expires, not a Storage url', async () => {
    const url = await uploadDocumentImage('d1', file());

    expect(url).toMatch(/^\/api\/documents\/d1\/images\/\d+-\d+\.png$/);
    expect(url).not.toContain('supabase');
  });

  it('points the url at the same file it uploaded', async () => {
    const url = await uploadDocumentImage('d1', file());

    expect(storage.uploads[0].path).toBe(`u1/d1/${url.split('/').pop()}`);
  });
});

describe('uploadDocumentImages', () => {
  it('uploads each file in turn and returns the urls', async () => {
    const urls = await uploadDocumentImages('d1', [file(), file()]);

    expect(urls).toHaveLength(2);
    expect(storage.uploads).toHaveLength(2);
  });

  it('returns an empty array when files is missing', async () => {
    await expect(uploadDocumentImages('d1')).resolves.toEqual([]);
    expect(storage.uploads).toHaveLength(0);
  });

  it('accepts 10 files', async () => {
    const files = Array.from({ length: 10 }, () => file());

    await expect(uploadDocumentImages('d1', files)).resolves.toHaveLength(10);
  });

  it('rejects 11 files without uploading any', async () => {
    const files = Array.from({ length: 11 }, () => file());

    await expect(uploadDocumentImages('d1', files)).rejects.toThrowError(
      '이미지는 한 번에 10장까지 올릴 수 있습니다.'
    );
    expect(storage.uploads).toHaveLength(0);
  });
});

describe('draft 상태 지원', () => {
  it('mints a uuid the server will accept as a document id', () => {
    const id = createDocumentDraftId();

    expect(id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
  });

  it('mints a different id each time', () => {
    expect(createDocumentDraftId()).not.toBe(createDocumentDraftId());
  });

  it('uploads to the draft id before the document exists', async () => {
    const draftId = createDocumentDraftId();

    const url = await uploadDocumentImage(draftId, file());

    expect(storage.uploads[0].path).toContain(`u1/${draftId}/`);
    expect(url).toContain(`/api/documents/${draftId}/images/`);
  });

  it('saves the draft under the same id the images were uploaded to', async () => {
    mockApiFetch(apiFetch, { 'POST /api/documents': { id: 'd1' } });
    const draftId = createDocumentDraftId();

    await createDocument({ id: draftId, docType: 'resume', title: '초안' });

    expect(apiFetch.mock.calls[0][1].body).toMatchObject({ id: draftId });
  });

  it('discards abandoned draft images', async () => {
    mockApiFetch(apiFetch, { 'DELETE /api/documents/draft-1/images': null });

    await removeDocumentImages('draft-1');

    expect(apiFetch).toHaveBeenCalledWith('/api/documents/draft-1/images', { method: 'DELETE' });
  });
});

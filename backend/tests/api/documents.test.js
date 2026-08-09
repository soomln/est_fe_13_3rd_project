import { beforeEach, describe, expect, it, vi } from 'vitest';

import { mockApiFetch } from '../helpers/routeHarness';

vi.mock('../../lib/api/_fetch', () => ({ apiFetch: vi.fn() }));
vi.mock('../../lib/api/templates', () => ({ getTemplate: vi.fn() }));

const { apiFetch } = await import('../../lib/api/_fetch');
const { getTemplate } = await import('../../lib/api/templates');
const {
  createDocument,
  createDocumentFromTemplate,
  deleteDocument,
  deleteDocuments,
  getDocument,
  listMyDocuments,
  updateDocument,
} = await import('../../lib/api/documents');

beforeEach(() => {
  apiFetch.mockReset();
  getTemplate.mockReset();
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

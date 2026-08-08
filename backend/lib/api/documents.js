import { PAGE_SIZE } from '../constants';
import { apiFetch } from './_fetch';
import { getTemplate } from './templates';

export async function listMyDocuments({
  docType,
  q,
  sort = 'latest',
  page = 1,
  pageSize = PAGE_SIZE.documents,
} = {}) {
  return apiFetch('/api/documents', { query: { docType, q, sort, page, pageSize } });
}

export async function getDocument(id) {
  return apiFetch(`/api/documents/${encodeURIComponent(id)}`);
}

export async function createDocument({
  docType,
  title,
  templateId = null,
  content = null,
  contentHtml = null,
  contentText = null,
} = {}) {
  return apiFetch('/api/documents', {
    method: 'POST',
    body: { docType, title, templateId, content, contentHtml, contentText },
  });
}

export async function createDocumentFromTemplate(templateId, title) {
  const template = await getTemplate(templateId);
  return createDocument({
    docType: template.docType,
    title: title ?? template.title,
    templateId: template.id,
    content: template.content,
    contentHtml: template.contentHtml,
  });
}

export async function updateDocument(id, patch) {
  return apiFetch(`/api/documents/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch });
}

export async function deleteDocument(id) {
  return apiFetch(`/api/documents/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function deleteDocuments(ids) {
  if (!ids?.length) return 0;
  const { deleted } = await apiFetch('/api/documents', { method: 'DELETE', body: { ids } });
  return deleted;
}

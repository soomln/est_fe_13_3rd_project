import { PAGE_SIZE, UPLOAD_LIMIT } from '../constants';
import { createClient } from '../supabase/client';
import { apiFetch } from './_fetch';
import { getCurrentUser } from './auth';
import { ApiError } from './errors';
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

export function createDocumentDraftId() {
  return crypto.randomUUID();
}

export async function createDocument({
  id = null,
  docType,
  title,
  templateId = null,
  content = null,
  contentHtml = null,
  contentText = null,
} = {}) {
  return apiFetch('/api/documents', {
    method: 'POST',
    body: { id, docType, title, templateId, content, contentHtml, contentText },
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

export async function uploadDocumentImage(documentId, file) {
  const user = await getCurrentUser();
  if (!user) throw new ApiError('로그인이 필요합니다.', { status: 401 });

  const { maxBytes, mimes } = UPLOAD_LIMIT.document;
  if (!mimes.includes(file.type)) {
    throw new ApiError('JPG, PNG, WEBP, GIF 이미지만 올릴 수 있습니다.');
  }
  if (file.size > maxBytes) {
    throw new ApiError(`이미지는 ${maxBytes / 1024 / 1024}MB 이하만 올릴 수 있습니다.`);
  }

  const supabase = createClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const name = `${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;

  const { error } = await supabase.storage
    .from('documents')
    .upload(`${user.id}/${documentId}/${name}`, file, { cacheControl: '3600', upsert: false });
  if (error) throw new ApiError(`이미지 업로드에 실패했습니다: ${error.message}`, { cause: error });

  return `/api/documents/${encodeURIComponent(documentId)}/images/${name}`;
}

export async function uploadDocumentImages(documentId, files) {
  const list = Array.from(files ?? []);
  if (list.length > UPLOAD_LIMIT.document.maxCount) {
    throw new ApiError(`이미지는 한 번에 ${UPLOAD_LIMIT.document.maxCount}장까지 올릴 수 있습니다.`);
  }

  const urls = [];
  for (const file of list) {
    urls.push(await uploadDocumentImage(documentId, file));
  }
  return urls;
}

export async function removeDocumentImages(documentId) {
  await apiFetch(`/api/documents/${encodeURIComponent(documentId)}/images`, { method: 'DELETE' });
}

import { PAGE_SIZE, REACTION } from '../constants';
import { apiFetch } from './_fetch';
import { getMyReactionIds, listMyReactionTargetIds, toggleReaction } from './reactions';

export async function listTemplates({
  docType,
  q,
  sort = 'popular',
  page = 1,
  pageSize = PAGE_SIZE.templates,
} = {}) {
  return apiFetch('/api/templates', { query: { docType, q, sort, page, pageSize } });
}

export async function getTemplate(id) {
  return apiFetch(`/api/templates/${encodeURIComponent(id)}`);
}

export async function incrementTemplateView(templateId) {
  await apiFetch('/api/views', {
    method: 'POST',
    body: { targetType: 'template', targetId: templateId },
  });
}

export async function toggleTemplateBookmark(templateId) {
  return toggleReaction(...REACTION.templateBookmark, templateId);
}

export async function getMyBookmarkedTemplateIds(templateIds) {
  return getMyReactionIds(...REACTION.templateBookmark, templateIds);
}

export async function listMyBookmarkedTemplateIds() {
  return listMyReactionTargetIds(...REACTION.templateBookmark);
}

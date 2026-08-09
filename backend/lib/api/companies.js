import { PAGE_SIZE, REACTION } from '../constants';
import { apiFetch } from './_fetch';
import {
  getMyReactionIds,
  listMyReactionTargetIds,
  removeReactions,
  toggleReaction,
} from './reactions';

export async function listCompanies({
  q,
  industry,
  size,
  jobRole,
  sort = 'popular',
  page = 1,
  pageSize = PAGE_SIZE.companies,
} = {}) {
  return apiFetch('/api/companies', {
    query: { q, industry, size, jobRole, sort, page, pageSize },
  });
}

export async function getCompany(slug) {
  return apiFetch(`/api/companies/${encodeURIComponent(slug)}`);
}

export async function getRecommendedCompanies(limit = 6) {
  const { items } = await apiFetch('/api/companies/recommended', { query: { limit } });
  return items;
}

export async function incrementCompanyView(companyId) {
  await apiFetch('/api/views', {
    method: 'POST',
    body: { targetType: 'company', targetId: companyId },
  });
}

export async function toggleCompanyBookmark(companyId) {
  return toggleReaction(...REACTION.companyBookmark, companyId);
}

export async function getMyBookmarkedCompanyIds(companyIds) {
  return getMyReactionIds(...REACTION.companyBookmark, companyIds);
}

export async function listMyBookmarkedCompanies({
  page = 1,
  pageSize = PAGE_SIZE.scrappedCompanies,
} = {}) {
  const ids = await listMyReactionTargetIds(...REACTION.companyBookmark);
  if (ids.length === 0) return { items: [], total: 0, page, pageSize };

  const pageIds = ids.slice((page - 1) * pageSize, page * pageSize);
  const { items } = await apiFetch('/api/companies', {
    query: { ids: pageIds.join(','), pageSize },
  });

  const order = new Map(pageIds.map((id, index) => [id, index]));
  items.sort((a, b) => order.get(a.id) - order.get(b.id));

  return { items, total: ids.length, page, pageSize };
}

export async function removeCompanyBookmarks(companyIds) {
  return removeReactions(...REACTION.companyBookmark, companyIds);
}

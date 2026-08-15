import { PAGE_SIZE, REACTION } from '../constants';
import { apiFetch } from './_fetch';
import {
  getMyReactionIds,
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
  sort = 'latest',
  page = 1,
  pageSize = PAGE_SIZE.scrappedCompanies,
} = {}) {
  return apiFetch('/api/companies', { query: { scrapped: 1, sort, page, pageSize } });
}

export async function removeCompanyBookmarks(companyIds) {
  return removeReactions(...REACTION.companyBookmark, companyIds);
}

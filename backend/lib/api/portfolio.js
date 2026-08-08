import { PAGE_SIZE, REACTION, UPLOAD_LIMIT } from '../constants';
import { createClient } from '../supabase/client';
import { apiFetch } from './_fetch';
import { getCurrentUser } from './auth';
import { ApiError } from './errors';
import { getMyReactionIds, listMyReactionTargetIds, toggleReaction } from './reactions';

export async function listPortfolios({
  category,
  userId,
  sort = 'latest',
  page = 1,
  pageSize = PAGE_SIZE.portfolioGallery,
} = {}) {
  return apiFetch('/api/portfolios', { query: { category, userId, sort, page, pageSize } });
}

export async function listMyPortfolios({
  status,
  sort = 'latest',
  page = 1,
  pageSize = PAGE_SIZE.myPortfolios,
} = {}) {
  return apiFetch('/api/portfolios', { query: { mine: 1, status, sort, page, pageSize } });
}

export async function getPortfolio(id) {
  return apiFetch(`/api/portfolios/${encodeURIComponent(id)}`);
}

export async function createPortfolio(input = {}) {
  return apiFetch('/api/portfolios', { method: 'POST', body: input });
}

export async function updatePortfolio(id, patch) {
  return apiFetch(`/api/portfolios/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch });
}

export async function publishPortfolio(id) {
  return updatePortfolio(id, { status: 'published' });
}

export async function deletePortfolio(id) {
  return apiFetch(`/api/portfolios/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function deletePortfolios(ids) {
  if (!ids?.length) return 0;
  const { deleted } = await apiFetch('/api/portfolios', { method: 'DELETE', body: { ids } });
  return deleted;
}

export async function incrementPortfolioView(portfolioId) {
  await apiFetch('/api/views', {
    method: 'POST',
    body: { targetType: 'portfolio', targetId: portfolioId },
  });
}

export async function togglePortfolioLike(portfolioId) {
  return toggleReaction(...REACTION.portfolioLike, portfolioId);
}

export async function togglePortfolioBookmark(portfolioId) {
  return toggleReaction(...REACTION.portfolioBookmark, portfolioId);
}

export async function getMyPortfolioReactions(portfolioIds) {
  const [liked, bookmarked] = await Promise.all([
    getMyReactionIds(...REACTION.portfolioLike, portfolioIds),
    getMyReactionIds(...REACTION.portfolioBookmark, portfolioIds),
  ]);
  return { liked, bookmarked };
}

export async function listMyBookmarkedPortfolios({
  page = 1,
  pageSize = PAGE_SIZE.myPortfolios,
} = {}) {
  const ids = await listMyReactionTargetIds(...REACTION.portfolioBookmark);
  if (ids.length === 0) return { items: [], total: 0, page, pageSize };

  const pageIds = ids.slice((page - 1) * pageSize, page * pageSize);
  const { items } = await apiFetch('/api/portfolios', {
    query: { ids: pageIds.join(','), pageSize },
  });

  const order = new Map(pageIds.map((id, index) => [id, index]));
  items.sort((a, b) => order.get(a.id) - order.get(b.id));

  return { items, total: ids.length, page, pageSize };
}

export async function uploadPortfolioImage(portfolioId, file) {
  const user = await getCurrentUser();
  if (!user) throw new ApiError('로그인이 필요합니다.', { status: 401 });

  const { maxBytes, mimes } = UPLOAD_LIMIT.portfolio;
  if (!mimes.includes(file.type)) {
    throw new ApiError('JPG, PNG, WEBP, GIF 이미지만 올릴 수 있습니다.');
  }
  if (file.size > maxBytes) {
    throw new ApiError(`이미지는 ${maxBytes / 1024 / 1024}MB 이하만 올릴 수 있습니다.`);
  }

  const supabase = createClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
  const path = `${user.id}/${portfolioId}/${Date.now()}-${Math.floor(Math.random() * 1e6)}.${ext}`;

  const { error } = await supabase.storage.from('portfolios').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new ApiError(`이미지 업로드에 실패했습니다: ${error.message}`, { cause: error });

  const {
    data: { publicUrl },
  } = supabase.storage.from('portfolios').getPublicUrl(path);

  return publicUrl;
}

export async function uploadPortfolioImages(portfolioId, files) {
  const list = Array.from(files ?? []);
  if (list.length > UPLOAD_LIMIT.portfolio.maxCount) {
    throw new ApiError(`이미지는 최대 ${UPLOAD_LIMIT.portfolio.maxCount}장까지 올릴 수 있습니다.`);
  }

  const urls = [];
  for (const file of list) {
    urls.push(await uploadPortfolioImage(portfolioId, file));
  }
  return urls;
}

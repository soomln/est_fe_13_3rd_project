import { PAGE_SIZE, REACTION } from '../constants';
import { apiFetch } from './_fetch';
import {
  getMyReactionIds,
  removeReactions,
  toggleReaction,
} from './reactions';

export async function listPosts({
  type,
  companyId,
  companySlug,
  jobRole,
  q,
  sort = 'latest',
  page = 1,
  pageSize,
} = {}) {
  return apiFetch('/api/posts', {
    query: {
      type,
      companyId,
      companySlug,
      jobRole,
      q,
      sort,
      page,
      pageSize: pageSize ?? (type === 'qbank' ? PAGE_SIZE.qbank : PAGE_SIZE.reviews),
    },
  });
}

export async function listMyPosts({ type, sort = 'latest', page = 1, pageSize = PAGE_SIZE.myQbank } = {}) {
  return apiFetch('/api/posts', { query: { mine: 1, type, sort, page, pageSize } });
}

export async function getPost(id) {
  return apiFetch(`/api/posts/${encodeURIComponent(id)}`);
}

export async function createPost(input = {}) {
  return apiFetch('/api/posts', { method: 'POST', body: input });
}

export async function updatePost(id, patch) {
  return apiFetch(`/api/posts/${encodeURIComponent(id)}`, { method: 'PATCH', body: patch });
}

export async function deletePost(id) {
  return apiFetch(`/api/posts/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function deletePosts(ids) {
  if (!ids?.length) return 0;
  const { deleted } = await apiFetch('/api/posts', { method: 'DELETE', body: { ids } });
  return deleted;
}

export async function incrementPostView(postId) {
  await apiFetch('/api/views', { method: 'POST', body: { targetType: 'post', targetId: postId } });
}

export async function togglePostLike(postId) {
  return toggleReaction(...REACTION.postLike, postId);
}

export async function togglePostScrap(postId) {
  return toggleReaction(...REACTION.postScrap, postId);
}

export async function getMyPostReactions(postIds) {
  const [liked, scrapped] = await Promise.all([
    getMyReactionIds(...REACTION.postLike, postIds),
    getMyReactionIds(...REACTION.postScrap, postIds),
  ]);
  return { liked, scrapped };
}

export async function listMyScrappedPosts({
  type,
  sort = 'latest',
  page = 1,
  pageSize = PAGE_SIZE.qbank,
} = {}) {
  return apiFetch('/api/posts', { query: { scrapped: 1, type, sort, page, pageSize } });
}

export async function removePostScraps(postIds) {
  return removeReactions(...REACTION.postScrap, postIds);
}

export const removeScraps = removePostScraps;

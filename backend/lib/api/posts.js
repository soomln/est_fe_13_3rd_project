import { PAGE_SIZE, REACTION } from '../constants';
import { apiFetch } from './_fetch';
import { getMyReactionIds, listMyReactionTargetIds, toggleReaction } from './reactions';

export async function listPosts({
  type,
  companyId,
  companySlug,
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

export async function listMyScrappedPosts({ type, page = 1, pageSize = PAGE_SIZE.qbank } = {}) {
  const ids = await listMyReactionTargetIds(...REACTION.postScrap);
  if (ids.length === 0) return { items: [], total: 0, page, pageSize };

  const { items } = await apiFetch('/api/posts', {
    query: { ids: ids.join(','), type, pageSize: 50 },
  });

  const order = new Map(ids.map((id, index) => [id, index]));
  items.sort((a, b) => order.get(a.id) - order.get(b.id));

  const from = (page - 1) * pageSize;
  return { items: items.slice(from, from + pageSize), total: items.length, page, pageSize };
}

export async function removeScraps(postIds) {
  const { removeReactions } = await import('./reactions');
  await removeReactions(...REACTION.postScrap, postIds);
  return postIds.length;
}

import { PAGE_SIZE, REACTION } from '../constants';
import { apiFetch } from './_fetch';
import { getMyReactionIds, toggleReaction } from './reactions';

export async function listComments(postId, { sort = 'latest', page = 1, pageSize = PAGE_SIZE.comments } = {}) {
  return apiFetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
    query: { sort, page, pageSize },
  });
}

export async function createComment(postId, body) {
  return apiFetch(`/api/posts/${encodeURIComponent(postId)}/comments`, {
    method: 'POST',
    body: { body },
  });
}

export async function updateComment(commentId, body) {
  return apiFetch(`/api/comments/${encodeURIComponent(commentId)}`, {
    method: 'PATCH',
    body: { body },
  });
}

export async function deleteComment(commentId) {
  return apiFetch(`/api/comments/${encodeURIComponent(commentId)}`, { method: 'DELETE' });
}

export async function toggleCommentLike(commentId) {
  return toggleReaction(...REACTION.commentLike, commentId);
}

export async function getMyCommentLikes(commentIds) {
  return getMyReactionIds(...REACTION.commentLike, commentIds);
}

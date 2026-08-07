import { apiFetch } from './_fetch';

export async function toggleReaction(targetType, kind, targetId) {
  const { active } = await apiFetch('/api/reactions', {
    method: 'POST',
    body: { targetType, targetId, kind },
  });
  return active;
}

export async function getMyReactionIds(targetType, kind, targetIds) {
  if (!targetIds?.length) return new Set();

  const { targetIds: mine } = await apiFetch('/api/reactions', {
    query: { targetType, kind, targetIds: targetIds.join(',') },
  });

  return new Set(mine);
}

export async function hasMyReaction(targetType, kind, targetId) {
  const ids = await getMyReactionIds(targetType, kind, [targetId]);
  return ids.has(targetId);
}

export async function listMyReactionTargetIds(targetType, kind) {
  const { targetIds } = await apiFetch('/api/reactions', { query: { targetType, kind } });
  return targetIds;
}

export async function removeReactions(targetType, kind, targetIds) {
  if (!targetIds?.length) return 0;

  const { deleted } = await apiFetch('/api/reactions', {
    method: 'DELETE',
    body: { targetType, kind, targetIds },
  });
  return deleted;
}

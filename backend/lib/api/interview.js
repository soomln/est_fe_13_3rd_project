import { PAGE_SIZE, REACTION } from '../constants';
import { apiFetch } from './_fetch';
import { getMyReactionIds, removeReactions, toggleReaction } from './reactions';

export async function createSession({
  companyId = null,
  resumeIds = [],
  coverLetterIds = [],
  interviewerStyle = 'neutral',
  selectedCategories = [],
  showTimer = true,
} = {}) {
  return apiFetch('/api/interviews', {
    method: 'POST',
    body: { companyId, resumeIds, coverLetterIds, interviewerStyle, selectedCategories, showTimer },
  });
}

export async function listMySessions({ page = 1, pageSize = 10 } = {}) {
  return apiFetch('/api/interviews', { query: { page, pageSize } });
}

export async function getSession(id) {
  return apiFetch(`/api/interviews/${encodeURIComponent(id)}`);
}

export async function saveQas(sessionId, qas) {
  return apiFetch(`/api/interviews/${encodeURIComponent(sessionId)}/qas`, {
    method: 'POST',
    body: { qas },
  });
}

export async function finishSession(sessionId, { durationSec, totalScore, subScores } = {}) {
  return apiFetch(`/api/interviews/${encodeURIComponent(sessionId)}`, {
    method: 'PATCH',
    body: { status: 'finished', durationSec, totalScore, subScores },
  });
}

export async function deleteSession(sessionId) {
  return apiFetch(`/api/interviews/${encodeURIComponent(sessionId)}`, { method: 'DELETE' });
}

export async function listMyScraps({
  q,
  sort = 'latest',
  page = 1,
  pageSize = PAGE_SIZE.interviewScraps,
} = {}) {
  return apiFetch('/api/interview-qas', { query: { scrapped: 1, q, sort, page, pageSize } });
}

export async function listMyQas({ q, sessionId, sort = 'latest', page = 1, pageSize = 20 } = {}) {
  return apiFetch('/api/interview-qas', { query: { q, sessionId, sort, page, pageSize } });
}

export async function listSessionQas(sessionId) {
  return apiFetch('/api/interview-qas', { query: { sessionId, pageSize: 50 } });
}

export async function toggleQaScrap(qaId) {
  return toggleReaction(...REACTION.interviewQaScrap, qaId);
}

export async function getMyScrappedQaIds(qaIds) {
  return getMyReactionIds(...REACTION.interviewQaScrap, qaIds);
}

export async function removeScraps(qaIds) {
  if (!qaIds?.length) return 0;
  await removeReactions(...REACTION.interviewQaScrap, qaIds);
  return qaIds.length;
}

export async function deleteQas(ids) {
  if (!ids?.length) return 0;
  const { deleted } = await apiFetch('/api/interview-qas', { method: 'DELETE', body: { ids } });
  return deleted;
}

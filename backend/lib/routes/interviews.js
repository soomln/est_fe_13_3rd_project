import { badRequest, notFound } from '../http/errors';
import { defineRoute, unwrap } from '../http/route';

const STYLES = ['friendly', 'neutral', 'pressure', 'technical'];
const STATUSES = ['ongoing', 'finished'];

const formatDate = (iso) => (iso ? iso.slice(0, 10).replace(/-/g, '.') : '');

function feedbackText(feedback) {
  if (!feedback) return '';
  if (typeof feedback === 'string') return feedback;
  if (feedback.summary) return feedback.summary;
  const parts = [...(feedback.strengths ?? []), ...(feedback.improvements ?? [])];
  return parts.join(' ');
}

export function toQa(row) {
  return {
    id: row.id,
    sessionId: row.session_id,
    seq: row.seq,
    category: row.category,
    question: row.question,
    answer: row.answer ?? '',
    feedback: row.feedback ?? {},
    feedbackText: feedbackText(row.feedback),
    score: row.score,
    date: formatDate(row.created_at),
    createdAt: row.created_at,
  };
}

function toSession(row, qas) {
  return {
    id: row.id,
    companyId: row.company_id,
    resumeIds: row.resume_ids ?? [],
    coverLetterIds: row.cover_letter_ids ?? [],
    interviewerStyle: row.interviewer_style,
    selectedCategories: row.selected_categories ?? [],
    showTimer: row.show_timer,
    durationSec: row.duration_sec ?? 0,
    status: row.status,
    totalScore: row.total_score,
    subScores: row.sub_scores ?? {},
    date: formatDate(row.created_at),
    createdAt: row.created_at,
    finishedAt: row.finished_at,
    ...(qas ? { qas: qas.map(toQa) } : {}),
  };
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    throw badRequest('JSON 본문이 필요합니다.');
  }
}

export const GET = defineRoute(
  async ({ request, supabase, user }) => {
    const q = request.nextUrl.searchParams;
    const page = Math.max(1, Number(q.get('page') ?? 1));
    const pageSize = Math.min(50, Math.max(1, Number(q.get('pageSize') ?? 10)));

    const from = (page - 1) * pageSize;
    const { data, error, count } = await supabase
      .from('interview_sessions')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) throw error;

    return { items: (data ?? []).map((r) => toSession(r)), total: count ?? 0, page, pageSize };
  },
  { auth: true }
);

export const POST = defineRoute(
  async ({ request, supabase, user }) => {
    const body = await readJson(request);

    if (body.interviewerStyle && !STYLES.includes(body.interviewerStyle)) {
      throw badRequest(`interviewerStyle 은 ${STYLES.join(' | ')} 중 하나여야 합니다.`);
    }

    const row = unwrap(
      await supabase
        .from('interview_sessions')
        .insert({
          user_id: user.id,
          company_id: body.companyId ?? null,
          resume_ids: body.resumeIds ?? [],
          cover_letter_ids: body.coverLetterIds ?? [],
          interviewer_style: body.interviewerStyle ?? 'neutral',
          selected_categories: body.selectedCategories ?? [],
          show_timer: body.showTimer ?? true,
        })
        .select('*')
        .single()
    );

    return toSession(row, []);
  },
  { auth: true }
);

export const GET_DETAIL = defineRoute(
  async ({ params, supabase, user }) => {
    const row = unwrap(
      await supabase
        .from('interview_sessions')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .maybeSingle()
    );
    if (!row) throw notFound('면접 기록을 찾을 수 없습니다.');

    const qas = unwrap(
      await supabase
        .from('interview_qas')
        .select('*')
        .eq('session_id', params.id)
        .order('seq', { ascending: true })
    );

    return toSession(row, qas);
  },
  { auth: true }
);

export const PATCH_DETAIL = defineRoute(
  async ({ request, params, supabase, user }) => {
    const body = await readJson(request);

    const patch = {};
    if ('status' in body) {
      if (!STATUSES.includes(body.status)) {
        throw badRequest(`status 는 ${STATUSES.join(' | ')} 중 하나여야 합니다.`);
      }
      patch.status = body.status;
      if (body.status === 'finished') patch.finished_at = new Date().toISOString();
    }
    if ('durationSec' in body) patch.duration_sec = body.durationSec;
    if ('totalScore' in body) patch.total_score = body.totalScore;
    if ('subScores' in body) patch.sub_scores = body.subScores;
    if ('companyId' in body) patch.company_id = body.companyId;

    if (Object.keys(patch).length === 0) throw badRequest('수정할 내용이 없습니다.');

    const row = unwrap(
      await supabase
        .from('interview_sessions')
        .update(patch)
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select('*')
        .maybeSingle()
    );
    if (!row) throw notFound('면접 기록을 찾을 수 없습니다.');

    return toSession(row);
  },
  { auth: true }
);

export const DELETE_DETAIL = defineRoute(
  async ({ params, supabase, user }) => {
    const rows = unwrap(
      await supabase
        .from('interview_sessions')
        .delete()
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select('id')
    );
    if (!rows?.length) throw notFound('면접 기록을 찾을 수 없습니다.');
    return { deleted: 1 };
  },
  { auth: true }
);

export const POST_QAS = defineRoute(
  async ({ request, params, supabase, user }) => {
    const body = await readJson(request);
    const list = Array.isArray(body) ? body : body.qas;

    if (!Array.isArray(list) || list.length === 0) {
      throw badRequest('qas 배열이 필요합니다.');
    }

    const session = unwrap(
      await supabase
        .from('interview_sessions')
        .select('id')
        .eq('id', params.id)
        .eq('user_id', user.id)
        .maybeSingle()
    );
    if (!session) throw notFound('면접 기록을 찾을 수 없습니다.');

    const rows = list.map((qa, index) => {
      if (!qa?.question?.trim()) throw badRequest('question 은 필수입니다.');
      return {
        session_id: params.id,
        user_id: user.id,
        seq: qa.seq ?? index + 1,
        category: qa.category ?? null,
        question: qa.question,
        answer: qa.answer ?? null,
        feedback: qa.feedback ?? {},
        score: qa.score ?? null,
      };
    });

    const inserted = unwrap(await supabase.from('interview_qas').insert(rows).select('*'));
    return { items: inserted.map(toQa), saved: inserted.length };
  },
  { auth: true }
);

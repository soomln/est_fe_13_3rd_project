import { stripHtml, truncate } from './generateInterviewQuestions';

const ALAN_CLIENT_ID = process.env.NEXT_PUBLIC_ALAN_CLIENT_ID;

const MAX_DOC_LENGTH = 120;
const MAX_COMPANY_LENGTH = 80;
const MAX_ANSWER_LENGTH = 200;

export const SUB_SCORE_KEYS = ['content', 'delivery', 'logic', 'skill', 'attitude'];
const SUB_SCORE_MAX = 20;

export function sumSubScores(subScores) {
  return SUB_SCORE_KEYS.reduce((sum, key) => sum + (Number(subScores?.[key]) || 0), 0);
}

function formatCompanyInfo(company) {
  if (!company) return '';
  const info = [company.name, company.industry, company.intro].filter(Boolean).join(' / ');
  return truncate(info, MAX_COMPANY_LENGTH);
}

function buildPrompt({ resumeText, coverLetterText, companyInfo, qaList }) {
  const qaText = qaList
    .map((qa, index) => `${index + 1}.(${qa.category}) Q:${qa.question}\nA:${qa.answer || '(답변 없음)'}`)
    .join('\n\n');

  return [
    '너는 실제 기업의 AI 면접관이다. 아래 면접 질문/답변과 지원자 정보를 보고 평가하라.',
    '각 답변마다 summary(한줄총평), strengths(잘한점 문자열배열), improvements(개선점 문자열배열), score(0~10 정수)를 만들어라.',
    'subScores(content,delivery,logic,skill,attitude 다섯 키, 항목당 20점 만점이므로 각 0~20 정수)도 만들어라. totalScore는 별도로 합산하므로 응답에 넣지 마라.',
    '다른 설명 없이 아래 JSON 형식으로만 답하라: {"questions":[{"category":"코드","summary":"...","strengths":["..."],"improvements":["..."],"score":0}],"subScores":{"content":0,"delivery":0,"logic":0,"skill":0,"attitude":0}}',
    `질문/답변:\n${qaText}`,
    resumeText && `이력서:\n${resumeText}`,
    coverLetterText && `자소서:\n${coverLetterText}`,
    companyInfo && `지원기업:\n${companyInfo}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function extractJsonObject(text) {
  if (!text) return null;
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) return null;

  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function clampScore(value, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return null;
  return Math.min(max, Math.max(0, Math.round(num)));
}

export async function evaluateInterviewAnswers({ resumeText, coverLetterText, company, qaList }) {
  if (!ALAN_CLIENT_ID) {
    throw new Error('NEXT_PUBLIC_ALAN_CLIENT_ID가 설정되지 않았습니다.');
  }
  if (!qaList?.length) {
    throw new Error('평가할 질문/답변이 없습니다.');
  }

  const content = buildPrompt({
    resumeText: truncate(stripHtml(resumeText), MAX_DOC_LENGTH),
    coverLetterText: truncate(stripHtml(coverLetterText), MAX_DOC_LENGTH),
    companyInfo: formatCompanyInfo(company),
    qaList: qaList.map((qa) => ({
      ...qa,
      answer: truncate(stripHtml(qa.answer), MAX_ANSWER_LENGTH),
    })),
  });

  const res = await fetch('/interview/api/alan-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, client_id: ALAN_CLIENT_ID }),
  });
  if (!res.ok) {
    throw new Error(`AI 평가 호출에 실패했습니다. (HTTP ${res.status})`);
  }

  const { answer } = await res.json();
  const parsed = extractJsonObject(answer);
  if (!parsed) {
    throw new Error('AI 평가 응답을 해석하지 못했습니다.');
  }

  const byCategory = new Map(
    (Array.isArray(parsed.questions) ? parsed.questions : []).map((item) => [item?.category, item]),
  );

  const questionResults = qaList.map((qa) => {
    const raw = byCategory.get(qa.category);
    const score = clampScore(raw?.score, 10);
    if (!raw || score === null) {
      throw new Error(`"${qa.category}" 질문에 대한 AI 평가 결과가 없습니다.`);
    }

    return {
      category: qa.category,
      summary: typeof raw.summary === 'string' ? raw.summary.trim() : '',
      strengths: Array.isArray(raw.strengths) ? raw.strengths.filter((s) => typeof s === 'string') : [],
      improvements: Array.isArray(raw.improvements)
        ? raw.improvements.filter((s) => typeof s === 'string')
        : [],
      score,
    };
  });

  const subScores = {};
  for (const key of SUB_SCORE_KEYS) {
    const value = clampScore(parsed.subScores?.[key], SUB_SCORE_MAX);
    if (value === null) {
      throw new Error('세부 항목 점수를 계산하지 못했습니다.');
    }
    subScores[key] = value;
  }

  const totalScore = sumSubScores(subScores);

  return { questionResults, totalScore, subScores };
}

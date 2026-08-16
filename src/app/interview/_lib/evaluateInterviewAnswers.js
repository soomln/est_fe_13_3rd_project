import { stripHtml, truncate } from './generateInterviewQuestions';

const ALAN_CLIENT_ID = process.env.NEXT_PUBLIC_ALAN_CLIENT_ID;

// 서버(우리 라우트)→Alan 구간은 여전히 GET 쿼리스트링이라 길이 제한이 있다(alan-question/route.js
// 참고). 평가 프롬프트는 질문 생성 프롬프트와 달리 답변 5개를 통째로 담아야 해서 훨씬 길어지기
// 쉬우므로, 질문 생성 때보다 더 타이트하게 잘라 URL 길이 제한(502/414)에 걸리지 않게 한다.
const MAX_DOC_LENGTH = 120;
const MAX_COMPANY_LENGTH = 80;
const MAX_ANSWER_LENGTH = 200;

// InterviewResult에 이미 정의된 세부 점수 항목(답변내용/전달력/논리성/전문성/태도)을 그대로 사용한다.
// 항목당 20점 만점 * 5개 = 100점 만점이며, 최종 점수는 이 5개 항목의 합으로만 계산한다(평균 사용 금지).
export const SUB_SCORE_KEYS = ['content', 'delivery', 'logic', 'skill', 'attitude'];
const SUB_SCORE_MAX = 20;

// 화면에 표시되는 5개 세부 점수(subScores)를 그대로 합산한 값만 최종 점수로 인정한다.
// finishSession() 저장값과 InterviewResult 표시값이 항상 같은 계산식을 쓰도록 이 함수 하나로 통일한다.
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

// AI 응답이 항상 완벽한 JSON/모든 질문을 포함한다는 보장이 없으므로, 하나라도 검증에 실패하면
// 임의의 점수로 채우지 않고 에러를 던져 호출부(chat/page.js)가 실패로 처리하게 한다.
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

  // 최종 점수는 AI가 반환하는 totalScore를 신뢰하지 않고, 화면에 표시하는 5개 subScores(항목당
  // 20점 만점)의 합으로만 계산한다. 평균을 쓰지 않으므로 항상 0~100 범위가 그대로 보장된다.
  const totalScore = sumSubScores(subScores);

  return { questionResults, totalScore, subScores };
}

import { QUESTION_CATEGORIES, getQuestionByCategory, getQuestionText } from '../_constants/questions';

const ALAN_CLIENT_ID = process.env.NEXT_PUBLIC_ALAN_CLIENT_ID;

const MAX_DOC_LENGTH = 250;
const MAX_COMPANY_LENGTH = 150;
const MIN_DESCRIPTION_LENGTH = 10;
const MAX_DESCRIPTION_LENGTH = 21;
const DESCRIPTION_ENDING = /(을|를)?\s*확인하는\s*질문입니다\.?$/;
const QUESTION_LINE_WIDTH = 40;
const CLAUSE_BREAK_MIN_LENGTH = 20;

export function stripHtml(text) {
  return text ? text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

function stripMarkdown(text) {
  return text ? text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/__(.*?)__/g, '$1') : '';
}

function formatQuestionText(text) {
  if (!text) return '';

  const clean = stripMarkdown(text)
    .replace(/\s*\n\s*/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .trim();

  const sentences = clean.split(/(?<=[.!?])\s+/).filter(Boolean);

  const paragraphs = sentences.map((sentence) => {
    const words = sentence.split(' ');
    const lines = [];
    let current = '';

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (next.length > QUESTION_LINE_WIDTH && current) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }

      if (current.endsWith(',') && current.length >= CLAUSE_BREAK_MIN_LENGTH) {
        lines.push(current);
        current = '';
      }
    }
    if (current) lines.push(current);

    return lines.join('\n');
  });

  return paragraphs.join('\n\n');
}

export function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function formatCompanyInfo(company) {
  if (!company) return '';
  const info = [company.name, company.industry, company.intro].filter(Boolean).join(' / ');
  return truncate(info, MAX_COMPANY_LENGTH);
}

const INTERVIEWER_STYLE_INSTRUCTIONS = {
  friendly: '면접관의 말투는 친절하고 부드럽게, 지원자가 편안함을 느끼도록 다정하게 표현한다. question도 딱딱하지 않고 따뜻한 어조로 작성한다.',
  neutral: '면접관의 말투는 담담하고 중립적으로, 사무적인 어조로 표현한다. question도 평이하고 절제된 어조로 작성한다.',
  pressure: '면접관의 말투는 엄격하고 날카롭게, 핵심을 파고드는 어조로 표현한다. question도 압박감 있게 작성한다.',
};

function buildPrompt({ resumeText, coverLetterText, companyInfo, categories, interviewerStyle }) {
  const categoryList = categories
    .map((category) => {
      const meta = getQuestionByCategory(category);
      return `- category: "${category}", title: "${meta?.title ?? category}"`;
    })
    .join('\n');

  const styleInstruction =
    INTERVIEWER_STYLE_INSTRUCTIONS[interviewerStyle] ?? INTERVIEWER_STYLE_INSTRUCTIONS.friendly;

  return [
    '너는 실제 기업의 AI 면접관이다. 아래 지원자 정보를 참고해서 카테고리마다 실제 면접 질문(question)과, 그 질문을 왜 하는지/무엇을 확인하려는지 짧게 설명하는 description을 만들어라.',
    styleInstruction,
    'description 규칙(반드시 지킬 것): 최대 21자 이내의 자연스러운 서술형 한 문장으로 작성한다. 화면에 한 줄로만 표시되므로 21자를 넘기면 절대 안 된다. 반드시 "~확인하는 질문입니다."처럼 문장으로 끝내야 하며, 명사형으로 끝내면 안 된다.',
    'description 좋은 예: "직무 기술 역량을 확인하는 질문입니다." / "기술 이해도를 확인하는 질문입니다." / "문제 해결 능력을 확인하는 질문입니다." / "지원 동기를 확인하는 질문입니다." / "입사 의지를 확인하는 질문입니다."',
    'description 나쁜 예(금지): "경험과 강점 확인"처럼 명사형으로 끝내는 것, "사용자 경험 중시 개발 철학을 확인하는 질문입니다."처럼 21자를 넘기는 것, question 문장을 그대로 넣거나 길게 요약하는 것.',
    'question은 자유롭고 구체적으로 작성해도 되지만, description은 예외 없이 위 규칙대로 21자 이내의 짧은 문장으로 유지한다.',
    '다른 설명 없이 아래 JSON 배열 형식으로만 답하라: [{"category":"코드","title":"카테고리명","description":"21자 이내 서술형 한 문장","question":"실제 질문 전체"}]',
    `카테고리 목록:\n${categoryList}`,
    resumeText && `이력서 요약:\n${resumeText}`,
    coverLetterText && `자기소개서 요약:\n${coverLetterText}`,
    companyInfo && `지원 기업 정보:\n${companyInfo}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

function extractJsonArray(text) {
  if (!text) return null;
  const start = text.indexOf('[');
  const end = text.lastIndexOf(']');
  if (start === -1 || end === -1 || end < start) return null;

  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function shortenDescription(description, maxLength) {
  const subjectWithoutEnding = description.replace(DESCRIPTION_ENDING, '').trim();
  if (subjectWithoutEnding === description) return null;

  const suffix = '확인하는 질문입니다.';
  const budget = maxLength - suffix.length - 1;
  if (budget <= 0) return null;

  let subject =
    subjectWithoutEnding.length > budget ? subjectWithoutEnding.slice(0, budget) : subjectWithoutEnding;
  const lastSpace = subject.lastIndexOf(' ');
  if (lastSpace > 0) subject = subject.slice(0, lastSpace);
  if (!subject) return null;

  return `${subject} ${suffix}`;
}

function buildFallback(category, interviewerStyle) {
  const meta = getQuestionByCategory(category);
  return {
    category,
    title: meta?.title ?? category,
    description: meta?.description ?? '',
    question: formatQuestionText(getQuestionText(meta, interviewerStyle)),
  };
}

function normalizeItem(raw, category, interviewerStyle) {
  const fallback = buildFallback(category, interviewerStyle);
  if (!raw || typeof raw !== 'object') return fallback;

  const rawQuestion = typeof raw.question === 'string' ? stripMarkdown(raw.question).trim() : '';
  const question = rawQuestion ? formatQuestionText(rawQuestion) : fallback.question;

  const rawDescription =
    typeof raw.description === 'string' ? stripMarkdown(raw.description).trim() : '';
  const isUsable = rawDescription && rawDescription !== rawQuestion && rawDescription.length >= MIN_DESCRIPTION_LENGTH;

  let description = fallback.description;
  if (isUsable) {
    if (rawDescription.length <= MAX_DESCRIPTION_LENGTH) {
      description = rawDescription;
    } else {
      description = shortenDescription(rawDescription, MAX_DESCRIPTION_LENGTH) ?? fallback.description;
    }
  }

  return {
    category,
    title: fallback.title,
    description,
    question,
  };
}

export async function generateInterviewQuestions({
  resumeText,
  coverLetterText,
  company,
  categories = QUESTION_CATEGORIES,
  interviewerStyle = 'friendly',
  signal,
}) {
  if (!ALAN_CLIENT_ID) {
    throw new Error('NEXT_PUBLIC_ALAN_CLIENT_ID가 설정되지 않았습니다.');
  }

  const content = buildPrompt({
    resumeText: truncate(stripHtml(resumeText), MAX_DOC_LENGTH),
    coverLetterText: truncate(stripHtml(coverLetterText), MAX_DOC_LENGTH),
    companyInfo: formatCompanyInfo(company),
    categories,
    interviewerStyle,
  });

  const res = await fetch('/interview/api/alan-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, client_id: ALAN_CLIENT_ID }),
    signal,
  });
  if (!res.ok) {
    throw new Error(`Alan AI 호출에 실패했습니다. (HTTP ${res.status})`);
  }

  const { answer } = await res.json();
  const parsed = extractJsonArray(answer) ?? [];
  const byCategory = new Map(parsed.map((item) => [item?.category, item]));

  return categories.map((category) =>
    normalizeItem(byCategory.get(category), category, interviewerStyle),
  );
}

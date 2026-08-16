import { QUESTION_CATEGORIES, getQuestionByCategory } from '../_constants/questions';

const ALAN_CLIENT_ID = process.env.NEXT_PUBLIC_ALAN_CLIENT_ID;

// 이 프롬프트는 /interview/api/alan-question 라우트로 POST body에 실어 보낸다(브라우저→우리 서버
// 구간은 더 이상 URL 길이 제한을 받지 않는다). 다만 그 라우트가 Alan을 호출하는 서버→Alan 구간은
// 여전히 GET 쿼리스트링이라 무한정 늘릴 수는 없어서, 아래 길이는 안전 여유로 계속 유지한다.
const MAX_DOC_LENGTH = 250;
const MAX_COMPANY_LENGTH = 150;
const MIN_DESCRIPTION_LENGTH = 10;
// 질문 리스트 UI에서 description을 한 줄로만 보여주므로 21자를 넘기지 않는다.
const MAX_DESCRIPTION_LENGTH = 21;
const DESCRIPTION_ENDING = /(을|를)?\s*확인하는\s*질문입니다\.?$/;
// question을 채팅 버블에 표시할 때 한 줄에 담을 대략적인 글자 수.
const QUESTION_LINE_WIDTH = 40;
// 쉼표마다 무조건 줄바꿈하면 "React, TypeScript, Next.js" 같은 나열이 한 단어씩 끊어지므로,
// 쉼표 앞부분이 이 길이 이상일 때만(=충분히 긴 절일 때만) 그 쉼표에서 강제로 줄을 바꾼다.
const CLAUSE_BREAK_MIN_LENGTH = 20;

function stripHtml(text) {
  return text ? text.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim() : '';
}

function stripMarkdown(text) {
  return text ? text.replace(/\*\*(.*?)\*\*/g, '$1').replace(/__(.*?)__/g, '$1') : '';
}

// 마침표/물음표/느낌표로 문장을 나눠 문단처럼 띄우고, 한 문장이 너무 길면 쉼표·너비 기준으로
// 다시 줄바꿈한다. question 원문 내용 자체는 건드리지 않고 줄바꿈·공백만 정리한다.
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

function truncate(text, max) {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

function formatCompanyInfo(company) {
  if (!company) return '';
  const info = [company.name, company.industry, company.intro].filter(Boolean).join(' / ');
  return truncate(info, MAX_COMPANY_LENGTH);
}

function buildPrompt({ resumeText, coverLetterText, companyInfo, categories }) {
  const categoryList = categories
    .map((category) => {
      const meta = getQuestionByCategory(category);
      return `- category: "${category}", title: "${meta?.title ?? category}"`;
    })
    .join('\n');

  return [
    '너는 실제 기업의 AI 면접관이다. 아래 지원자 정보를 참고해서 카테고리마다 실제 면접 질문(question)과, 그 질문을 왜 하는지/무엇을 확인하려는지 짧게 설명하는 description을 만들어라.',
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

// AI가 규칙을 지키지 않고 21자를 넘기더라도, "~확인하는 질문입니다." 형태라면 주어 부분만
// 단어 단위로 줄여서 한 줄에 들어가게 만든다(조사를 어색하게 이어붙이지 않기 위해 조사는 버린다).
// 이 패턴 자체를 벗어난 응답은 다듬을 수 없으므로 null을 반환한다.
function shortenDescription(description, maxLength) {
  const subjectWithoutEnding = description.replace(DESCRIPTION_ENDING, '').trim();
  if (subjectWithoutEnding === description) return null;

  const suffix = '확인하는 질문입니다.';
  const budget = maxLength - suffix.length - 1; // 주어와 접미사 사이 띄어쓰기 1칸
  if (budget <= 0) return null;

  let subject =
    subjectWithoutEnding.length > budget ? subjectWithoutEnding.slice(0, budget) : subjectWithoutEnding;
  const lastSpace = subject.lastIndexOf(' ');
  if (lastSpace > 0) subject = subject.slice(0, lastSpace);
  if (!subject) return null;

  return `${subject} ${suffix}`;
}

function buildFallback(category) {
  const meta = getQuestionByCategory(category);
  return {
    category,
    title: meta?.title ?? category,
    description: meta?.description ?? '',
    question: formatQuestionText(meta?.question ?? ''),
  };
}

function normalizeItem(raw, category) {
  const fallback = buildFallback(category);
  if (!raw || typeof raw !== 'object') return fallback;

  const rawQuestion = typeof raw.question === 'string' ? stripMarkdown(raw.question).trim() : '';
  const question = rawQuestion ? formatQuestionText(rawQuestion) : fallback.question;

  const rawDescription =
    typeof raw.description === 'string' ? stripMarkdown(raw.description).trim() : '';
  // description이 비어있거나 question과 사실상 같으면 애초에 신뢰할 수 없으니 폴백을 쓴다.
  const isUsable = rawDescription && rawDescription !== rawQuestion && rawDescription.length >= MIN_DESCRIPTION_LENGTH;

  let description = fallback.description;
  if (isUsable) {
    if (rawDescription.length <= MAX_DESCRIPTION_LENGTH) {
      description = rawDescription;
    } else {
      // 21자를 넘겼어도 "~확인하는 질문입니다." 형태면 주어만 줄여서 한 줄에 맞춘다.
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
}) {
  if (!ALAN_CLIENT_ID) {
    throw new Error('NEXT_PUBLIC_ALAN_CLIENT_ID가 설정되지 않았습니다.');
  }

  const content = buildPrompt({
    resumeText: truncate(stripHtml(resumeText), MAX_DOC_LENGTH),
    coverLetterText: truncate(stripHtml(coverLetterText), MAX_DOC_LENGTH),
    companyInfo: formatCompanyInfo(company),
    categories,
  });

  const res = await fetch('/interview/api/alan-question', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content, client_id: ALAN_CLIENT_ID }),
  });
  if (!res.ok) {
    throw new Error(`Alan AI 호출에 실패했습니다. (HTTP ${res.status})`);
  }

  const { answer } = await res.json();
  const parsed = extractJsonArray(answer) ?? [];
  const byCategory = new Map(parsed.map((item) => [item?.category, item]));

  return categories.map((category) => normalizeItem(byCategory.get(category), category));
}

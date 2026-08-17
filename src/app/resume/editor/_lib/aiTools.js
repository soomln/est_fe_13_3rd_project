// 툴바의 AI 보조도구. 고른 글을 AI 에게 보내고 결과를 채팅에 보여준다.
// replace 가 true 면 결과로 바꾸는 버튼을 붙인다

const AI_TOOLS = {
  fix: {
    label: '첨삭',
    rule: '아래 글에서 어색한 표현과 맞춤법만 고쳐서 다시 써줘. 설명 없이 고친 글만.',
    replace: true,
  },
  polish: {
    label: '문장 개선',
    rule: '아래 글을 이력서에 어울리는 문장으로 다시 써줘. 설명 없이 문장만.',
    replace: true,
  },
  // 이미 쓴 단어를 다시 주면 쓸모가 없다. 빠진 것을 찾게 한다.
  // 안내 문장은 코드가 붙인다. Alan 에게 형식을 시키면 빈 답이 온다
  keywords: {
    label: '키워드 추천',
    rule: '아래 글에 넣으면 좋을 이력서 키워드를 다섯 개 추천해줘. 이미 글에 있는 단어는 빼고. 설명 없이 단어만 줄을 나눠서.',
    replace: false,
    wrap: (answer) =>
      `선택한 내용에 대한 추천 키워드예요.\n\n${answer}\n\n` +
      '위 키워드를 넣으면 좀 더 전문적이고 완성도 높은 문장이 됩니다.',
  },

  'translate-en': {
    label: '영어로 번역',
    rule: '아래 글을 영어로 번역해줘. 설명 없이 번역문만.',
    replace: true,
  },
  'translate-ja': {
    label: '일본어로 번역',
    rule: '아래 글을 일본어로 번역해줘. 설명 없이 번역문만.',
    replace: true,
  },
  'translate-zh': {
    label: '중국어로 번역',
    rule: '아래 글을 중국어로 번역해줘. 설명 없이 번역문만.',
    replace: true,
  },

  'tone-polite': {
    label: '정중하게',
    rule: '아래 글을 더 정중한 말투로 다시 써줘. 뜻은 그대로 두고. 설명 없이 문장만.',
    replace: true,
  },
  'tone-friendly': {
    label: '친근하게',
    rule: '아래 글을 더 친근한 말투로 다시 써줘. 뜻은 그대로 두고. 설명 없이 문장만.',
    replace: true,
  },
  'tone-short': {
    label: '간결하게',
    rule: '아래 글을 더 짧고 간결하게 다시 써줘. 뜻은 그대로 두고. 설명 없이 문장만.',
    replace: true,
  },
  'tone-pro': {
    label: '전문적으로',
    rule: '아래 글을 더 전문적인 말투로 다시 써줘. 뜻은 그대로 두고. 설명 없이 문장만.',
    replace: true,
  },
};

// 주소에 한 번에 담을 수 있는 만큼
export const SELECTION_MAX = 400;

// 길면 나눠서 여러 번 물어본다. 문장 끝에서 끊어야 답이 어색하지 않다
export function splitText(text, size = SELECTION_MAX) {
  const parts = [];
  let buffer = '';

  text.split(/(?<=[.!?。\n])/).forEach((piece) => {
    if (buffer && (buffer + piece).length > size) {
      parts.push(buffer.trim());
      buffer = '';
    }
    buffer += piece;
  });

  if (buffer.trim()) parts.push(buffer.trim());

  // 문장 하나가 통째로 길면 그냥 자른다
  return parts.flatMap((part) =>
    part.length <= size ? [part] : (part.match(new RegExp(`.{1,${size}}`, 'gs')) ?? [])
  );
}

export default AI_TOOLS;

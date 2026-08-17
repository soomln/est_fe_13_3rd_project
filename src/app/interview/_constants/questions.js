export const QUESTIONS = [
  {
    title: '전체',
    category: 'all',
    description: '처음부터 모든 질문을 순서대로 진행합니다.',
  },
  {
    title: '자기소개',
    category: 'intro',
    description: '경험과 강점을 확인하는 질문입니다.',
    question: {
      friendly: '편하게 본인 소개 한번 해주실래요? 강점이나 관심사도 같이 말씀해주시면 좋아요!',
      neutral: '본인을 간단하게 소개해주세요.',
      pressure: '본인을 소개해보세요. 핵심 역량 위주로 간결하게 말씀하세요.',
    },
    answer:
      '안녕하세요. 저는 프론트엔드 개발자를 목표로 하고 있는 지원자입니다.',
  },
  {
    title: '기술 질문 1',
    category: 'tech1',
    description: '직무 기술 역량을 확인하는 질문입니다.',
    question: {
      friendly: '프론트엔드 개발자로 지원하게 된 계기가 궁금해요. 편하게 말씀해주세요.',
      neutral: '프론트엔드 개발자로 지원한 이유는 무엇인가요?',
      pressure: '왜 하필 프론트엔드 개발자입니까? 구체적인 이유를 명확히 답하세요.',
    },
    answer:
      '사용자 경험을 중요하게 생각하며, 직관적이고 유지보수하기 좋은 프론트엔드 개발을 지향하고 있습니다.',
  },
  {
    title: '기술 질문 2',
    category: 'tech2',
    description: '기술 이해도를 확인하는 질문입니다.',
    question: {
      friendly: '프로젝트 하시면서 가장 힘들었던 기술적인 문제가 있었다면 편하게 들려주시겠어요?',
      neutral: '프로젝트에서 가장 어려웠던 기술적인 문제는 무엇이었나요?',
      pressure: '기술적으로 가장 어려웠던 문제가 무엇이었고, 어떻게 해결했는지 근거를 들어 설명하세요.',
    },
    answer:
      '프로젝트에서 상태 관리와 API 응답 처리 과정에서 발생한 문제를 해결한 경험이 있습니다.',
  },
  {
    title: '인성 질문',
    category: 'personality',
    description: '협업과 가치관을 확인하는 질문입니다.',
    question: {
      friendly: '혹시 팀원분과 의견이 안 맞았던 적 있으셨어요? 그때 어떻게 풀어가셨는지 편하게 얘기해주세요.',
      neutral: '팀원과 의견이 충돌했을 때 어떻게 해결했나요?',
      pressure: '팀원과 의견 충돌이 있었을 때 어떤 기준으로 해결했는지 명확히 설명하세요.',
    },
    answer:
      '서로의 의견을 정리한 뒤 근거를 비교하고 가장 적절한 방향을 함께 결정했습니다.',
  },
  {
    title: '마무리 질문',
    category: 'closing',
    description: '입사 의지를 확인하는 질문입니다.',
    question: {
      friendly: '마지막으로 편하게 하고 싶은 말씀 있으시면 자유롭게 해주세요!',
      neutral: '마지막으로 하고 싶은 말이 있나요.',
      pressure: '마지막으로 할 말이 있다면 간결하게 답하세요.',
    },
    answer: '지속적으로 배우고 성장하는 개발자가 되겠습니다.',
  },
];

export const QUESTION_TITLES = QUESTIONS.filter(
  (item) => item.title !== '전체',
).map((item) => item.title);

export const QUESTION_CATEGORIES = QUESTIONS.filter(
  (item) => item.category !== 'all',
).map((item) => item.category);

export function getQuestionByTitle(title) {
  return QUESTIONS.find((item) => item.title === title);
}

export function getQuestionByCategory(category) {
  return QUESTIONS.find((item) => item.category === category);
}

export function getQuestionText(item, interviewerStyle = 'friendly') {
  const question = item?.question;
  if (!question) return '';
  if (typeof question === 'string') return question;
  return question[interviewerStyle] ?? question.friendly ?? '';
}

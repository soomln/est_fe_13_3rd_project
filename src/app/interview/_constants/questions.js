export const QUESTIONS = [
  {
    title: '전체',
    category: 'all',
    description: '처음부터 모든 질문을 순서대로 진행합니다.',
  },
  {
    title: '자기소개',
    category: 'self_intro',
    description: '경험과 강점을 확인하는 질문입니다.',
    question: '본인을 간단하게 소개해주세요.',
    answer:
      '안녕하세요. 저는 프론트엔드 개발자를 목표로 하고 있는 지원자입니다.',
  },
  {
    title: '기술 질문 1',
    category: 'technical1',
    description: '직무 기술 역량을 확인하는 질문입니다.',
    question: '프론트엔드 개발자로 지원한 이유는 무엇인가요?',
    answer:
      '사용자 경험을 중요하게 생각하며, 직관적이고 유지보수하기 좋은 프론트엔드 개발을 지향하고 있습니다.',
  },
  {
    title: '기술 질문 2',
    category: 'technical2',
    description: '기술 이해도를 확인하는 질문입니다.',
    question:
      '프로젝트에서 가장 어려웠던 기술적인 문제는 무엇이었나요?',
    answer:
      '프로젝트에서 상태 관리와 API 응답 처리 과정에서 발생한 문제를 해결한 경험이 있습니다.',
  },
  {
    title: '인성 질문',
    category: 'personality',
    description: '협업과 가치관을 확인하는 질문입니다.',
    question: '팀원과 의견이 충돌했을 때 어떻게 해결했나요?',
    answer:
      '서로의 의견을 정리한 뒤 근거를 비교하고 가장 적절한 방향을 함께 결정했습니다.',
  },
  {
    title: '마무리 질문',
    category: 'closing',
    description: '입사 의지를 확인하는 질문입니다.',
    question: '마지막으로 하고 싶은 말이 있나요.',
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

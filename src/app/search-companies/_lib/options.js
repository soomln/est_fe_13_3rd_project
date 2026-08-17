// 필터 / 글쓰기 폼에서 쓰는 선택지

// 목록 필터 사이드바 그룹. code_master 그룹명과 1:1 로 맞춘다
export const FILTER_GROUPS = [
  { key: 'jobRole', title: '직무', group: 'job_role' },
  { key: 'size', title: '기업 규모', group: 'company_size' },
  { key: 'industry', title: '산업', group: 'industry' },
];

// 더보기 전에 노출할 개수 ('전체' 포함)
export const FILTER_VISIBLE_COUNT = 3;

export const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'comments', label: '댓글순' },
  { value: 'views', label: '조회순' },
];

// 파이차트 3분할 색상. 디자인은 와이어프레임 색을 20% 투명도로 썼기에 브랜드 색으로 치환했다
export const CHART_COLORS = ['#E7D7FE', '#CCEDD8', '#FFEBCC'];

// 통계 패널 집계에 쓰는 후기 조회 개수 (목록 API 의 pageSize 상한)
export const STATS_SAMPLE_SIZE = 50;

export const CHANNEL_ETC_CODE = 'etc';

// 난이도 점수 선택지. posts.difficulty_score / problem_score 는 1~5 정수만 받는다
export const SCORE_OPTIONS = [1, 2, 3, 4, 5].map((score) => ({
  code: String(score),
  label: `${score}점`,
}));

// 1~5 점수를 code_master 의 difficulty 코드로 변환
export function toDifficultyCode(score) {
  if (score <= 2) return 'easy';
  if (score === 3) return 'normal';

  return 'hard';
}

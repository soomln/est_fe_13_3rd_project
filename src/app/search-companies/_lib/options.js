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
  { value: 'views', label: '조회순' },
];

export const CHANNEL_ETC_CODE = 'etc';

export const QUESTION_COUNT_OPTIONS = Array.from({ length: 10 }, (_, index) => ({
  value: String(index + 1),
  label: `${index + 1}개`,
}));

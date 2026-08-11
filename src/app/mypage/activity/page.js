import { Suspense } from 'react';

import ActivityBrowser from '@/app/mypage/activity/_components/ActivityBrowser';

// 주의: supabase 연결 전까지 쓰는 임시 목록
const COMPANIES = [
  { id: 'co-01', name: '네이버', industry: 'IT / 플랫폼', logoUrl: '/images/companies/naver.svg', avgSalary: '6,800만원', rating: 4.3, employeeCount: '4,200명', reviewCount: 128, qbankCount: 64, createdAt: '2026.07.26' },
  { id: 'co-02', name: '카카오', industry: 'IT / 플랫폼', logoUrl: '/images/companies/kakao.svg', avgSalary: '6,500만원', rating: 4.1, employeeCount: '3,800명', reviewCount: 112, qbankCount: 57, createdAt: '2026.07.25' },
  { id: 'co-03', name: '토스', industry: '핀테크', logoUrl: '/images/companies/toss.svg', avgSalary: '7,200만원', rating: 4.5, employeeCount: '1,900명', reviewCount: 96, qbankCount: 48, createdAt: '2026.07.24' },
  { id: 'co-04', name: '이스트소프트', industry: 'IT / 소프트웨어', logoUrl: '/images/companies/estsoft.svg', avgSalary: '5,400만원', rating: 3.9, employeeCount: '620명', reviewCount: 41, qbankCount: 23, createdAt: '2026.07.23' },
  { id: 'co-05', name: '우아한형제들', industry: 'IT / 플랫폼', logoUrl: '/images/companies/woowahan.svg', avgSalary: '6,900만원', rating: 4.4, employeeCount: '2,100명', reviewCount: 87, qbankCount: 39, createdAt: '2026.07.22' },
  { id: 'co-06', name: '당근', industry: 'IT / 플랫폼', logoUrl: '/images/companies/daangn.svg', avgSalary: '6,300만원', rating: 4.2, employeeCount: '780명', reviewCount: 52, qbankCount: 27, createdAt: '2026.07.21' },
  { id: 'co-07', name: '넥슨코리아', industry: '게임', logoUrl: '/images/companies/nexon.svg', avgSalary: '6,100만원', rating: 4.0, employeeCount: '3,100명', reviewCount: 74, qbankCount: 35, createdAt: '2026.07.20' },
  { id: 'co-08', name: '크래프톤', industry: '게임', logoUrl: '/images/companies/krafton.svg', avgSalary: '7,000만원', rating: 4.2, employeeCount: '1,600명', reviewCount: 63, qbankCount: 31, createdAt: '2026.07.19' },
  { id: 'co-09', name: '쿠팡', industry: '이커머스', logoUrl: '/images/companies/coupang.svg', avgSalary: '6,600만원', rating: 3.8, employeeCount: '5,400명', reviewCount: 141, qbankCount: 68, createdAt: '2026.07.18' },
  { id: 'co-10', name: '라인', industry: 'IT / 플랫폼', logoUrl: '/images/companies/line.svg', avgSalary: '6,700만원', rating: 4.3, employeeCount: '2,600명', reviewCount: 98, qbankCount: 45, createdAt: '2026.07.17' },
  { id: 'co-11', name: '무신사', industry: '이커머스', logoUrl: '/images/companies/musinsa.svg', avgSalary: '5,900만원', rating: 4.0, employeeCount: '1,400명', reviewCount: 58, qbankCount: 26, createdAt: '2026.07.16' },
  { id: 'co-12', name: '안랩', industry: '보안', logoUrl: '/images/companies/ahnlab.svg', avgSalary: '5,600만원', rating: 3.9, employeeCount: '1,100명', reviewCount: 44, qbankCount: 21, createdAt: '2026.07.15' },
];

const QBANKS = [
  {
    id: 'qb-01',
    companyName: '네이버',
    companyLogo: '/images/companies/naver.svg',
    difficulty: '어려움',
    result: '합격',
    route: '온라인 지원',
    jobInfo: '프론트엔드 / 신입 / 대졸',
    createdAt: '2026.07.26',
    questions: ['본인이 만든 서비스에서 가장 신경 쓴 부분은 무엇인가요?', '브라우저 렌더링 과정을 설명해주세요.'],
    bookmark: 512,
    comment: 24,
  },
  {
    id: 'qb-02',
    companyName: '카카오',
    companyLogo: '/images/companies/kakao.svg',
    difficulty: '보통',
    result: '합격',
    route: '리크루터 제안',
    jobInfo: '백엔드 / 신입 / 대졸',
    createdAt: '2026.07.24',
    questions: ['데이터베이스 인덱스는 언제 효과가 없나요?', '트랜잭션 격리 수준을 설명해주세요.'],
    bookmark: 388,
    comment: 17,
  },
  {
    id: 'qb-03',
    companyName: '토스',
    companyLogo: '/images/companies/toss.svg',
    difficulty: '어려움',
    result: '대기',
    route: '온라인 지원',
    jobInfo: '프론트엔드 / 1~3년 / 대졸',
    createdAt: '2026.07.22',
    questions: ['상태 관리 라이브러리를 쓰지 않고 해결한 경험이 있나요?', '접근성을 어떻게 검증했나요?'],
    bookmark: 461,
    comment: 31,
  },
  {
    id: 'qb-04',
    companyName: '이스트소프트',
    companyLogo: '/images/companies/estsoft.svg',
    difficulty: '보통',
    result: '합격',
    route: '채용 박람회',
    jobInfo: '프론트엔드 / 신입 / 대졸',
    createdAt: '2026.07.20',
    questions: ['이스트소프트에 지원한 이유는 무엇인가요?', '본인의 장점과 단점을 말씀해주세요.'],
    bookmark: 205,
    comment: 9,
  },
  {
    id: 'qb-05',
    companyName: '우아한형제들',
    companyLogo: '/images/companies/woowahan.svg',
    difficulty: '보통',
    result: '불합격',
    route: '지인 추천',
    jobInfo: '백엔드 / 신입 / 대졸',
    createdAt: '2026.07.18',
    questions: ['대용량 트래픽을 어떻게 처리하나요?', '캐시 무효화 전략을 설명해주세요.'],
    bookmark: 334,
    comment: 12,
  },
  {
    id: 'qb-06',
    companyName: '넥슨코리아',
    companyLogo: '/images/companies/nexon.svg',
    difficulty: '쉬움',
    result: '합격',
    route: '온라인 지원',
    jobInfo: '게임 클라이언트 / 신입 / 대졸',
    createdAt: '2026.07.16',
    questions: ['프레임 드랍의 원인을 어떻게 찾나요?', '오브젝트 풀링을 왜 쓰나요?'],
    bookmark: 178,
    comment: 6,
  },
  {
    id: 'qb-07',
    companyName: '쿠팡',
    companyLogo: '/images/companies/coupang.svg',
    difficulty: '어려움',
    result: '대기',
    route: '리크루터 제안',
    jobInfo: '데이터 / 1~3년 / 석사',
    createdAt: '2026.07.14',
    questions: ['추천 모델의 성능을 어떤 지표로 평가하나요?', '실험 설계에서 주의할 점은 무엇인가요?'],
    bookmark: 292,
    comment: 15,
  },
];

export default function Activity() {
  return (
    <Suspense>
      <ActivityBrowser companies={COMPANIES} qbanks={QBANKS} />
    </Suspense>
  );
}

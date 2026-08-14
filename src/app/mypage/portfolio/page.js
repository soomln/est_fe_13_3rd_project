import { Suspense } from 'react';

import PortfolioBrowser from '@/app/mypage/portfolio/_components/PortfolioBrowser';

// 주의: supabase 연결 전까지 쓰는 임시 목록. 배열 순서가 등록순
const PORTFOLIOS = [
  { id: 'pf-01', title: '취업 준비 대시보드', authorName: '홍길동', thumbnailUrl: '', authorAvatar: '', likeCount: 50, createdAt: '2026.07.26', isScrapped: false },
  { id: 'pf-02', title: '개인 블로그 리뉴얼', authorName: '홍길동', thumbnailUrl: '', authorAvatar: '', likeCount: 42, createdAt: '2026.07.20', isScrapped: false },
  { id: 'pf-03', title: '날씨 알림 서비스', authorName: '홍길동', thumbnailUrl: '', authorAvatar: '', likeCount: 38, createdAt: '2026.07.12', isScrapped: false },
  { id: 'pf-04', title: '팀 협업 도구', authorName: '홍길동', thumbnailUrl: '', authorAvatar: '', likeCount: 27, createdAt: '2026.07.05', isScrapped: false },
  { id: 'pf-05', title: '독서 기록 앱', authorName: '홍길동', thumbnailUrl: '', authorAvatar: '', likeCount: 21, createdAt: '2026.06.28', isScrapped: false },
  { id: 'pf-11', title: '여행 일정 플래너', authorName: '홍길동', thumbnailUrl: '', authorAvatar: '', likeCount: 18, createdAt: '2026.06.20', isScrapped: false },
  { id: 'pf-12', title: '운동 기록 대시보드', authorName: '홍길동', thumbnailUrl: '', authorAvatar: '', likeCount: 15, createdAt: '2026.06.14', isScrapped: false },
  { id: 'pf-13', title: '레시피 공유 서비스', authorName: '홍길동', thumbnailUrl: '', authorAvatar: '', likeCount: 12, createdAt: '2026.06.07', isScrapped: false },
  { id: 'pf-14', title: '포트폴리오 사이트', authorName: '홍길동', thumbnailUrl: '', authorAvatar: '', likeCount: 9, createdAt: '2026.05.30', isScrapped: false },
  { id: 'pf-06', title: '디자인 시스템 정리', authorName: '김소영', thumbnailUrl: '', authorAvatar: '', likeCount: 61, createdAt: '2026.07.24', isScrapped: true },
  { id: 'pf-07', title: '커머스 상세 페이지', authorName: '박소영', thumbnailUrl: '', authorAvatar: '', likeCount: 55, createdAt: '2026.07.18', isScrapped: true },
  { id: 'pf-08', title: '실시간 채팅 클론', authorName: '장도담', thumbnailUrl: '', authorAvatar: '', likeCount: 47, createdAt: '2026.07.09', isScrapped: true },
  { id: 'pf-09', title: '사내 관리자 페이지', authorName: '송주윤', thumbnailUrl: '', authorAvatar: '', likeCount: 39, createdAt: '2026.07.02', isScrapped: true },
  { id: 'pf-10', title: '모바일 가계부 앱', authorName: '최수민', thumbnailUrl: '', authorAvatar: '', likeCount: 33, createdAt: '2026.06.25', isScrapped: true },
];

export default function Portfolio() {
  return (
    <Suspense>
      <PortfolioBrowser portfolios={PORTFOLIOS} />
    </Suspense>
  );
}

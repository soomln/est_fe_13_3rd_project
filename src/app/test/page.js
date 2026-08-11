'use client';

import { useState } from 'react';
// 팀 컨벤션 준수: 컴포넌트는 PascalCase, 절대 경로 별칭(@/) 사용
import Header from '@/app/_components/common/Header/Header';
import Footer from '@/app/_components/common/Footer/Footer';
import Bookmark from '@/app/_components/common/Bookmark/Bookmark';
import Tag from '@/app/_components/common/Tag/Tag';
import Pagination from '@/app/_components/common/Pagination/Pagination';
import PortfolioCard from '@/app/_components/common/PortfolioCard';
import PostCard from '@/app/_components/common/ReviewCard/ReviewCard';
import CategoryChip from '@/app/_components/common/Category/CategoryChip';
import CircleBadge from '@/app/_components/common/CircleBadge/CircleBadge';
import ActionBtn from '@/app/_components/common/ActionBtn/ActionBtn';
import ReviewCard from '@/app/_components/common/ReviewCard/ReviewCard';

export default function Home() {
  // 1. Boolean 상태 관리 (팀 컨벤션: is / has / can 접두사 준수)
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('web');

  // 카테고리 목록 데이터
  const categories = ['all', 'web'];

  // 포트폴리오 데이터 (camelCase 준수)
  const portfolioData = [
    { id: 1, thumbnailUrl: '', title: '포트폴리오 예시 1', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 2, thumbnailUrl: '', title: '포트폴리오 예시 2', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
  ];
  const review = {
    id: 1,
    job: '개발',
    education: '대졸',
    date: '2026.07.23',
    difficulty: '보통',
    result: '합격',
    route: '잡코리아',
    title: '생각보다 편했던 면접',
    content: '면접관분들이 편하게 분위기를 만들어 주셔서 긴장이 많이 풀렸습니다.',
    summary: '난이도는 보통이었지만 면접관분들이 편안한 분위기를 만들어 주셔서 긴장하지 않고 면접을 볼 수 있었습니다.',
    questions: ['1. 이스트소프트에 지원한 이유는 무엇인가요?', '2. 본인의 장점과 단점을 말씀해주세요.'],
    comments: [
      {
        id: 1,
        job: '개발',
        education: '대졸',
        date: '2026.07.24',
        time: '22:50',
        content: '저도 최근에 봤는데 분위기가 정말 편안했어요. 프로젝트만 잘 준비하면 충분히 답변 가능합니다!',
        likes: 50,
      },
      {
        id: 2,
        job: '개발',
        education: '대졸',
        date: '2026.07.24',
        time: '22:50',
        content: '저도 최종 합격했습니다! 면접관분들이 친절하셔서 긴장이 많이 풀렸어요.',
        likes: 50,
      },
      {
        id: 3,
        job: '개발',
        education: '대졸',
        date: '2026.07.24',
        time: '22:50',
        content: '프로젝트 위주로 준비했는데 비슷하게 나왔습니다. 후기 공감돼요!',
        likes: 50,
      },
      {
        id: 4,
        job: '개발',
        education: '대졸',
        date: '2026.07.24',
        time: '22:50',
        content:
          '저도 이번에 합격했는데 거의 비슷한 질문 받았습니다. 준비하시는 분들 너무 걱정 안 하셔도 될 것 같아요.',
        likes: 50,
      },
    ],
    bookmark: 500,
    comment: 10,
  };
  return (
    <>
      {/* 1. 상단 공통 헤더 */}
      <Header />

      {/* 2. 본문 영역 */}
      <main
        style={{
          padding: '40px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '40px',
          backgroundColor: '#2b2b2b',
          color: '#ffffff',
          minHeight: '100vh',
        }}
      >
        <h1>컴포넌트 테스트</h1>

        {/* 1. 북마크 테스트 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2>1. 북마크 버튼</h2>
          <Bookmark />
          <Bookmark size='medium' />
          <Bookmark size='large' />
        </section>
        {/* 2. 초록색 태그 테스트 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2>2. 초록색 태그</h2>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Tag label='무료 양식 · 브라우저 편집 · AI 연습' variant='green' />
          </div>
        </section>

        {/* 3. 카테고리 칩 테스트 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2>3. 카테고리 탭 (CategoryChip)</h2>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            {categories.map((cat) => (
              <CategoryChip
                key={cat}
                label={cat}
                isSelected={selectedCategory === cat}
                onClick={() => setSelectedCategory(cat)}
              />
            ))}
          </div>
        </section>

        {/* 4. 페이지네이션 테스트 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2>4. 페이지네이션</h2>
          <Pagination currentPage={currentPage} totalPages={10} onPageChange={(page) => setCurrentPage(page)} />
        </section>

        {/* 5. 포트폴리오 카드 테스트 */}

        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2>Action Button</h2>
          <ActionBtn iconText={'thumb_up_alt'} count={50} />
          <ActionBtn iconText={'bookmark'} count={50} />

          <h2>5. 포트폴리오 카드</h2>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {portfolioData.map((item) => (
              <PortfolioCard key={item.id} item={item} onClick={() => {}} />
            ))}
          </div>
        </section>

        {/* 6. 포스트(면접 후기) 카드 테스트 */}
        <section style={{}}>
          <h2>6. 포스트 카드 (면접 후기)</h2>
          <ReviewCard review={review} onBookmarkClick={() => {}} />
          <ReviewCard companyLogo='/logo.svg' companyName='이스트소프트' review={review} onBookmarkClick={() => {}} />
        </section>

        {/*7. 원형 배지 (CircleBadge) 테스트 */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h2>7. 원형 배지 (CircleBadge)</h2>
          <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
            {/* 큰 사이즈 */}
            <CircleBadge src='/logo.svg' name='Zero Margin' size='large' />
            {/* 중간 사이즈 */}
            <CircleBadge src='/logo.svg' name='김개발' size='medium' />
            {/* 작은 사이즈 */}
            <CircleBadge src='/logo.svg' name='박디자인' size='small' />
          </div>
        </section>
      </main>

      {/* 3. 하단 공통 푸터 */}
      <Footer />
    </>
  );
}

'use client';

import { useState } from 'react';
import Bookmark from '../_components/common/Bookmark';
import Tag from '../_components/common/Tag';
import Pagination from '../_components/common/Pagination';
import PortfolioCard from '../_components/common/PortfolioCard';
import PostCard from '../_components/common/PostCard';
import CategoryChip from '../_components/common/CategoryChip';

export default function Home() {
  // 1. 상태 관리
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isPostBookmarked, setIsPostBookmarked] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('web');

  // 카테고리 목록 데이터
  const categories = ['all', 'web'];

  // 포트폴리오 데이터
  const portfolioData = [
    { id: 1, title: '', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
    { id: 2, title: '제목', authorName: '이름', likeCount: 50, bookmarkCount: 50 },
  ];

  return (
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
        <Bookmark isBookmarked={isBookmarked} onClick={() => setIsBookmarked((prev) => !prev)} />
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
        <h2>5. 포트폴리오 카드</h2>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
          {portfolioData.map((item) => (
            <PortfolioCard
              key={item.id}
              title={item.title}
              authorName={item.authorName}
              likeCount={item.likeCount}
              bookmarkCount={item.bookmarkCount}
            />
          ))}
        </div>
      </section>

      {/* 6. 포스트(면접 후기) 카드 테스트 */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxWidth: '800px' }}>
        <h2>6. 포스트 카드 (면접 후기)</h2>
        <PostCard
          companyName='이스트소프트'
          difficulty='보통'
          result='합격'
          channel='잡코리아'
          jobInfo='개발 / 사원 / 대졸'
          date='2026. 07. 23'
          questions={['1. 이스트소프트에 지원한 이유는 무엇인가요?', '2. 본인의 장점과 단점을 말씀해주세요.']}
          saveCount={500}
          commentCount={10}
          isBookmarked={isPostBookmarked}
          onBookmarkClick={() => setIsPostBookmarked((prev) => !prev)}
        />
      </section>
    </main>
  );
}

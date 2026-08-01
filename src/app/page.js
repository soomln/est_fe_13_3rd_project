'use client';

import { useState } from 'react';
import Bookmark from './components/common/Bookmark';

export default function Home() {
  // 북마크 클릭 상태 관리
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <main style={{ padding: '20px' }}>
      <h1>컴포넌트 테스트</h1>

      {/* 클릭할 때마다 isBookmarked 상태가 반대로 toggling 됩니다 */}
      <Bookmark isBookmarked={isBookmarked} onClick={() => setIsBookmarked(!isBookmarked)} />
    </main>
  );
}

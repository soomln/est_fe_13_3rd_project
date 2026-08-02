// src/app/page.js
import Header from './_components/common/Header';

export default function Home() {
  return (
    <div>
      {/* 상단 헤더 컴포넌트 */}
      <Header />

      {/* 메인 콘텐츠 영역 (테스트용) */}
      <main className='container'>
        <h1 style={{ marginTop: '40px' }}>메인 페이지 테스트</h1>
        <p>반응형 레이아웃과 Header 컴포넌트가 제대로 작동하는지 확인합니다.</p>
      </main>
    </div>
  );
}

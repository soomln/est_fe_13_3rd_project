'use client';

import Link from 'next/link';

import { useAuth } from '@/app/_components/auth';

const DOCS_PATH = '/mypage/documents';

// 로그인해야 볼 수 있는 곳이다.
// 그냥 넘기면 proxy 가 메인으로 되돌리는데, 화면을 새로 띄우지 않으면
// 로그인 창이 뜨지 않아서 그냥 메인으로 돌아간 것처럼 보인다
export default function MyDocsLink({ className, children }) {
  const { isLoading, isLoggedIn, openLogin } = useAuth();

  const guard = (event) => {
    if (isLoading || isLoggedIn) return;

    event.preventDefault();

    // 로그인을 마치면 문서함으로 보내달라고 주소에 남긴다
    const url = new URL(window.location.href);
    url.searchParams.set('next', DOCS_PATH);
    window.history.replaceState({}, '', url);

    openLogin();
  };

  return (
    <Link href={DOCS_PATH} className={className} onClick={guard}>
      {children}
    </Link>
  );
}

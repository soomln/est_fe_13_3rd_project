import { Suspense } from 'react';
import { headers } from 'next/headers';
import Portfolio from './Portfolio';

export const metadata = {
  title: '포트폴리오 갤러리 | CallBack',
  description: '포트폴리오를 한 곳에 정리하고, 나만의 강점을 담아 효과적으로 PR해보세요!',

  openGraph: {
    title: '포트폴리오 갤러리 | CallBack',
    description: '포트폴리오를 한 곳에 정리하고, 나만의 강점을 담아 효과적으로 PR해보세요!',
  },
};

async function getInitialPortfolios(query = {}) {
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const hostname = host?.split(':')[0];
  const protocol =
    requestHeaders.get('x-forwarded-proto') ??
    (hostname === 'localhost' || hostname === '127.0.0.1' ? 'http' : 'https');
  const cookie = requestHeaders.get('cookie');

  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, String(value));
    }
  }

  const queryString = searchParams.toString();
  const endpoint = `${protocol}://${host}/api/portfolios${queryString ? `?${queryString}` : ''}`;
  const response = await fetch(endpoint, {
    cache: 'no-store',
    headers: cookie ? { cookie } : undefined,
  });

  if (!response.ok) {
    throw new Error(`포트폴리오 목록을 불러오지 못했습니다. (${response.status})`);
  }

  return response.json();
}

export default async function Page() {
  const [initialData, popularData] = await Promise.all([
    getInitialPortfolios(),
    getInitialPortfolios({ sort: 'popular', pageSize: 10 }),
  ]);
  const initialBestPortfolioItems = popularData.items ?? [];

  return (
    <Suspense fallback={null}>
      <Portfolio initialData={initialData} initialBestPortfolioItems={initialBestPortfolioItems} />
    </Suspense>
  );
}

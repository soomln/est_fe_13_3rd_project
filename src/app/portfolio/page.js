import { Suspense } from 'react';
import { randomInt } from 'node:crypto';
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

async function getInitialPortfolios() {
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const hostname = host?.split(':')[0];
  const protocol =
    requestHeaders.get('x-forwarded-proto') ??
    (hostname === 'localhost' || hostname === '127.0.0.1' ? 'http' : 'https');
  const cookie = requestHeaders.get('cookie');

  const response = await fetch(`${protocol}://${host}/api/portfolios`, {
    cache: 'no-store',
    headers: cookie ? { cookie } : undefined,
  });

  if (!response.ok) {
    throw new Error(`포트폴리오 목록을 불러오지 못했습니다. (${response.status})`);
  }

  return response.json();
}

function selectRandomPortfolios(items, count) {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const randomIndex = randomInt(index + 1);
    [shuffled[index], shuffled[randomIndex]] = [shuffled[randomIndex], shuffled[index]];
  }

  return shuffled.slice(0, count);
}

export default async function Page() {
  const initialData = await getInitialPortfolios();
  const initialBestPortfolioItems = selectRandomPortfolios(initialData.items ?? [], 6);

  return (
    <Suspense fallback={null}>
      <Portfolio initialData={initialData} initialBestPortfolioItems={initialBestPortfolioItems} />
    </Suspense>
  );
}

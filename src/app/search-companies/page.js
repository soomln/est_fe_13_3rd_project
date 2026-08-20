import { Suspense } from 'react';

import SearchCompaniesClient from './_components/SearchCompaniesClient';

export const metadata = {
  title: 'CallBack | 기업 탐색',
  description: '기업 정보부터 면접 후기, 족보까지 확인하고, 나에게 맞는 기업을 찾아보세요!',

  openGraph: {
    title: 'CallBack | 기업 탐색',
    description: '기업 정보부터 면접 후기, 족보까지 확인하고, 나에게 맞는 기업을 찾아보세요!',
    type: 'website',
  },
};

export default function SearchCompaniesPage() {
  return (
    <Suspense fallback={null}>
      <SearchCompaniesClient />
    </Suspense>
  );
}

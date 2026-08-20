import { Suspense } from 'react';

import SearchCompaniesClient from './_components/SearchCompaniesClient';

 export const metadata = {
  title: 'CallBack',
  description: '개발자를 위한 취업 준비 플랫폼. 당신의 취업 준비를 최적화 하세요!',
};

export default function SearchCompaniesPage() {
  return (
    <Suspense fallback={null}>
      <SearchCompaniesClient />
    </Suspense>
  );
}

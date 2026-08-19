import { Suspense } from 'react';

import SearchCompaniesClient from './_components/SearchCompaniesClient';

export default function SearchCompaniesPage() {
  return (
    <Suspense fallback={null}>
      <SearchCompaniesClient />
    </Suspense>
  );
}

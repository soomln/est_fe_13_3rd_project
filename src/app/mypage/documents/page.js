import { Suspense } from 'react';

import DocumentBrowser from '@/app/mypage/documents/_components/DocumentBrowser';

export default function Documents() {
  return (
    <Suspense>
      <DocumentBrowser />
    </Suspense>
  );
}

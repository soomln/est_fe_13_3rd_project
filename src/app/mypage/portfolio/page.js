import { Suspense } from 'react';

import PortfolioBrowser from '@/app/mypage/portfolio/_components/PortfolioBrowser';

export default function Portfolio() {
  return (
    <Suspense>
      <PortfolioBrowser />
    </Suspense>
  );
}

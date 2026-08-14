import { Suspense } from 'react';

import ScrapBrowser from '@/app/mypage/interview-scrap/_components/ScrapBrowser';

export default function InterviewScrap() {
  return (
    <Suspense>
      <ScrapBrowser />
    </Suspense>
  );
}

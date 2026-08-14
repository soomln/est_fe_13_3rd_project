import { Suspense } from 'react';

import ActivityBrowser from '@/app/mypage/activity/_components/ActivityBrowser';

export default function Activity() {
  return (
    <Suspense>
      <ActivityBrowser />
    </Suspense>
  );
}

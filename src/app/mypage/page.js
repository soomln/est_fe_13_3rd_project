import { Suspense } from 'react';

import ProfilePanel from '@/app/mypage/_components/ProfilePanel';

export default function MyPage() {
  return (
    <Suspense>
      <ProfilePanel />
    </Suspense>
  );
}

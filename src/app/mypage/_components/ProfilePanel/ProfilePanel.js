'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

import { useMyProfile } from '@/app/mypage/_components/MyProfileProvider';
import ProfileView from '@/app/mypage/_components/ProfileView';
import ProfileEdit from '@/app/mypage/_components/ProfileEdit';
import ErrorState from '@/app/mypage/_components/ErrorState';
import { toView } from '@/app/mypage/_lib/profileMap';
import styles from './ProfilePanel.module.sass';

// ?mode=edit 이면 한꺼번에 고치는 화면, 아니면 섹션마다 고치는 화면
export default function ProfilePanel() {
  const searchParams = useSearchParams();
  const { profile, codes, stats, status, refreshStats, reload } = useMyProfile();

  // 프로필 화면에 들어올 때마다 개수를 새로 센다
  useEffect(() => {
    refreshStats?.();
  }, [refreshStats]);

  if (status === 'loading') {
    return (
      <p className={`${styles.profile_panel_state} font_body_m_r`} role='status'>
        불러오는 중이에요…
      </p>
    );
  }

  if (status === 'error') {
    return (
      <ErrorState title='프로필을 불러오지 못했어요' onRetry={reload} />
    );
  }

  const view = toView(profile, codes, stats);

  return searchParams.get('mode') === 'edit' ? (
    <ProfileEdit profile={view} />
  ) : (
    <ProfileView profile={view} />
  );
}

'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { getMyProfile, getMyProfileStats, updateProfile } from '@backend/lib/api/mypage';
import { getCodeGroups } from '@backend/lib/api/codes';

const CODE_GROUPS = [
  'job_role',
  'career_level',
  'tech_stack',
  'interest_field',
  'education_level',
  'school_type',
  'edu_status',
  'language_level',
];

const MyProfileContext = createContext(null);

// 마이페이지 안에서 내 프로필을 한 번만 불러와 같이 쓴다
export function useMyProfile() {
  return useContext(MyProfileContext) ?? { status: 'loading', codes: {} };
}

export default function MyProfileProvider({ children, initialProfile = null, initialCodes = null }) {
  const [profile, setProfile] = useState(initialProfile);
  const [codes, setCodes] = useState(initialCodes ?? {});
  const [stats, setStats] = useState(null);
  // 서버에서 미리 받아왔으면 불러오는 중 화면을 건너뛴다
  const [status, setStatus] = useState(initialProfile && initialCodes ? 'ready' : 'loading');
  const [reloadKey, setReloadKey] = useState(0);

  // 개수는 없어도 화면이 뜨니 실패해도 넘어간다
  useEffect(() => {
    let alive = true;

    Promise.all([getMyProfile(), getCodeGroups(CODE_GROUPS), getMyProfileStats().catch(() => null)])
      .then(([myProfile, codeGroups, myStats]) => {
        if (!alive) return;
        setProfile(myProfile);
        setCodes(codeGroups);
        setStats(myStats);
        setStatus('ready');
      })
      .catch(() => {
        if (alive) setStatus('error');
      });

    return () => {
      alive = false;
    };
  }, [reloadKey]);

  const reload = useCallback(() => setReloadKey((prev) => prev + 1), []);

  // 문서·포트폴리오를 지우면 개수가 달라지니 다시 불러온다
  const refreshStats = useCallback(() => {
    getMyProfileStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  // 서버에 저장하고 돌려받은 값으로 화면을 맞춘다
  const saveProfile = useCallback(async (patch) => {
    const saved = await updateProfile(patch);
    setProfile(saved);
    return saved;
  }, []);

  return (
    <MyProfileContext.Provider
      value={{ profile, codes, stats, status, setProfile, saveProfile, refreshStats, reload }}
    >
      {children}
    </MyProfileContext.Provider>
  );
}

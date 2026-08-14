'use client';

import { createContext, useContext, useEffect, useState } from 'react';

import { getMyProfile } from '@backend/lib/api/mypage';

const MyProfileContext = createContext(null);

// 마이페이지 안에서 내 프로필을 한 번만 불러와 같이 쓴다
export function useMyProfile() {
  return useContext(MyProfileContext) ?? { profile: null, setProfile: () => {} };
}

export default function MyProfileProvider({ children }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let alive = true;

    getMyProfile()
      .then((result) => {
        if (alive) setProfile(result);
      })
      .catch(() => {});

    return () => {
      alive = false;
    };
  }, []);

  return (
    <MyProfileContext.Provider value={{ profile, setProfile }}>{children}</MyProfileContext.Provider>
  );
}

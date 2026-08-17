'use client';

import { useEffect, useState } from 'react';

import { getCodes } from '@backend/lib/api/codes';
import { getMyProfile } from '@backend/lib/api/profile';

// 글쓴이 정보(직무 / 연차 / 학력)는 마이페이지 프로필에서 가져온다
export default function useWriterProfile(isLoggedIn) {
  const [writer, setWriter] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let ignore = false;

    async function fetchProfile() {
      if (!isLoggedIn) {
        if (!ignore) setStatus('anonymous');
        return;
      }

      try {
        const [profile, careerLevels] = await Promise.all([getMyProfile(), getCodes('career_level')]);

        if (ignore) return;

        const jobRoleCode = profile?.desired_role ?? '';
        const careerLevel = profile?.career_level ?? '';
        const educationLevel = profile?.education_level ?? '';

        if (!jobRoleCode || !careerLevel || !educationLevel) {
          setStatus('incomplete');
          return;
        }

        // posts.position_level 은 코드가 아니라 라벨을 저장한다
        const positionLevel = careerLevels.find((code) => code.code === careerLevel)?.label ?? careerLevel;

        setWriter({ jobRoleCode, positionLevel, educationLevel });
        setStatus('ready');
      } catch (error) {
        console.error(error);

        if (!ignore) setStatus('error');
      }
    }

    fetchProfile();

    return () => {
      ignore = true;
    };
  }, [isLoggedIn]);

  return { writer, status };
}

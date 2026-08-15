'use client';

import { useRef, useState } from 'react';

import { uploadAvatar } from '@backend/lib/api/mypage';
import { useMyProfile } from '@/app/mypage/_components/MyProfileProvider';
import TextField from '@/app/mypage/_components/TextField';
import AvatarPicker from '@/app/mypage/_components/AvatarPicker';
import styles from './ProfileEdit.module.sass';

const AVATAR_TYPES = 'image/jpeg,image/png,image/webp';

// 사진 · 이름 · 희망 직무 · 경력 구분 · 링크
export default function BasicFields({ draft, onChange, hasNameError, onPhotoError }) {
  const { codes, setProfile } = useMyProfile();
  const [isUploading, setIsUploading] = useState(false);
  const [isPicking, setIsPicking] = useState(false);
  const fileInputRef = useRef(null);

  const roles = ['', ...(codes.job_role ?? []).map((item) => item.label)];
  const levels = ['', ...(codes.career_level ?? []).map((item) => item.label)];

  // 사진은 고르는 즉시 올라간다
  const pickPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploading(true);

    try {
      const url = await uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatar_url: url }));
      onChange({ ...draft, avatarUrl: url });
    } catch (error) {
      onPhotoError(error?.message ?? '사진을 올리지 못했어요.');
    } finally {
      setIsUploading(false);
    }
  };

  // 기본 이미지는 고르는 즉시 반영한다
  const pickDefault = (url) => {
    setIsPicking(false);
    setProfile((prev) => ({ ...prev, avatar_url: url }));
    onChange({ ...draft, avatarUrl: url });
  };

  return (
    <section className={styles.profile_edit_basic}>
      <div className={styles.profile_edit_avatar_box}>
        {draft.avatarUrl ? (
          <img src={draft.avatarUrl} alt='' className={styles.profile_edit_avatar} />
        ) : (
          <span className={styles.profile_edit_avatar} />
        )}

        <input
          ref={fileInputRef}
          type='file'
          accept={AVATAR_TYPES}
          className={styles.profile_edit_avatar_input}
          onChange={pickPhoto}
          aria-label='프로필 사진 파일 선택'
        />

        <button
          type='button'
          className={`${styles.profile_edit_avatar_btn} font_body_s_b`}
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
        >
          {isUploading ? '올리는 중…' : '사진 변경'}
        </button>

        <button
          type='button'
          className={`${styles.profile_edit_avatar_btn} font_body_s_b`}
          onClick={() => setIsPicking(true)}
        >
          기본 이미지
        </button>
      </div>

      <AvatarPicker
        isOpen={isPicking}
        current={draft.avatarUrl}
        onSelect={pickDefault}
        onClose={() => setIsPicking(false)}
      />

      <div className={styles.profile_edit_grid}>
        <TextField
          label='이름'
          placeholder='홍길동'
          hasError={hasNameError}
          value={draft.name}
          onChange={(event) => onChange({ ...draft, name: event.target.value })}
        />
        <TextField
          label='희망 직무'
          options={roles}
          value={draft.desiredRole}
          onChange={(event) => onChange({ ...draft, desiredRole: event.target.value })}
        />
        <TextField
          label='경력 구분'
          options={levels}
          value={draft.careerLevel}
          onChange={(event) => onChange({ ...draft, careerLevel: event.target.value })}
        />
        <TextField
          label='링크 (선택)'
          placeholder='github.com/아이디'
          value={draft.github}
          onChange={(event) => onChange({ ...draft, github: event.target.value })}
        />
      </div>
    </section>
  );
}

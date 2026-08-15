'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { getMyAccount, deleteMyAccount, uploadAvatar } from '@backend/lib/api/mypage';
import { useMyProfile } from '@/app/mypage/_components/MyProfileProvider';
import AvatarPicker from '@/app/mypage/_components/AvatarPicker';
import formatDate from '@/app/mypage/_lib/formatDate';
import styles from './AccountPanel.module.sass';

// 탈퇴하려면 이 문구를 글자 그대로 입력해야 한다
const CONFIRM_TEXT = '회원탈퇴 하겠습니다';

const AVATAR_TYPES = 'image/jpeg,image/png,image/webp';

export default function AccountPanel() {
  const router = useRouter();
  const { profile, setProfile, saveProfile } = useMyProfile();
  const [account, setAccount] = useState(null);
  const [confirmText, setConfirmText] = useState('');
  const [isLeaving, setIsLeaving] = useState(false);
  const [leaveError, setLeaveError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [isPicking, setIsPicking] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    let alive = true;

    getMyAccount()
      .then((result) => {
        if (alive) setAccount(result);
      })
      .catch(() => {
        if (alive) setAccount(null);
      });

    return () => {
      alive = false;
    };
  }, []);

  const email = account?.email ?? '불러오는 중이에요…';
  const joinedAt = formatDate(account?.createdAt);
  const avatarUrl = profile?.avatar_url ?? '';

  // 용량·형식 검사는 uploadAvatar 가 하고 메시지를 그대로 보여준다
  const handlePickPhoto = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setIsUploading(true);
    setPhotoError('');

    try {
      const url = await uploadAvatar(file);
      setProfile((prev) => ({ ...prev, avatar_url: url }));
    } catch (error) {
      setPhotoError(error?.message ?? '사진을 올리지 못했어요.');
    } finally {
      setIsUploading(false);
    }
  };

  const pickDefault = async (url) => {
    setIsPicking(false);
    setPhotoError('');

    try {
      await saveProfile({ avatar_url: url });
    } catch {
      setPhotoError('사진을 바꾸지 못했어요.');
    }
  };

  const canLeave = confirmText === CONFIRM_TEXT && !isLeaving;

  // 탈퇴하면 계정과 올린 파일이 모두 지워지고 되돌릴 수 없다
  const handleLeave = async () => {
    if (!canLeave) return;

    setIsLeaving(true);
    setLeaveError('');

    try {
      await deleteMyAccount();
      router.replace('/');
    } catch {
      setLeaveError('탈퇴에 실패했어요. 잠시 뒤 다시 시도해주세요.');
      setIsLeaving(false);
    }
  };

  return (
    <>
      <div className={styles.account_head}>
        <h1 className={`${styles.account_head_title} font_h1`}>계정 설정</h1>
        <p className={`${styles.account_head_desc} font_body_m_r`}>
          로그인 정보와 계정 상태를 관리해요.
        </p>
      </div>

      <section className={styles.account_card}>
        <h2 className={`${styles.account_card_title} font_h4`}>로그인 정보</h2>

        <div className={styles.account_login}>
          <div className={styles.account_avatar_col}>
            <div className={styles.account_avatar_box}>
              {avatarUrl ? (
                <img src={avatarUrl} alt='' className={styles.account_avatar} />
              ) : (
                <span className={styles.account_avatar_dummy} />
              )}

              {/* 사진 위에 마우스를 올리면 어두워지면서 뜬다 */}
              <div className={styles.account_photo_dim}>
                <button
                  type='button'
                  className={`${styles.account_photo_btn} font_body_m_b`}
                  onClick={() => setIsPicking(true)}
                >
                  기본 이미지
                </button>
              </div>
            </div>

            <button
              type='button'
              className={`${styles.account_photo_btn} font_body_m_b`}
              disabled={isUploading}
              onClick={() => fileInputRef.current?.click()}
            >
              {isUploading ? '올리는 중…' : '사진 변경'}
            </button>
          </div>

          <dl className={styles.account_fields}>
            <div className={styles.account_field}>
              <dt className='font_body_m_b'>이메일</dt>
              <dd className='font_body_m_r'>{email}</dd>
            </div>

            <div className={styles.account_field}>
              <dt className='font_body_m_b'>가입일</dt>
              <dd className='font_body_m_r'>{joinedAt}</dd>
            </div>
          </dl>

          <input
            ref={fileInputRef}
            type='file'
            accept={AVATAR_TYPES}
            className={styles.account_photo_input}
            onChange={handlePickPhoto}
            aria-label='프로필 사진 파일 선택'
          />

        </div>

        <AvatarPicker
          isOpen={isPicking}
          current={avatarUrl}
          onSelect={pickDefault}
          onClose={() => setIsPicking(false)}
        />

        {photoError && (
          <p className={`${styles.account_photo_error} font_body_s_b`} role='alert'>
            {photoError}
          </p>
        )}
      </section>

      <section className={styles.account_card}>
        <h2 className={`${styles.account_card_title} font_h4`}>회원 탈퇴</h2>
        <p className={`${styles.account_leave_desc} font_body_m_r`}>
          탈퇴하면 작성한{' '}
          <strong className={styles.account_leave_warn}>
            이력서·자기소개서와 AI 면접 기록이 모두 삭제
          </strong>
          되고, 되돌릴 수 없어요.
        </p>

        <div className={styles.account_leave_box}>
          <p className={`${styles.account_leave_notice} font_body_s_b`}>
            <span className='material-symbols-sharp' aria-hidden='true'>
              warning
            </span>
            동의하신다면 아래에 ‘{CONFIRM_TEXT}’를 입력한 후 탈퇴 버튼을 눌러주세요.
          </p>

          <div className={styles.account_leave_form}>
            <input
              type='text'
              className={`${styles.account_leave_input} font_body_m_r`}
              placeholder={CONFIRM_TEXT}
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              aria-label='탈퇴 확인 문구'
            />
            <button
              type='button'
              className={`${styles.account_leave_btn} font_body_l_b`}
              disabled={!canLeave}
              onClick={handleLeave}
            >
              {isLeaving ? '처리 중…' : '탈퇴'}
            </button>
          </div>

          {leaveError && (
            <p className={`${styles.account_leave_error} font_body_s_b`} role='alert'>
              {leaveError}
            </p>
          )}
        </div>
      </section>
    </>
  );
}

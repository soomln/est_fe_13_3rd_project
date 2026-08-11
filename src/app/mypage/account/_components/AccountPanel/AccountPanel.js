'use client';

import { useState } from 'react';

import styles from './AccountPanel.module.sass';

// 탈퇴하려면 이 문구를 글자 그대로 입력해야 한다
const CONFIRM_TEXT = '회원탈퇴 하겠습니다';

export default function AccountPanel({ account }) {
  const { email, joinedAt, avatarUrl } = account;
  const [confirmText, setConfirmText] = useState('');

  const canLeave = confirmText === CONFIRM_TEXT;

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
          {avatarUrl ? (
            <img src={avatarUrl} alt='' className={styles.account_avatar} />
          ) : (
            <span className={styles.account_avatar_dummy} />
          )}

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

          <button type='button' className={`${styles.account_photo_btn} font_body_s_b`}>
            사진 변경
          </button>
        </div>
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
            >
              탈퇴
            </button>
          </div>
        </div>
      </section>
    </>
  );
}

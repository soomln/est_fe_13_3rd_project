'use client';

import { useEffect, useRef } from 'react';

import styles from './Toast.module.sass';

const HIDE_MS = 2500;

// 끝난 뒤 알려줄 때 쓰는 알림. 잠시 뒤 스스로 사라진다. tone='error' 면 빨간 알림
export default function Toast({ message, tone = 'done', onHide }) {
  const hideRef = useRef(onHide);
  hideRef.current = onHide;

  // message 만 본다. onHide 까지 보면 부모가 다시 그려질 때마다 타이머가 처음부터 돌아 영영 안 사라진다
  useEffect(() => {
    if (!message) return undefined;

    const timer = setTimeout(() => hideRef.current(), HIDE_MS);
    return () => clearTimeout(timer);
  }, [message]);

  if (!message) return null;

  const isError = tone === 'error';

  return (
    <p
      className={`${styles.toast} ${isError ? styles.toast_error : ''} font_body_m_b`}
      role={isError ? 'alert' : 'status'}
    >
      <span className='material-symbols-sharp' aria-hidden='true'>
        {isError ? 'cancel' : 'check_circle'}
      </span>
      {message}
    </p>
  );
}

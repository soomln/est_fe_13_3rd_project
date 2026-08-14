'use client';

import { useEffect } from 'react';

import styles from './Toast.module.sass';

const HIDE_MS = 2500;

// 삭제처럼 끝난 뒤 알려줄 때 쓰는 알림. 잠시 뒤 스스로 사라진다
export default function Toast({ message, onHide }) {
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(onHide, HIDE_MS);
    return () => clearTimeout(timer);
  }, [message, onHide]);

  if (!message) return null;

  return (
    <p className={`${styles.toast} font_body_m_b`} role='status'>
      <span className='material-symbols-sharp' aria-hidden='true'>
        check_circle
      </span>
      {message}
    </p>
  );
}

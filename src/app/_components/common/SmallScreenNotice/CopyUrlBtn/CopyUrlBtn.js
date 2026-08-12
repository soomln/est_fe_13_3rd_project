'use client';

import { useEffect, useState } from 'react';
import styles from './CopyUrlBtn.module.sass';

const RESET_MS = 2000;

// 현재 주소를 클립보드에 복사한다
export default function CopyUrlBtn() {
  const [state, setState] = useState('idle');

  useEffect(() => {
    if (state === 'idle') return;

    const timer = setTimeout(() => setState('idle'), RESET_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setState('done');
    } catch {
      setState('failed');
    }
  };

  if (state === 'failed') {
    return (
      <p className={`${styles.copy_failed} font_body_s_r`}>
        복사가 안 됐어요. 주소창을 길게 눌러 직접 복사해주세요
      </p>
    );
  }

  return (
    <button
      type='button'
      className={`${styles.copy_btn} font_body_m_b`}
      onClick={handleClick}
      aria-live='polite'
    >
      <span className='material-symbols-sharp'>{state === 'done' ? 'check' : 'content_copy'}</span>
      {state === 'done' ? '복사했어요' : '주소 복사하기'}
    </button>
  );
}

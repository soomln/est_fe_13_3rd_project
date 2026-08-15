'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import styles from './UnsavedGuard.module.sass';

// 수정 중일 때 다른 곳으로 나가려 하면 한 번 물어본다
export default function UnsavedGuard({ isDirty }) {
  const router = useRouter();
  const [pendingHref, setPendingHref] = useState(null);

  // 새로고침·탭 닫기는 브라우저가 대신 물어본다
  useEffect(() => {
    if (!isDirty) return undefined;

    const onBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  // 사이트 안에서 링크로 옮겨가는 것은 우리가 막는다
  useEffect(() => {
    if (!isDirty) return undefined;

    const onClick = (event) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey) return;

      const link = event.target.closest?.('a[href]');
      if (!link || link.target === '_blank') return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;

      const next = new URL(link.href);
      if (next.origin !== window.location.origin) return;
      if (next.pathname + next.search === window.location.pathname + window.location.search) return;

      event.preventDefault();
      event.stopPropagation();
      setPendingHref(next.pathname + next.search);
    };

    document.addEventListener('click', onClick, true);

    return () => document.removeEventListener('click', onClick, true);
  }, [isDirty]);

  if (!pendingHref) return null;

  return (
    <div className={styles.unsaved_guard_overlay}>
      <div className={styles.unsaved_guard} role='alertdialog' aria-label='저장하지 않고 나가기'>
        <p className={`${styles.unsaved_guard_title} font_h4`}>저장하지 않은 내용이 있어요</p>
        <p className={`${styles.unsaved_guard_desc} font_body_m_r`}>
          지금 나가면 수정한 내용이 사라져요. 그래도 나갈까요?
        </p>

        <div className={styles.unsaved_guard_btns}>
          <button
            type='button'
            className={`${styles.unsaved_guard_stay} font_body_l_b`}
            onClick={() => setPendingHref(null)}
          >
            계속 수정하기
          </button>

          <button
            type='button'
            className={`${styles.unsaved_guard_leave} font_body_l_b`}
            onClick={() => {
              const href = pendingHref;
              setPendingHref(null);
              router.push(href);
            }}
          >
            나가기
          </button>
        </div>
      </div>
    </div>
  );
}

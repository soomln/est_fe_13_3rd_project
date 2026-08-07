'use client';

import { useState } from 'react';
import styles from './Bookmark.module.sass';

/**
 * [공통] 북마크 버튼 컴포넌트
 */
export default function Bookmark({
  onClick = () => {},
  size = 'small', // 기본값: small (32px), 옵션: 'small'(32px), 'medium'(52px), 'large'(91px)
}) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <button
      type='button'
      className={`${styles.bookmark_btn}`}
      onClick={() => {
        setIsBookmarked((prev) => !prev);
        onClick();
      }}
      aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
    >
      <span className={`material-symbols-sharp ${styles.icon} ${styles[size]} ${isBookmarked ? styles.is_active : ''}`}>
        bookmark
      </span>
    </button>
  );
}

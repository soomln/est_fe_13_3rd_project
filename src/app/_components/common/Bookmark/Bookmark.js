'use client';

import { useState } from 'react';
import styles from './Bookmark.module.sass';

/**
 * [공통] 북마크 버튼 컴포넌트
 */
export default function Bookmark({
  isBookmarked: isBookmarkedProp,
  onClick = () => {},
  size = 'small', // 기본값: small (32px), 옵션: 'small'(32px), 'medium'(52px), 'large'(91px)
  className = '',
}) {
  // isBookmarked를 넘기면 controlled(부모가 상태 소유), 안 넘기면 자체 state로 동작
  const isControlled = isBookmarkedProp !== undefined;
  const [internalBookmarked, setInternalBookmarked] = useState(false);
  const isBookmarked = isControlled ? isBookmarkedProp : internalBookmarked;

  const handleClick = (e) => {
    if (!isControlled) {
      setInternalBookmarked(!isBookmarked);
    }
    onClick(e);
  };

  return (
    <button
      type='button'
      className={`material-symbols-sharp ${styles.bookmark_btn} ${styles[size]} ${isBookmarked ? styles.is_active : ''} ${className}`.trim()}
      onClick={handleClick}
      aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
    >
      bookmark
    </button>
  );
}

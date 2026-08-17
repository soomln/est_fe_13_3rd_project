'use client';

import { useState } from 'react';

import styles from './BookmarkBtn.module.sass';

// 북마크 버튼
export default function BookmarkBtn({ isActive, size = 60, onClick }) {
  const [isSaved, setIsSaved] = useState(false);

  // isActive 를 넘기면 제어 컴포넌트, 안 넘기면 내부 state
  const saved = isActive ?? isSaved;

  const handleClick = (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isActive === undefined) setIsSaved((prev) => !prev);
    if (onClick) onClick();
  };

  return (
    <button
      type='button'
      className={`${styles.bookmark_btn} ${saved ? styles.bookmark_btn_saved : ''}`}
      style={{ '--bookmark-size': `${size}px` }}
      onClick={handleClick}
      aria-label={saved ? '북마크 해제' : '북마크 추가'}
      aria-pressed={saved}
    >
      <span className='material-symbols-sharp' aria-hidden='true'>
        bookmark
      </span>
    </button>
  );
}

'use client';

import { useState } from 'react';

import styles from './BookmarkBtn.module.sass';

// 양식 카드 북마크 버튼
export default function BookmarkBtn({ onClick }) {
  const [isSaved, setIsSaved] = useState(false);

  const handleClick = () => {
    setIsSaved((prev) => !prev);
    if (onClick) onClick();
  };

  return (
    <button
      type='button'
      className={`${styles.bookmark_btn} ${isSaved ? styles.bookmark_btn_saved : ''}`}
      onClick={handleClick}
      aria-label={isSaved ? '북마크 해제' : '북마크 추가'}
    >
      <span className='material-symbols-sharp' aria-hidden='true'>
        bookmark
      </span>
    </button>
  );
}

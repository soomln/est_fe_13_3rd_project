import { useState } from 'react';
import styles from './Bookmark.module.sass';

/**
 * [공통] 북마크 버튼 컴포넌트
 */
export default function Bookmark({ onClick = () => {} }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <button
      type='button'
      className={`material-symbols-sharp ${styles.bookmark_btn} ${isBookmarked ? styles.is_active : ''}`}
      onClick={() => {
        setIsBookmarked(!isBookmarked);
        onClick();
      }}
      aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
    >
      bookmark
    </button>
  );
} //

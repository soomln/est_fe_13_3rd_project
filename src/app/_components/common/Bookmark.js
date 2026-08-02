import styles from './Bookmark.module.sass';

/**
 * [공통] 북마크 버튼 컴포넌트
 *
 * @param {boolean} isBookmarked
 * @param {Function} onClick
 */
export default function Bookmark({ isBookmarked = false, onClick = () => {} }) {
  return (
    <button
      type='button'
      className={`${styles.bookmark_btn} ${isBookmarked ? styles.is_active : ''}`}
      onClick={onClick}
      aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
    >
      <span className='material-symbols-sharp'>bookmark</span>
    </button>
  );
} //

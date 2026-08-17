'use client';

import styles from './CommentItem.module.sass';

// ISO datetime → "HH:MM"
function toTime(iso) {
  if (!iso) return '';

  const date = new Date(iso);

  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export default function CommentItem({ comment, isLiked, isMine, onLikeClick, onDeleteClick }) {
  return (
    <li className={styles.comment}>
      <div className={styles.comment_meta}>
        <span className={`material-symbols-rounded ${styles.comment_avatar}`} aria-hidden='true'>
          account_circle
        </span>

        <span className='font_body_l_r'>{comment.authorName}</span>
        <span className={`${styles.comment_date} font_body_l_r`}>{comment.date}</span>
        <span className={`${styles.comment_date} font_body_l_r`}>{toTime(comment.createdAt)}</span>

        {isMine && (
          <button type='button' className={`${styles.comment_delete} font_body_l_r`} onClick={onDeleteClick}>
            삭제
          </button>
        )}
      </div>

      <div className={styles.comment_body}>
        <p className='font_body_l_r'>{comment.body}</p>

        <button
          type='button'
          className={`${styles.comment_like} ${isLiked ? styles.comment_like_active : ''} font_body_l_r`}
          onClick={onLikeClick}
          aria-label='좋아요'
        >
          <span className='material-symbols-rounded' aria-hidden='true'>
            thumb_up
          </span>
          {comment.likeCount}
        </button>
      </div>
    </li>
  );
}

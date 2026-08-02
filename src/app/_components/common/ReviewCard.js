import Bookmark from './Bookmark';
import styles from './ReviewCard.module.sass';

/**
 * [공통] 면접 후기/포스트 카드 컴포넌트
 */
export default function PostCard({
  companyLogo,
  companyName,
  difficulty,
  result,
  channel,
  jobInfo,
  date,
  questions,
  saveCount,
  commentCount,
  isBookmarked,
  onBookmarkClick,
  onClick,
}) {
  return (
    <div className={styles.post_card} onClick={onClick}>
      <div
        className={`${styles.bookmark_wrapper} ${isBookmarked ? styles.is_active : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          onBookmarkClick();
        }}
      >
        <img src={isBookmarked ? '/bookmark.svg' : '/bookmark.svg'} alt='북마크' className={styles.bookmark_img} />
      </div>

      <div className={styles.card_header}>
        <div className={styles.company_info}>
          <img src={companyLogo} alt={companyName} className={styles.logo_img} />
          <span className={styles.company_name}>{companyName}</span>
        </div>
      </div>

      <div className={styles.meta_line}>
        <div className={styles.meta_tags}>
          <div className={styles.meta_item}>
            <span className={styles.label}>면접 난이도</span>
            <span className={`${styles.value} ${styles.green}`}>{difficulty}</span>
          </div>
          <span className={styles.divider} />
          <div className={styles.meta_item}>
            <span className={styles.label}>합격 여부</span>
            <span className={styles.value}>{result}</span>
          </div>
          <span className={styles.divider} />
          <div className={styles.meta_item}>
            <span className={styles.label}>면접 경로</span>
            <span className={styles.value}>{channel}</span>
          </div>
        </div>

        <div className={styles.writer_info}>
          <span className={styles.job_text}>{jobInfo}</span>
          <span className={styles.date_text}>{date}</span>
        </div>
      </div>

      <div className={styles.question_list}>
        {questions?.map((q, idx) => (
          <p key={idx} className={styles.question_item}>
            {q}
          </p>
        ))}
      </div>

      <div className={styles.card_footer}>
        <div className={styles.save_box}>
          <span className={`material-symbols-sharp ${styles.fill_icon}`}>bookmark</span>
          <span>퍼가요</span>
          <span>{saveCount}</span>
        </div>
        <div className={styles.comment_box}>
          <span>댓글 {commentCount}</span>
        </div>
      </div>
    </div>
  );
}

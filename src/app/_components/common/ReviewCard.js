import Bookmark from './Bookmark';
import styles from './ReviewCard.module.sass';

/**
 * [공통] 면접 후기/포스트 카드 컴포넌트
 */
export default function PostCard({
  companyLogo = '/images/est_logo.svg',
  companyName = '기업명',
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
        className={`${styles.bookmark_wrapper} ${isBookmarked ? styles.is_active : ''}`.trim()}
        onClick={(e) => {
          e.stopPropagation(); // 💡 카드 전체 클릭(onClick)과 북마크 클릭이 겹치지 않게 막아주는 훌륭한 코드입니다!
          onBookmarkClick();
        }}
      >
        <Bookmark />
      </div>

      <div className={styles.card_header}>
        <div className={styles.company_info}>
          <img src={companyLogo || '/logo.svg'} alt={`${companyName} 로고`} className={styles.logo_img} />
          {/* 💡 수정: SASS에서 빼낸 폰트 클래스를 여기에 추가합니다. */}
          <span className={`${styles.company_name} font_body_s_r`}>{companyName}</span>
        </div>
      </div>

      <div className={styles.meta_line}>
        <div className={styles.meta_tags}>
          <div className={styles.meta_item}>
            <span className={`${styles.label} font_body_s_b`}>면접 난이도</span>
            <span className={`${styles.value} ${styles.green} font_body_s_b`}>{difficulty}</span>
          </div>
          <span className={styles.divider} />
          <div className={styles.meta_item}>
            <span className={`${styles.label} font_body_s_b`}>합격 여부</span>
            <span className={`${styles.value} font_body_s_r`}>{result}</span>
          </div>
          <span className={styles.divider} />
          <div className={styles.meta_item}>
            <span className={`${styles.label} font_body_s_b`}>면접 경로</span>
            <span className={`${styles.value} font_body_s_r`}>{channel}</span>
          </div>
        </div>

        <div className={styles.writer_info}>
          <span className={`${styles.job_text} font_caption_r`}>{jobInfo}</span>
          <span className={`${styles.date_text} font_caption_r`}>{date}</span>
        </div>
      </div>

      <div className={styles.question_list}>
        {questions.map((q, idx) => (
          <p key={idx} className={`${styles.question_item} font_body_m_r`}>
            {q}
          </p>
        ))}
      </div>

      <div className={`${styles.card_footer} font_body_s_r`}>
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

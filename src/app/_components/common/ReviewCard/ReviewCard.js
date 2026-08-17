import BookmarkBtn from '../BookmarkBtn';
import styles from './ReviewCard.module.sass';
import Link from 'next/link';

// 면접 후기 / 면접 족보 카드
export default function ReviewCard({
  companyLogo = null,
  companyName = '',
  review,
  href,
  showBookmark = false,
  isBookmarked,
  onBookmarkClick,
  onClick,
}) {


const card = (
  <li key={review.id} className={styles.review_card} onClick={onClick}>
      {showBookmark && (
        <div className={styles.bookmark_wrapper}>
          <BookmarkBtn size={60} isActive={isBookmarked} onClick={onBookmarkClick} />
        </div>
      )}

      <div className={styles.card_header}>
        {companyLogo && (
          <div className={styles.company_info}>
            <img src={companyLogo} alt={`${companyName} 로고`} className={styles.logo_img} />
            {companyName && <span className={`font_body_m_b ${styles.company_name}`}>{companyName}</span>}
          </div>
        )}

        <div className={styles.meta_line}>
          <div className={styles.meta_tags}>
            <div className={styles.meta_item}>
              {review.postType === "review"? (
                <span className={`font_body_m_b ${styles.label}`}>면접 난이도</span>
              ) : (
                <span className={`font_body_m_b ${styles.label}`}>문제 난이도</span>
              )}
              
              <span className={`font_body_m_r ${styles.value} ${styles.green}`}>{review.difficulty}</span>
            </div>
            <div className={styles.meta_item}>
              <span className={`font_body_m_b ${styles.label}`}>합격 여부</span>
              <span className={`font_body_m_r ${styles.value}`}>{review.result}</span>
            </div>
            <div className={styles.meta_item}>
              <span className={`font_body_m_b ${styles.label}`}>면접 경로</span>
              <span className={`font_body_m_r ${styles.value}`}>{review.route}</span>
            </div>
          </div>

          <div className={styles.writer_info}>
            <span className={`material-symbols-rounded ${styles.writer_icon}`}>account_circle</span>
            <span className={`font_body_m_r ${styles.job_text}`}>{`${review.job} / ${review.education}`}</span>
            <span className={`font_body_m_r ${styles.date_text}`}>{review.date}</span>
          </div>
        </div>
      </div>

      <div className={styles.question_list}>
        {review.postType === "review"? (
          <>
            <h1>{review.title}</h1>
            <p>{review.content}</p>
          </>
        ) : (
          <>
            <h1>{review.title}</h1>
            {review.questionList?.map((q, idx) => (
              <p key={idx}>{idx+1}. {q}</p>
            ))}
          </>
        )}
      </div>

      <div className={`font_body_m_r ${styles.card_footer}`}>
        <div className={styles.save_box}>
          <span className={`material-symbols-sharp ${styles.fill_icon}`}>bookmark</span>
          <span>퍼가요</span>
          <span>{review.bookmark}</span>
        </div>
        <div className={styles.comment_box}>
          <span>댓글 {review.comment}</span>
        </div>
      </div>
    </li>
)

 if (href) {
    return (
      <Link href={href} className={styles.link}>
        {card}
      </Link>
    );
  }

  return card;
}

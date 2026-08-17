import Link from 'next/link';

import BookmarkBtn from '../BookmarkBtn';
import styles from './ReviewCard.module.sass';

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
  const isQbank = review.postType === 'qbank';

  // 목록 API 는 jobInfo/saveCount/commentCount 로 내려온다
  const jobInfo = review.jobInfo ?? [review.job, review.education].filter(Boolean).join(' / ');
  const saveCount = review.saveCount ?? review.bookmark ?? 0;
  const commentCount = review.commentCount ?? review.comment ?? 0;
  const questionList = review.questionList ?? review.questions ?? [];

  const metaItems = [
    { label: '면접 난이도', value: review.difficulty, isPoint: true },
    { label: '합격 여부', value: review.result },
    { label: '면접 경로', value: review.route },
  ];

  const card = (
    <div className={styles.review_card} onClick={onClick}>
      {showBookmark && (
        <div className={styles.bookmark_wrapper}>
          <BookmarkBtn size={60} animated={false} isActive={isBookmarked} onClick={onBookmarkClick} />
        </div>
      )}

      {companyLogo && (
        <div className={styles.company_info}>
          <img src={companyLogo} alt={`${companyName} 로고`} className={styles.logo_img} />
          {companyName && <span className={`font_body_m_b ${styles.company_name}`}>{companyName}</span>}
        </div>
      )}

      <div className={styles.meta_line}>
        <div className={styles.meta_tags}>
          {metaItems.map((item) => (
            <div key={item.label} className={styles.meta_item}>
              <span className={`font_body_l_b ${styles.label}`}>{item.label}</span>
              <span className={`font_body_l_r ${styles.value} ${item.isPoint ? styles.green : ''}`}>{item.value}</span>
            </div>
          ))}
        </div>

        <div className={styles.writer_info}>
          <span className={`material-symbols-rounded ${styles.writer_icon}`} aria-hidden='true'>
            account_circle
          </span>
          <span className={`font_body_m_r ${styles.job_text}`}>{jobInfo}</span>
          <span className={`font_body_m_r ${styles.date_text}`}>{review.date}</span>
        </div>
      </div>

      {isQbank ? (
        <ol className={styles.question_list}>
          {questionList.map((question, index) => (
            <li key={index} className='font_body_l_r'>
              {question}
            </li>
          ))}
        </ol>
      ) : (
        <div className={styles.content_block}>
          <p className={`font_body_l_b ${styles.post_title}`}>{review.title}</p>
          <p className={`font_body_l_r ${styles.post_content}`}>{review.content}</p>
        </div>
      )}

      <div className={`font_body_m_r ${styles.card_footer}`}>
        <div className={styles.save_box}>
          <span className={`material-symbols-sharp ${styles.fill_icon}`} aria-hidden='true'>
            bookmark
          </span>
          <span>퍼가요</span>
          <span>{saveCount}</span>
        </div>

        <div className={styles.comment_box}>
          <span>댓글 {commentCount}</span>
        </div>
      </div>
    </div>
  );

  return (
    <li className={styles.item}>
      {href ? (
        <Link href={href} className={styles.link}>
          {card}
        </Link>
      ) : (
        card
      )}
    </li>
  );
}

import styles from "@/app/search-companies/_components/InterviewReviewCard.module.sass"

export default function InterviewQuestionDetailHeader(){
  return(
    <div className={styles.card_header}>
      <div className={styles.meta_line}>
        <div className={styles.meta_tags}>
          <div className={styles.meta_item}>
            <span className={`font_body_m_b ${styles.label}`}>면접 난이도</span>
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
          <span className={`font_body_m_r ${styles.job_text}`}>{review.job} / {review.education}</span>
          <span className={`font_body_m_r ${styles.date_text}`}>{review.date}</span>
        </div>
      </div>
    </div>
  );
}
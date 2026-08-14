import styles from "@/app/search-companies/_components/InterviewReviewCard.module.sass"

export default function InterviewQuestionReviewDetailHeader({question}){
  return(
    <div className={styles.card_header}>
      <div className={styles.meta_line}>
        <div className={styles.meta_tags}>
          <div className={styles.meta_item}>
            <span className={`font_body_m_b ${styles.label}`}>면접 난이도</span>
            <span className={`font_body_m_r ${styles.value} ${styles.green}`}>{question.difficulty}</span>
          </div>
          <div className={styles.meta_item}>
            <span className={`font_body_m_b ${styles.label}`}>합격 여부</span>
            <span className={`font_body_m_r ${styles.value}`}>{question.result}</span>
          </div>
          <div className={styles.meta_item}>
            <span className={`font_body_m_b ${styles.label}`}>면접 경로</span>
            <span className={`font_body_m_r ${styles.value}`}>{question.route}</span>
          </div>
        </div>

        <div className={styles.writer_info}>
          <span className={`material-symbols-rounded ${styles.writer_icon}`}>account_circle</span>
          <span className={`font_body_m_r ${styles.job_text}`}>{question.job} / {question.education}</span>
          <span className={`font_body_m_r ${styles.date_text}`}>{question.date}</span>
        </div>
      </div>
    </div>
  );
}
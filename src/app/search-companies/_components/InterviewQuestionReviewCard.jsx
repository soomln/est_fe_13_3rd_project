import Bookmark from "@/app/_components/common/Bookmark";
import styles from "../_components/InterviewQuestionReviewCard.module.sass"


export default function InterviewQuestionReviewCard({review, onBookmarkClick, onClick}){
  const questions = review.questions;


  return (
    <div className={styles.review_card} onClick={onClick}>
      <div className={styles.bookmark_wrapper}>
        {<Bookmark size='large' onClick={onBookmarkClick} />}
      </div>

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

      <div className={styles.content}>
        {questions.map((q, idx) => (
          <p key={idx} className={`font_body_m_r ${styles.question_item}`}>
            {q}
          </p>
        ))}
      </div>
      <div>

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
    </div>
  );
}
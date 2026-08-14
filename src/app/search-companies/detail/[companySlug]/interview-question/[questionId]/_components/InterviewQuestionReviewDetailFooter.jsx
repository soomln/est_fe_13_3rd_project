import styles from "@/app/search-companies/_components/InterviewReviewCard.module.sass"

export default function InterviewQuestionReviewDetailFooter({question}){
  return(
    <div className={`font_body_m_r ${styles.card_footer}`}>
      <div className={styles.save_box}>
        <span className={`material-symbols-sharp ${styles.fill_icon}`}>bookmark</span>
        <span>퍼가요</span>
        <span>{question.bookmark}</span>
      </div>
      <div className={styles.comment_box}>
        <span>댓글 {question.comment}</span>
      </div>
    </div>
  );
}
import styles from './FeedbackButton.module.sass';

export default function FeedbackButton({ onClick }) {
  return (
    <button
      type="button"
      className={`${styles.feedback_button} font_h4`}
      onClick={onClick}
    >
      피드백 확인하기
    </button>
  );
}
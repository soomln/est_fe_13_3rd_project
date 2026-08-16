import styles from './RetryButton.module.sass';

export default function RetryButton({ onClick }) {
  return (
    <button
      type="button"
      className={`${styles.retry_button} font_h4`}
      onClick={onClick}
    >
      다시 연습하기
    </button>
  );
}
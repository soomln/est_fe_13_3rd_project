import styles from './RetryButton.module.sass';

export default function RetryButton({ onClick, label = '다시 연습하기', variant }) {
  return (
    <button
      type="button"
      className={`${styles.retry_button} ${variant ? styles[variant] : ''} font_h4`}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
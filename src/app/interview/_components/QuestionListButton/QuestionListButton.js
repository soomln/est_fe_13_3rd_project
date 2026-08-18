import styles from './QuestionListButton.module.sass';

export default function QuestionListButton({
  children = '질문 리스트 불러오기',
  onClick,
  disabled = false,
}) {
  return (
    <button
      type="button"
      className={`${styles.question_list_button} font_body_s_b`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
}
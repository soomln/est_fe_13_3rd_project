import './QuestionListButton.sass';

export default function QuestionListButton({
  children = '질문 리스트 불러오기',
  onClick,
}) {
  return (
    <button
      type="button"
      className="question_list_button font_body_s_b"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
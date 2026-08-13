import './FeedbackButton.sass';

export default function FeedbackButton({ onClick }) {
  return (
    <button
      type="button"
      className="feedback_button font_h4"
      onClick={onClick}
    >
      피드백 확인하기
    </button>
  );
}
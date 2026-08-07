import './RetryButton.sass';

export default function RetryButton({ onClick }) {
  return (
    <button
      type="button"
      className="retry_btn font_h4"
      onClick={onClick}
    >
      다시 연습하기
    </button>
  );
}
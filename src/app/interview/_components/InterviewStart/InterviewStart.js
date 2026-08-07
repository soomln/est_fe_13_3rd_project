import './InterviewStart.sass';

export default function InterviewStart({ onClick }) {
  return (
    <button
      type="button"
      className="interview_start_btn font_h4"
      onClick={onClick}
    >
      AI 면접 시작하기
    </button>
  );
}
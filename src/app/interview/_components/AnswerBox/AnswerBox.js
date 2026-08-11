import './AnswerBox.sass';

export default function AnswerBox() {
  return (
    <div className="answer_box">
      <span className="placeholder font_body_l_r">
        답변을 입력해주세요.
      </span>

      <div className="input_actions">
        <button
          type="button"
          className="voice_button"
          aria-label="음성 입력"
        >
          <span className="material-symbols-outlined">
            mic
          </span>
        </button>

        <button
          type="button"
          className="send_button"
          aria-label="답변 보내기"
        >
          <span className="material-symbols-outlined">
            send
          </span>
        </button>
      </div>
    </div>
  );
}
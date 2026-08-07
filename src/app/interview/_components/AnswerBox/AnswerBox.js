import './AnswerBox.sass';

export default function AnswerBox() {
  return (
    <div className="answer_box">
      <input
        type="text"
        className="answer_input font_body_l_r"
        placeholder="답변을 입력해주세요."
      />

      <div className="answer_action">
        <button className="mic_btn">
          <span className="material-symbols-rounded">mic</span>
        </button>

        <button className="send_btn">
          <span className="material-symbols-rounded">send</span>
        </button>
      </div>
    </div>
  );
}
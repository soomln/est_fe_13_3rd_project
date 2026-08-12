'use client';

import { useState } from 'react';
import './AnswerBox.sass';

export default function AnswerBox({ onSend }) {
  const [answer, setAnswer] = useState('');
  const handleSubmit = () => {
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) return;
    onSend(trimmedAnswer);
    setAnswer('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="answer_box">
      <textarea
        className="placeholder font_body_l_r"
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="답변을 입력해주세요."
      />

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
          onClick={handleSubmit}
        >
          <span className="material-symbols-outlined">
            send
          </span>
        </button>
      </div>
    </div>
  );
}
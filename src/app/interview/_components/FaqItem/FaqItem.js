'use client';

import { useState } from 'react';
import './FaqItem.sass';

export default function FaqItem({
  question,
  answer,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="faq_item">
      <button
        type="button"
        className="faq_header"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className="faq_left">
          <span className="question_mark">
            Q.
          </span>

          <span className="font_body_l_r">
            {question}
          </span>
        </div>

        <span className="material-symbols-rounded">
          {isOpen
            ? 'keyboard_arrow_up'
            : 'keyboard_arrow_down'}
        </span>
      </button>

      {isOpen && (
        <div className="faq_answer font_body_m_r">
          {answer}
        </div>
      )}
    </div>
  );
}
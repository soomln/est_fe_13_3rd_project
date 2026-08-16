'use client';

import { useState } from 'react';
import styles from './FaqItem.module.sass';

export default function FaqItem({
  question,
  answer,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.faq_item}>
      <button
        type="button"
        className={styles.faq_header}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className={styles.faq_left}>
          <span className={styles.question_mark}>
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
        <div className={`${styles.faq_answer} font_body_m_r`}>
          {answer}
        </div>
      )}
    </div>
  );
}
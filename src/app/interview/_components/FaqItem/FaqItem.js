'use client';

import { useState } from 'react';
import styles from './FaqItem.module.sass';

export default function FaqItem({
  question,
  answer,
  answerTitle,
  details,
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`${styles.faq_item} ${isOpen ? styles.open : ''}`}>
      <button
        type="button"
        className={styles.faq_header}
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <div className={styles.faq_left}>
          <span className={`${styles.question_mark} font_body_m_b`}>
            Q.
          </span>

          <span className="font_body_m_b">
            {question}
          </span>
        </div>

        <span className={`${styles.arrow} material-symbols-rounded`}>
          {isOpen
            ? 'keyboard_arrow_up'
            : 'keyboard_arrow_down'}
        </span>
      </button>

      {isOpen && (
        <div className={styles.faq_answer}>
          <div className={styles.answer_content}>
            <div className={styles.answer_icon}>
              <span className="material-symbols-rounded">
                description
              </span>
            </div>

            <div className={styles.answer_text}>
              <p className="font_body_m_b">
                {answerTitle}
              </p>

              <p className="font_body_s_r">
                {answer}
              </p>
            </div>
          </div>

          <ul className={styles.answer_list}>
            {details.map((detail) => (
              <li
                key={detail}
                className="font_body_s_r"
              >
                <span className="material-symbols-rounded">
                  check
                </span>

                {detail}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
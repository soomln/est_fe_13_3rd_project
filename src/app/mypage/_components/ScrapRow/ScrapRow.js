'use client';

import styles from './ScrapRow.module.sass';

// 스크랩한 면접 질문 한 줄. 펼치면 내 답변과 AI 피드백이 나온다
export default function ScrapRow({ index, question, answer, feedback, createdAt, isOpen, onToggleOpen }) {
  return (
    <li className={`${styles.scrap_row} ${isOpen ? styles.scrap_row_open : ''}`}>
      <div className={styles.scrap_row_head}>
        <div className={styles.scrap_row_question}>
          <span className={`${styles.scrap_row_index} font_body_s_b`}>{index}</span>
          <span className={`${styles.scrap_row_badge_q} font_body_m_b`} aria-hidden='true'>
            Q
          </span>
          <p className={`${styles.scrap_row_question_text} font_body_l_b`}>{question}</p>
        </div>

        <div className={styles.scrap_row_meta}>
          <span className={`${styles.scrap_row_date} font_body_s_b`}>{createdAt}</span>
          <button
            type='button'
            className={styles.scrap_row_toggle}
            onClick={onToggleOpen}
            aria-expanded={isOpen}
            aria-label={isOpen ? '답변 접기' : '답변 펼치기'}
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              keyboard_arrow_down
            </span>
          </button>
        </div>
      </div>

      {isOpen && (
        <div className={styles.scrap_row_body}>
          <div className={styles.scrap_row_block}>
            <span className={`${styles.scrap_row_badge_a} font_caption_b`} aria-hidden='true'>
              A
            </span>
            <p className={`${styles.scrap_row_answer} font_body_m_r`}>{answer}</p>
          </div>

          <div className={styles.scrap_row_block}>
            <span className={styles.scrap_row_badge_ai} aria-hidden='true'>
              AI
            </span>
            <div className={styles.scrap_row_feedback}>
              <p className={`${styles.scrap_row_feedback_label} font_body_s_b`}>AI 피드백</p>
              <p className={`${styles.scrap_row_feedback_text} font_body_m_r`}>{feedback}</p>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}

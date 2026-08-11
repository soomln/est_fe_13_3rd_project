'use client';

import styles from './ScrapRow.module.sass';

// 스크랩한 면접 질문 한 줄. 펼치면 내 답변과 AI 피드백이 나온다
// onToggle 을 넘길 때만 선택용 체크박스가 나온다 (삭제모드)
export default function ScrapRow({
  index,
  question,
  answer,
  feedback,
  createdAt,
  isOpen,
  onToggleOpen,
  isSelected = false,
  onToggle,
}) {
  const Head = onToggle ? 'label' : 'div';

  return (
    <li
      className={`${styles.scrap_row} ${isOpen ? styles.scrap_row_open : ''} ${
        onToggle ? styles.scrap_row_pickable : ''
      } ${isSelected ? styles.scrap_row_selected : ''}`}
    >
      <Head
        className={styles.scrap_row_head}
        onClick={onToggle ? undefined : onToggleOpen}
      >
        <div className={styles.scrap_row_main}>
          {onToggle && (
            <span className={styles.scrap_row_check}>
              <input
                type='checkbox'
                checked={isSelected}
                onChange={onToggle}
                aria-label={`${question} 선택`}
              />
              <span className='material-symbols-sharp' aria-hidden='true'>
                check
              </span>
            </span>
          )}

          <span className={`${styles.scrap_row_index} font_body_s_b`}>{index}</span>
          <span className={`${styles.scrap_row_badge_q} font_body_m_b`} aria-hidden='true'>
            Q
          </span>
          <p className={`${styles.scrap_row_question} font_body_l_b`}>{question}</p>
          <span className={`${styles.scrap_row_date} font_body_s_b`}>{createdAt}</span>
        </div>

        <button
          type='button'
          className={styles.scrap_row_toggle}
          onClick={(event) => {
            event.stopPropagation();
            onToggleOpen();
          }}
          aria-expanded={isOpen}
          aria-label={isOpen ? '답변 접기' : '답변 펼치기'}
        >
          <span className='material-symbols-sharp' aria-hidden='true'>
            keyboard_arrow_down
          </span>
        </button>
      </Head>

      {isOpen && (
        <div className={styles.scrap_row_body}>
          <div className={styles.scrap_row_block}>
            <span className={`${styles.scrap_row_badge_a} font_caption_b`} aria-hidden='true'>
              A
            </span>
            <div className={styles.scrap_row_answer}>
              <p className={`${styles.scrap_row_answer_label} font_body_s_b`}>나의 답변</p>
              <p className={`${styles.scrap_row_answer_text} font_body_m_r`}>{answer}</p>
            </div>
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

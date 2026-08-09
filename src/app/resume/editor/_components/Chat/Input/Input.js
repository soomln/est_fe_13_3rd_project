'use client';

import styles from './Input.module.sass';

// AI 코치 질문 입력창
export default function Input() {
  return (
    <form className={styles.chat_input} onSubmit={(event) => event.preventDefault()}>
      <input
        type='text'
        className={`${styles.chat_input_field} font_body_l_r`}
        placeholder='궁금한 점을 입력해주세요.'
        aria-label='AI 코치에게 질문하기'
      />

      <button type='submit' className={styles.chat_input_send} aria-label='보내기'>
        <span className='material-symbols-sharp' aria-hidden='true'>
          arrow_circle_up
        </span>
      </button>
    </form>
  );
}

'use client';

import { useRef, useState } from 'react';

import styles from './Input.module.sass';

// AI 코치 질문 입력창
export default function Input({ onSend, isThinking }) {
  const [text, setText] = useState('');
  const fieldRef = useRef(null);

  // 내용만큼 세로로 늘어나게 한다. 최대 높이는 CSS 가 잡는다
  const fitHeight = () => {
    const field = fieldRef.current;
    if (!field) return;

    field.style.height = 'auto';
    field.style.height = `${field.scrollHeight}px`;
  };

  const send = (event) => {
    event.preventDefault();
    if (!text.trim() || isThinking) return;

    onSend?.(text);
    setText('');
    if (fieldRef.current) fieldRef.current.style.height = 'auto';
  };

  // 줄바꿈은 Shift + Enter. 한글은 조합이 끝난 뒤에 보낸다
  const keyDown = (event) => {
    if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return;
    send(event);
  };

  return (
    <form className={styles.chat_input} onSubmit={send}>
      <textarea
        ref={fieldRef}
        rows={1}
        className={`${styles.chat_input_field} font_body_l_r`}
        value={text}
        onChange={(event) => {
          setText(event.target.value);
          fitHeight();
        }}
        onKeyDown={keyDown}
        placeholder={isThinking ? '답을 기다리는 중이에요…' : '궁금한 점을 입력해주세요.'}
        aria-label='AI 코치에게 질문하기'
        disabled={isThinking}
      />

      <button
        type='submit'
        className={styles.chat_input_send}
        aria-label='보내기'
        disabled={isThinking || !text.trim()}
      >
        <span className='material-symbols-sharp' aria-hidden='true'>
          arrow_circle_up
        </span>
      </button>
    </form>
  );
}

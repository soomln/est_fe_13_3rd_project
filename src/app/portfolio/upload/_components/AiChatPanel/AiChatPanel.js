import { useEffect, useRef, useState } from 'react';

import styles from './AiChatPanel.module.sass';
import UserMessage from '../UserMessage';
import AiMessage from '../AiMessage';

export default function AiChatPanel({ onClose, messages, setMessages }) {
  const [input, setInput] = useState('');
  const chatRef = useRef(null);

  const handleSubmit = () => {
    const message = input.trim();

    if (!message) return;

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
      },
    ]);

    setInput('');

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: 'AI 답변 테스트입니다.',
        },
      ]);
    }, 1000);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  useEffect(() => {
    const chat = chatRef.current;

    if (!chat) return;

    chat.scrollTo({
      top: chat.scrollHeight,
      behavior: 'smooth',
    });
  }, [messages]);

  return (
    <div className={styles.panel}>
      <header>
        <div className='font_body_l_b'>AI랑 같이 쓰기</div>
        <button type='button' onClick={onClose} aria-label='AI 채팅 닫기'>
          <span className='material-symbols-sharp'>keyboard_double_arrow_left</span>
        </button>
      </header>
      <div ref={chatRef} className={styles.chat_wrapper}>
        <ul className={styles.chat}>
          {messages.map((m, idx) =>
            m.role === 'user' ? (
              <UserMessage key={idx} message={m.content} />
            ) : (
              <AiMessage key={idx} message={m.content} />
            ),
          )}
        </ul>
      </div>

      <footer className={styles.footer}>
        <form className={styles.input_wrapper}>
          <textarea
            className='font_body_m_r'
            placeholder='궁금한 점을 입력해주세요.'
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />

          <button type='submit' aria-label='메시지 전송' disabled={!input.trim()} onClick={handleSubmit}>
            <span className='material-symbols-sharp'>arrow_upward</span>
          </button>
        </form>
      </footer>
    </div>
  );
}

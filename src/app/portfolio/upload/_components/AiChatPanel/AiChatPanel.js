import { useEffect, useRef, useState } from 'react';

import styles from './AiChatPanel.module.sass';
import UserMessage from '../UserMessage';
import AiMessage from '../AiMessage';
import SuggestionList from '../SuggestionList';

export default function AiChatPanel({ activeTab, messages, setMessages, onClose }) {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);
  const SUGGESTIONS = {
    overview: ['프로젝트 설명 다듬어줘', '핵심 기능 정리해줘', '차별점 찾아줘'],

    document: ['문장을 더 전문적으로 다듬어줘', '내용을 간결하게 정리해줘', '지원 직무에 맞게 다듬어줘'],

    code: ['어필할 코드 골라줘', '기술적 강점 알려줘', '개선할 부분 알려줘'],
  };
  const handleSubmit = async (e) => {
    e?.preventDefault();

    const message = input.trim();

    if (!message || isLoading) return;

    const aiMessageId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
      },
      {
        id: aiMessageId,
        role: 'assistant',
        content: '',
      },
    ]);

    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
        }),
      });

      if (!response.ok) {
        const data = await response.json();

        throw new Error(data.error || 'Gemini API 요청에 실패했습니다.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, {
          stream: true,
        });

        setMessages((prev) =>
          prev.map((m) =>
            m.id === aiMessageId
              ? {
                  ...m,
                  content: m.content + chunk,
                }
              : m,
          ),
        );
      }
    } catch (error) {
      console.error('AI 채팅 에러:', error);

      setMessages((prev) =>
        prev.map((m) =>
          m.id === aiMessageId
            ? {
                ...m,
                content: 'AI 답변을 불러오지 못했습니다.',
              }
            : m,
        ),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  const handleScroll = () => {
    const chat = chatRef.current;

    if (!chat) return;

    const distanceFromBottom = chat.scrollHeight - chat.scrollTop - chat.clientHeight;

    setIsAtBottom(distanceFromBottom < 80);
  };

  const handleSuggestionClick = (suggestion) => {
    setInput(suggestion);
  };

  useEffect(() => {
    const chat = chatRef.current;

    if (!chat || !isAtBottom) return;

    chat.scrollTop = chat.scrollHeight;
  }, [messages, isAtBottom]);

  return (
    <div className={styles.panel}>
      <header>
        <div className='font_body_l_b'>AI랑 같이 쓰기</div>

        <button type='button' onClick={onClose} aria-label='AI 채팅 닫기'>
          <span className='material-symbols-sharp'>keyboard_double_arrow_left</span>
        </button>
      </header>

      <div ref={chatRef} className={styles.chat_wrapper} onScroll={handleScroll}>
        <ul className={styles.chat}>
          {messages.map((m) =>
            m.role === 'user' ? (
              <UserMessage key={m.id} message={m.content} />
            ) : (
              <AiMessage key={m.id} message={m.content} />
            ),
          )}

          {isLoading && <AiMessage message='답변을 작성하고 있어요...' />}
        </ul>
      </div>

      <footer className={styles.footer}>
        <SuggestionList suggestions={SUGGESTIONS[activeTab]} onSuggestionClick={handleSuggestionClick} />
        <form className={styles.input_wrapper} onSubmit={handleSubmit}>
          <textarea
            className='font_body_m_r'
            placeholder='궁금한 점을 입력해주세요.'
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={handleKeyDown}
          />

          <button type='submit' aria-label='메시지 전송' disabled={!input.trim() || isLoading}>
            <span className='material-symbols-sharp'>arrow_upward</span>
          </button>
        </form>
      </footer>
    </div>
  );
}

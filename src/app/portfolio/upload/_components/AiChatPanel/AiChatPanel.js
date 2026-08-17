import { useEffect, useRef, useState } from 'react';

import UserMessage from '../UserMessage';
import AiMessage from '../AiMessage';
import SuggestionList from '../SuggestionList';

import styles from './AiChatPanel.module.sass';

const GITHUB_QUESTION = 'GitHub 레포지토리를 분석해서 어필할 부분을 찾아줘';

const CONTENT_QUESTIONS = [
  '지금 작성한 프로젝트 소개를 평가해줘',
  '더 강조하면 좋을 부분을 알려줘',
  '보완하면 좋을 내용을 추천해줘',
  '면접에서 설명하기 좋은 코드 포인트를 알려줘',
];

const SUGGESTIONS = {
  overview: ['지금 작성한 프로젝트 소개를 평가해줘', '더 강조하면 좋을 부분을 알려줘', '보완하면 좋을 내용을 추천해줘'],

  code: [GITHUB_QUESTION, '면접에서 설명하기 좋은 코드 포인트를 알려줘'],
};

export default function AiChatPanel({ activeTab, item, messages, setMessages, showToast, onClose }) {
  const [input, setInput] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [isGithubMode, setIsGithubMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const chatRef = useRef(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const hasContent = (blocks) => {
    if (!blocks?.length) return false;

    return blocks.some((block) => {
      switch (block.type) {
        case 'text':
          return block.html?.replace(/<[^>]*>/g, '').trim();

        case 'code':
          return block.code?.trim();

        case 'image':
        case 'video':
          return block.url?.trim();

        default:
          return false;
      }
    });
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();

    const message = input.trim();

    if (!message || isLoading) return;

    const currentContent = item[activeTab] ?? [];
    const isContentQuestion = CONTENT_QUESTIONS.includes(message);
    const isGithubQuestion = message === GITHUB_QUESTION;
    const submittedGithubUrl = githubUrl.trim();

    // 블록 분석이 필요한 추천 질문일 때만 검사
    if (isContentQuestion && !hasContent(currentContent)) {
      showToast('먼저 분석할 내용을 작성해주세요.');
      return;
    }

    // GitHub 질문은 URL 필요
    if (isGithubQuestion && !submittedGithubUrl) {
      showToast('GitHub 레포지토리 주소를 입력해주세요.');
      return;
    }

    const recentMessages = messages.slice(-6);
    const aiMessageId = crypto.randomUUID();

    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: isGithubQuestion ? `${message}\n${submittedGithubUrl}` : message,
      },
      {
        id: aiMessageId,
        role: 'assistant',
        content: '',
      },
    ]);

    setInput('');

    // GitHub 질문 전송 시 URL input 바로 닫기
    if (isGithubQuestion) {
      setGithubUrl('');
      setIsGithubMode(false);
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini', {
        method: 'POST',

        headers: {
          'Content-Type': 'application/json',
        },

        body: JSON.stringify({
          message,
          activeTab,
          content: currentContent,
          messages: recentMessages,
          githubUrl: isGithubQuestion ? submittedGithubUrl : null,
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
                content: error.message || 'AI 답변을 불러오지 못했습니다.',
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

    if (suggestion === GITHUB_QUESTION) {
      setIsGithubMode(true);
      return;
    }

    setIsGithubMode(false);
    setGithubUrl('');
  };

  useEffect(() => {
    const chat = chatRef.current;

    if (!chat || !isAtBottom) return;

    chat.scrollTop = chat.scrollHeight;
  }, [messages, isAtBottom]);

  useEffect(() => {
    if (activeTab !== 'code') {
      setIsGithubMode(false);
      setGithubUrl('');
    }
  }, [activeTab]);

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
        <SuggestionList suggestions={SUGGESTIONS[activeTab] ?? []} onSuggestionClick={handleSuggestionClick} />

        {isGithubMode && (
          <div className={styles.github_input_wrapper}>
            <span className='material-symbols-sharp'>link</span>

            <input
              type='url'
              value={githubUrl}
              placeholder='https://github.com/username/repository'
              onChange={(e) => {
                setGithubUrl(e.target.value);
              }}
              disabled={isLoading}
            />
          </div>
        )}

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

          <button
            type='submit'
            aria-label='메시지 전송'
            disabled={!input.trim() || isLoading || (isGithubMode && !githubUrl.trim())}
          >
            <span className='material-symbols-sharp'>arrow_upward</span>
          </button>
        </form>
      </footer>
    </div>
  );
}

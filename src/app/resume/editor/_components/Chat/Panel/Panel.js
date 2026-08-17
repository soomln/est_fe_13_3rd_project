'use client';

import { useEffect, useRef } from 'react';

import Bubble from '@/app/resume/editor/_components/Chat/Bubble';
import ChatInput from '@/app/resume/editor/_components/Chat/Input';
import styles from './Panel.module.sass';

export default function Panel({ isOpen, onClose, coach, onPickChoice }) {
  const viewRef = useRef(null);

  // 새 말풍선이 생기면 아래로 따라간다
  useEffect(() => {
    const view = viewRef.current;
    if (view) view.scrollTop = view.scrollHeight;
  }, [coach.turns, coach.isThinking]);

  return (
    <aside
      className={`${styles.chat_panel} ${isOpen ? '' : styles.chat_panel_closed}`}
      aria-hidden={!isOpen}
    >
      <div className={styles.chat_panel_inner}>
        <div className={styles.chat_panel_head}>
          <div className={styles.chat_panel_profile}>
            <span className={styles.chat_panel_avatar}>
              <img
                src='/images/resume/ai_profile.png'
                alt=''
                className={styles.chat_panel_avatar_img}
              />
            </span>

            <span className={styles.chat_panel_names}>
              <span className={`${styles.chat_panel_name} font_h4`}>CallBack AI 코치</span>
              <span className={`${styles.chat_panel_state} font_body_m_b`}>무엇이든 물어보세요</span>
            </span>
          </div>

          <button
            type='button'
            className={styles.chat_panel_collapse}
            onClick={onClose}
            aria-label='AI 코치 접기'
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              keyboard_double_arrow_left
            </span>
          </button>
        </div>

        <div className={styles.chat_panel_view} ref={viewRef}>
          <div className={styles.chat_panel_list}>
            {coach.turns.map((turn) => (
              <div key={turn.id} className={styles.chat_panel_turn}>
                <Bubble role={turn.role} avatarUrl={coach.avatarUrl}>
                  {turn.text}
                </Bubble>

                {turn.choices && (
                  <div className={styles.chat_panel_tags}>
                    {turn.choices.map((choice) => (
                      <button
                        key={choice.key}
                        type='button'
                        className={`${styles.chat_panel_tag} font_body_s_b`}
                        onClick={() => onPickChoice(turn.id, choice)}
                      >
                        {choice.label}
                      </button>
                    ))}
                  </div>
                )}

                {turn.choices && turn.hint && (
                  <p className={`${styles.chat_panel_hint} font_caption_r`}>{turn.hint}</p>
                )}
              </div>
            ))}

            {coach.isThinking && (
              <Bubble role='ai'>
                <span className={styles.chat_panel_thinking} role='status' aria-label='생각하는 중입니다'>
                  {coach.thinkingNote || '생각하는 중입니다'}
                  <span className={styles.chat_panel_dot} aria-hidden='true'>
                    .
                  </span>
                  <span className={styles.chat_panel_dot} aria-hidden='true'>
                    .
                  </span>
                  <span className={styles.chat_panel_dot} aria-hidden='true'>
                    .
                  </span>
                </span>
              </Bubble>
            )}
          </div>
        </div>

        <div className={styles.chat_panel_foot}>
          <ChatInput onSend={coach.askCoach} isThinking={coach.isThinking} />
        </div>
      </div>
    </aside>
  );
}

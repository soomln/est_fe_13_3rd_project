'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

import styles from './EditorHeader.module.sass';

const BLINK_MS = 900;
const TIP_STAY_MS = 3000;

export default function EditorHeader({ isChatOpen, onOpenChat }) {
  const [title, setTitle] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  // hidden | blink | shown
  const [tipState, setTipState] = useState('hidden');
  // 연속으로 눌러도 깜빡임이 다시 시작되도록 강제로 다시 그린다
  const [blinkKey, setBlinkKey] = useState(0);
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  };

  useEffect(() => clearTimers, []);

  const handleDownload = () => {
    if (isSaved) return;
    clearTimers();
    setBlinkKey((prev) => prev + 1);
    setTipState('blink');
    timersRef.current.push(
      setTimeout(() => setTipState('shown'), BLINK_MS),
      setTimeout(() => setTipState('hidden'), BLINK_MS + TIP_STAY_MS)
    );
  };

  const handleSave = () => {
    clearTimers();
    setTipState('hidden');
    setIsSaved(true);
  };

  return (
    <header
      className={`${styles.editor_header} ${isChatOpen ? '' : styles.editor_header_wide}`}
    >
      <div className={styles.editor_header_left}>
        {!isChatOpen && (
          <button
            type='button'
            className={`${styles.editor_header_expand} font_body_m_b`}
            onClick={onOpenChat}
            aria-label='AI 코치 펼치기'
          >
            AI
            <span className='material-symbols-sharp' aria-hidden='true'>
              keyboard_double_arrow_right
            </span>
          </button>
        )}

        <Link href='/resume/free_form' className={`${styles.editor_header_back} font_body_l_b`}>
          <span className='material-symbols-sharp' aria-hidden='true'>
            arrow_back
          </span>
          양식 선택하기
        </Link>
      </div>

      <div className={styles.editor_header_title}>
        <span className={`${styles.editor_header_title_label} font_h4`}>제목:</span>

        {isEditingTitle ? (
          <input
            type='text'
            className={`${styles.editor_header_title_input} font_h4`}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            onBlur={() => setIsEditingTitle(false)}
            onKeyDown={(event) => event.key === 'Enter' && setIsEditingTitle(false)}
            placeholder='이름을 입력해주세요'
            aria-label='문서 제목'
            autoFocus
          />
        ) : (
          <button
            type='button'
            className={`${styles.editor_header_title_value} font_h4`}
            onClick={() => setIsEditingTitle(true)}
          >
            {title || '이름을 입력해주세요'}
          </button>
        )}
      </div>

      <div className={styles.editor_header_tools}>
        <div className={styles.editor_header_history}>
          <button type='button' className={styles.editor_header_history_btn} aria-label='실행 취소'>
            <span className='material-symbols-sharp' aria-hidden='true'>
              undo
            </span>
          </button>
          <button type='button' className={styles.editor_header_history_btn} aria-label='다시 실행'>
            <span className='material-symbols-sharp' aria-hidden='true'>
              redo
            </span>
          </button>
        </div>

        <span className={styles.editor_header_divider} aria-hidden='true' />

        <div className={styles.editor_header_actions}>
          <button type='button' className={styles.editor_header_print} aria-label='인쇄'>
            <span className='material-symbols-sharp' aria-hidden='true'>
              print
            </span>
          </button>

          <button
            type='button'
            className={`${styles.editor_header_save} font_body_m_b`}
            onClick={handleSave}
          >
            내 문서함에 저장
          </button>

          <div className={styles.editor_header_download_wrap}>
            <button
              type='button'
              className={`${styles.editor_header_download} font_body_m_b`}
              onClick={handleDownload}
            >
              <span className='material-symbols-sharp' aria-hidden='true'>
                download
              </span>
              다운로드
            </button>

            {!isSaved && (
              <p
                key={blinkKey}
                className={`${styles.editor_header_tip} ${
                  tipState === 'hidden' ? '' : styles.editor_header_tip_shown
                } ${tipState === 'blink' ? styles.editor_header_tip_blink : ''} font_body_m_b`}
                role='status'
              >
                먼저 내 문서함에 저장 버튼을 누른 후 다운로드할 수 있어요.
              </p>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

'use client';

import { useState } from 'react';
import styles from './AnswerBox.module.sass';
import { VOICE_INTERVIEW_STATUS } from '../../_hooks/useVoiceInterview';

const VOICE_STATUS_TEXT = {
  [VOICE_INTERVIEW_STATUS.AI_SPEAKING]: '🔊 AI가 질문하고 있어요...',
  [VOICE_INTERVIEW_STATUS.LISTENING]: '🎙️ 듣고 있어요...',
  [VOICE_INTERVIEW_STATUS.PROCESSING]: '답변을 확인하고 있어요...',
};

const VOICE_ARIA_LABEL = {
  [VOICE_INTERVIEW_STATUS.AI_SPEAKING]: 'AI가 질문하고 있어요',
  [VOICE_INTERVIEW_STATUS.LISTENING]: '음성 면접 종료하기',
  [VOICE_INTERVIEW_STATUS.PROCESSING]: '답변을 확인하고 있어요',
};

export default function AnswerBox({
  onSend,
  isVoiceMode = false,
  voiceStatus = VOICE_INTERVIEW_STATUS.IDLE,
  voiceSupported = false,
  voiceError = '',
  interimTranscript = '',
  onToggleVoice,
}) {
  const [answer, setAnswer] = useState('');

  const handleSubmit = () => {
    const trimmedAnswer = answer.trim();
    if (!trimmedAnswer) return;
    onSend(trimmedAnswer);
    setAnswer('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const displayedValue = isVoiceMode ? interimTranscript : answer;

  const statusMessage = isVoiceMode ? voiceError || VOICE_STATUS_TEXT[voiceStatus] || '' : '';

  const voiceAriaLabel = !voiceSupported
    ? '음성 인식 미지원'
    : isVoiceMode
      ? VOICE_ARIA_LABEL[voiceStatus] || '음성 면접 종료하기'
      : '음성 면접 시작하기';

  return (
    <div className={styles.answer_box}>
      <div className={styles.text_area_wrap}>
        <textarea
          className={`${styles.placeholder} font_body_l_r`}
          value={displayedValue}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isVoiceMode}
          placeholder={isVoiceMode ? '마이크에 대고 답변해주세요.' : '답변을 입력해주세요.'}
        />

        {statusMessage && (
          <p
            className={`${styles.status_text} font_caption_r ${
              voiceError ? styles.status_error : ''
            }`}
          >
            {statusMessage}
          </p>
        )}
      </div>

      <div className={styles.input_actions}>
        <button
          type="button"
          className={`${styles.voice_button} ${isVoiceMode ? styles.voice_button_active : ''}`}
          aria-label={voiceAriaLabel}
          title={voiceAriaLabel}
          onClick={onToggleVoice}
        >
          <span className="material-symbols-outlined">
            {voiceSupported ? 'mic' : 'mic_off'}
          </span>
        </button>

        <button
          type="button"
          className={styles.send_button}
          aria-label="답변 보내기"
          onClick={handleSubmit}
          disabled={isVoiceMode}
        >
          <span className="material-symbols-outlined">
            send
          </span>
        </button>
      </div>
    </div>
  );
}

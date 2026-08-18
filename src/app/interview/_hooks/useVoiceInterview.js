'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import useSpeechRecognition from './useSpeechRecognition';
import useSpeechSynthesis from './useSpeechSynthesis';

export const VOICE_INTERVIEW_STATUS = {
  IDLE: 'idle',
  AI_SPEAKING: 'ai-speaking',
  LISTENING: 'listening',
  PROCESSING: 'processing',
};

const SILENCE_AFTER_SPEECH_MS = 1800;
const SILENCE_BEFORE_SPEECH_MS = 8000;
const NO_SPEECH_NOTICE = '음성이 잘 들리지 않았어요. 다시 말씀해주세요.';

export default function useVoiceInterview({
  isActive,
  aiMessage,
  isInterviewFinished,
  isEvaluating,
  onAnswerFinalized,
  onVoiceInterviewEnd,
}) {
  const [status, setStatus] = useState(VOICE_INTERVIEW_STATUS.IDLE);
  const [notice, setNotice] = useState('');

  const isActiveRef = useRef(isActive);
  const isInterviewFinishedRef = useRef(isInterviewFinished);
  const onAnswerFinalizedRef = useRef(onAnswerFinalized);
  const onVoiceInterviewEndRef = useRef(onVoiceInterviewEnd);

  const lastSpokenMessageRef = useRef(null);
  const answerBufferRef = useRef('');
  const hasSpeechRef = useRef(false);
  const silenceTimerRef = useRef(null);
  const finalizeAnswerRef = useRef(() => {});

  useEffect(() => {
    isActiveRef.current = isActive;
    isInterviewFinishedRef.current = isInterviewFinished;
  }, [isActive, isInterviewFinished]);

  useEffect(() => {
    onAnswerFinalizedRef.current = onAnswerFinalized;
    onVoiceInterviewEndRef.current = onVoiceInterviewEnd;
  }, [onAnswerFinalized, onVoiceInterviewEnd]);

  const armSilenceTimer = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    const delay = hasSpeechRef.current ? SILENCE_AFTER_SPEECH_MS : SILENCE_BEFORE_SPEECH_MS;
    silenceTimerRef.current = setTimeout(() => finalizeAnswerRef.current(), delay);
  }, []);

  const handleFinalResult = useCallback(
    (text) => {
      const trimmed = text.trim();
      if (trimmed) {
        answerBufferRef.current = answerBufferRef.current
          ? `${answerBufferRef.current}${/\s$/.test(answerBufferRef.current) ? '' : ' '}${trimmed}`
          : trimmed;
      }
      hasSpeechRef.current = true;
      setNotice('');
      armSilenceTimer();
    },
    [armSilenceTimer],
  );

  const handleSpeechActivity = useCallback(() => {
    hasSpeechRef.current = true;
    armSilenceTimer();
  }, [armSilenceTimer]);

  const {
    interimTranscript,
    speechSupported,
    speechError,
    startListening,
    stopListening,
  } = useSpeechRecognition({
    onFinalResult: handleFinalResult,
    onSpeechActivity: handleSpeechActivity,
  });

  const { speak, cancel: cancelSpeech } = useSpeechSynthesis();

  const finalizeAnswer = useCallback(() => {
    clearTimeout(silenceTimerRef.current);
    const text = answerBufferRef.current.trim();

    if (!hasSpeechRef.current || !text) {
      setNotice(NO_SPEECH_NOTICE);
      armSilenceTimer();
      return;
    }

    answerBufferRef.current = '';
    hasSpeechRef.current = false;
    setNotice('');
    stopListening();
    setStatus(VOICE_INTERVIEW_STATUS.PROCESSING);
    onAnswerFinalizedRef.current?.(text);
  }, [armSilenceTimer, stopListening]);

  useEffect(() => {
    finalizeAnswerRef.current = finalizeAnswer;
  }, [finalizeAnswer]);

  // 새 AI 메시지가 등장하면 읽어주고, 끝나면 자동으로 듣기를 시작한다.
  useEffect(() => {
    if (!isActive) return;
    if (aiMessage == null) return;
    if (isEvaluating) return;
    if (aiMessage === lastSpokenMessageRef.current) return;

    lastSpokenMessageRef.current = aiMessage;
    clearTimeout(silenceTimerRef.current);
    stopListening();
    setNotice('');
    setStatus(VOICE_INTERVIEW_STATUS.AI_SPEAKING);

    speak(aiMessage, {
      onEnd: () => {
        if (!isActiveRef.current) return;
        if (isInterviewFinishedRef.current) {
          setStatus(VOICE_INTERVIEW_STATUS.IDLE);
          onVoiceInterviewEndRef.current?.();
          return;
        }
        answerBufferRef.current = '';
        hasSpeechRef.current = false;
        setStatus(VOICE_INTERVIEW_STATUS.LISTENING);
        startListening();
        armSilenceTimer();
      },
    });
  }, [isActive, aiMessage, isEvaluating, speak, stopListening, startListening, armSilenceTimer]);

  // 음성 면접 모드가 꺼지면 진행 중이던 음성 관련 동작을 모두 정리한다.
  useEffect(() => {
    if (isActive) return;

    cancelSpeech();
    stopListening();
    clearTimeout(silenceTimerRef.current);
    answerBufferRef.current = '';
    hasSpeechRef.current = false;
    lastSpokenMessageRef.current = null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 음성 면접 종료(prop) 신호에 맞춰 외부 시스템(recognition/synthesis)과 상태를 함께 정리
    setStatus(VOICE_INTERVIEW_STATUS.IDLE);
    setNotice('');
  }, [isActive, cancelSpeech, stopListening]);

  useEffect(() => () => clearTimeout(silenceTimerRef.current), []);

  return {
    status,
    interimTranscript,
    supported: speechSupported,
    error: speechError || notice,
  };
}

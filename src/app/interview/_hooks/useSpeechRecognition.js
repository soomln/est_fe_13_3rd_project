'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const UNSUPPORTED_MESSAGE = '현재 브라우저에서는 음성 면접을 지원하지 않습니다.';
const PERMISSION_DENIED_MESSAGE =
  '마이크 권한이 필요합니다. 브라우저 설정에서 마이크 권한을 허용해주세요.';
const NO_SPEECH_MESSAGE = '음성을 인식하지 못했어요. 다시 말씀해주세요.';
const GENERIC_ERROR_MESSAGE = '음성 인식 중 오류가 발생했습니다. 다시 시도해주세요.';

export default function useSpeechRecognition({ onFinalResult, onSpeechActivity } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(false);
  const [speechError, setSpeechError] = useState('');

  const recognitionRef = useRef(null);
  const onFinalResultRef = useRef(onFinalResult);
  const onSpeechActivityRef = useRef(onSpeechActivity);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
    onSpeechActivityRef.current = onSpeechActivity;
  }, [onFinalResult, onSpeechActivity]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 브라우저 지원 여부는 mount 이후에만 판별 가능
    setSpeechSupported(!!SpeechRecognition);
    if (!SpeechRecognition) return undefined;

    const recognition = new SpeechRecognition();
    recognition.lang = 'ko-KR';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      onSpeechActivityRef.current?.();
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i];
        const text = result[0]?.transcript ?? '';
        if (result.isFinal) {
          onFinalResultRef.current?.(text);
        } else {
          interim += text;
        }
      }
      setInterimTranscript(interim);
    };

    recognition.onerror = (event) => {
      if (event.error === 'aborted') return;
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setSpeechError(PERMISSION_DENIED_MESSAGE);
      } else if (event.error === 'no-speech') {
        setSpeechError(NO_SPEECH_MESSAGE);
      } else {
        setSpeechError(GENERIC_ERROR_MESSAGE);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript('');
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      try {
        recognition.stop();
      } catch {
        // 이미 종료된 경우 무시
      }
      recognitionRef.current = null;
    };
  }, []);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setSpeechError(UNSUPPORTED_MESSAGE);
      return;
    }
    setSpeechError('');
    setInterimTranscript('');
    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch {
      // 이미 시작된 상태에서 재호출된 경우 무시
    }
  }, []);

  const stopListening = useCallback(() => {
    if (!recognitionRef.current) return;
    setInterimTranscript((current) => {
      if (current) onFinalResultRef.current?.(current);
      return '';
    });
    try {
      recognitionRef.current.stop();
    } catch {
      // 이미 종료된 상태에서 재호출된 경우 무시
    }
    setIsListening(false);
  }, []);

  const resetSpeechState = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // 이미 종료된 상태에서 재호출된 경우 무시
      }
    }
    setIsListening(false);
    setInterimTranscript('');
    setSpeechError('');
  }, []);

  return {
    isListening,
    interimTranscript,
    speechSupported,
    speechError,
    startListening,
    stopListening,
    resetSpeechState,
  };
}

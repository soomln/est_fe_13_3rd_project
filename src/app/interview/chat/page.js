'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import styles from './page.module.sass';

import Header from '../../_components/common/Header/Header';

import AiChatBubble from '../_components/AiChatBubble';
import AnswerBox from '../_components/AnswerBox';
import SettingButton from '../_components/SettingButton';
import DocumentOption from '../_components/DocumentOption';
import CompanySearch from '../_components/CompanySearch';
import QuestionListButton from '../_components/QuestionListButton';
import QuestionPanel, { clearQuestionPanelCache } from '../_components/QuestionPanel';
import UserChatBubble from '../_components/UserChatBubble';
import InterviewResult from '../_components/InterviewResult';
import RetryButton from '../_components/RetryButton';
import InterviewFeedbackModal from '../_components/InterviewFeedbackModal';
import InterviewSettingModal from '../_components/InterviewSettingModal';
import InterviewTimer from '../_components/InterviewTimer';
import DocumentRequiredNotice from '../_components/DocumentRequiredNotice';
import { createSession, saveQas, finishSession } from '@backend/lib/api/interview';
import { getDocument, listMyDocuments } from '@backend/lib/api/documents';
import { getCompany } from '@backend/lib/api/companies';
import { evaluateInterviewAnswers, sumSubScores } from '../_lib/evaluateInterviewAnswers';
import useVoiceInterview from '../_hooks/useVoiceInterview';

function formatMessageTime(date = new Date()) {
  return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function createInitialMessage() {
  return {
    role: 'ai',
    content: '안녕하세요!\n저는 AI 면접관입니다.\n\n면접 진행을 위해\n우측 패널의 옵션을 선택해주세요.',
    time: formatMessageTime(),
  };
}

const INTERVIEWER_STYLE_LABELS = {
  friendly: '친절한',
  neutral: '중립적인',
  pressure: '엄격한',
};

const STORAGE_KEY = 'interview_chat_state_v1';

function loadSavedState() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(state) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function clearSavedState() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

function shouldRestoreOnMount() {
  if (typeof window === 'undefined' || typeof performance === 'undefined') return false;
  const [entry] = performance.getEntriesByType('navigation');
  if (entry?.type) return entry.type === 'reload' || entry.type === 'back_forward';
  return performance.navigation?.type === 1;
}

export default function InterviewPage() {
  const router = useRouter();

  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isQuestionList, setIsQuestionList] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState(() => [createInitialMessage()]);
  const [isInterviewFinished, setIsInterviewFinished] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState(null);
  const [selectedCoverLetterId, setSelectedCoverLetterId] = useState(null);
  const [selectedCompanyId, setSelectedCompanyId] = useState(null);
  const [selectedCompanySlug, setSelectedCompanySlug] = useState(null);
  const [interviewerStyle, setInterviewerStyle] = useState('friendly');
  const [showTimer, setShowTimer] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [interviewStartedAt, setInterviewStartedAt] = useState(null);
  const [timerStartedAt, setTimerStartedAt] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState(null);
  const [evaluationError, setEvaluationError] = useState(false);
  const [pendingQaList, setPendingQaList] = useState([]);
  const [needsAutoRetry, setNeedsAutoRetry] = useState(false);
  const [hasHydrated, setHasHydrated] = useState(false);
  const chatEndRef = useRef(null);
  const [docStatus, setDocStatus] = useState({ loading: true, hasResume: true, hasCoverLetter: true });
  const [isVoiceMode, setIsVoiceMode] = useState(false);

  useEffect(() => {
    let cancelled = false;

    listMyDocuments({ pageSize: 1 })
      .then(({ counts }) => {
        if (cancelled) return;
        setDocStatus({
          loading: false,
          hasResume: (counts?.resume ?? 0) > 0,
          hasCoverLetter: (counts?.cover_letter ?? 0) > 0,
        });
      })
      .catch((err) => {
        console.error('이력서/자소서 보유 여부 확인 실패:', err);
        if (!cancelled) setDocStatus({ loading: false, hasResume: true, hasCoverLetter: true });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isEvaluating, evaluationResult, evaluationError]);

  const handleSelectCompany = (id, company) => {
    setSelectedCompanyId(id);
    setSelectedCompanySlug(company?.slug ?? null);
  };

  const handleToggleShowTimer = (next) => {
    setShowTimer(next);
    setTimerStartedAt(next && interviewStartedAt ? Date.now() : null);
    if (next) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: '타이머 표시를 켰습니다!\n면접이 시작되면 진행 시간이 상단에 표시돼요.',
          time: formatMessageTime(),
        },
      ]);
    }
  };

  const handleChangeInterviewerStyle = (next) => {
    setInterviewerStyle(next);
    setMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        content: `면접관 성격을 ${INTERVIEWER_STYLE_LABELS[next] ?? next} 스타일로 설정했습니다!`,
        time: formatMessageTime(),
      },
    ]);
  };

  // 질문 리스트 생성 버튼을 누른 직후: 아직 QuestionPanel의 실제 API 호출 전이라
  // 새 메시지로 추가한다.
  const handleGenerationChecking = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        content: '선택하신 정보를 확인하고 있어요. 잠시만 기다려주세요!',
        time: formatMessageTime(),
      },
    ]);
  }, []);

  // 실제 질문 생성 API 호출이 시작되는 시점: "확인 중" 메시지를 이어서 교체한다.
  const handleGenerationStart = useCallback(() => {
    setMessages((prev) => [
      ...prev.slice(0, -1),
      {
        role: 'ai',
        content: '이력서와 자기소개서, 기업 정보를 분석해서 맞춤형 면접 질문을 만들고 있어요.',
        time: formatMessageTime(),
      },
    ]);
  }, []);

  const handleGenerationSuccess = useCallback(() => {
    setMessages((prev) => [
      ...prev.slice(0, -1),
      {
        role: 'ai',
        content: '질문이 준비됐어요! 면접을 시작해볼까요?',
        time: formatMessageTime(),
      },
    ]);
  }, []);

  const handleGenerationError = useCallback(() => {
    setMessages((prev) => [
      ...prev.slice(0, -1),
      {
        role: 'ai',
        content: '질문을 준비하는 중 문제가 발생했어요. 다시 시도해주세요.',
        time: formatMessageTime(),
      },
    ]);
  }, []);

  // 이력서/자소서 계정 자체가 없으면 DocumentRequiredNotice가 먼저 막아주므로,
  // 여기서는 "둘 중 최소 하나는 선택했는지"만 확인한다(기업 선택은 선택 사항).
  const handleLoadQuestionList = () => {
    if (!selectedResumeId && !selectedCoverLetterId) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: '면접 질문을 생성하기 전에 이력서 또는 자기소개서를 먼저 선택해주세요.',
          time: formatMessageTime(),
        },
      ]);
      return;
    }
    handleGenerationChecking();
    setIsQuestionList(true);
  };

  const ensureSessionId = async () => {
    if (sessionId) return sessionId;

    try {
      const session = await createSession({
        companyId: selectedCompanyId,
        resumeIds: selectedResumeId ? [selectedResumeId] : [],
        coverLetterIds: selectedCoverLetterId ? [selectedCoverLetterId] : [],
        interviewerStyle: interviewerStyle || 'friendly',
        selectedCategories: selectedQuestions.map((question) => question.category),
        showTimer,
      });
      setSessionId(session.id);
      return session.id;
    } catch (err) {
      console.error('면접 세션 생성 실패(재시도):', err);
      return null;
    }
  };

  const runEvaluation = async (qaList) => {
    try {
      const [resume, coverLetter, company] = await Promise.all([
        selectedResumeId ? getDocument(selectedResumeId) : null,
        selectedCoverLetterId ? getDocument(selectedCoverLetterId) : null,
        selectedCompanySlug ? getCompany(selectedCompanySlug) : null,
      ]);

      const evaluation = await evaluateInterviewAnswers({
        resumeText: resume?.contentText,
        coverLetterText: coverLetter?.contentText,
        company,
        qaList,
      });

      const results = qaList.map((qa, index) => {
        const questionResult = evaluation.questionResults[index];
        return {
          ...qa,
          feedback: {
            summary: questionResult.summary,
            strengths: questionResult.strengths,
            improvements: questionResult.improvements,
          },
          score: questionResult.score,
        };
      });

      const totalScore = sumSubScores(evaluation.subScores);

      let resultsWithQaIds = results;
      const activeSessionId = await ensureSessionId();

      if (activeSessionId) {
        const saved = await saveQas(
          activeSessionId,
          results.map((result, index) => ({
            seq: index + 1,
            category: result.category,
            question: result.question,
            answer: result.answer,
            feedback: result.feedback,
            score: result.score,
          })),
        );
        resultsWithQaIds = results.map((result, index) => ({
          ...result,
          qaId: saved?.items?.find((item) => item.seq === index + 1)?.id ?? null,
        }));
        await finishSession(activeSessionId, {
          durationSec: interviewStartedAt
            ? Math.round((Date.now() - interviewStartedAt) / 1000)
            : undefined,
          totalScore,
          subScores: evaluation.subScores,
        });
      } else {
        console.error('면접 세션이 없어 답변/평가를 저장하지 못했습니다. 북마크도 저장되지 않습니다.');
      }

      setEvaluationResult({
        totalScore,
        subScores: evaluation.subScores,
        results: resultsWithQaIds,
      });
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: 'ai',
          content:
            '면접이 종료되었습니다!\n평가가 완료되었습니다.\n결과를 확인해보세요.',
          time: formatMessageTime(),
        },
      ]);
    } catch (err) {
      console.error('면접 평가 실패:', err);
      setEvaluationError(true);

      const activeSessionId = await ensureSessionId();
      if (activeSessionId) {
        try {
          await saveQas(
            activeSessionId,
            qaList.map((qa, index) => ({
              seq: index + 1,
              category: qa.category,
              question: qa.question,
              answer: qa.answer,
            })),
          );
        } catch (saveErr) {
          console.error('질문/답변 저장 실패:', saveErr);
        }
      }

      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: 'ai',
          content:
            '답변 평가에 실패했습니다.\n질문과 답변은 저장되었습니다.\n아래 "평가 다시 시도" 버튼을 눌러주세요.',
          time: formatMessageTime(),
        },
      ]);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRetryEvaluation = () => {
    setMessages((prev) => [
      ...prev.slice(0, -1),
      {
        role: 'ai',
        content: '답변을 다시 분석하고 있습니다...',
        time: formatMessageTime(),
      },
    ]);
    setIsEvaluating(true);
    setEvaluationError(false);
    runEvaluation(pendingQaList);
  };

  useEffect(() => {
    if (!shouldRestoreOnMount()) {
      clearSavedState();
      clearQuestionPanelCache();
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 새로고침/뒤로가기가 아니면 저장된 상태 없이 즉시 초기 화면을 렌더링해야 함
      setHasHydrated(true);
      return;
    }

    const saved = loadSavedState();
    if (!saved) {
      setHasHydrated(true);
      return;
    }

    setIsQuestionList(saved.isQuestionList ?? false);
    setSelectedQuestions(saved.selectedQuestions ?? []);
    setCurrentQuestionIndex(saved.currentQuestionIndex ?? 0);
    setMessages(saved.messages?.length ? saved.messages : [createInitialMessage()]);
    setIsInterviewFinished(saved.isInterviewFinished ?? false);
    setSelectedResumeId(saved.selectedResumeId ?? null);
    setSelectedCoverLetterId(saved.selectedCoverLetterId ?? null);
    setSelectedCompanyId(saved.selectedCompanyId ?? null);
    setSelectedCompanySlug(saved.selectedCompanySlug ?? null);
    setInterviewerStyle(saved.interviewerStyle ?? 'friendly');
    setShowTimer(saved.showTimer ?? false);
    setSessionId(saved.sessionId ?? null);
    setAnswers(saved.answers ?? []);
    setInterviewStartedAt(saved.interviewStartedAt ?? null);
    setTimerStartedAt(saved.timerStartedAt ?? null);
    setEvaluationResult(saved.evaluationResult ?? null);
    setPendingQaList(saved.pendingQaList ?? []);

    if (saved.isInterviewFinished && !saved.evaluationResult && saved.pendingQaList?.length) {
      setNeedsAutoRetry(true);
    }
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!needsAutoRetry) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- 자동 재시도 트리거 상태를 곧바로 소비하고 재평가를 시작해야 함
    setNeedsAutoRetry(false);
    setIsInterviewFinished(true);
    setIsEvaluating(true);
    setEvaluationError(false);
    runEvaluation(pendingQaList);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [needsAutoRetry]);

  useEffect(() => {
    if (!hasHydrated) return;
    saveState({
      isQuestionList,
      selectedQuestions,
      currentQuestionIndex,
      messages,
      isInterviewFinished,
      selectedResumeId,
      selectedCoverLetterId,
      selectedCompanyId,
      selectedCompanySlug,
      interviewerStyle,
      showTimer,
      sessionId,
      answers,
      interviewStartedAt,
      timerStartedAt,
      evaluationResult,
      pendingQaList,
    });
  }, [
    isQuestionList,
    selectedQuestions,
    currentQuestionIndex,
    messages,
    isInterviewFinished,
    selectedResumeId,
    selectedCoverLetterId,
    selectedCompanyId,
    selectedCompanySlug,
    interviewerStyle,
    showTimer,
    sessionId,
    answers,
    interviewStartedAt,
    timerStartedAt,
    evaluationResult,
    pendingQaList,
    hasHydrated,
  ]);

  const handleSendAnswer = async (answer) => {
    if (selectedQuestions.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: '면접 질문에 필요한 정보를 왼쪽 패널에서 선택해 주세요.',
          time: formatMessageTime(),
        },
      ]);
      return;
    }

    const nextIndex = currentQuestionIndex + 1;
    const nextAnswers = [...answers, answer];
    const nextMessages = [
      ...messages,
      {
        role: 'user',
        content: answer,
        time: formatMessageTime(),
      },
    ];

    if (nextIndex < selectedQuestions.length) {
      nextMessages.push({
        role: 'ai',
        content: selectedQuestions[nextIndex].question,
        time: formatMessageTime(),
      });
      setCurrentQuestionIndex(nextIndex);
      setMessages(nextMessages);
      setAnswers(nextAnswers);
      return;
    }

    setAnswers(nextAnswers);
    setMessages([
      ...nextMessages,
      {
        role: 'ai',
        content: '면접이 종료되었습니다!\n답변을 분석하고 있습니다...',
        time: formatMessageTime(),
      },
    ]);
    setIsInterviewFinished(true);
    setIsEvaluating(true);
    setEvaluationError(false);

    const qaList = selectedQuestions.map((question, index) => ({
      category: question.category,
      title: question.title,
      question: question.question,
      answer: nextAnswers[index],
    }));
    setPendingQaList(qaList);

    await runEvaluation(qaList);
  };

  const lastMessage = messages[messages.length - 1];
  const latestAiMessage = lastMessage?.role === 'ai' ? lastMessage.content : null;

  const voice = useVoiceInterview({
    isActive: isVoiceMode,
    aiMessage: latestAiMessage,
    isInterviewFinished,
    isEvaluating,
    onAnswerFinalized: handleSendAnswer,
    onVoiceInterviewEnd: () => setIsVoiceMode(false),
  });

  const handleToggleVoiceMode = () => {
    if (!isVoiceMode && selectedQuestions.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: '면접 질문에 필요한 정보를 왼쪽 패널에서 선택해 주세요.',
          time: formatMessageTime(),
        },
      ]);
      return;
    }
    setIsVoiceMode((prev) => !prev);
  };

  const handleRetry = () => {
    clearSavedState();
    clearQuestionPanelCache();
    setIsInterviewFinished(false);
    setCurrentQuestionIndex(0);
    setMessages([createInitialMessage()]);
    setAnswers([]);
    setSessionId(null);
    setInterviewStartedAt(null);
    setTimerStartedAt(null);
    setIsEvaluating(false);
    setEvaluationResult(null);
    setEvaluationError(false);
    setPendingQaList([]);
  };
  const handleStartInterview = async (questions) => {
    if (questions.length === 0) return;
    setSelectedQuestions(questions);
    setCurrentQuestionIndex(0);
    setIsInterviewFinished(false);
    setAnswers([]);
    setEvaluationResult(null);
    setEvaluationError(false);
    setMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        content: questions[0].question,
        time: formatMessageTime(),
      },
    ]);
    const startedAt = Date.now();
    setInterviewStartedAt(startedAt);
    if (showTimer) setTimerStartedAt(startedAt);

    try {
      const session = await createSession({
        companyId: selectedCompanyId,
        resumeIds: selectedResumeId ? [selectedResumeId] : [],
        coverLetterIds: selectedCoverLetterId ? [selectedCoverLetterId] : [],
        interviewerStyle: interviewerStyle || 'friendly',
        selectedCategories: questions.map((question) => question.category),
        showTimer,
      });
      setSessionId(session.id);
    } catch (err) {
      console.error('면접 세션 생성 실패:', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content:
            '면접 세션 생성에 실패했습니다.\n답변과 결과가 저장되지 않을 수 있어요.',
          time: formatMessageTime(),
        },
      ]);
    }
  };

  if (!hasHydrated) {
    return (
      <>
        <Header />
        <main className={styles.interview_page} />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className={styles.interview_page}>
        <h1 className={styles.sr_only}>AI 면접 진행</h1>

        <div className={`container ${styles.chat_layout}`}>
          <div className={styles.chat_container}>
            <div className={styles.chat_header}>
              <div className={styles.chat_header_left}>
                <button
                  type="button"
                  className={`${styles.exit_button} font_body_l_b`}
                  onClick={() => {
                    clearSavedState();
                    clearQuestionPanelCache();
                    router.push('/interview');
                  }}
                >
                  ← 면접 나가기
                </button>
              </div>

              <div className={styles.chat_header_center}>
                {showTimer && (
                  <InterviewTimer startedAt={timerStartedAt} running={!isInterviewFinished} />
                )}
              </div>

              <div className={styles.chat_header_right}>
                <SettingButton
                  onClick={() => setIsSettingOpen(true)}
                />
              </div>
            </div>

            <div className={styles.chat_content}>
              {messages.map((message, index) =>
                message.role === 'ai' ? (
                  <AiChatBubble
                    key={index}
                    message={message.content}
                    time={message.time}
                  />
                ) : (
                  <UserChatBubble
                    key={index}
                    message={message.content}
                    time={message.time}
                  />
                ),
              )}

              {isInterviewFinished && !isEvaluating && evaluationResult && (
                <InterviewResult
                  scores={evaluationResult.subScores}
                  onFeedback={() => {
                    setIsFeedbackOpen(true);
                  }}
                  onRetry={handleRetry}
                />
              )}

              {isInterviewFinished && !isEvaluating && evaluationError && (
                <div className={styles.evaluation_error_actions}>
                  <RetryButton label="평가 다시 시도" onClick={handleRetryEvaluation} />
                  <RetryButton variant="outline" onClick={handleRetry} />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {!isInterviewFinished && (
              <AnswerBox
                onSend={handleSendAnswer}
                isVoiceMode={isVoiceMode}
                voiceStatus={voice.status}
                voiceSupported={voice.supported}
                voiceError={voice.error}
                interimTranscript={voice.interimTranscript}
                onToggleVoice={handleToggleVoiceMode}
              />
            )}
          </div>

          {isQuestionList ? (
            <QuestionPanel
              resumeId={selectedResumeId}
              coverLetterId={selectedCoverLetterId}
              companySlug={selectedCompanySlug}
              interviewerStyle={interviewerStyle}
              onStart={handleStartInterview}
              onGenerationStart={handleGenerationStart}
              onGenerationSuccess={handleGenerationSuccess}
              onGenerationError={handleGenerationError}
            />
          ) : docStatus.loading ? (
            <aside className={styles.option_panel} />
          ) : !docStatus.hasResume || !docStatus.hasCoverLetter ? (
            <DocumentRequiredNotice
              hasResume={docStatus.hasResume}
              hasCoverLetter={docStatus.hasCoverLetter}
            />
          ) : (
            <aside className={styles.option_panel}>
              <h2 className="font_h4">
                면접에 필요한 정보를 선택해주세요.
              </h2>
              <DocumentOption
                title="이력서"
                type="resume"
                selectedId={selectedResumeId}
                onSelect={setSelectedResumeId}
              />
              <DocumentOption
                title="자소서"
                type="cover_letter"
                selectedId={selectedCoverLetterId}
                onSelect={setSelectedCoverLetterId}
              />
              <CompanySearch
                selectedId={selectedCompanyId}
                onSelect={handleSelectCompany}
              />
              <QuestionListButton onClick={handleLoadQuestionList}>
                질문 리스트 불러오기
              </QuestionListButton>
            </aside>
          )}
        </div>

        {isFeedbackOpen && evaluationResult && (
          <InterviewFeedbackModal
            results={evaluationResult.results}
            onClose={() => setIsFeedbackOpen(false)}
          />
        )}

        {isSettingOpen && (
          <InterviewSettingModal
            onClose={() => setIsSettingOpen(false)}
            showTimer={showTimer}
            onToggleShowTimer={handleToggleShowTimer}
            interviewerStyle={interviewerStyle}
            onInterviewerStyleChange={handleChangeInterviewerStyle}
          />
        )}
      </main>
    </>
  );
}
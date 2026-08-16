'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import styles from './page.module.sass';

import Header from '../../_components/common/Header/Header';

import AiChatBubble from '../_components/AiChatBubble';
import AnswerBox from '../_components/AnswerBox';
import SettingButton from '../_components/SettingButton';
import DocumentOption from '../_components/DocumentOption';
import CompanySearch from '../_components/CompanySearch';
import QuestionListButton from '../_components/QuestionListButton';
import QuestionPanel from '../_components/QuestionPanel';
import UserChatBubble from '../_components/UserChatBubble';
import InterviewResult from '../_components/InterviewResult';
import RetryButton from '../_components/RetryButton';
import InterviewFeedbackModal from '../_components/InterviewFeedbackModal';
import InterviewSettingModal from '../_components/InterviewSettingModal';
import { createSession, saveQas, finishSession } from '@backend/lib/api/interview';
import { getDocument } from '@backend/lib/api/documents';
import { getCompany } from '@backend/lib/api/companies';
import { evaluateInterviewAnswers, sumSubScores } from '../_lib/evaluateInterviewAnswers';

export default function InterviewPage() {
  const router = useRouter();

const [isSettingOpen, setIsSettingOpen] = useState(false);
const [isQuestionList, setIsQuestionList] = useState(false);
const [selectedQuestions, setSelectedQuestions] = useState([]);
const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
const [messages, setMessages] = useState([]);
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
const [isEvaluating, setIsEvaluating] = useState(false);
const [evaluationResult, setEvaluationResult] = useState(null);
const [evaluationError, setEvaluationError] = useState(false);

  const handleSelectCompany = (id, company) => {
    setSelectedCompanyId(id);
    setSelectedCompanySlug(company?.slug ?? null);
  };

  const handleGenerationError = useCallback(() => {
    setMessages((prev) => [
      ...prev,
      {
        role: 'ai',
        content:
          '선택하신 정보를 바탕으로\n맞춤 질문을 생성하지 못했습니다.\n\n기본 질문으로 면접을 진행합니다.',
      },
    ]);
  }, []);

  const handleSendAnswer = async (answer) => {
    if (selectedQuestions.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: '면접 질문에 필요한 정보를 왼쪽 패널에서 선택해 주세요.',
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
      },
    ];

    if (nextIndex < selectedQuestions.length) {
      nextMessages.push({
        role: 'ai',
        content: selectedQuestions[nextIndex].question,
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

      // finishSession()에 저장하는 값과 InterviewResult에 표시하는 값이 항상 같은 계산식을
      // 쓰도록, 화면에 표시되는 subScores를 그대로 합산해서 totalScore를 구한다.
      const totalScore = sumSubScores(evaluation.subScores);

      if (sessionId) {
        await saveQas(
          sessionId,
          results.map((result, index) => ({
            seq: index + 1,
            category: result.category,
            question: result.question,
            answer: result.answer,
            feedback: result.feedback,
            score: result.score,
          })),
        );
        await finishSession(sessionId, {
          durationSec: interviewStartedAt
            ? Math.round((Date.now() - interviewStartedAt) / 1000)
            : undefined,
          totalScore,
          subScores: evaluation.subScores,
        });
      }

      setEvaluationResult({
        totalScore,
        subScores: evaluation.subScores,
        results,
      });
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: 'ai',
          content:
            '면접이 종료되었습니다!\n평가가 완료되었습니다.\n결과를 확인해보세요.',
        },
      ]);
    } catch (err) {
      console.error('면접 평가 실패:', err);
      setEvaluationError(true);

      if (sessionId) {
        try {
          await saveQas(
            sessionId,
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
            '면접이 종료되었습니다.\n\n답변 평가에 실패했습니다.\n질문과 답변은 저장되었습니다.\n잠시 후 다시 시도해주세요.',
        },
      ]);
    } finally {
      setIsEvaluating(false);
    }
  };
  const handleRetry = () => {
    setIsInterviewFinished(false);
    setCurrentQuestionIndex(0);
    setMessages([]);
    setAnswers([]);
    setSessionId(null);
    setInterviewStartedAt(null);
    setIsEvaluating(false);
    setEvaluationResult(null);
    setEvaluationError(false);
  };
  const handleStartInterview = async (questions) => {
    if (questions.length === 0) return;
    setSelectedQuestions(questions);
    setCurrentQuestionIndex(0);
    setIsInterviewFinished(false);
    setAnswers([]);
    setEvaluationResult(null);
    setEvaluationError(false);
    setMessages([
      {
        role: 'ai',
        content: questions[0].question,
      },
    ]);
    setInterviewStartedAt(Date.now());

    try {
      const session = await createSession({
        companyId: selectedCompanyId,
        resumeIds: selectedResumeId ? [selectedResumeId] : [],
        coverLetterIds: selectedCoverLetterId ? [selectedCoverLetterId] : [],
        interviewerStyle,
        selectedCategories: questions.map((question) => question.category),
        showTimer,
      });
      setSessionId(session.id);
    } catch (err) {
      console.error('면접 세션 생성 실패:', err);
    }
  };

  return (
    <>
      <Header />

      <main className={styles.interview_page}>
        <div className={`container ${styles.chat_layout}`}>
          <div className={styles.chat_container}>
            <div className={styles.chat_header}>
              <button
                type="button"
                className={`${styles.exit_button} font_body_l_b`}
                onClick={() => router.push('/interview')}
              >
                ← 면접 나가기
              </button>

              <SettingButton
                onClick={() => setIsSettingOpen(true)}
              />
            </div>

            <div className={styles.chat_content}>
              {messages.length === 0 ? (
                <AiChatBubble
                  message={'안녕하세요!\n저는 AI 면접관입니다.\n\n면접 진행을 위해\n우측 패널의 옵션을 선택해주세요.'}
                />
              ) : (
                messages.map((message, index) =>
                  message.role === 'ai' ? (
                    <AiChatBubble
                      key={index}
                      message={message.content}
                    />
                  ) : (
                    <UserChatBubble
                      key={index}
                      message={message.content}
                      time="01:48"
                    />
                  ),
                )
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
                <RetryButton onClick={handleRetry} />
              )}
            </div>

            {!isInterviewFinished && (
              <AnswerBox onSend={handleSendAnswer} />
            )}
          </div>

          {isQuestionList ? (
            <QuestionPanel
              resumeId={selectedResumeId}
              coverLetterId={selectedCoverLetterId}
              companySlug={selectedCompanySlug}
              onStart={handleStartInterview}
              onGenerationError={handleGenerationError}
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
              <QuestionListButton
                onClick={() => {
                  if (
                    !selectedResumeId ||
                    !selectedCoverLetterId ||
                    !selectedCompanyId
                  ) {
                    return;
                  }
                  setIsQuestionList(true);
                }}
              >
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
            onToggleShowTimer={setShowTimer}
            interviewerStyle={interviewerStyle}
            onInterviewerStyleChange={setInterviewerStyle}
          />
        )}
      </main>
    </>
  );
}
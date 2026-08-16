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
import InterviewFeedbackModal from '../_components/InterviewFeedbackModal';
import InterviewSettingModal from '../_components/InterviewSettingModal';
import { createSession } from '@backend/lib/api/interview';

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

  const handleSendAnswer = (answer) => {
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
      return;
    }
    setMessages([
      ...nextMessages,
      {
        role: 'ai',
        content:
          '면접이 종료되었습니다!\n다시 연습하고 싶은 질문을 선택하세요.\n오늘 진행한 면접 질문을 저장하고, 필요할 때 언제든 다시 연습할 수 있습니다.',
      },
    ]);
    setIsInterviewFinished(true);
  };
  const handleRetry = () => {
    setIsInterviewFinished(false);
    setCurrentQuestionIndex(0);
    setMessages([]);
  };
  const handleStartInterview = async (questions) => {
    if (questions.length === 0) return;
    setSelectedQuestions(questions);
    setCurrentQuestionIndex(0);
    setIsInterviewFinished(false);
    setMessages([
      {
        role: 'ai',
        content: questions[0].question,
      },
    ]);

    try {
      await createSession({
        companyId: selectedCompanyId,
        resumeIds: selectedResumeId ? [selectedResumeId] : [],
        coverLetterIds: selectedCoverLetterId ? [selectedCoverLetterId] : [],
        interviewerStyle,
        selectedCategories: questions.map((question) => question.category),
        showTimer,
      });
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

              {isInterviewFinished && (
                <InterviewResult
                  totalScore={5}
                  scores={{
                    content: 1,
                    delivery: 1,
                    logic: 1,
                    skill: 1,
                    attitude: 1,
                  }}
                  onFeedback={() => {
                    setIsFeedbackOpen(true);
                  }}
                  onRetry={handleRetry}
                />
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

        {isFeedbackOpen && (
          <InterviewFeedbackModal
            selectedQuestions={selectedQuestions}
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
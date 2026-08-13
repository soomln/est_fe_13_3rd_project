'use client';

import { useState } from 'react';
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

export default function InterviewPage() {
  const router = useRouter();

  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isQuestionList, setIsQuestionList] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [messages, setMessages] = useState([]);
  const [isInterviewFinished, setIsInterviewFinished] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

  const questionData = {
    전체: '안녕하세요. 간단하게 자기소개 부탁드립니다.',
    자기소개: '안녕하세요. 본인을 간단하게 소개해주세요.',
    '기술 질문 1': '프론트엔드 개발자로 지원한 이유는 무엇인가요?',
    '기술 질문 2':
      '프로젝트에서 가장 어려웠던 기술적인 문제는 무엇이었나요?',
    '인성 질문': '팀원과 의견이 충돌했을 때 어떻게 해결했나요?',
    '마무리 질문': '마지막으로 하고 싶은 말이 있나요.',
  };

  const handleSendAnswer = (answer) => {
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
        content: questionData[selectedQuestions[nextIndex]],
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
  const handleStartInterview = (questions) => {
    if (questions.length === 0) return;
    setSelectedQuestions(questions);
    setCurrentQuestionIndex(0);
    setIsInterviewFinished(false);
    const firstQuestion = questionData[questions[0]];
    setMessages([
      {
        role: 'ai',
        content: firstQuestion,
      },
    ]);
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
                  message="안녕하세요! 저는 AI 면접관입니다. 면접 진행을 위해 우측 패널 옵션을 선택해주세요!"
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
              onStart={handleStartInterview}
            />
          ) : (
            <aside className={styles.option_panel}>
              <h2 className="font_h4">
                면접에 필요한 정보를 선택해주세요.
              </h2>

              <DocumentOption
                title="이력서"
                type="resume"
              />

              <DocumentOption
                title="자소서"
                type="cover_letter"
              />

              <CompanySearch />

              <QuestionListButton
                onClick={() => setIsQuestionList(true)}
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
      </main>
    </>
  );
}
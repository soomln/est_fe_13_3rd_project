'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import styles from './page.module.sass';

import Header from '../../_components/common/Header/Header';

import AiChatBubble from '../_components/AiChatBubble';
import AnswerBox from '../_components/AnswerBox';
import InterviewSettingModal from '../_components/InterviewSettingModal';
import SettingButton from '../_components/SettingButton';
import DocumentOption from '../_components/DocumentOption';
import CompanySearch from '../_components/CompanySearch';
import QuestionListButton from '../_components/QuestionListButton';
import QuestionPanel from '../_components/QuestionPanel';

export default function InterviewPage() {
  const router = useRouter();
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [isQuestionList, setIsQuestionList] = useState(false);

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
              <AiChatBubble />
            </div>

            <AnswerBox />
          </div>

          {isQuestionList ? (
            <QuestionPanel />
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

        {isSettingOpen && (
          <InterviewSettingModal
            onClose={() => setIsSettingOpen(false)}
          />
        )}
      </main>
    </>
  );
}
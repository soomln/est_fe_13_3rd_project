'use client';

import { useState } from 'react';

import './InterviewFeedbackModal.sass';

const questionData = {
  자기소개: {
    question: '본인을 간단하게 소개해주세요.',
    answer:
      '안녕하세요. 저는 프론트엔드 개발자를 목표로 하고 있는 지원자입니다.',
  },
  '기술 질문 1': {
    question:
      '프론트엔드 개발자로 지원한 이유는 무엇인가요?',
    answer:
      '사용자 경험을 중요하게 생각하며, 직관적이고 유지보수하기 좋은 프론트엔드 개발을 지향하고 있습니다.',
  },
  '기술 질문 2': {
    question:
      '프로젝트에서 가장 어려웠던 기술적인 문제는 무엇이었나요?',
    answer:
      '프로젝트에서 상태 관리와 API 응답 처리 과정에서 발생한 문제를 해결한 경험이 있습니다.',
  },
  '인성 질문': {
    question:
      '팀원과 의견이 충돌했을 때 어떻게 해결했나요?',
    answer:
      '서로의 의견을 정리한 뒤 근거를 비교하고 가장 적절한 방향을 함께 결정했습니다.',
  },
  '마무리 질문': {
    question:
      '마지막으로 하고 싶은 말이 있나요.',
    answer:
      '지속적으로 배우고 성장하는 개발자가 되겠습니다.',
  },
};

const feedbackData = {
  good: [
    '지원 직무에 대한 방향성이 잘 드러났습니다.',
    '답변의 핵심 내용을 명확하게 전달했습니다.',
  ],
  improve: [
    '관련 프로젝트 경험을 함께 이야기하면 신뢰도가 높아집니다.',
    '구체적인 기술 스택이나 경험을 추가하면 더 인상적인 답변이 됩니다.',
  ],
  summary:
    '질문에 대한 방향은 잘 전달되었으며, 구체적인 경험을 추가하면 더욱 설득력 있는 답변이 됩니다.',
};

export default function InterviewFeedbackModal({
  selectedQuestions = [],
  onClose,
}) {
  const [openQuestionId, setOpenQuestionId] =
    useState(selectedQuestions[0] || null);
  const [bookmarkedQuestions, setBookmarkedQuestions] =
    useState([]);
  const handleToggle = (id) => {
    setOpenQuestionId((prev) =>
      prev === id ? null : id,
    );
  };
  const handleBookmark = (id) => {
    setBookmarkedQuestions((prev) =>
      prev.includes(id)
        ? prev.filter((item) => item !== id)
        : [...prev, id],
    );
  };
  const feedbackList = selectedQuestions.map(
    (question) => ({
      id: question,
      title: question,
      question:
        questionData[question]?.question || '',
      answer:
        questionData[question]?.answer || '',
      feedback: feedbackData,
      summary: feedbackData.summary,
    }),
  );

  return (
    <div className="feedback_overlay">
      <div className="interview_feedback_modal">
        <div className="modal_header">
          <div>
            <div className="modal_title_wrap">
              <span className="material-symbols-outlined">
                feedback
              </span>
              <h2 className="modal_title font_h4">
                질문별 피드백
              </h2>
            </div>
            <p className="modal_description font_body_s_r">
              원하는 질문에 북마크를 클릭하면, 마이페이지에 두고
              언제든지 다시 볼 수 있어요!
            </p>
          </div>
          <button
            type="button"
            className="close_button"
            onClick={onClose}
            aria-label="닫기"
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>
        <div className="feedback_content">
          {feedbackList.map((item) => {
            const isOpen =
              openQuestionId === item.id;
            const isBookmarked =
              bookmarkedQuestions.includes(item.id);

            return (
              <div
                key={item.id}
                className={`feedback_item ${
                  isOpen ? 'is_open' : ''
                }`}
              >
                <div className="feedback_item_header">
                  <button
                    type="button"
                    className="question_toggle"
                    onClick={() =>
                      handleToggle(item.id)
                    }
                  >
                    <span className="question_title font_body_l_b">
                      {item.title}
                    </span>
                    <span className="material-symbols-outlined">
                      {isOpen
                        ? 'keyboard_arrow_up'
                        : 'keyboard_arrow_down'}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`bookmark_button ${
                      isBookmarked
                        ? 'is_bookmarked'
                        : ''
                    }`}
                    onClick={() =>
                      handleBookmark(item.id)
                    }
                    aria-label="북마크"
                  >
                    <span className="material-symbols-outlined">
                      {isBookmarked
                        ? 'bookmark'
                        : 'bookmark_border'}
                    </span>
                  </button>
                </div>

                {isOpen && (
                  <div className="feedback_detail">
                    <section>
                      <h3 className="font_body_l_b">
                        {item.title} 질문
                      </h3>
                      <p className="font_body_l_r">
                        {item.question}
                      </p>
                    </section>

                    <section>
                      <h3 className="font_body_l_b">
                        {item.title} 답변
                      </h3>
                      <p className="font_body_l_r">
                        {item.answer}
                      </p>
                    </section>

                    <section>
                      <h3 className="font_body_l_b">
                        피드백
                      </h3>
                      <div className="feedback_group">
                        <h4 className="font_body_l_r">
                          잘한 점
                        </h4>
                        <ul>
                          {item.feedback.good.map(
                            (text) => (
                              <li
                                key={text}
                                className="font_body_l_r"
                              >
                                {text}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                      <div className="feedback_group">
                        <h4 className="font_body_l_r">
                          보완할 점
                        </h4>
                        <ul>
                          {item.feedback.improve.map(
                            (text) => (
                              <li
                                key={text}
                                className="font_body_l_r"
                              >
                                {text}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    </section>

                    <section>
                      <h3 className="font_body_l_b">
                        한줄 총평
                      </h3>
                      <p className="font_body_l_r">
                        {item.summary}
                      </p>
                    </section>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
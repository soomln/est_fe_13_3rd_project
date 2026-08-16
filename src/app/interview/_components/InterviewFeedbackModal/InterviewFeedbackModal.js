'use client';

import { useState } from 'react';

import './InterviewFeedbackModal.sass';

export default function InterviewFeedbackModal({
  results = [],
  onClose,
}) {
  const [openQuestionId, setOpenQuestionId] =
    useState(results[0]?.category || null);
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
  const feedbackList = results.map(
    (item) => ({
      id: item.category,
      title: item.title,
      question: item.question,
      answer: item.answer || '',
      score: item.score,
      good: item.feedback?.strengths || [],
      improve: item.feedback?.improvements || [],
      summary: item.feedback?.summary || '',
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
                    {typeof item.score === 'number' && (
                      <span className="question_score font_body_m_b">
                        {item.score}점
                      </span>
                    )}
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
                      <p className="font_body_l_r question_text">
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
                          {item.good.map(
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
                          {item.improve.map(
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
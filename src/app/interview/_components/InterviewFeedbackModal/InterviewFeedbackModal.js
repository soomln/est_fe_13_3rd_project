'use client';

import { useEffect, useState } from 'react';

import styles from './InterviewFeedbackModal.module.sass';
import { getMyScrappedQaIds, toggleQaScrap } from '@backend/lib/api/interview';

export default function InterviewFeedbackModal({
  results = [],
  onClose,
}) {
  const [openQuestionId, setOpenQuestionId] =
    useState(results[0]?.category || null);
  const [bookmarkedQuestions, setBookmarkedQuestions] =
    useState([]);

  useEffect(() => {
    let cancelled = false;
    const qaIds = results.map((r) => r.qaId).filter(Boolean);
    if (qaIds.length === 0) return undefined;

    getMyScrappedQaIds(qaIds)
      .then((scrappedIds) => {
        if (cancelled) return;
        const bookmarked = results
          .filter((r) => r.qaId && scrappedIds.has(r.qaId))
          .map((r) => r.category);
        setBookmarkedQuestions(bookmarked);
      })
      .catch((err) => {
        console.error('북마크 상태 조회 실패:', err);
      });

    return () => {
      cancelled = true;
    };
  }, [results]);

  const handleToggle = (id) => {
    setOpenQuestionId((prev) =>
      prev === id ? null : id,
    );
  };
  const handleBookmark = async (item) => {
    const wasBookmarked = bookmarkedQuestions.includes(item.id);
    setBookmarkedQuestions((prev) =>
      wasBookmarked ? prev.filter((v) => v !== item.id) : [...prev, item.id],
    );

    if (!item.qaId) return;

    try {
      await toggleQaScrap(item.qaId);
    } catch (err) {
      console.error('질문 스크랩 실패:', err);
      setBookmarkedQuestions((prev) =>
        wasBookmarked ? [...prev, item.id] : prev.filter((v) => v !== item.id),
      );
    }
  };
  const feedbackList = results.map(
    (item) => ({
      id: item.category,
      qaId: item.qaId ?? null,
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
    <div className={styles.feedback_overlay}>
      <div className={styles.interview_feedback_modal}>
        <div className={styles.modal_header}>
          <div>
            <div className={styles.modal_title_wrap}>
              <span className="material-symbols-outlined">
                feedback
              </span>
              <h2 className={`${styles.modal_title} font_h4`}>
                질문별 피드백
              </h2>
            </div>
            <p className={`${styles.modal_description} font_body_s_r`}>
              원하는 질문에 북마크를 클릭하면, 마이페이지에 두고
              언제든지 다시 볼 수 있어요!
            </p>
            <p className={`${styles.modal_notice} font_body_s_r`}>
              질문별 점수는 각 10점 만점이에요. 100점 만점인 최종 점수와는
              별도의 기준으로 채점돼요.
            </p>
          </div>
          <button
            type="button"
            className={styles.close_button}
            onClick={onClose}
            aria-label="닫기"
          >
            <span className="material-symbols-outlined">
              close
            </span>
          </button>
        </div>
        <div className={styles.feedback_content}>
          {feedbackList.map((item) => {
            const isOpen =
              openQuestionId === item.id;
            const isBookmarked =
              bookmarkedQuestions.includes(item.id);

            return (
              <div
                key={item.id}
                className={`${styles.feedback_item} ${
                  isOpen ? 'is_open' : ''
                }`}
              >
                <div className={styles.feedback_item_header}>
                  <button
                    type="button"
                    className={styles.question_toggle}
                    onClick={() =>
                      handleToggle(item.id)
                    }
                  >
                    <span className={`${styles.question_title} font_body_l_b`}>
                      {item.title}
                    </span>
                    {typeof item.score === 'number' && (
                      <span className={`${styles.question_score} font_body_m_b`}>
                        {item.score}점 <span className={styles.score_max}>/ 10점</span>
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
                    className={`${styles.bookmark_button} ${
                      isBookmarked
                        ? styles.is_bookmarked
                        : ''
                    }`}
                    onClick={() =>
                      handleBookmark(item)
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
                  <div className={styles.feedback_detail}>
                    <section>
                      <h3 className="font_body_l_b">
                        AI면접관 질문
                      </h3>
                      <p className={`font_body_l_r ${styles.question_text}`}>
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
                      <div className={styles.feedback_group}>
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
                      <div className={styles.feedback_group}>
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
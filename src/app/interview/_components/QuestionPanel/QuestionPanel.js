'use client';

import { useState } from 'react';

import './QuestionPanel.sass';
import QuestionListButton from '../QuestionListButton';
import { QUESTIONS, QUESTION_TITLES } from '../../_constants/questions';

export default function QuestionPanel({ onStart }) {
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const handleSelect = (title) => {
    if (title === '전체') {
      setSelectedQuestions((prev) =>
        prev.length === QUESTION_TITLES.length
          ? []
          : QUESTION_TITLES,
      );

      return;
    }

    setSelectedQuestions((prev) => {
      if (prev.includes(title)) {
        return prev.filter((item) => item !== title);
      }

      return [...prev, title];
    });
  };

  return (
    <aside className="question_panel">
      <h2 className="font_h3">질문 리스트</h2>

      <ul className="question_list">
        {QUESTIONS.map((question) => {
          const isSelected =
            question.title === '전체'
              ? selectedQuestions.length === QUESTION_TITLES.length
              : selectedQuestions.includes(question.title);

          return (
            <li key={question.title} className="question_item">
              <button
                type="button"
                className="question_button"
                onClick={() => handleSelect(question.title)}
              >
                <span className="material-symbols-outlined">
                  {isSelected
                    ? 'check_box'
                    : 'check_box_outline_blank'}
                </span>

                <div className="question_info">
                  <strong className="font_h4">
                    {question.title}
                  </strong>

                  <p className="font_body_m_r">
                    {question.description}
                  </p>
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <QuestionListButton
        onClick={() => onStart(selectedQuestions)}
      >
        선택한 질문으로 시작하기
      </QuestionListButton>
    </aside>
  );
}
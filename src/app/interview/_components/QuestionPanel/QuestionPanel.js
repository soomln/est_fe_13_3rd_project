'use client';

import { useState } from 'react';

import './QuestionPanel.sass';
import QuestionListButton from '../QuestionListButton';

export default function QuestionPanel({ onStart }) {
  const [selectedQuestions, setSelectedQuestions] = useState([]);

  const questions = [
    {
      title: '전체',
      description: '처음부터 모든 질문을 순서대로 진행합니다.',
    },
    {
      title: '자기소개',
      description: '본인에 대해 간단히 소개해주세요.',
    },
    {
      title: '기술 질문 1',
      description: '지원한 직무와 관련된 기술 질문입니다.',
    },
    {
      title: '기술 질문 2',
      description: '기술 이해도를 확인하는 질문입니다.',
    },
    {
      title: '인성 질문',
      description: '성격, 가치관에 대한 질문입니다.',
    },
    {
      title: '마무리 질문',
      description: '마지막으로 자유롭게 적어주세요.',
    },
  ];

  // 실제로 면접에 사용할 질문
  const questionTitles = questions
    .filter((question) => question.title !== '전체')
    .map((question) => question.title);

  const handleSelect = (title) => {
    // 전체 선택
    if (title === '전체') {
      setSelectedQuestions((prev) =>
        prev.length === questionTitles.length
          ? []
          : questionTitles,
      );

      return;
    }

    // 개별 질문 선택 / 해제
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
        {questions.map((question) => {
          const isSelected =
            question.title === '전체'
              ? selectedQuestions.length === questionTitles.length
              : selectedQuestions.includes(question.title);

          return (
            <li key={question.title}>
              <button
                type="button"
                onClick={() => handleSelect(question.title)}
              >
                <span className="material-symbols-outlined">
                  {isSelected
                    ? 'check_box'
                    : 'check_box_outline_blank'}
                </span>

                <div>
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
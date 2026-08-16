'use client';

import { useEffect, useState } from 'react';

import styles from './QuestionPanel.module.sass';
import QuestionListButton from '../QuestionListButton';
import { QUESTIONS } from '../../_constants/questions';
import { getDocument } from '@backend/lib/api/documents';
import { getCompany } from '@backend/lib/api/companies';
import { generateInterviewQuestions } from '../../_lib/generateInterviewQuestions';

export default function QuestionPanel({
  resumeId,
  coverLetterId,
  companySlug,
  onStart,
  onGenerationError,
}) {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const generate = async () => {
      try {
        setIsGenerating(true);
        setSelectedQuestions([]);

        const [resume, coverLetter, company] = await Promise.all([
          resumeId ? getDocument(resumeId) : null,
          coverLetterId ? getDocument(coverLetterId) : null,
          companySlug ? getCompany(companySlug) : null,
        ]);

        const questions = await generateInterviewQuestions({
          resumeText: resume?.contentText,
          coverLetterText: coverLetter?.contentText,
          company,
        });

        if (!cancelled) setGeneratedQuestions(questions);
      } catch (err) {
        console.error('면접 질문 생성 실패:', err);
        if (!cancelled) {
          onGenerationError?.();
          // AI 생성이 완전히 실패해도 정적 질문으로 패널이 계속 동작하게 한다.
          setGeneratedQuestions(
            QUESTIONS.filter((item) => item.category !== 'all').map((item) => ({
              category: item.category,
              title: item.title,
              description: item.description,
              question: item.question,
            })),
          );
        }
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    };

    generate();

    return () => {
      cancelled = true;
    };
  }, [resumeId, coverLetterId, companySlug, onGenerationError]);

  const handleSelect = (item) => {
    setSelectedQuestions((prev) => {
      if (item.category === 'all') {
        return prev.length === generatedQuestions.length ? [] : generatedQuestions;
      }

      const isSelected = prev.some((q) => q.category === item.category);
      const nextCategories = isSelected
        ? prev.filter((q) => q.category !== item.category)
        : [...prev, item];

      // 선택 순서와 상관없이 항상 생성된 카테고리 순서를 유지한다.
      return generatedQuestions.filter((q) =>
        nextCategories.some((n) => n.category === q.category),
      );
    });
  };

  return (
    <aside className={styles.question_panel}>
      <h2 className="font_h3">질문 리스트</h2>

      <ul className={styles.question_list}>
        {QUESTIONS.map((question) => {
          const isAllRow = question.category === 'all';
          const generatedItem = generatedQuestions.find(
            (item) => item.category === question.category,
          );

          const isSelected = isAllRow
            ? generatedQuestions.length > 0 &&
            selectedQuestions.length === generatedQuestions.length
            : selectedQuestions.some((item) => item.category === question.category);

          const description = isAllRow
            ? question.description
            : isGenerating
              ? '질문을 생성하는 중...'
              : generatedItem?.description || question.description;

          return (
            <li key={question.category} className={styles.question_item}>
              <button
                type="button"
                className={styles.question_button}
                onClick={() => handleSelect(isAllRow ? question : generatedItem)}
                disabled={isGenerating || (!isAllRow && !generatedItem)}
              >
                <span className="material-symbols-outlined">
                  {isSelected
                    ? 'check_box'
                    : 'check_box_outline_blank'}
                </span>

                <div className={styles.question_info}>
                  <strong className="font_h4">
                    {question.title}
                  </strong>

                  <p className="font_body_m_r">
                    {description}
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

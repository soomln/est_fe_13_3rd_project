'use client';

import { useEffect, useState } from 'react';

import styles from './QuestionPanel.module.sass';
import QuestionListButton from '../QuestionListButton';
import { QUESTIONS, getQuestionText } from '../../_constants/questions';
import { getDocument } from '@backend/lib/api/documents';
import { getCompany } from '@backend/lib/api/companies';
import { generateInterviewQuestions } from '../../_lib/generateInterviewQuestions';

const CACHE_KEY = 'interview_question_panel_cache_v1';

function loadCache() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveCache(cache) {
  if (typeof window === 'undefined') return;
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export function clearQuestionPanelCache() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(CACHE_KEY);
}

function matchesCache(cache, resumeId, coverLetterId, companySlug, interviewerStyle) {
  return Boolean(
    cache &&
      cache.resumeId === resumeId &&
      cache.coverLetterId === coverLetterId &&
      cache.companySlug === companySlug &&
      cache.interviewerStyle === interviewerStyle &&
      cache.generatedQuestions?.length,
  );
}

export default function QuestionPanel({
  resumeId,
  coverLetterId,
  companySlug,
  interviewerStyle = 'friendly',
  onStart,
  onGenerationError,
}) {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const cache = loadCache();
    if (matchesCache(cache, resumeId, coverLetterId, companySlug, interviewerStyle)) {
      setGeneratedQuestions(cache.generatedQuestions);
      setSelectedQuestions(cache.selectedQuestions ?? []);
      setIsGenerating(false);
      return;
    }

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
          interviewerStyle,
        });

        if (!cancelled) setGeneratedQuestions(questions);
      } catch (err) {
        console.error('면접 질문 생성 실패:', err);
        if (!cancelled) {
          onGenerationError?.();
          setGeneratedQuestions(
            QUESTIONS.filter((item) => item.category !== 'all').map((item) => ({
              category: item.category,
              title: item.title,
              description: item.description,
              question: getQuestionText(item, interviewerStyle),
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
  }, [resumeId, coverLetterId, companySlug, interviewerStyle, onGenerationError]);

  useEffect(() => {
    if (isGenerating || generatedQuestions.length === 0) return;
    saveCache({
      resumeId,
      coverLetterId,
      companySlug,
      interviewerStyle,
      generatedQuestions,
      selectedQuestions,
    });
  }, [
    resumeId,
    coverLetterId,
    companySlug,
    interviewerStyle,
    generatedQuestions,
    selectedQuestions,
    isGenerating,
  ]);

  const handleSelect = (item) => {
    setSelectedQuestions((prev) => {
      if (item.category === 'all') {
        return prev.length === generatedQuestions.length ? [] : generatedQuestions;
      }

      const isSelected = prev.some((q) => q.category === item.category);
      const nextCategories = isSelected
        ? prev.filter((q) => q.category !== item.category)
        : [...prev, item];

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

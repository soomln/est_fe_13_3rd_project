'use client';

import { useEffect, useRef, useState } from 'react';

import styles from './QuestionPanel.module.sass';
import QuestionListButton from '../QuestionListButton';
import { QUESTIONS, getQuestionText } from '../../_constants/questions';
import { getDocument } from '@backend/lib/api/documents';
import { getCompany } from '@backend/lib/api/companies';
import { generateInterviewQuestions, stripHtml } from '../../_lib/generateInterviewQuestions';

// v1에는 생성 실패 시 사용하는 기본 템플릿 질문이 "성공"과 구분 없이 캐시될 수 있었던
// 문제가 있어 v2로 올려 기존에 저장된 캐시를 무효화한다.
const CACHE_KEY = 'interview_question_panel_cache_v2';

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
  onGenerationStart,
  onGenerationSuccess,
  onGenerationError,
}) {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(true);
  // 이번 generatedQuestions가 AI 생성 결과가 아니라 실패 시의 기본 템플릿인지 표시.
  // fallback 결과는 세션 캐시에 저장하지 않아, 다음에 같은 이력서를 골랐을 때 다시 시도하게 한다.
  const isFallbackRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const cache = loadCache();
    if (matchesCache(cache, resumeId, coverLetterId, companySlug, interviewerStyle)) {
      isFallbackRef.current = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- 세션 캐시 히트 시 API 호출 없이 즉시 캐시된 질문으로 렌더링해야 함
      setGeneratedQuestions(cache.generatedQuestions);
      setSelectedQuestions(cache.selectedQuestions ?? []);
      setIsGenerating(false);
      return undefined;
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

        // StrictMode가 개발 모드에서 만드는 첫 번째(취소될) 호출은 여기서 걸러내,
        // 실제로 API를 부르지 않는 시도까지 "생성 중" 안내가 뜨지 않도록 한다.
        if (cancelled) return;
        onGenerationStart?.();

        // contentText가 비어 있는 이력서(template_id가 NULL인 경우 등)는
        // content_html에 실제 본문이 있을 수 있으므로 그걸 대신 사용한다.
        const resumeText = resume?.contentText || stripHtml(resume?.contentHtml) || '';

        const questions = await generateInterviewQuestions({
          resumeText,
          coverLetterText: coverLetter?.contentText,
          company,
          interviewerStyle,
          signal: controller.signal,
        });

        if (!cancelled) {
          isFallbackRef.current = false;
          setGeneratedQuestions(questions);
          onGenerationSuccess?.();
        }
      } catch (err) {
        if (err?.name === 'AbortError') return;
        console.error('면접 질문 생성 실패:', err);
        if (!cancelled) {
          isFallbackRef.current = true;
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
      controller.abort();
    };
  }, [
    resumeId,
    coverLetterId,
    companySlug,
    interviewerStyle,
    onGenerationStart,
    onGenerationSuccess,
    onGenerationError,
  ]);

  useEffect(() => {
    if (isGenerating || generatedQuestions.length === 0 || isFallbackRef.current) return;
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

                <span className={styles.question_info}>
                  <strong className="font_h4">
                    {question.title}
                  </strong>

                  <p className="font_body_m_r">
                    {description}
                  </p>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <QuestionListButton
        onClick={() => onStart(selectedQuestions)}
        disabled={isGenerating}
      >
        선택한 질문으로 시작하기
      </QuestionListButton>
    </aside>
  );
}

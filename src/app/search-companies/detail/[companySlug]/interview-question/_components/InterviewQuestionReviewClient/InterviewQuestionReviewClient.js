'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { PAGE_SIZE } from '@backend/lib/constants';
import { getCodeGroups } from '@backend/lib/api/codes';
import { listPosts, togglePostScrap } from '@backend/lib/api/posts';
import { useAuth } from '@/app/_components/auth';
import Pagination from '@/app/_components/common/Pagination';
import ReviewCard from '@/app/_components/common/ReviewCard';
import MetaLegend from '@/app/search-companies/_components/MetaLegend';
import PostToolbar from '@/app/search-companies/_components/PostToolbar';
import styles from './InterviewQuestionReviewClient.module.sass';

const CODE_GROUPS = ['job_role', 'difficulty', 'pass_result'];
const EMPTY_FILTERS = { jobRole: '', difficulty: '', passResult: '', sort: 'latest' };

export default function InterviewQuestionReviewClient({ companySlug }) {
  const router = useRouter();
  const { isLoggedIn, openLogin } = useAuth();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const [codes, setCodes] = useState({});
  const [questions, setQuestions] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let ignore = false;

    async function fetchCodes() {
      try {
        const result = await getCodeGroups(CODE_GROUPS);

        if (!ignore) setCodes(result);
      } catch (error) {
        console.error(error);
      }
    }

    fetchCodes();

    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    let ignore = false;

    async function fetchQuestions() {
      setStatus('loading');

      try {
        const result = await listPosts({
          type: 'qbank',
          companySlug,
          jobRole: filters.jobRole,
          difficulty: filters.difficulty,
          passResult: filters.passResult,
          sort: filters.sort,
          page,
        });

        if (ignore) return;

        setQuestions(result.items);
        setTotal(result.total);
        setStatus('ready');
      } catch (error) {
        console.error(error);

        if (!ignore) setStatus('error');
      }
    }

    fetchQuestions();

    return () => {
      ignore = true;
    };
  }, [companySlug, filters.jobRole, filters.difficulty, filters.passResult, filters.sort, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE.qbank));

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }

    router.push(`/search-companies/detail/${companySlug}/interview-question/write`);
  };

  const handleScrapClick = async (question) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }

    setQuestions((prev) =>
      prev.map((item) => (item.id === question.id ? { ...item, scrappedByMe: !item.scrappedByMe } : item))
    );

    try {
      await togglePostScrap(question.id);
    } catch (error) {
      console.error(error);

      setQuestions((prev) =>
        prev.map((item) => (item.id === question.id ? { ...item, scrappedByMe: question.scrappedByMe } : item))
      );
    }
  };

  return (
    <div className={styles.question}>
      <PostToolbar filters={filters} codes={codes} onChange={handleFilterChange} onWriteClick={handleWriteClick} />

      <MetaLegend />

      {status === 'error' && <p className={styles.question_state}>면접 족보를 불러오지 못했습니다.</p>}

      {status !== 'error' && questions.length === 0 && (
        <p className={styles.question_state}>
          {status === 'loading' ? '불러오는 중...' : '조건에 맞는 면접 족보가 없습니다.'}
        </p>
      )}

      {questions.length > 0 && (
        <ul className={styles.question_list}>
          {questions.map((question) => (
            <ReviewCard
              key={question.id}
              href={`/search-companies/detail/${companySlug}/interview-question/${question.id}`}
              review={question}
              showBookmark
              isBookmarked={question.scrappedByMe ?? false}
              onBookmarkClick={() => handleScrapClick(question)}
            />
          ))}
        </ul>
      )}

      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}

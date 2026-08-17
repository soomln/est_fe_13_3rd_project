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
import ReviewStats from '@/app/search-companies/_components/ReviewStats';
import aggregateReviewStats from '@/app/search-companies/_lib/aggregateReviewStats';
import { STATS_SAMPLE_SIZE } from '@/app/search-companies/_lib/options';
import styles from './InterviewReviewClient.module.sass';

const CODE_GROUPS = ['job_role', 'difficulty', 'pass_result'];
const EMPTY_FILTERS = { jobRole: '', difficulty: '', passResult: '', sort: 'latest' };

export default function InterviewReviewClient({ companySlug }) {
  const router = useRouter();
  const { isLoggedIn, openLogin } = useAuth();

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);

  const [codes, setCodes] = useState({});
  const [reviews, setReviews] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState('loading');
  const [stats, setStats] = useState(() => aggregateReviewStats([]));

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

  // 통계 패널은 필터와 무관하게 해당 기업의 전체 후기를 집계한다
  useEffect(() => {
    let ignore = false;

    async function fetchStats() {
      try {
        const result = await listPosts({
          type: 'review',
          companySlug,
          pageSize: STATS_SAMPLE_SIZE,
        });

        if (!ignore) setStats(aggregateReviewStats(result.items));
      } catch (error) {
        console.error(error);
      }
    }

    fetchStats();

    return () => {
      ignore = true;
    };
  }, [companySlug]);

  useEffect(() => {
    let ignore = false;

    async function fetchReviews() {
      setStatus('loading');

      try {
        const result = await listPosts({
          type: 'review',
          companySlug,
          jobRole: filters.jobRole,
          difficulty: filters.difficulty,
          passResult: filters.passResult,
          sort: filters.sort,
          page,
        });

        if (ignore) return;

        setReviews(result.items);
        setTotal(result.total);
        setStatus('ready');
      } catch (error) {
        console.error(error);

        if (!ignore) setStatus('error');
      }
    }

    fetchReviews();

    return () => {
      ignore = true;
    };
  }, [companySlug, filters.jobRole, filters.difficulty, filters.passResult, filters.sort, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE.reviews));

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const handleWriteClick = () => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }

    router.push(`/search-companies/detail/${companySlug}/interview-review/write`);
  };

  const handleScrapClick = async (review) => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }

    setReviews((prev) =>
      prev.map((item) => (item.id === review.id ? { ...item, scrappedByMe: !item.scrappedByMe } : item))
    );

    try {
      await togglePostScrap(review.id);
    } catch (error) {
      console.error(error);

      setReviews((prev) =>
        prev.map((item) => (item.id === review.id ? { ...item, scrappedByMe: review.scrappedByMe } : item))
      );
    }
  };

  return (
    <div className={styles.review}>
      <ReviewStats stats={stats} />

      <PostToolbar filters={filters} codes={codes} onChange={handleFilterChange} onWriteClick={handleWriteClick} />

      <MetaLegend />

      {status === 'error' && <p className={styles.review_state}>면접 후기를 불러오지 못했습니다.</p>}

      {status !== 'error' && reviews.length === 0 && (
        <p className={styles.review_state}>
          {status === 'loading' ? '불러오는 중...' : '조건에 맞는 면접 후기가 없습니다.'}
        </p>
      )}

      {reviews.length > 0 && (
        <ul className={styles.review_list}>
          {reviews.map((review) => (
            <ReviewCard
              key={review.id}
              href={`/search-companies/detail/${companySlug}/interview-review/${review.id}`}
              review={review}
              isBookmarked={review.scrappedByMe ?? false}
              onBookmarkClick={() => handleScrapClick(review)}
            />
          ))}
        </ul>
      )}

      {totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
    </div>
  );
}

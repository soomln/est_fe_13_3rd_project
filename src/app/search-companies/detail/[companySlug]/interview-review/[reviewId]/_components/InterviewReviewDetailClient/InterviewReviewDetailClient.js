'use client';

import { useEffect, useState } from 'react';

import { getPost } from '@backend/lib/api/posts';
import CommentSection from '@/app/search-companies/_components/CommentSection';
import MetaLegend from '@/app/search-companies/_components/MetaLegend';
import PostDetailHeader from '@/app/search-companies/_components/PostDetailHeader';
import PostSummary from '@/app/search-companies/_components/PostSummary';
import styles from './InterviewReviewDetailClient.module.sass';

export default function InterviewReviewDetailClient({ companySlug, reviewId }) {
  const [review, setReview] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let ignore = false;

    async function fetchReview() {
      try {
        const data = await getPost(reviewId);

        if (ignore) return;

        setReview(data);
        setStatus('ready');
      } catch (error) {
        console.error(error);

        if (!ignore) setStatus('error');
      }
    }

    fetchReview();

    return () => {
      ignore = true;
    };
  }, [reviewId]);

  if (status === 'error') {
    return <p className={styles.detail_state}>면접 후기를 불러오지 못했습니다.</p>;
  }

  if (!review) {
    return <p className={styles.detail_state}>불러오는 중...</p>;
  }

  const summaryItems = [
    {
      label: '면접 난이도',
      value: review.difficultyScore == null ? '-' : review.difficultyScore.toFixed(1),
      unit: '/ 5.0',
    },
  ];

  return (
    <div className={styles.detail}>
      <MetaLegend />

      <article className={styles.detail_card}>
        <div className={styles.detail_main}>
          <PostDetailHeader
            label='면접 후기'
            post={review}
            backHref={`/search-companies/detail/${companySlug}/interview-review`}
          />

          <PostSummary items={summaryItems} description={review.overallComment} />

          <p className={`${styles.detail_body} font_body_l_r`}>{review.body}</p>
        </div>

        <CommentSection postId={review.id} />
      </article>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';

import { getPost } from '@backend/lib/api/posts';
import CommentSection from '@/app/search-companies/_components/CommentSection';
import MetaLegend from '@/app/search-companies/_components/MetaLegend';
import PostDetailHeader from '@/app/search-companies/_components/PostDetailHeader';
import PostSummary from '@/app/search-companies/_components/PostSummary';
import styles from './InterviewQuestionReviewDetailClient.module.sass';

const toScore = (value) => (value == null ? '-' : value.toFixed(1));

export default function InterviewQuestionReviewDetailClient({ companySlug, questionId }) {
  const [qbank, setQbank] = useState(null);
  const [status, setStatus] = useState('loading');

  useEffect(() => {
    let ignore = false;

    async function fetchQbank() {
      try {
        const data = await getPost(questionId);

        if (ignore) return;

        setQbank(data);
        setStatus('ready');
      } catch (error) {
        console.error(error);

        if (!ignore) setStatus('error');
      }
    }

    fetchQbank();

    return () => {
      ignore = true;
    };
  }, [questionId]);

  if (status === 'error') {
    return <p className={styles.detail_state}>면접 족보를 불러오지 못했습니다.</p>;
  }

  if (!qbank) {
    return <p className={styles.detail_state}>불러오는 중...</p>;
  }

  const questionList = qbank.questionList ?? [];

  const summaryItems = [
    { label: '면접 난이도', value: toScore(qbank.difficultyScore), unit: '/ 5.0', icon: 'kid_star' },
    { label: '문제 난이도', value: toScore(qbank.problemScore), unit: '/ 5.0', icon: 'kid_star' },
    {
      label: '문제 출제 수',
      value: qbank.questionCount ?? questionList.length,
      unit: '개',
      icon: 'inbox_text_person',
    },
    { label: '합격 여부', value: qbank.result || '-', icon: 'handshake', muted: true },
  ];

  return (
    <div className={styles.detail}>
      <MetaLegend />

      <article className={styles.detail_card}>
        <div className={styles.detail_main}>
          <PostDetailHeader
            post={qbank}
            showTitle={false}
            backHref={`/search-companies/detail/${companySlug}/interview-question`}
          />

          <PostSummary items={summaryItems} />

          <ol className={styles.detail_questions}>
            {questionList.map((question, index) => (
              <li key={index} className='font_body_l_r'>
                {question}
              </li>
            ))}
          </ol>
        </div>

        <CommentSection postId={qbank.id} />
      </article>
    </div>
  );
}

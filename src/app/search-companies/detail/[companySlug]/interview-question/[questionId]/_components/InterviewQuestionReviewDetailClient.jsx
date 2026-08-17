"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPost } from "@backend/lib/api/posts";
import { listComments } from "@backend/lib/api/comments";
import InterviewQuestionReviewDetailContent from "./InterviewQuestionReviewDetailContent";

export default function InterviewQuestionReviewDetailClient({ companySlug, questionId }) {
  const [qbank, setQbank] = useState(null);
  const [comments, setComments] = useState([]);

  const router = useRouter();

  const fetchComments = async () => {
    const commentData = await listComments(questionId);
    setComments(commentData.items ?? []);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [qbankData, commentData] = await Promise.all([getPost(questionId), listComments(questionId)]);

        setQbank(qbankData);
        setComments(commentData.items ?? []);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, [questionId]);

  const handleBack = () => {
    router.push(`/search-companies/detail/${companySlug}/interview-question`);
  };

  if (!qbank) {
    return <p>불러오는 중...</p>;
  }

  return (
    <InterviewQuestionReviewDetailContent
      question={qbank}
      comments={comments}
      reloadComments={fetchComments}
      handleBack={handleBack}
    />
  );
}

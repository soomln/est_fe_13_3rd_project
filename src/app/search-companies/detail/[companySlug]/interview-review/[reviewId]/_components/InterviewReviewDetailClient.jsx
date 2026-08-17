"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getPost } from "@backend/lib/api/posts";
import { listComments } from "@backend/lib/api/comments";
import InterviewReviewDetailContent from "./InterviewReviewDetailContent";

export default function InterviewReviewDetailClient({ companySlug, reviewId }) {
  const [review, setReview] = useState(null);
  const [comments, setComments] = useState([]);

  const router = useRouter();

  const fetchComments = async () => {
    const commentData = await listComments(reviewId);
    setComments(commentData.items ?? []);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [reviewData, commentData] = await Promise.all([getPost(reviewId), listComments(reviewId)]);

        setReview(reviewData);
        setComments(commentData.items ?? []);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, [reviewId]);

  const handleBack = () => {
    router.push(`/search-companies/detail/${companySlug}/interview-review`);
  };

  if (!review) {
    return <p>불러오는 중...</p>;
  }

  return (
    <InterviewReviewDetailContent
      review={review}
      comments={comments}
      reloadComments={fetchComments}
      handleBack={handleBack}
    />
  );
}

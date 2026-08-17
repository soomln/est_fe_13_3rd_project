"use client";
import { useState, useEffect } from "react";
import { listPosts } from "@backend/lib/api/posts";
import InterviewStatistics from "@/app/search-companies/_components/InterviewStatistics";
import InterviewFilter from "@/app/search-companies/_components/InterviewFilter";
import ReviewCard from "@/app/_components/common/ReviewCard";
import Pagination from "@/app/_components/common/Pagination";
import aggregateReviewStats from "@/app/search-companies/_lib/aggregateReviewStats";

export default function InterviewReviewClient({ companySlug }) {
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await listPosts({ type: "review", companySlug });

        setReviews(result.items);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, [companySlug]);

  const stats = aggregateReviewStats(reviews);

  return (
    <>
      <InterviewStatistics stats={stats} />
      <InterviewFilter />
      <button type="button">글 작성하기</button>

      <ul>
        {reviews.map((review) => (
          <ReviewCard
            key={review.id}
            href={`/search-companies/detail/${companySlug}/interview-review/${review.id}`}
            review={review}
          />
        ))}
      </ul>

      <Pagination />
    </>
  );
}

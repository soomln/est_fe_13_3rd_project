"use client";
import { useState, useEffect } from "react";
import { listPosts } from "@backend/lib/api/posts";
import ReviewCard from "@/app/_components/common/ReviewCard";
import Pagination from "@/app/_components/common/Pagination";

export default function InterviewQuestionReviewClient({ companySlug }) {
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const result = await listPosts({ type: "qbank", companySlug });

        setQuestions(result.items);
      } catch (err) {
        console.error(err);
      }
    }

    fetchData();
  }, [companySlug]);

  return (
    <>
      <ul>
        {questions.map((question) => (
          <ReviewCard
            key={question.id}
            href={`/search-companies/detail/${companySlug}/interview-question/${question.id}`}
            review={question}
            showBookmark
          />
        ))}
      </ul>

      <Pagination />
    </>
  );
}

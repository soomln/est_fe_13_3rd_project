"use client";
import { useState, useEffect } from "react";

import { getCompany } from "@backend/lib/api/companies";
import { listPosts } from "@backend/lib/api/posts";
import CompanyHeader from "../../../_components/CompanyHeader/CompanyHeader";
import TabNavigation from "../../../_components/TabNavigation/TabNavigation";
import InterviewStatistics from "@/app/search-companies/_components/InterviewStatistics";
import InterviewFilter from "@/app/search-companies/_components/InterviewFilter";
import ReviewCard from "@/app/_components/common/ReviewCard";
import Pagination from "@/app/_components/common/Pagination";

const chartData = [
  {
    label: "긍정",
    value: 60,
    color: "#8B5CF6",
  },
  {
    label: "보통",
    value: 25,
    color: "#22C55E",
  },
  {
    label: "부정",
    value: 15,
    color: "#FACC15",
  },
];

const interviewRoutes = [
  { label: "온라인 지원", value: 70 },
  { label: "지인 추천", value: 70 },
  { label: "학교 추천", value: 70 },
  { label: "채용 박람회", value: 70 },
  { label: "채용 담당자 제안", value: 70 },
  { label: "기타", value: 70 },
];



export default function InterviewReviewClient({companySlug}){
  const [company, setCompany] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
  async function fetchData() {
    try {
      const [companyData, result] = await Promise.all([
        getCompany(companySlug),
        listPosts({
          type: "review",
          companySlug,
        }),
      ]);

      console.log("company =", companyData);
      console.log("posts =", result);

      setCompany(companyData);
      setReviews(result.items);
    } catch (err) {
      console.error(err);
    }
  }

  fetchData();
}, [companySlug]);
  

  return (
    <>
      <CompanyHeader company={company}/>
      <TabNavigation />
      <InterviewStatistics chartData={chartData} interviewRoutes={interviewRoutes}/>
      <InterviewFilter/>
      <button type='button'>글 작성하기</button>
      {reviews.map((review) => (
      <ReviewCard
        key={review.id}
        review={review}
      />
      ))}
      <Pagination/>
    </>
  );
}
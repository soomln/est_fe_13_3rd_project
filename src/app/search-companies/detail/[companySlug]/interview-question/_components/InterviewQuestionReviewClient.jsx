"use client";
import { useState, useEffect } from "react";
import { listPosts } from "@backend/lib/api/posts";
import { getCompany } from "@backend/lib/api/companies";
import CompanyHeader from "../../../_components/CompanyHeader/CompanyHeader";
import TabNavigation from "../../../_components/TabNavigation/TabNavigation";
import ReviewCard from "@/app/_components/common/ReviewCard";
import Pagination from "@/app/_components/common/Pagination";

export default function InterviewQuestionReviewClient({companySlug}){
  const [company, setCompany] = useState(null);
    const [reviews, setReviews] = useState([]);
  
    useEffect(() => {
    async function fetchData() {
      try {
        const [companyData, result] = await Promise.all([
          getCompany(companySlug),
          listPosts({
            type: "qback",
            companySlug,
          }),
        ]);
  
        console.log("company =", companyData);
        console.log("qbank =", result);
  
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
"use client";
import { useState, useEffect } from "react";
import { getPost } from "@backend/lib/api/posts";
import { listComments } from "@backend/lib/api/comments";
import { getCompany } from "@backend/lib/api/companies";
import CompanyHeader from "@/app/search-companies/detail/_components/CompanyHeader/CompanyHeader";
import TabNavigation from "@/app/search-companies/detail/_components/TabNavigation/TabNavigation";
import InterviewReviewDetailContent from "./InterviewReviewDetailContent";
import { useRouter } from "next/navigation";



export default function InterviewReviewDetailClient({companySlug,reviewId}){
  const [company, setCompany] = useState(null);
  const [review, setReview] = useState(null);
  const [comments, setComments] = useState([]);

  const fetchComments = async () => {
  const commentData = await listComments(reviewId);
  setComments(commentData.items ?? []);
  };
  
  useEffect(() => {
  async function fetchData() {
    const [companyData, reviewData, commentData] = await Promise.all([
      getCompany(companySlug),
      getPost(reviewId),
      listComments(reviewId),
    ]);

    setCompany(companyData);
    setReview(reviewData);
    setComments(commentData.items ?? []);
    await fetchComments();
  }

  fetchData();
  }, [companySlug, reviewId]);

  const router = useRouter();
  const handleBack = () => {
  router.push(
    `/search-companies/detail/${companySlug}/interview-review`
  );
  };
  
  if (!company || !review) {
    return <div>로딩 중...</div>;
  }


  return(
  <>
    <CompanyHeader company={company} />
    <TabNavigation companySlug={companySlug}/>
    
    <InterviewReviewDetailContent 
    review={review} 
    comments={comments} 
    reloadComments={fetchComments}
    handleBack={handleBack}
    />
  </>
  );
}
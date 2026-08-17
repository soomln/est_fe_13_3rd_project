"use client";
import { useState, useEffect } from "react";
import { getPost } from "@backend/lib/api/posts";
import { listComments } from "@backend/lib/api/comments";
import { getCompany } from "@backend/lib/api/companies";
import CompanyHeader from "@/app/search-companies/detail/_components/CompanyHeader/CompanyHeader";
import TabNavigation from "@/app/search-companies/detail/_components/TabNavigation/TabNavigation";
import InterviewQuestionReviewDetailContent from "./InterviewQuestionReviewDetailContent";

export default function InterviewQuestionReviewDetailClient({companySlug,questionId}){
  const [company, setCompany] = useState(null);
  const [qbank, setQbank] = useState(null);
  const [comments, setComments] = useState([]);

  const fetchComments = async () => {
  const commentData = await listComments(questionId);
  setComments(commentData.items ?? []);
  };


  useEffect(() => {
  async function fetchData() {
    const [companyData, qbankData, commentData] = await Promise.all([
      getCompany(companySlug),
      getPost(questionId),
      listComments(questionId),
    ]);

    setCompany(companyData);
    setQbank(qbankData);
    setComments(commentData.items ?? []);
    await fetchComments();
  }

  fetchData();
  }, [companySlug, questionId]);

  if (!company || !qbank) {
    return <div>로딩 중...</div>;
  }


  return(
  <>
    <CompanyHeader company={company} />
    <TabNavigation />
    <InterviewQuestionReviewDetailContent 
    question={qbank} 
    comments={comments} 
    reloadComments={fetchComments}
    />
  </>
  );
}
"use client";
import { useState, useEffect } from "react";
import { getPost } from "@backend/lib/api/posts";
import { listComments } from "@backend/lib/api/comments";
import { getCompany } from "@backend/lib/api/companies";
import CompanyHeader from "@/app/search-companies/detail/_components/CompanyHeader/CompanyHeader";
import TabNavigation from "@/app/search-companies/detail/_components/TabNavigation/TabNavigation";
import InterviewQuestionReviewDetailContent from "./InterviewQuestionReviewDetailContent";
import { useRouter } from "next/navigation";

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

  const router = useRouter();
  const handleBack = () => {
  router.push(
    `/search-companies/detail/${companySlug}/interview-question`
  );
  };

  if (!company || !qbank) {
    return <div>로딩 중...</div>;
  }


  return(
  <>
    <CompanyHeader company={company} />
    <TabNavigation companySlug={companySlug}/>
    <InterviewQuestionReviewDetailContent 
    question={qbank} 
    comments={comments} 
    reloadComments={fetchComments}
    handleBack={handleBack}
    />
  </>
  );
}
import Header from "@/app/_components/common/Header";
import Footer from "@/app/_components/common/Footer";
import InterviewQuestionReviewDetailClient from "./_components/InterviewQuestionReviewDetailClient";


export default async function InterviewQuestionReviewDetailPage({ params }) {
  const { companySlug, questionId } = await params;

  return (
    <>
      <Header />
      <InterviewQuestionReviewDetailClient
        companySlug={companySlug}
        questionId={questionId}
      />
      <Footer />
    </>
  );
}
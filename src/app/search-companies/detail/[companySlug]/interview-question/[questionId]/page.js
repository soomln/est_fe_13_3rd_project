import InterviewQuestionReviewDetailClient from './_components/InterviewQuestionReviewDetailClient';

export default async function InterviewQuestionReviewDetailPage({ params }) {
  const { companySlug, questionId } = await params;

  return <InterviewQuestionReviewDetailClient companySlug={companySlug} questionId={questionId} />;
}

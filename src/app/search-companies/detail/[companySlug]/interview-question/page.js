import InterviewQuestionReviewClient from './_components/InterviewQuestionReviewClient';

export default async function InterviewQuestionReviewPage({ params }) {
  const { companySlug } = await params;

  return <InterviewQuestionReviewClient companySlug={companySlug} />;
}

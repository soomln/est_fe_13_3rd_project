import InterviewReviewDetailClient from './_components/InterviewReviewDetailClient';

export default async function InterviewReviewDetailPage({ params }) {
  const { companySlug, reviewId } = await params;

  return <InterviewReviewDetailClient companySlug={companySlug} reviewId={reviewId} />;
}

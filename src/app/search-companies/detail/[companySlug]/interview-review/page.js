import InterviewReviewClient from './_components/InterviewReviewClient';

export default async function InterviewReviewPage({ params }) {
  const { companySlug } = await params;

  return <InterviewReviewClient companySlug={companySlug} />;
}

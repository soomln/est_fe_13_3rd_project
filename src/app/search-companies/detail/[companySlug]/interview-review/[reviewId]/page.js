import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import InterviewReviewDetailClient from './_components/InterviewReviewDetailClient';

export default async function InterviewReviewDetailPage({ params }) {
  const { companySlug, reviewId } = await params;

  return (
    <>
      <Header />
      <InterviewReviewDetailClient
        companySlug={companySlug}
        reviewId={reviewId}
      />
      <Footer />
    </>
  );
}
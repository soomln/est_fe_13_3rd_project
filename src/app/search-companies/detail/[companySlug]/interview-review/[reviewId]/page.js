import InterviewReviewDetailClient from './_components/InterviewReviewDetailClient';

export const metadata = {
  title: '면접 후기 | CallBack',
  description: '실제 지원자들의 면접 후기와 합격 경험을 확인해보세요.',

  openGraph: {
    title: '면접 후기 | CallBack',
    description: '실제 지원자들의 면접 후기와 합격 경험을 확인해보세요.',
    type: 'website',
    images: ['/images/OG_Image.png'],
  },
};


export default async function InterviewReviewDetailPage({ params }) {
  const { companySlug, reviewId } = await params;

  return <InterviewReviewDetailClient companySlug={companySlug} reviewId={reviewId} />;
}

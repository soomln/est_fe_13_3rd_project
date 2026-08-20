import InterviewQuestionReviewDetailClient from './_components/InterviewQuestionReviewDetailClient';

export const metadata = {
  title: '면접 족보 | CallBack',
  description: '기업별 실제 면접 질문과 면접 족보를 확인해보세요.',

    openGraph: {
    title: '면접 족보 | CallBack',
    description: '기업별 실제 면접 질문과 면접 족보를 확인해보세요.',
    type: 'website',
    images: ['/images/OG_Image.png'],
  },
};

export default async function InterviewQuestionReviewDetailPage({ params }) {
  const { companySlug, questionId } = await params;

  return <InterviewQuestionReviewDetailClient companySlug={companySlug} questionId={questionId} />;
}

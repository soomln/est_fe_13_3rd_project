import InterviewQuestionReviewClient from './_components/InterviewQuestionReviewClient';

export const metadata = {
  title: '면접 족보 | CallBack',
  description: '기업별 실제 면접 질문과 면접 족보를 확인해보세요.',

    openGraph: {
    title: '면접 족보 | CallBack',
    description: '기업별 실제 면접 질문과 면접 족보를 확인해보세요.',
    type: 'website',
  },
};

export default async function InterviewQuestionReviewPage({ params }) {
  const { companySlug } = await params;

  return <InterviewQuestionReviewClient companySlug={companySlug} />;
}

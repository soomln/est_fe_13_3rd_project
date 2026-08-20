import InterviewPageClient from './InterviewPageClient';

export const metadata = {
  title: 'CallBack | AI 면접',
  description: '이력서와 자기소개서를 기반으로 AI와 함께 면접을 연습해보세요!',

  openGraph: {
    title: 'CallBack | AI 면접',
    description: '이력서와 자기소개서를 기반으로 AI와 함께 면접을 연습해보세요!',
  },
};

export default function InterviewPage() {
  return <InterviewPageClient />;
}

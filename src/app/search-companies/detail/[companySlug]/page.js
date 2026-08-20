import CompanyInfoTab from '@/app/search-companies/detail/_components/CompanyInfoTab';

export const metadata = {
  title: '기업 상세 | CallBack',
  description: '기업 정보부터 면접 후기, 족보까지 확인하고, 나에게 맞는 기업을 찾아보세요!',

  openGraph: {
    title: '기업 상세 | CallBack',
    description: '기업 정보부터 면접 후기, 족보까지 확인하고, 나에게 맞는 기업을 찾아보세요!',
    type: 'website',
  },
};

export default function CompanyDetailPage() {
  return <CompanyInfoTab />;
}

import CompanyInfoTab from '@/app/search-companies/detail/_components/CompanyInfoTab';

export const metadata = {
  title: 'CallBack',
  description: '개발자를 위한 취업 준비 플랫폼. 당신의 취업 준비를 최적화 하세요!',

  openGraph: {
    title: 'CallBack',
    description: '개발자를 위한 취업 준비 플랫폼. 당신의 취업 준비를 최적화 하세요!',
    type: 'website',
    images: ['/images/OG_Image.png'],
  },
};

export default function CompanyDetailPage() {
  return <CompanyInfoTab />;
}

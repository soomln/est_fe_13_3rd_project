'use client';

import Benefits from '@/app/search-companies/detail/_components/Benefits';
import CompanyHighlights from '@/app/search-companies/detail/_components/CompanyHighlights';
import CompanyInfoList from '@/app/search-companies/detail/_components/CompanyInfoList';
import CompanyInfoSkeleton from '../CompanyInfoSkeleton/CompanyInfoSkeleton';
import CompanyIntro from '@/app/search-companies/detail/_components/CompanyIntro';
import CompanyNews from '@/app/search-companies/detail/_components/CompanyNews';
import CoreValues from '@/app/search-companies/detail/_components/CoreValues';
import MainServices from '@/app/search-companies/detail/_components/MainServices';
import RecruitBanner from '@/app/search-companies/detail/_components/RecruitBanner';
import { useCompany } from '@/app/search-companies/detail/_components/CompanyShell';
import styles from './CompanyInfoTab.module.sass';

// 기업 정보 탭
export default function CompanyInfoTab() {
  const { company, status } = useCompany();

  if (status === 'error') {
    return <p className={styles.info_state}>기업 정보를 불러오지 못했습니다.</p>;
  }

  if (!company) {
    return <CompanyInfoSkeleton />;
    // return <p className={styles.info_state}>불러오는 중...</p>;
  }

  return (
    <div className={styles.info}>
      <div className={styles.info_main}>
        <CompanyIntro intro={company.intro} />
        <CoreValues values={company.values ?? []} />
        <MainServices services={company.services ?? []} />
        <Benefits benefits={company.benefits ?? []} />
      </div>

      <aside className={styles.info_side}>
        <CompanyInfoList company={company} />
        <CompanyHighlights summary={company.summary ?? []} />
        <CompanyNews news={company.news ?? []} />
        <RecruitBanner companyName={company.name} homepage={company.homepage} />
      </aside>
    </div>
  );
}

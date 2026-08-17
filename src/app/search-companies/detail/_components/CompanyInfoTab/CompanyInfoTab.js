'use client';

import { useCompany } from '@/app/search-companies/detail/_components/CompanyShell';
import LeftContent from '@/app/search-companies/detail/_components/LeftContent/LeftContent';
import RightSidebar from '@/app/search-companies/detail/_components/RightSidebar/RightSidebar';
import styles from './CompanyInfoTab.module.sass';

// 기업 정보 탭
export default function CompanyInfoTab() {
  const { company, status } = useCompany();

  if (status === 'error') {
    return <p className={styles.info_state}>기업 정보를 불러오지 못했습니다.</p>;
  }

  if (!company) {
    return <p className={styles.info_state}>불러오는 중...</p>;
  }

  return (
    <div className={styles.info}>
      <div className={styles.info_main}>
        <LeftContent company={company} />
      </div>

      <aside className={styles.info_side}>
        <RightSidebar company={company} />
      </aside>
    </div>
  );
}

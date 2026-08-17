'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { getCompany } from '@backend/lib/api/companies';
import CompanyHeader from '@/app/search-companies/detail/_components/CompanyHeader';
import CompanySummaryCards from '@/app/search-companies/detail/_components/CompanySummaryCards';
import TabNavigation from '@/app/search-companies/detail/_components/TabNavigation';
import styles from './CompanyShell.module.sass';

const CompanyContext = createContext({ company: null, companySlug: '', status: 'loading' });

// 기업 상세 하위 페이지에서 기업 정보를 꺼내 쓴다
export function useCompany() {
  return useContext(CompanyContext);
}

// 기업 상세 공용 셸. 기업 정보를 한 번만 조회해 헤더/탭과 하위 페이지에 공급한다
export default function CompanyShell({ companySlug, children }) {
  const [company, setCompany] = useState(null);
  const [status, setStatus] = useState('loading');

  const pathname = usePathname();
  const isWritePage = pathname.endsWith('/write');

  useEffect(() => {
    let ignore = false;

    async function fetchCompany() {
      try {
        const data = await getCompany(companySlug);

        if (ignore) return;

        setCompany(data);
        setStatus('ready');
      } catch (error) {
        console.error(error);

        if (!ignore) setStatus('error');
      }
    }

    fetchCompany();

    return () => {
      ignore = true;
    };
  }, [companySlug]);

  return (
    <main className={styles.shell}>
      <div className={`container ${styles.shell_inner}`}>
        <CompanyHeader company={company} />

        {!isWritePage && <CompanySummaryCards company={company} />}

        <TabNavigation companySlug={companySlug} />

        <CompanyContext.Provider value={{ company, companySlug, status }}>{children}</CompanyContext.Provider>
      </div>
    </main>
  );
}

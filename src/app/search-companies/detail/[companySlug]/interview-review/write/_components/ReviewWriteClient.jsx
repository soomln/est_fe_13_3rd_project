"use client"
import { useState, useEffect } from 'react';

import CompanyHeader from '@/app/search-companies/detail/_components/CompanyHeader/CompanyHeader';
import TabNavigation from '@/app/search-companies/detail/_components/TabNavigation/TabNavigation';
import ReviewWriteForm from './ReviewWriteForm';
import { getCompany } from '@backend/lib/api/companies';

export default function ReviewWriteClient({companySlug}){
  const [company, setCompany] = useState(null);

  useEffect(() => {
  async function fetchData() {
    const [companyData] = await Promise.all([
      getCompany(companySlug),
    ]);

    setCompany(companyData);
  }

  fetchData();
  }, [companySlug]);

  if (!company) {
    return <div>로딩 중...</div>;
  }

  return(
    <>
      <CompanyHeader company={company}/>
      <TabNavigation/>
      <ReviewWriteForm company={company}/>
    </>
  );
}
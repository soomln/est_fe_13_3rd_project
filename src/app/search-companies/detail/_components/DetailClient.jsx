"use client";
// import company from '../data/company';


import { useEffect, useState } from "react";
import { getCompany } from "@backend/lib/api/companies";
import CompanyHeader from '../_components/CompanyHeader/CompanyHeader';
import TabNavigation from '../_components/TabNavigation/TabNavigation';
import LeftContent from '../_components/LeftContent/LeftContent';
import RightSidebar from '../_components/RightSidebar/RightSidebar';

export default function DetailClient({ companySlug }) {
  const [company, setCompany] = useState(null);

  useEffect(() => {
    async function fetchCompany() {
      const data = await getCompany(companySlug);
      setCompany(data);
    }

    fetchCompany();
  }, [companySlug]);

  if (!company) return <div>Loading...</div>;

  return (
    <>
      <CompanyHeader company={company} />
      <TabNavigation />
      <LeftContent company={company} />
      <RightSidebar company={company} />
    </>
  );

}
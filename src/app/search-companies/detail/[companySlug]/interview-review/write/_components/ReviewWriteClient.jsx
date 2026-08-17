"use client"

import { useCompany } from '@/app/search-companies/detail/_components/CompanyShell';
import ReviewWriteForm from './ReviewWriteForm';

export default function ReviewWriteClient(){
  const { company } = useCompany();

  if (!company) {
    return <p>불러오는 중...</p>;
  }

  return <ReviewWriteForm company={company} />;
}

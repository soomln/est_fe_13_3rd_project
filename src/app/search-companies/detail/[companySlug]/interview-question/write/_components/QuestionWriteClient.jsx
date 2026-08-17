"use client"

import { useCompany } from '@/app/search-companies/detail/_components/CompanyShell';
import QuestionWriteForm from './QuestionWriteForm';

export default function QuestionWriteClient(){
  const { company } = useCompany();

  if (!company) {
    return <p>불러오는 중...</p>;
  }

  return <QuestionWriteForm company={company} />;
}

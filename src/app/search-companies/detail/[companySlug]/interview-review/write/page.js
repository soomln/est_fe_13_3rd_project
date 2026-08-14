import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer'; 
import { getCompany } from '@backend/lib/api/companies';
import { createPost } from '@backend/lib/api/posts';

import ReviewWriteClient from './_components/ReviewWriteClient';


export default async function InterviewReviewWrite({ params }){
   const { companySlug } = await params;

  return(
    <>
      <Header/>
      <ReviewWriteClient companySlug={companySlug}/>
      <Footer/>
    </>
  );
}
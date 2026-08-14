import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer'; 

import QuestionWriteClient from './_components/QuestionWriteClient';

export default async function InterviewQuestionWrite({ params }){
  const { companySlug } = await params;
  
  return(
    <>
      <Header/>
      <QuestionWriteClient companySlug={companySlug}/>
      <Footer/>
    </>
  );
}
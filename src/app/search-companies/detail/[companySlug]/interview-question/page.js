import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import InterviewQuestionReviewClient from './_components/InterviewQuestionReviewClient';


export default async function InterviewQuestionReviewPage({params}){
  const { companySlug } = await params;
  return(
    <div>
      <Header/>
      <InterviewQuestionReviewClient companySlug={companySlug}/>
      <Footer/>
    </div>
  );
}
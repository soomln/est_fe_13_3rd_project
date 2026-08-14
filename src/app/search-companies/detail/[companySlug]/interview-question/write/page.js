import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer'; 
import company from '../../../data/company';
import CompanyHeader from '../../../_components/CompanyHeader/CompanyHeader';
import TabNavigation from '../../../_components/TabNavigation/TabNavigation';
import QuestionWriteForm from './_components/QuestionWriteForm';

export default function InterviewQuestionWrite(){
  return(
    <>
      <Header/>
      <CompanyHeader company={company}/>
      <TabNavigation/>
      <QuestionWriteForm />
      <Footer/>
    </>
  );
}
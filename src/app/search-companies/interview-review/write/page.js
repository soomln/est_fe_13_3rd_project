import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer'; 
import company from "../../detail/data/company";
import CompanyHeader from '../../detail/_components/CompanyHeader/CompanyHeader';
import TabNavigation from '../../detail/_components/TabNavigation/TabNavigation';
import ReviewWriteForm from './_components/ReviewWriteForm';

export default function InterviewReviewWrite(){
  return(
    <>
      <Header/>
      <CompanyHeader company={company}/>
      <TabNavigation/>
      <ReviewWriteForm/>
      <Footer/>
    </>
  );
}
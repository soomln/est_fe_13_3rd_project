import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import company from "../data/company";
import CompanyHeader from "../components/CompanyHeader/CompanyHeader";
import TabNavigation from "../components/TabNavigation/TabNavigation";

export default function InterviewReviewPage(){
  return(
    <div>
      <Header/>
      <CompanyHeader company={company}/>
      <TabNavigation/>
      <Footer/>
    </div>
  );
}
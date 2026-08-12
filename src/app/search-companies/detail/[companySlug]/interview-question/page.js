import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import company from "../../data/company";
import reviews from "../../../data/review";
import CompanyHeader from "../../_components/CompanyHeader/CompanyHeader";
import TabNavigation from "../../_components/TabNavigation/TabNavigation";
import Pagination from '@/app/_components/common/Pagination';
import InterviewQuestionReviewCard from '../../../_components/InterviewQuestionReviewCard';
import InterviewFilter from '../../../_components/InterviewFilter';
import ReviewCard from '@/app/_components/common/ReviewCard';


export default function InterviewQuestionReviewPage(){
  return(
    <div>
      <Header/>
      <CompanyHeader company={company}/>
      <TabNavigation/>
      <InterviewFilter/>
      <button type='button'>글 작성하기</button>
      {reviews.map((review) => (
      // <InterviewQuestionReviewCard
      //   key={review.id}
      //   review={review}
      // />
      <ReviewCard 
        key={review.id}
        review
      />
      ))}
      <Pagination/>
      <Footer/>
    </div>
  );
}
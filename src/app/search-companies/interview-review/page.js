import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import company from "../detail/data/company";
import reviews from "../data/review";
import CompanyHeader from "../detail/_components/CompanyHeader/CompanyHeader";
import TabNavigation from "../detail/_components/TabNavigation/TabNavigation";
import Pagination from '@/app/_components/common/Pagination';
import InterviewStatistics from '../_components/InterviewStatistics';
import InterviewReviewCard from '../_components/InterviewReviewCard';
import InterviewFilter from '../_components/InterviewFilter';
import ReviewCard from '@/app/_components/common/ReviewCard';

const chartData = [
  {
    label: "긍정",
    value: 60,
    color: "#8B5CF6",
  },
  {
    label: "보통",
    value: 25,
    color: "#22C55E",
  },
  {
    label: "부정",
    value: 15,
    color: "#FACC15",
  },
];

const interviewRoutes = [
  { label: "온라인 지원", value: 70 },
  { label: "지인 추천", value: 70 },
  { label: "학교 추천", value: 70 },
  { label: "채용 박람회", value: 70 },
  { label: "채용 담당자 제안", value: 70 },
  { label: "기타", value: 70 },
];


export default function InterviewReviewPage(){
  return(
    <div>
      <Header/>
      <CompanyHeader company={company}/>
      <TabNavigation/>
      <InterviewStatistics chartData={chartData} interviewRoutes={interviewRoutes}/>
      <InterviewFilter/>
      <button type='button'>글 작성하기</button>
      {reviews.map((review) => (
      // <InterviewReviewCard
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
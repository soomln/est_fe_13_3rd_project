import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import company from "../data/company";
import CompanyHeader from "../_components/CompanyHeader/CompanyHeader";
import TabNavigation from "../_components/TabNavigation/TabNavigation";
import Pagination from '@/app/_components/common/Pagination';
import InterviewStatistics from '../../_components/InterviewStatistics';
import InterviewReviewCard from '../../_components/InterviewReviewCard';

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

const reviews = [
  {
    id: 1,
    job: "개발",
    education: "대졸",
    date: "2026.07.23",
    difficulty: "보통",
    result: "합격",
    route: "잡코리아",
    title: "생각보다 편했던 면접",
    content: "면접관분들이 편하게 분위기를 만들어 주셔서 긴장이 많이 풀렸습니다.",
    bookmark: 500,
    comment: 10,
  },
  {
    id: 2,
    job: "개발",
    education: "대졸",
    date: "2026.07.23",
    difficulty: "보통",
    result: "합격",
    route: "잡코리아",
    title: "생각보다 편했던 면접",
    content: "면접관분들이 편하게 분위기를 만들어 주셔서 긴장이 많이 풀렸습니다.",
    bookmark: 500,
    comment: 10,
  },
  {
    id: 3,
    job: "개발",
    education: "대졸",
    date: "2026.07.23",
    difficulty: "보통",
    result: "합격",
    route: "잡코리아",
    title: "생각보다 편했던 면접",
    content: "면접관분들이 편하게 분위기를 만들어 주셔서 긴장이 많이 풀렸습니다.",
    bookmark: 500,
    comment: 10,
  },
];


export default function InterviewReviewPage(){
  return(
    <div>
      <Header/>
      <CompanyHeader company={company}/>
      <TabNavigation/>
      <InterviewStatistics chartData={chartData} interviewRoutes={interviewRoutes}/>
      {reviews.map((review) => (
      <InterviewReviewCard
        key={review.id}
        review={review}
      />
      ))}
      <Pagination/>
      <Footer/>
    </div>
  );
}
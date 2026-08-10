import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import company from "../../detail/data/company";
import questions from '../../data/questions';
import CompanyHeader from '../../detail/_components/CompanyHeader/CompanyHeader';
import TabNavigation from '../../detail/_components/TabNavigation/TabNavigation';
import InterviewQuestionDetailContent from './_components/InterviewQuestionDetailContent';

export default async function InterviewDetail({ params }) {
  const { questionId } = await params;

  const question = questions.find(
    (item) => item.id === Number(questionId)
  );

  return (
    <div>
      <Header />
      <CompanyHeader company={company} />
      <TabNavigation />
      <InterviewQuestionDetailContent question={question}/>
      
      <Footer />
    </div>
  );
}
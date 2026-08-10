import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import company from "../../detail/data/company";
import reviews from '../../data/review';
import CompanyHeader from '../../detail/_components/CompanyHeader/CompanyHeader';
import TabNavigation from '../../detail/_components/TabNavigation/TabNavigation';

export default async function InterviewDetail({ params }) {
  const { questionId } = await params;

  const review = reviews.find(
    (item) => item.id === Number(questionId)
  );

  return (
    <div>
      <Header />
      <CompanyHeader company={company} />
      <TabNavigation />
      
      <Footer />
    </div>
  );
}
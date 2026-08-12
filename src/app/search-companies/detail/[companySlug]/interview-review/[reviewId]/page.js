import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import company from "../../detail/data/company";
import reviews from '../../data/review';
import CompanyHeader from '../../detail/_components/CompanyHeader/CompanyHeader';
import TabNavigation from '../../detail/_components/TabNavigation/TabNavigation';
import InterviewReviewDetailContent from './_components/InterviewReviewDetailContent';

export default async function InterviewReviewDetailPage({ params }) {
  const { reviewId } = await params;

  const review = reviews.find(
    (item) => item.id === Number(reviewId)
  );

  return (
    <div>
      <Header />
      <CompanyHeader company={company} />
      <TabNavigation />
      <InterviewReviewDetailContent review={review} />
      <Footer />
    </div>
  );
}
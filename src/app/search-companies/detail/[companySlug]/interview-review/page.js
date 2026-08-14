import Header from "@/app/_components/common/Header";
import Footer from "@/app/_components/common/Footer";
import InterviewReviewClient from "./_components/InterviewReviewClient";



export default async function InterviewReviewPage({ params }) {
  const { companySlug } = await params;

  return (
    <div>
      <Header />
      <InterviewReviewClient companySlug={companySlug} />
      <Footer />
    </div>
  );
}
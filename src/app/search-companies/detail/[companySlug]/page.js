
import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';

import DetailClient from '../_components/DetailClient';

export default async function DetailPage({ params }) {
  const { companySlug } = await params;

  return (
    <div>
      <Header />

      <DetailClient companySlug={companySlug} />

      <Footer />
    </div>
  );
}


import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';

export default function SearchCompaniesLayout({ children }) {
  return (
    <>
      <Header />

      {children}

      <Footer />
    </>
  );
}

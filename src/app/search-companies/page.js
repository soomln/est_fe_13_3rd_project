import styles from './page.module.sass';
import Header from '../_components/common/Header';
import Footer from '../_components/common/Footer';
import SearchCompaniesClient from './_components/SearchCompaniesClient';
import Pagination from '../_components/common/Pagination';



export default function SearchCompaniesPage() {
  return (
    <div>
      <Header />
      <SearchCompaniesClient/>
      <Pagination/>
      <Footer/>
    </div>
  );

  
}

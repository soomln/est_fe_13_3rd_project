import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import company from './data/company';
import CompanyHeader from './_components/CompanyHeader/CompanyHeader';
import TabNavigation from './_components/TabNavigation/TabNavigation';
import LeftContent from './_components/LeftContent/LeftContent';
import RightSidebar from './_components/RightSidebar/RightSidebar';


export default function detail(){
  return (
    <div>
      <Header/>
      <CompanyHeader company={company}/>
      <TabNavigation/>

      <div>
        <LeftContent company={company}/>
        <RightSidebar company={company}/>
      </div>

      <Footer/>
    </div>
  );
}
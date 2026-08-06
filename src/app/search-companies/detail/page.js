import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import company from './data/company';
import CompanyHeader from './components/CompanyHeader/CompanyHeader';
import TabNavigation from './components/TabNavigation/TabNavigation';
import LeftContent from './components/LeftContent/LeftContent';
import RightSidebar from './components/RightSidebar/RightSidebar';


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
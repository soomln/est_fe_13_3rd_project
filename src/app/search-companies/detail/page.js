import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import CompanyHeader from './components/CompanyHeader/CompanyHeader';
import TabNavigation from './components/TabNavigation';
import Content from './components/Content';

const company = {
  name: "이스트소프트",
  logo: "/images/estSoft 1.png",
  industry: "IT / 소프트웨어",
  rating: 4.9,
};


export default function detail(){
  return (
    <div>
      <Header/>
      <CompanyHeader/>
      <TabNavigation/>
      <Content/>
      <Footer/>
    </div>
  );
}
import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import CompanyHeader from './components/CompanyHeader/CompanyHeader';
import TabNavigation from './components/TabNavigation/TabNavigation';
import LeftContent from './components/LeftContent/LeftContent';
import RightSidebar from './components/RightSidebar/RightSidebar';


const company = {
  name: "이스트소프트",
  logo: "/images/estSoft 1.png",
  industry: "IT / 소프트웨어",
  rating: 4.9,
  hire: "상시 채용",
  favorite: 100,
  review: 100,
  jokbo: 100,
  passrate: 100,
  tags: ["AI", "클라우드", "핀테크"],
};


export default function detail(){
  return (
    <div>
      <Header/>
      <CompanyHeader company={company}/>
      <TabNavigation/>

      <div>
        <LeftContent/>
        <RightSidebar/>
      </div>

      <Footer/>
    </div>
  );
}
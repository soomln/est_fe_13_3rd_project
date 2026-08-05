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
  intro:
  "이스트소프트는 AI와 소프트웨어 기술을 기반으로...",

  values: [
    {
      title: "성장",
      description: "개인의 성장을 지원"
    },
    {
      title: "기술 혁신",
      description: "끊임없는 연구"
    }
  ],

  services: [
    {
      Image: "/images/estSoft 1.png",
      description: "알약",
    },
    {
      Image: "/images/estSoft 1.png",
      description: "알약",
    },
    {
      Image: "/images/estSoft 1.png",
      description: "알약",
    },
    {
      Image: "/images/estSoft 1.png",
      description: "알약",
    },
    {
      Image: "/images/estSoft 1.png",
      description: "알약",
    },
  ],

  benefits: [
    {
      title: "식대 지원",
      description: "기숙사·주거비 식비 지원"
    },
    {
      title: "건강검진",
      description: "건강검진·의료비보험 지원"
    },
    {
      title: "교육비 지원",
      description: "육아휴직·출산 경조사 지원"
    }
  ]
};


export default function detail(){
  return (
    <div>
      <Header/>
      <CompanyHeader company={company}/>
      <TabNavigation/>

      <div>
        <LeftContent company={company}/>
        <RightSidebar/>
      </div>

      <Footer/>
    </div>
  );
}
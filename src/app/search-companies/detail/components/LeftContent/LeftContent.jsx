export default function LeftContent(){

  const company = {
    name: "이스트소프트",
    industry: "IT / 소프트웨어",
    rating: 4.9,
    favorite: 100,
    review: 100,
    jokbo: 100,

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
      "알약",
      "줌",
      "AI Studio"
    ],

    benefits: [
      "식대 지원",
      "건강검진",
      "교육비 지원"
    ]
  };


  return(
    <>
      <section>
        <h2>기업 소개</h2>
        <p>회사 소개 내용...</p>
      </section>

      <section>
        <h2>핵심 가치</h2>

        <ValueCard />
        <ValueCard />
        <ValueCard />
        <ValueCard />
      </section>

      <section>
        <h2>주요 서비스</h2>

        <ServiceCard />
        <ServiceCard />
        <ServiceCard />
      </section>

      <section>
        <h2>복지 및 혜택</h2>

        <BenefitItem />
        <BenefitItem />
        <BenefitItem />
      </section>
    </>
  );
}
import InfoRow from "./InfoRow";
import NewsItem from "./NewsItem";
import CompanySummary from "./CompanySummary";
import "./RightSidebar.module.sass";

export default function RightSidebar({company}){
  return(
    <>
    <h1>=========RightSidebar==========</h1>
      <section>
          <h2>기업 기본 정보</h2>
          <InfoRow company={company}/>
      </section>

      <section>
        <h2>기업 한눈에 보기</h2>
        <div>
          {company.summary.map((item) => (
            <CompanySummary
              key={item.description}
              summaryItem={item}
            />
          ))}
        </div>
      </section>

      <section>
        <h2>기업 뉴스</h2>
        <div>
          {company.news.map((item) => (
            <NewsItem
              key={item.title}
              news={item}
            />
          ))}
        </div>
      </section>

      <section>
        <h2>배너</h2>
      </section>  
    </>
  );
}
import "./CompanyHeader.module.sass";
import SummaryCard from "../SummaryCard/SummaryCard";



export default function CompanyHeader({company}){

  const summary = [
    { title: "면접 채용", value: "상시 채용" },
    { title: "평균 난이도", value: company.rating },
    { title: "관심 기업 등록", value: company.favorite },
    { title: "전체 후기", value: company.review },
    { title: "족보", value: company.jokbo },
  ];

  return(
    <>
      <section className="topInfo">
        <div className="companyInfo">
          <img src={company.logo} alt={company.name} />
          <h1>{company.name}</h1>
          <p>{company.industry}</p>
          <div className="tags">
            {company.tags.map((tag) => (
              <span key={tag}>#{tag}</span>
            ))}
          </div>
        </div>

        <div className="statistics">
          <div>
            <span>전체 후기</span>
            <strong>{company.review}건</strong>
          </div>

          <div>
            <span>평균 난이도</span>
            <strong>{company.rating}/5.0</strong>
          </div>

          <div>
            <span>합격률</span>
            <strong>{company.passrate}%</strong>
          </div>
        </div>
      </section>
      <div className="summaryCards">
        {summary.map((item) => (
          <SummaryCard
            key={item.title}
            title={item.title}
            value={item.value}
          />
        ))}
      </div>
    </>
  );
}
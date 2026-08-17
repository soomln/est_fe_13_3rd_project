import ValueCard from "./ValueCard";
import ServiceCard from "./ServiceCard";
import BenefitItem from "./BenefitItem";

export default function LeftContent({company}){

  return(
    <>
      <section>
        <h2>기업 소개</h2>
        <p>회사 소개 내용...</p>
      </section>

      <section>
        <h2>-핵심 가치-</h2>
        <div className="valueList">
          {company.values.map((value) => (
            <ValueCard
              key={value.title}
              value={value}
            />
          ))}
        </div>
      </section>

      <section>
        <h2>-주요 서비스-</h2>
        <div className="serviceList">
          {company.services.map((service) => (
            <ServiceCard
              key={service.description}
              service={service}
            />
          ))}
        </div>
      </section>

      <section>
        <h2>복지 및 혜택</h2>
        <div className="benefitList">
          {company.benefits.map((benefit) => (
            <BenefitItem
              key={benefit.description}
              benefit={benefit}
            />
          ))}
        </div>
      </section>
    </>
  );
}
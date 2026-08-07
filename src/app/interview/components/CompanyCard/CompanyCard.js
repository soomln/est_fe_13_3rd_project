import Image from 'next/image';
import './CompanyCard.sass';

export default function CompanyCard({
  logo,
  companyName,
  position,
  salary,
  rating,
  onClick,
}) {
  return (
    <button className="company_card" onClick={onClick}>
      <div className="company_logo">
        <Image
          src={logo}
          alt={companyName}
          width={80}
          height={80}
        />
      </div>

      <div className="company_info">
        <div className="company_title font_body_m_b">
          <span>{companyName}</span>
          <span className="position">{position}</span>
        </div>

        <div className="company_detail">
          <div className="detail_item">
            <span className="label font_body_m_r">평균 연봉</span>
            <span className="value font_body_m_r">{salary}</span>
          </div>

          <div className="detail_item rating">
            <span className="label font_body_m_r">기업 평점</span>

            <span className="material-symbols-rounded star">
              star
            </span>

            <span className="value font_body_m_r">{rating}</span>
          </div>
        </div>
      </div>
    </button>
  );
}
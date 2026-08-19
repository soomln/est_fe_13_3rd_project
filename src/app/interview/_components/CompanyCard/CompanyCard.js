import Image from 'next/image';
import styles from './CompanyCard.module.sass';

export default function CompanyCard({
  logo,
  companyName,
  position,
  salary,
  rating,
  onClick,
}) {
  return (
    <button className={styles.company_card} onClick={onClick}>
      <span className={styles.company_logo}>
        <Image
          src={logo}
          alt={companyName}
          width={60}
          height={60}
        />
      </span>

      <span className={styles.company_content}>
        <span className={`${styles.company_title} font_body_m_b`}>
          <span className={styles.company_name}>
            {companyName}
          </span>

          <span className="position">
            {position}
          </span>
        </span>

        <span className={styles.company_detail}>
          <span className={styles.detail_item}>
            <span className={`${styles.label} font_body_m_r`}>
              평균 연봉
            </span>

            <span className={`${styles.value} font_body_m_b`}>
              {salary}
            </span>
          </span>

          <span className={styles.divider} />

          <span className={styles.detail_item}>
            <span className={`${styles.label} font_body_m_r`}>
              기업 평점
            </span>

            <span className={`material-symbols-rounded ${styles.star}`}>
              grade
            </span>

            <span className={`${styles.value} font_body_m_b`}>
              {rating}
            </span>
          </span>
        </span>
      </span>
    </button>
  );
}
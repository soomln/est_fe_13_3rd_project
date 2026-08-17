import Link from 'next/link';

import BookmarkBtn from '@/app/_components/common/BookmarkBtn';
import styles from './CompanyCard.module.sass';

// 기업 카드. hover 하면 로고 자리에 지표가 나온다
export default function CompanyCard({
  company,
  href,
  isSelected = false,
  onToggle,
  showBookmark = false,
  isBookmarked,
  onBookmarkClick,
}) {
  const { name, rating, avgSalary } = company;

  // 목록 API 는 logo/category/employees/review/jokbo, 마이페이지 스크랩은 logoUrl/industry/... 로 내려온다
  const logoUrl = company.logoUrl ?? company.logo;
  const industry = company.industry ?? company.category;
  const employeeCount = company.employeeCount ?? company.employees;
  const reviewCount = company.reviewCount ?? company.review;
  const qbankCount = company.qbankCount ?? company.jokbo;

  const card = (
    <div className={`${styles.company_card} ${isSelected ? styles.company_card_selected : ''}`}>
      {onToggle && (
        <label
          className={styles.company_card_check}
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <input type='checkbox' checked={isSelected} onChange={onToggle} aria-label={`${name} 선택`} />
          <span className='material-symbols-sharp' aria-hidden='true'>
            check
          </span>
        </label>
      )}

      {showBookmark && (
        <div className={styles.company_card_bookmark}>
          <BookmarkBtn size={32} isActive={isBookmarked} onClick={onBookmarkClick} />
        </div>
      )}

      <div className={styles.company_card_logo}>
        {logoUrl ? <img src={logoUrl} alt='' /> : <span className={styles.company_card_logo_dummy} />}
      </div>

      <div className={styles.company_card_name}>
        <p className={`${styles.company_card_title} font_body_l_b`}>{name}</p>
        <p className={`${styles.company_card_industry} font_body_s_b`}>{industry}</p>
      </div>

      <dl className={styles.company_card_stats}>
        <div className={styles.company_card_stat}>
          <dt className='font_body_m_r'>평균 연봉</dt>
          <dd className='font_body_m_r'>{avgSalary ?? '-'}</dd>
        </div>

        <div className={styles.company_card_stat}>
          <dt className='font_body_m_r'>기업 평점</dt>
          <dd className={`${styles.company_card_rating} font_body_m_r`}>
            <span className='material-symbols-sharp' aria-hidden='true'>
              star
            </span>
            {rating ?? '-'}
          </dd>
        </div>

        <div className={styles.company_card_stat}>
          <dt className='font_body_m_r'>사원 수</dt>
          <dd className='font_body_m_r'>{employeeCount == null ? '-' : `${employeeCount}명`}</dd>
        </div>

        <div className={styles.company_card_stat}>
          <dt className='font_body_m_r'>후기</dt>
          <dd className='font_body_m_r'>{reviewCount ?? 0}</dd>
        </div>

        <div className={styles.company_card_stat}>
          <dt className='font_body_m_r'>족보</dt>
          <dd className='font_body_m_r'>{qbankCount ?? 0}</dd>
        </div>
      </dl>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={styles.company_card_link}>
        {card}
      </Link>
    );
  }

  return card;
}

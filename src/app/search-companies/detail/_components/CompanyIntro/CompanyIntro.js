import styles from './CompanyIntro.module.sass';

// 기업 소개
export default function CompanyIntro({ intro }) {
  return (
    <section className={styles.intro}>
      <div className={styles.intro_text}>
        <h2 className='font_h3'>기업 소개</h2>
        <p className='font_body_l_r'>{intro || '등록된 기업 소개가 없습니다.'}</p>
      </div>

      <img className={styles.intro_image} src='/images/search-companies/company-intro.png' alt='' />
    </section>
  );
}

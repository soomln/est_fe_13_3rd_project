import styles from './MainServices.module.sass';

// 주요 서비스
export default function MainServices({ services }) {
  if (services.length === 0) return null;

  return (
    <section className={styles.services}>
      <h2 className='font_h3'>주요 서비스</h2>

      <ul className={styles.services_list}>
        {services.map((service) => (
          <li key={service.name} className={styles.services_card}>
            <div className={styles.services_logo}>
              {service.logo && <img src={service.logo} alt={service.name} />}
            </div>

            <a
              className={`${styles.services_link} font_caption_r`}
              href={service.link ?? '#'}
              target='_blank'
              rel='noreferrer'
            >
              자세히보기
              <span className='material-symbols-rounded' aria-hidden='true'>
                arrow_right
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}

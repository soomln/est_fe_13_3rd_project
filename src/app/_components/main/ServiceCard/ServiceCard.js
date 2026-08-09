import Link from 'next/link';
import styles from './ServiceCard.module.sass';

export default function ServiceCard({ icon, title, description, href }) {
  return (
    <li className={styles.service_card}>
      <span className={`material-symbols-rounded ${styles.service_icon}`} aria-hidden='true'>
        {icon}
      </span>

      <h3 className={`font_body_l_b ${styles.service_title}`}>{title}</h3>
      <p className={`font_body_s_r ${styles.service_desc}`}>{description}</p>

      <Link href={href} className={`font_body_s_b ${styles.service_link}`}>
        작성하기
        <span className='material-symbols-rounded' aria-hidden='true'>
          arrow_forward
        </span>
      </Link>
    </li>
  );
}

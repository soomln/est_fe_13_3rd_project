import Link from 'next/link';
import Image from 'next/image';
import styles from './ServiceCard.module.sass';

export default function ServiceCard({
  iconSrc = '/images/services/resume.svg',
  title = '이력서/자소서',
  description = 'AI와 무료 양식으로\n완성도 높게 작성하세요.',
  href = '#',
  tone = 'green',
}) {
  return (
    <div className={styles.card}>
      <div className={`${styles.icon_box} ${styles[`tone_${tone}`]}`}>
        <Image src={iconSrc} alt='' width={50} height={50} className={styles.icon} />
      </div>

      <div className={styles.text_box}>
        <p className={`font_body_m_b ${styles.title}`}>{title}</p>
        <p className={`font_body_s_r ${styles.description}`}>{description}</p>
      </div>

      <Link href={href} className={`font_caption_b ${styles.link}`}>
        작성하기
      </Link>
    </div>
  );
}

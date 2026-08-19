import styles from './ServiceIntro.module.sass';

export default function ServiceIntro({
  eyebrow = 'SERVICES',
  title = '취업 준비의 모든 것',
  description = '개발자 취업에 필요한 모든 도구를 한 플랫폼에서',
}) {
  return (
    <div className={styles.service_intro}>
      <p className={`font_h4 ${styles.eyebrow}`}>{eyebrow}</p>
      <h2 className={`font_h1 ${styles.title}`}>{title}</h2>
      <p className={`font_body_l_r ${styles.description}`}>{description}</p>
    </div>
  );
}

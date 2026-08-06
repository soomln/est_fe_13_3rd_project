import styles from './ServiceIntro.module.sass';

/**
 * [홈] 서비스 섹션 인트로 (라벨 + 제목 + 설명)
 */
export default function ServiceIntro({
  eyebrow = 'SERVICES',
  title = '취업 준비의 모든 것',
  description = '개발자 취업에 필요한 모든 도구를 한 플랫폼에서',
}) {
  return (
    <div className={styles.service_intro}>
      <p className={styles.eyebrow}>{eyebrow}</p>
      <h2 className={styles.title}>{title}</h2>
      <p className={styles.description}>{description}</p>
    </div>
  );
}

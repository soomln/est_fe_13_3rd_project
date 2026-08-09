import styles from './CommunityPostItem.module.sass';

export default function CommunityPostItem({
  title = '백엔드 스터디',
  tag = 'Spring Boot · Java',
  status = '모집중',
}) {
  return (
    <div className={styles.item}>
      <div className={styles.text}>
        <p className={styles.title}>{title}</p>
        <p className={styles.tag}>{tag}</p>
      </div>

      <span className={styles.status}>{status}</span>
    </div>
  );
}

import styles from "./CompanyInfoSkeleton.module.sass";

export default function CompanyInfoSkeleton() {
  return (
    <div className={styles.info}>
      <div className={styles.main}>
        <div className={styles.block}></div>
        <div className={styles.block}></div>
        <div className={styles.block}></div>
      </div>

      <aside className={styles.side}>
        <div className={styles.card}></div>
        <div className={styles.card}></div>
      </aside>
    </div>
  );
}
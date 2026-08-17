import styles from './ProgressBar.module.sass';

export default function ProgressBar({ value, grade = '', max = 5 }) {
  const percent = (value / max) * 100;

  return (
    <div className={styles.difficulty}>

      <div className={styles.score}>
        <h2>{value}</h2>
        <p>{grade}</p>
      </div>

      <div className={styles.barSection}>

        <div className={styles.label}>
          <span>쉬움</span>
          <span>어려움</span>
        </div>

        <div className={styles.bar}>
          <div
            className={styles.fill}
            style={{ width: `${percent}%` }}
          />
        </div>

        <div className={styles.number}>
          <span>0</span>
          <span>{max}</span>
        </div>

      </div>

    </div>
  );
}
import styles from './EvaluationRow.module.sass';

// 평가 정보 입력들을 한 줄로 묶는다
export default function EvaluationRow({ children }) {
  return <div className={styles.row}>{children}</div>;
}

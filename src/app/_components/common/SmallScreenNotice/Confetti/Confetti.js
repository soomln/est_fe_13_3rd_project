import styles from './Confetti.module.sass';

const PIECE_COUNT = 10;

// 히어로 이미지 위에 덮는 색종이 장식
export default function Confetti() {
  return (
    <div className={styles.confetti_layer} aria-hidden='true'>
      {Array.from({ length: PIECE_COUNT }, (_, i) => (
        <span key={i} className={styles.confetti} />
      ))}
    </div>
  );
}

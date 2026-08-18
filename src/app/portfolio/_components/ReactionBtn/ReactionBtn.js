import styles from './ReactionBtn.module.sass';

export default function ReactionBtn({ iconText, value, isToggle = false, isActive = false, onClick }) {
  const handleClick = async () => {
    try {
      await onClick?.();
    } catch (error) {
      console.error('리액션 처리 실패:', error);
    }
  };

  return (
    <button type='button' className={styles.action_btn} onClick={handleClick}>
      <span
        className={`${styles.icon} material-symbols-outlined ${isToggle ? (isActive ? styles.fill : '') : styles.fill}`}
      >
        {iconText}
      </span>

      <span className={`${styles.value} font_body_l_b`}>{value}</span>
    </button>
  );
}

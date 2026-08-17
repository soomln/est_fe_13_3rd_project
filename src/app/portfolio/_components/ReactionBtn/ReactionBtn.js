import { useState } from 'react';
import styles from './ReactionBtn.module.sass';
export default function ReactionBtn({ iconText, value, isToggle = false, onClick }) {
  const [isActive, setIsActive] = useState(false);
  return (
    <button
      className={styles.action_btn}
      onClick={() => {
        setIsActive((prev) => !prev);
        onClick?.(isActive);
      }}
    >
      <span
        className={`${styles.icon} material-symbols-outlined ${isToggle ? (isActive ? styles.fill : '') : styles.fill}`}
      >
        {iconText}
      </span>
      <span className={`${styles.value} fon_body_l_b`}>{value}</span>
    </button>
  );
}

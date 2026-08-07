import { useState } from 'react';
import styles from './ActionBtn.module.sass';
export default function ActionBtn({ iconText, value, isActiveBtn = false, onClick }) {
  const [isActive, setIsActive] = useState(false);
  return (
    <button
      className={styles.action_btn}
      onClick={() => {
        setIsActive((prev) => !prev);
        onClick();
      }}
    >
      <span
        className={`${styles.icon} material-symbols-outlined ${isActiveBtn ? (isActive ? styles.fill : '') : styles.fill}`}
      >
        {iconText}
      </span>
      <span className={`${styles.value} fon_body_l_b`}>{value}</span>
    </button>
  );
}

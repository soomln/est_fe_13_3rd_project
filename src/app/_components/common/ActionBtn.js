import { useState } from 'react';
import styles from './ActionBtn.module.sass';

export default function LikeBtn({ iconText, count, onClick }) {
  const [isSelected, setIsSelected] = useState(false);
  const [currentCount, setCurrentCount] = useState(count);
  return (
    <button
      className={`inline-flex items-center cursor-pointer border-none p-0 gap-[0.125rem] ${styles.action_btn}`}
      onClick={() => {
        setCurrentCount((prev) => (isSelected ? --prev : ++prev));
        setIsSelected(!isSelected);
        // onClick();
      }}
    >
      <span className={`${styles.icon} material-symbols-rounded ${isSelected ? styles.active : ''}`}>{iconText}</span>
      <span className={`count font_body_m_b`}>{currentCount}</span>
    </button>
  );
}

import { useState } from 'react';
import styles from './ActionBtn.module.sass';

export default function LikeBtn({ iconText, count, onClick }) {
  const [isActive, setIsActive] = useState(false);
  const handleClick = async (e) => {
    e.stopPropagation();

    try {
      await onClick(isActive);
      setIsActive((prev) => !prev);
    } catch (error) {
      console.error('액션 처리 실패:', error);
    }
  };

  return (
    <button className={`${styles.action_btn}`} onClick={handleClick}>
      <span className={`${styles.icon} material-symbols-rounded ${isActive ? styles.active : ''}`}>{iconText}</span>
      <span className={`count font_body_m_b`}>{count}</span>
    </button>
  );
}

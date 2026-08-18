import styles from './ActionBtn.module.sass';

export default function ActionBtn({ iconText, count, isActive = false, onClick }) {
  const handleClick = async (event) => {
    event.stopPropagation();

    try {
      await onClick();
    } catch (error) {
      console.error('액션 처리 실패:', error);
    }
  };

  return (
    <button type='button' className={styles.action_btn} onClick={handleClick}>
      <span className={`${styles.icon} material-symbols-rounded ${isActive ? styles.active : ''}`}>{iconText}</span>

      <span className='count font_body_m_b'>{count}</span>
    </button>
  );
}

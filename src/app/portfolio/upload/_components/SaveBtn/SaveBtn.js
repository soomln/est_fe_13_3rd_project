import styles from './SaveBtn.module.sass';

export default function SaveBtn({ iconText, text, textColor, bgColor, onClick }) {
  return (
    <button
      type='button'
      className={styles.save_btn}
      style={{ color: textColor, backgroundColor: bgColor }}
      onClick={onClick}
    >
      <span className='material-symbols-sharp'>{iconText}</span>
      <span className='font_body_m_b'>{text}</span>
    </button>
  );
}

import styles from './UploadBtn.module.sass';

export default function UploadBtn({ iconText, text, isIconFill = false, isWide = false }) {
  return (
    <button className={`${styles.upload_btn} ${isWide ? styles.wide : ''}`}>
      <span className={`${styles.icon} ${isIconFill ? styles.fill : ''} material-symbols-sharp`}>{iconText}</span>
      <span className={`${styles.text} font_body_s_b`}>{text}</span>
    </button>
  );
}

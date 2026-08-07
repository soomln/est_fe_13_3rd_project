import styles from './ToastMessage.module.sass';
export default function ToastMessage({ isVisible, message = '' }) {
  return (
    <p className={`font_h4 ${styles.message} ${isVisible ? styles.visible : ''}`} role='status'>
      {message}
    </p>
  );
}

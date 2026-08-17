import styles from './ToastMessage.module.sass';
export default function ToastMessage({ message }) {
  return (
    <p className={`font_h4 ${styles.message}`} role='status'>
      {message}
    </p>
  );
}

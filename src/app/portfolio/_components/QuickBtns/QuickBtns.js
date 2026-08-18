import { useRouter } from 'next/navigation';

import { useAuth } from '@/app/_components/auth';

import styles from './QuickBtns.module.sass';

export default function QuickBtnGroup({ onMoveTop }) {
  const router = useRouter();
  const { isLoggedIn, openLogin } = useAuth();

  const handleClick = () => {
    if (!isLoggedIn) {
      openLogin();
      return;
    }

    router.push('/portfolio/upload');
  };

  return (
    <div className={styles.btns}>
      <button className={styles.btn} onClick={onMoveTop}>
        <span className={`${styles.icon} material-symbols-outlined`}>arrow_upward</span>
        <span className={`${styles.text} font_body_m_b`}>이동</span>
      </button>

      <button className={styles.btn} onClick={handleClick}>
        <span className={`${styles.icon} material-symbols-outlined`}>cloud_upload</span>
        <span className={`${styles.text} font_body_m_b`}>업로드</span>
      </button>
    </div>
  );
}

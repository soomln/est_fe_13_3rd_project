'use client';
import { useRouter } from 'next/navigation';

import styles from './BackBtn.module.sass';

export default function BackBtn() {
  const router = useRouter();
  return (
    <button type='button' className={styles.back_btn} onClick={() => router.push('/portfolio')} aria-label='뒤로가기'>
      <span className='material-symbols-sharp'>arrow_back</span>
      <span className='font_body_m_b'>뒤로가기</span>
    </button>
  );
}

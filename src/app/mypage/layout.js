import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import MyPageNav from '@/app/mypage/_components/MyPageNav';
import styles from './layout.module.sass';

export default function MyPageLayout({ children }) {
  return (
    <>
      <Header />

      <div className={styles.mypage}>
        <div className={`container ${styles.mypage_inner}`}>
          <MyPageNav />
          <main className={styles.mypage_main}>{children}</main>
        </div>
      </div>

      <Footer />
    </>
  );
}

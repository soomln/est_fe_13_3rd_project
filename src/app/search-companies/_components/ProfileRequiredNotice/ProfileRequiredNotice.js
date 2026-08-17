import Link from 'next/link';

import styles from './ProfileRequiredNotice.module.sass';

// 프로필 미등록 시 글쓰기 대신 보여주는 안내
export default function ProfileRequiredNotice() {
  return (
    <section className={styles.notice}>
      <span className={`material-symbols-rounded ${styles.notice_icon}`} aria-hidden='true'>
        account_circle
      </span>

      <h1 className={`${styles.notice_title} font_h3`}>프로필을 먼저 등록해주세요</h1>

      <p className={`${styles.notice_desc} font_body_l_r`}>
        면접 후기와 족보에는 작성자의 <strong>직무 · 연차 · 학력</strong>이 함께 표시됩니다.
        <br />
        마이페이지 프로필에 세 항목을 모두 등록해야 글을 작성할 수 있습니다.
      </p>

      <Link className={`${styles.notice_link} font_body_l_b`} href='/mypage'>
        마이페이지에서 등록하기
      </Link>
    </section>
  );
}

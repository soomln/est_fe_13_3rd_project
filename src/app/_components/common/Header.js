// Header.js
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.sass';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.header_inner}>
        {/* 로고 영역 */}
        <div className={styles.logo_area}>
          <Link href='/'>
            <Image src='/logo.svg' alt='CallBack 로고' width={160} height={32} priority />
          </Link>
        </div>

        {/* 네비게이션 메뉴 */}
        <nav className={styles.nav_menu}>
          <Link href='/resume'>이력서·자소서</Link>
          <Link href='/portfolio'>포트폴리오 갤러리</Link>
          <Link href='/interview'>AI 면접 연습</Link>
          <Link href='/search-companies'>기업 탐색</Link>
          <Link href='/community'>커뮤니티</Link>
        </nav>

        {/* 로그인 / 회원가입 버튼 */}
        <div className={styles.auth_buttons}>
          <button className={styles.btn_login}>로그인</button>
          <button className={styles.btn_signup}>회원가입</button>
        </div>

        {/* 모바일/태블릿용 햄버거 버튼 */}
        <button className={styles.btn_mobile_menu} aria-label='메뉴 열기'>
          <svg width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='#111111' strokeWidth='2'>
            <path d='M4 6h16M4 12h16M4 18h16' />
          </svg>
        </button>
      </div>
    </header>
  );
}

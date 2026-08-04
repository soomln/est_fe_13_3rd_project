import Link from 'next/link';
import Image from 'next/image';
import s from './Header.module.sass';

function Logo() {
  return (
    <Link href='/' className={s.logo}>
      <Image src='/logo.svg' alt='CallBack Logo' width={170} height={25} priority />
    </Link>
  );
}

function NavContainer() {
  const navItems = [
    { label: '이력서·자소서', href: '/resume' },
    { label: '포트폴리오 갤러리', href: '/portfolio' },
    { label: 'AI 면접 연습', href: '/interview' },
    { label: '기업 탐색', href: '/search-companies' },
    { label: '커뮤니티', href: '/community' },
  ];

  return (
    <nav className={s.navContainer}>
      {navItems.map((item) => (
        <Link key={item.href} href={item.href} className={s.navButton}>
          <span className={s.navLabel}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function CtaContainer() {
  return (
    <div className={s.ctaContainer}>
      <Link href='/login' className={s.btnLogin}>
        <span className={s.ctaLabel}>로그인</span>
      </Link>

      <Link href='/register' className={s.btnRegister}>
        <span className={s.ctaLabel}>회원가입</span>
      </Link>
    </div>
  );
}

function HamburgerButton() {
  return (
    <button type='button' className={s.hamburgerButton} aria-label='메뉴 열기'>
      <span className={s.hamburgerLine}></span>
      <span className={s.hamburgerLine}></span>
      <span className={s.hamburgerLine}></span>
    </button>
  );
}

function Frame() {
  return (
    <div className={s.frame}>
      <div className={s.frameInner}>
        <Logo />

        <NavContainer />

        <CtaContainer />

        <HamburgerButton />
      </div>
    </div>
  );
}

export default function Header() {
  return (
    <header className={s.header}>
      <div className={s.inner}>
        <Frame />
      </div>
    </header>
  );
}

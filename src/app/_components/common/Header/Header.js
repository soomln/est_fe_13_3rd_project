'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/_components/auth';
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
          <span className={`font_body_l_r ${s.navLabel}`}>{item.label}</span>
        </Link>
      ))}
    </nav>
  );
}

function CtaContainer() {
  const router = useRouter();
  const { isLoading, isLoggedIn, openLogin, openSignup, signOut } = useAuth();

  if (isLoading) return <div className={s.ctaContainer} aria-hidden='true' />;

  if (isLoggedIn) {
    const handleLogout = async () => {
      await signOut();
      router.push('/');
    };

    return (
      <div className={s.ctaContainer}>
        <Link href='/mypage' className={s.btnRegister}>
          <span className={`font_body_m_b ${s.ctaLabel}`}>마이페이지</span>
        </Link>

        <button type='button' onClick={handleLogout} className={s.btnLogin}>
          <span className={`font_body_m_b ${s.ctaLabel}`}>로그아웃</span>
        </button>
      </div>
    );
  }

  return (
    <div className={s.ctaContainer}>
      <button type='button' onClick={openLogin} className={s.btnLogin}>
        <span className={`font_body_m_b ${s.ctaLabel}`}>로그인</span>
      </button>

      <button type='button' onClick={openSignup} className={s.btnRegister}>
        <span className={`font_body_m_b ${s.ctaLabel}`}>회원가입</span>
      </button>
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

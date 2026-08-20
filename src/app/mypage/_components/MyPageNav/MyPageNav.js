'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { useAuth } from '@/app/_components/auth';
import { useMyProfile } from '@/app/mypage/_components/MyProfileProvider';
import { toOurAvatar } from '@/app/mypage/_lib/defaultAvatars';
import styles from './MyPageNav.module.sass';

const MENUS = [
  { href: '/mypage', icon: 'account_circle', label: '프로필' },
  { href: '/mypage/documents', icon: 'insert_drive_file', label: '문서함' },
  { href: '/mypage/portfolio', icon: 'folder', label: '포트폴리오' },
  { href: '/mypage/interview-scrap', icon: 'bookmark', label: 'AI 면접 스크랩' },
  { href: '/mypage/activity', icon: 'vital_signs', label: '내 활동' },
  { href: '/mypage/account', icon: 'settings', label: '계정 설정' },
];

export default function MyPageNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { profile, codes } = useMyProfile();
  const { signOut } = useAuth();

  // 서버는 코드(frontend)로 주니 이름표(프론트엔드)로 바꿔서 보여준다
  const role =
    (codes.job_role ?? []).find((item) => item.code === profile?.desired_role)?.label ?? '';

  const isActive = (href) => (href === '/mypage' ? pathname === href : pathname.startsWith(href));

  const handleSignOut = async () => {
    await signOut();
    router.replace('/');
  };

  return (
    <aside className={styles.mypage_nav}>
      <div className={styles.mypage_nav_profile}>
        {profile ? (
          <img src={toOurAvatar(profile.avatar_url)} alt='' className={styles.mypage_nav_avatar} />
        ) : (
          <span className={styles.mypage_nav_avatar} />
        )}

        <span className={styles.mypage_nav_names}>
          <span className={`${styles.mypage_nav_name} font_body_l_b`}>{profile?.name ?? ''}</span>
          <span className={`${styles.mypage_nav_role} font_body_l_r`}>{role}</span>
        </span>
      </div>

      <nav className={styles.mypage_nav_menus}>
        {MENUS.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={`${styles.mypage_nav_menu} ${
              isActive(menu.href) ? `${styles.mypage_nav_menu_active} font_body_l_b` : 'font_body_l_r'
            }`}
            aria-current={isActive(menu.href) ? 'page' : undefined}
          >
            <span className='material-symbols-sharp' aria-hidden='true'>
              {menu.icon}
            </span>
            {menu.label}
          </Link>
        ))}
      </nav>

      <span className={styles.mypage_nav_divider} aria-hidden='true' />

      <button
        type='button'
        className={`${styles.mypage_nav_logout} font_body_l_b`}
        onClick={handleSignOut}
      >
        <span className='material-symbols-sharp' aria-hidden='true'>
          logout
        </span>
        로그아웃
      </button>
    </aside>
  );
}

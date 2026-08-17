'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import styles from './TabNavigation.module.sass';

// 기업 정보 / 면접 후기 / 면접 족보 탭
export default function TabNavigation({ companySlug }) {
  const pathname = usePathname();
  const base = `/search-companies/detail/${companySlug}`;

  const tabs = [
    { label: '기업 정보', href: base },
    { label: '면접 후기', href: `${base}/interview-review` },
    { label: '면접 족보', href: `${base}/interview-question` },
  ];

  const activeHref = tabs
    .filter((tab) => pathname === tab.href || pathname.startsWith(`${tab.href}/`))
    .reduce((longest, tab) => (tab.href.length > longest.length ? tab.href : longest), '');

  return (
    <nav className={styles.tabs}>
      {tabs.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={`${styles.tab} ${tab.href === activeHref ? styles.tab_active : ''} font_body_m_b`}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}

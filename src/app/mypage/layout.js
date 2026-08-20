import { headers } from 'next/headers';

import Header from '@/app/_components/common/Header';
import Footer from '@/app/_components/common/Footer';
import MyPageNav from '@/app/mypage/_components/MyPageNav';
import MyProfileProvider from '@/app/mypage/_components/MyProfileProvider';
import styles from './layout.module.sass';

const CODE_GROUPS = [
  'job_role',
  'career_level',
  'tech_stack',
  'interest_field',
  'education_level',
  'school_type',
  'edu_status',
  'language_level',
];

// 브라우저는 첫 HTML 에 없는 주소를 미리 못 받는다. 프로필을 서버에서 먼저 가져와 넘긴다
async function fetchOnServer(paths) {
  const requestHeaders = await headers();
  const host = requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const hostname = host?.split(':')[0];
  const protocol =
    requestHeaders.get('x-forwarded-proto') ??
    (hostname === 'localhost' || hostname === '127.0.0.1' ? 'http' : 'https');
  const cookie = requestHeaders.get('cookie');

  return Promise.all(
    paths.map((path) =>
      fetch(`${protocol}://${host}${path}`, {
        cache: 'no-store',
        headers: cookie ? { cookie } : undefined,
      })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null)
    )
  );
}

export default async function MyPageLayout({ children }) {
  const [profile, rawCodes] = await fetchOnServer([
    '/api/profiles/me',
    `/api/codes?groups=${CODE_GROUPS.join(',')}`,
  ]);

  // 빠진 묶음은 빈 배열로 채워 클라이언트가 받던 모양과 똑같이 맞춘다
  const codes = rawCodes
    ? Object.fromEntries(CODE_GROUPS.map((group) => [group, rawCodes[group] ?? []]))
    : null;

  return (
    <>
      <Header />

      <MyProfileProvider initialProfile={profile} initialCodes={codes}>
        <div className={styles.mypage}>
          <div className={`container ${styles.mypage_inner}`}>
            <MyPageNav />
            <main className={styles.mypage_main}>{children}</main>
          </div>
        </div>
      </MyProfileProvider>

      <Footer />
    </>
  );
}

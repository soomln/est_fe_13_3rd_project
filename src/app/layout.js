import 'reset-css';
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './globals.sass';

import { AuthProvider } from './_components/auth';
import SmallScreenNotice from './_components/common/SmallScreenNotice';
import styles from './layout.module.sass';

export const metadata = {
  title: 'CallBack',
  description: '개발자를 위한 취업 준비 플랫폼. 당신의 취업 준비를 최적화 하세요!',

  openGraph: {
    title: 'CallBack',
    description: '개발자를 위한 취업 준비 플랫폼. 당신의 취업 준비를 최적화 하세요!',
    type: 'website',
    images: ['/images/OG_Image.png'],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang='ko'>
      <head></head>
      <body>
        <AuthProvider>
          <SmallScreenNotice />

          <div className={styles.app_wide}>{children}</div>
        </AuthProvider>
      </body>
    </html>
  );
}

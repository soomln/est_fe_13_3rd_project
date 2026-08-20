import localFont from 'next/font/local';
import 'reset-css';
import './globals.sass';
import 'material-symbols/outlined.css';
import 'material-symbols/rounded.css';
import 'material-symbols/sharp.css';

import { AuthProvider } from './_components/auth';
import SmallScreenNotice from './_components/common/SmallScreenNotice';
import styles from './layout.module.sass';

const pretendard = localFont({
  src: '../../public/fonts/PretendardVariable.woff2',
  display: 'swap',
  weight: '100 900',
  variable: '--font-pretendard',
});

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
    <html lang='ko' className={pretendard.variable}>
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

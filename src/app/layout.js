import { Geist, Geist_Mono } from 'next/font/google';
import './reset.sass';
import './globals.sass';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'CallBack',
  description: '개발자를 위한 취업 준비 플랫폼. 당신의 취업 준비를 최적화 하세요!',
};

export default function RootLayout({ children }) {
  return (
    <html lang='en' className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        {/* Material Symbols Sharp 구글 폰트 CDN 추가 */}
        <link
          rel='stylesheet'
          href='https://fonts.googleapis.com/css2?family=Material+Symbols+Sharp:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200'
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

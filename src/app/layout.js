import 'reset-css';
import 'pretendard/dist/web/static/pretendard.css';
import './globals.sass';
import 'material-symbols/outlined.css';
import 'material-symbols/rounded.css';
import 'material-symbols/sharp.css';

export const metadata = {
  title: 'CallBack',
  description: '개발자를 위한 취업 준비 플랫폼. 당신의 취업 준비를 최적화 하세요!',
};

export default function RootLayout({ children }) {
  return (
    <html lang='ko'>
      <head></head>
      <body>{children}</body>
    </html>
  );
}

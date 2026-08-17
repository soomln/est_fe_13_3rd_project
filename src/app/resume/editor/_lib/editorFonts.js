import { Gothic_A1, Nanum_Gothic, Noto_Sans_KR, Noto_Serif_KR } from 'next/font/google';

// 윈도우 전용 글꼴은 맥에서 안 보인다. 구글폰트로 받아서 어디서나 같게 보이게 한다
const notoSans = Noto_Sans_KR({ subsets: ['latin'], weight: ['400', '700'], variable: '--editor-font-gothic' });
const nanumGothic = Nanum_Gothic({ subsets: ['latin'], weight: ['400', '700'], variable: '--editor-font-nanum' });
const notoSerif = Noto_Serif_KR({ subsets: ['latin'], weight: ['400', '700'], variable: '--editor-font-myeongjo' });
const gothicA1 = Gothic_A1({ subsets: ['latin'], weight: ['400', '700'], variable: '--editor-font-dodum' });

// 문서 본문을 그리는 곳에 이 클래스를 붙여야 글꼴이 먹는다
const FONT_VARS = [notoSans, nanumGothic, notoSerif, gothicA1].map((font) => font.variable).join(' ');

// 툴바 글꼴 목록. 위에서 만든 변수를 가리킨다
export const FONTS = [
  { label: '고딕', value: 'var(--editor-font-gothic), sans-serif' },
  { label: '나눔고딕', value: 'var(--editor-font-nanum), sans-serif' },
  { label: '명조', value: 'var(--editor-font-myeongjo), serif' },
  { label: '돋움', value: 'var(--editor-font-dodum), sans-serif' },
];

export const DEFAULT_SIZE = 16;

export default FONT_VARS;

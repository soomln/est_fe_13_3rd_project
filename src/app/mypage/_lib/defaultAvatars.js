// 기본 프로필 이미지. public 에 파일을 두지 않고 코드로 그려서 주소로 만든다

const FACES = [
  { bg: '#00A63D', fg: '#EEFDF3' },
  { bg: '#FF9900', fg: '#FFFBEB' },
  { bg: '#8635F6', fg: '#EFE9FF' },
  { bg: '#111111', fg: '#FFFFFF' },
  { bg: '#6F6F6F', fg: '#FFFFFF' },
  { bg: '#823000', fg: '#FFF4C1' },
];

// 동그란 배경 위에 사람 실루엣
const draw = ({ bg, fg }) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">` +
  `<rect width="120" height="120" fill="${bg}"/>` +
  `<circle cx="60" cy="46" r="20" fill="${fg}"/>` +
  `<path d="M60 72c-20 0-34 12-34 28v20h68V100c0-16-14-28-34-28z" fill="${fg}"/>` +
  `</svg>`;

const DEFAULT_AVATARS = FACES.map(
  (face) => `data:image/svg+xml;utf8,${encodeURIComponent(draw(face))}`,
);

// 직접 올린 사진이 담기는 곳
const UPLOADED = '/storage/v1/object/public/avatars/';

// 화면에는 120px 로 나온다. 고해상도 화면까지 감안해 두 배로 받는다
const SIZE = 240;

// 올린 사진을 원본 그대로 내보내면 1MB 가 넘는다. 스토리지에 줄여서 달라고 한다
const resized = (url) =>
  `${url.replace('/object/public/', '/render/image/public/')}?width=${SIZE}&height=${SIZE}&resize=cover&quality=80`;

// 구글·깃허브에서 따라온 사진은 쓰지 않는다. 우리 기본 이미지 중 첫 번째를 준다
export function toOurAvatar(url) {
  if (!url) return DEFAULT_AVATARS[0];
  if (url.startsWith('data:')) return url;

  return url.includes(UPLOADED) ? resized(url) : DEFAULT_AVATARS[0];
}

export default DEFAULT_AVATARS;

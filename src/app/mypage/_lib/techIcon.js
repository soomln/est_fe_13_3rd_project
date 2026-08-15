import * as icons from 'simple-icons';

// tech_stack 코드와 simple-icons 이름이 다른 것들
const ALIASES = {
  html: 'siHtml5',
  nextjs: 'siNextdotjs',
  vue: 'siVuedotjs',
  nodejs: 'siNodedotjs',
  cpp: 'siCplusplus',
  java: 'siOpenjdk',
  gcp: 'siGooglecloud',
  react_native: 'siReact',
};

const keyOf = (code) => {
  const camel = code.replace(/_(.)/g, (_, char) => char.toUpperCase());
  return `si${camel[0].toUpperCase()}${camel.slice(1)}`;
};

// 로고가 없는 기술(C#·AWS·Azure 등)은 null. 부르는 쪽에서 글자 원으로 그린다
export default function techIcon(code) {
  const icon = icons[ALIASES[code] ?? keyOf(code)];
  if (!icon) return null;

  return { path: icon.path, color: `#${icon.hex}` };
}

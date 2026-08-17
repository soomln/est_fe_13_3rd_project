// 마이페이지 프로필을 이력서 양식의 맞는 자리에 채운다

import { getMyProfile } from '@backend/lib/api/mypage';
import { getCodeGroups } from '@backend/lib/api/codes';

import { matchSection, normalize } from '@/app/resume/editor/_lib/sectionMatch';
import { toView } from '@/app/mypage/_lib/profileMap';

const CODE_GROUPS = [
  'job_role',
  'career_level',
  'tech_stack',
  'education_level',
  'school_type',
  'edu_status',
  'language_level',
];

export async function loadProfileView() {
  const [profile, codes] = await Promise.all([getMyProfile(), getCodeGroups(CODE_GROUPS)]);
  return toView(profile, codes, null);
}

// 항목마다 한 줄에 들어갈 칸을 중요한 것부터 늘어놓는다
const ROWS = {
  educations: (p) => p.educations.map((item) => [item.meta, item.title, item.sub, item.badge]),
  careers: (p) => p.careers.map((item) => [item.meta, item.title, item.sub]),
  languages: (p) => p.languages.map((item) => [item.title, item.badge, item.sub]),
  awards: (p) => p.awards.map((item) => [item.date, item.title]),
  skills: (p) => (p.skills.length ? [[p.skills.join(', ')]] : []),
  headline: (p) => (p.bio || p.headline ? [[p.bio || p.headline]] : []),
};

// 인적사항은 "이름표 | 값" 표라 줄을 새로 만들지 않는다. 이름표에 맞는 값만 바꾼다
const CONTACT_FIELDS = [
  { names: ['이름', '성명', '성함', 'name'], get: (p) => p.name },
  { names: ['이메일', '메일', 'email'], get: (p) => p.email },
  { names: ['깃허브', '깃헙', 'github'], get: (p) => p.github },
];

const contactValue = (label, profile) => {
  const target = normalize(label);
  const field = CONTACT_FIELDS.find((each) => each.names.some((name) => target.includes(name)));
  return field ? String(field.get(profile) ?? '').trim() : '';
};

export const LABELS = {
  educations: '학력',
  careers: '경력',
  languages: '어학',
  awards: '수상·자격',
  skills: '기술 스택',
  contact: '인적사항',
  headline: '한 줄 소개',
};

const text = (value) => String(value ?? '').trim();
const isHeading = (node) => /^H[1-3]$/.test(node.tagName);

// 양식은 예시 글자로 채워져 있다. 이런 글자만 있으면 아직 안 쓴 것으로 본다
const PLACEHOLDER = /[○△]|example\.com|0000-0000/;
const isUntouched = (node) => !text(node.textContent) || PLACEHOLDER.test(node.textContent);

// 칸 수에 맞춘다. 넘치면 마지막 칸에 몰아 넣는다
function fit(row, count) {
  const clean = row.map(text);
  if (clean.length <= count) return [...clean, ...Array(count - clean.length).fill('')];
  return [...clean.slice(0, count - 1), clean.slice(count - 1).filter(Boolean).join(' · ')];
}

const toLine = (row) => row.map(text).filter(Boolean).join(' · ');

function writeTable(doc, table, rows) {
  const holder = table.querySelector('tbody') ?? table;
  const old = [...holder.rows];
  const count = old[0]?.children.length ?? 2;
  const cellTag = old[0]?.children[0]?.tagName.toLowerCase() ?? 'td';

  // 세 칸 이상이면서 숫자가 없는 첫 줄은 제목 줄로 보고 남긴다.
  // 두 칸짜리는 "이메일 | 값" 처럼 왼쪽이 이름표라 제목 줄이 아니다
  const keep =
    count >= 3 && old.length > 1 && ![...old[0].children].some((cell) => /\d/.test(cell.textContent))
      ? 1
      : 0;

  old.slice(keep).forEach((row) => row.remove());

  rows.forEach((row) => {
    const line = doc.createElement('tr');
    fit(row, count).forEach((value) => {
      const cell = doc.createElement(keep ? 'td' : cellTag);
      cell.textContent = value;
      line.append(cell);
    });
    holder.append(line);
  });
}

// 이름표 줄은 그대로 두고 값 칸만 바꾼다. 줄을 늘리거나 지우지 않는다
function writeContact(table, profile) {
  let count = 0;

  [...(table.querySelector('tbody') ?? table).rows].forEach((row) => {
    if (row.children.length < 2) return;

    const value = contactValue(row.children[0].textContent, profile);
    if (!value) return;

    row.children[1].textContent = value;
    count += 1;
  });

  return count > 0;
}

function writeInto(doc, nodes, rows) {
  const first = nodes[0];
  nodes.slice(1).forEach((node) => node.remove());

  if (first.tagName === 'TABLE') {
    writeTable(doc, first, rows);
    return;
  }

  const lines = rows.map(toLine);

  if (first.tagName === 'UL' || first.tagName === 'OL') {
    first.replaceChildren(
      ...lines.map((line) => {
        const item = doc.createElement('li');
        item.textContent = line;
        return item;
      })
    );
    return;
  }

  first.replaceWith(
    ...lines.map((line) => {
      const paragraph = doc.createElement('p');
      paragraph.textContent = line;
      return paragraph;
    })
  );
}

// 프로필에 그 항목의 값이 있는지
const hasValue = (key, profile) =>
  key === 'contact'
    ? CONTACT_FIELDS.some((field) => text(field.get(profile)))
    : Boolean(ROWS[key]?.(profile).some((row) => row.some(text)));

// 제목이 프로필 항목과 짝이 맞는 곳만 채운다. overwrite 가 아니면 예시 글자만 있는 곳만 건드린다
export default function fillProfile(html, profile, { overwrite } = {}) {
  const doc = new DOMParser().parseFromString(`<body>${html}</body>`, 'text/html');
  const blocks = [...doc.body.children];

  const filled = [];
  const skipped = [];

  blocks.forEach((node, index) => {
    if (!isHeading(node)) return;

    const key = matchSection(node.textContent).find((each) => hasValue(each, profile));
    if (!key) return;

    const section = [];
    for (let next = index + 1; next < blocks.length && !isHeading(blocks[next]); next += 1) {
      section.push(blocks[next]);
    }
    if (!section.length) return;

    if (!overwrite && !section.every(isUntouched)) {
      skipped.push(LABELS[key]);
      return;
    }

    if (key === 'contact') {
      if (section[0].tagName !== 'TABLE' || !writeContact(section[0], profile)) return;
    } else {
      writeInto(doc, section, ROWS[key](profile).filter((row) => row.some(text)));
    }

    filled.push(LABELS[key]);
  });

  return {
    html: doc.body.innerHTML,
    filled: [...new Set(filled)],
    skipped: [...new Set(skipped)],
  };
}

// 실제로 채울 수 있는 항목. 채워 보고 결과만 본다
export function findMatches(html, profile) {
  return fillProfile(html, profile, { overwrite: true }).filled;
}

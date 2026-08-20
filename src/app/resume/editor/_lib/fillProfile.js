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
  // 어학은 딴 날짜가 없다. "자격 및 어학" 표의 취득일 칸을 비워 자격과 줄을 맞춘다
  languages: (p) =>
    p.languages.map((item) => ['', item.title, [item.badge, item.sub].filter(Boolean).join(' · ')]),
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
const depth = (node) => Number(node.tagName[1]);

const rowsOf = (table) => [...(table.querySelector('tbody') ?? table).rows];

// 첫 줄이 전부 th 면 제목 줄이 있는 가로 표다. 그 아래가 데이터 줄이다
const isHeaderRow = (row) => [...row.children].every((cell) => cell.tagName === 'TH');

// 그 밖의 표는 줄마다 "라벨 | 값" 인 세로 표로 본다
const isLabelTable = (table) => {
  const rows = rowsOf(table);
  return (
    rows.length > 0 && !isHeaderRow(rows[0]) && rows.every((row) => row.children.length >= 2)
  );
};

// 사진처럼 rowspan 이 걸린 칸이 있으면 앞이 밀린다. 뒤에서 두 칸을 라벨과 값으로 본다
const labelCell = (row) => row.children[row.children.length - 2];
const valueCell = (row) => row.children[row.children.length - 1];

// 양식은 예시 글자로 채워져 있다. 이런 글자만 있으면 아직 안 쓴 것으로 본다
const PLACEHOLDER = /[○△]|example\.com|0000-0000/;
const isBlank = (node) => !text(node?.textContent) || PLACEHOLDER.test(node.textContent);

// 표는 라벨을 빼고 값 칸만 본다. 라벨을 같이 세면 빈 양식이 "이미 쓴 것" 으로 보인다
function isUntouched(node) {
  if (node.tagName !== 'TABLE') return isBlank(node);

  const rows = rowsOf(node);
  const cells = isLabelTable(node)
    ? rows.map(valueCell)
    : rows.filter((row) => !isHeaderRow(row)).flatMap((row) => [...row.children]);

  return cells.every(isBlank);
}

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

  // 칸이 전부 th 인 첫 줄만 제목 줄로 보고 남긴다
  const keep = old[0] && isHeaderRow(old[0]) && old.length > 1 ? 1 : 0;

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

  rowsOf(table).forEach((row) => {
    if (row.children.length < 2) return;

    const value = contactValue(labelCell(row).textContent, profile);
    if (!value) return;

    valueCell(row).textContent = value;
    count += 1;
  });

  return count > 0;
}

// 양식이 쓴 형식 그대로 채운다. 표면 표에, 목록이면 목록에, 그다음이 제목 자리다
function writeInto(doc, nodes, rows) {
  const table = nodes.find((node) => node.tagName === 'TABLE');

  if (table) {
    // 라벨 표는 줄마다 뜻이 달라 목록으로 갈아끼우면 표가 망가진다
    if (isLabelTable(table)) return false;
    writeTable(doc, table, rows);
    return true;
  }

  const list = nodes.find((node) => node.tagName === 'UL' || node.tagName === 'OL');

  if (list) {
    list.replaceChildren(
      ...rows.map((row) => {
        const item = doc.createElement('li');
        const line = doc.createElement('p');
        line.textContent = toLine(row);
        item.append(line);
        return item;
      })
    );
    return true;
  }

  // 하위 제목으로만 나뉜 항목은 제목 자리에 한 줄씩 쓴다
  const slots = nodes.filter(isHeading);

  if (slots.length) {
    let tail = nodes[nodes.length - 1];

    rows.forEach((row, index) => {
      if (slots[index]) {
        slots[index].textContent = toLine(row);
        return;
      }

      const extra = doc.createElement(slots[0].tagName);
      extra.textContent = toLine(row);
      tail.after(extra);
      tail = extra;
    });

    return true;
  }

  const first = nodes[0];
  nodes.slice(1).forEach((node) => node.remove());

  first.replaceWith(
    ...rows.map((row) => {
      const paragraph = doc.createElement('p');
      paragraph.textContent = toLine(row);
      return paragraph;
    })
  );

  return true;
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

  // 채워 넣은 글이 하위 제목에 남으면 그 제목이 다시 걸린다. 한 번 다룬 자리는 건너뛴다
  const used = new Set();

  // 같은 항목을 두 제목이 노리면(자격 및 어학 / 수상 내역) 더 길게 맞은 제목이 가져간다
  const owner = new Map();

  blocks.forEach((node, index) => {
    if (!isHeading(node)) return;

    matchSection(node.textContent)
      .filter((hit) => hasValue(hit.key, profile))
      .forEach((hit) => {
        const best = owner.get(hit.key);
        if (!best || hit.length > best.length) owner.set(hit.key, { index, length: hit.length });
      });
  });

  blocks.forEach((node, index) => {
    if (!isHeading(node) || used.has(node)) return;

    // "자격 및 어학" 처럼 한 제목이 두 항목을 겸하면 둘 다 넣는다
    const keys = matchSection(node.textContent)
      .filter((hit) => owner.get(hit.key)?.index === index)
      .map((hit) => hit.key);
    if (!keys.length) return;

    // 하위 제목(h3)은 그 항목 안에 든 자리다. 같거나 큰 제목, 또는 구분선에서 끊는다
    const section = [];
    for (let next = index + 1; next < blocks.length; next += 1) {
      const each = blocks[next];
      if (each.tagName === 'HR') break;
      if (isHeading(each) && depth(each) <= depth(node)) break;
      section.push(each);
    }
    if (!section.length) return;

    section.forEach((each) => used.add(each));

    if (!overwrite && !section.every(isUntouched)) {
      keys.forEach((key) => skipped.push(LABELS[key]));
      return;
    }

    if (keys.includes('contact')) {
      if (section[0].tagName !== 'TABLE' || !writeContact(section[0], profile)) return;
    } else {
      const rows = keys.flatMap((key) => ROWS[key](profile)).filter((row) => row.some(text));
      if (!writeInto(doc, section, rows)) return;
    }

    keys.forEach((key) => filled.push(LABELS[key]));
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

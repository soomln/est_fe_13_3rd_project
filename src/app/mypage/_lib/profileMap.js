// 서버(profiles 테이블)와 화면이 쓰는 이름이 달라서 여기서 맞춘다

const labelOf = (list, code) => list.find((item) => item.code === code)?.label ?? code;

// 코드표에 없는 이름표는 저장하지 않는다. 서버에 엉뚱한 값이 들어가는 것을 막는다
const toCodes = (list, labels) =>
  labels.map((label) => list.find((item) => item.label === label)?.code).filter(Boolean);

// meta 는 "2020.03 – 2024.02" 형태다
const splitMeta = (meta = '') => String(meta).split('–');

// 최종학력은 profiles 에 칸이 없어서 학력 행마다 같이 넣어둔다
const finalOf = (educations) => educations[0]?.final ?? '고졸';

const EMPTY = {
  name: '',
  headline: '',
  email: '',
  github: '',
  avatarUrl: '',
  bio: '',
  stats: [],
  desiredRole: '',
  careerLevel: '',
  educationLevel: '고졸',
  educations: [],
  careers: [],
  languages: [],
  awards: [],
  skills: [],
  interests: [],
};

export function toView(profile, codes, stats) {
  if (!profile) return EMPTY;

  const roles = codes.job_role ?? [];
  const levels = codes.career_level ?? [];
  const techs = codes.tech_stack ?? [];
  const fields = codes.interest_field ?? [];

  const headline = [
    profile.desired_role && labelOf(roles, profile.desired_role),
    profile.career_level && labelOf(levels, profile.career_level),
  ]
    .filter(Boolean)
    .join(' · ');

  return {
    name: profile.name ?? '',
    headline,
    email: profile.email ?? '',
    github: profile.github_url ?? '',
    avatarUrl: profile.avatar_url ?? '',
    bio: profile.bio ?? '',
    desiredRole: profile.desired_role ? labelOf(roles, profile.desired_role) : '',
    careerLevel: profile.career_level ? labelOf(levels, profile.career_level) : '',
    stats: [
      { value: stats?.docCount ?? 0, label: '문서', tone: 'black' },
      { value: stats?.portfolioCount ?? 0, label: '포트폴리오', tone: 'green' },
      { value: stats?.interviewScrapCount ?? 0, label: '면접 스크랩', tone: 'amber' },
    ],
    educationLevel: finalOf(profile.educations ?? []),
    educations: profile.educations ?? [],
    careers: profile.careers ?? [],
    languages: profile.languages ?? [],
    awards: profile.awards ?? [],
    skills: (profile.skill_codes ?? []).map((code) => labelOf(techs, code)),
    interests: (profile.interest_codes ?? []).map((code) => labelOf(fields, code)),
  };
}

// 수정한 섹션에 해당하는 칸만 골라 서버로 보낸다
export function toPatch(section, draft, codes) {
  switch (section) {
    case 'basic':
      return {
        name: draft.name,
        avatar_url: draft.avatarUrl || null,
        github_url: draft.github,
        desired_role: toCodes(codes.job_role ?? [], [draft.desiredRole])[0] ?? null,
        career_level: toCodes(codes.career_level ?? [], [draft.careerLevel])[0] ?? null,
      };
    case 'bio':
      return { bio: draft.bio };
    case 'educations':
      return {
        educations: draft.educations.map((item) => ({
          ...item,
          meta: normalizeMeta(item.meta),
          final: draft.educationLevel,
        })),
      };
    case 'careers':
      return {
        careers: draft.careers.map((item) => ({ ...item, meta: normalizeMeta(item.meta) })),
      };
    case 'languages':
      return { languages: draft.languages };
    case 'awards':
      return {
        awards: draft.awards.map((item) => ({ ...item, date: normalizeDate(item.date) })),
      };
    case 'skills':
      return { skill_codes: toCodes(codes.tech_stack ?? [], draft.skills) };
    case 'interests':
      return { interest_codes: toCodes(codes.interest_field ?? [], draft.interests) };
    default:
      return {};
  }
}

const isBlank = (text) => !String(text ?? '').trim();

// 시작·종료를 " – " 로 이어 붙인 값이라 양쪽 다 봐야 한다
const hasBlankMeta = (meta) => splitMeta(meta).some(isBlank);

// 띄어쓰기와 한 자리 월(2020.3)까지 받아주고 저장할 때 "2020. 03" 으로 통일한다
const squash = (text) => String(text ?? '').replace(/\s/g, '');

const DATE_RE = /^(\d{4})\.(\d{1,2})$/;

const monthOf = (text) => {
  const found = DATE_RE.exec(squash(text));
  if (!found) return null;
  const month = Number(found[2]);
  return month >= 1 && month <= 12 ? { year: Number(found[1]), month } : null;
};

// 아직 치는 중이라 판단이 이른 값. 여기까지는 틀렸다고 하지 않는다
const DATE_TYPING_RE = /^\d{0,4}$|^\d{4}\.$|^\d{4}\.[01]$/;

// 비교하기 쉽게 202003 같은 숫자로 바꾼다. 형식이 아니면 null
const toMonth = (text) => {
  const found = monthOf(text);
  return found ? found.year * 100 + found.month : null;
};

// "2020.3" 도 "2020. 03" 도 모두 "2020. 03" 으로
const normalizeDate = (text) => {
  const found = monthOf(text);
  return found ? `${found.year}. ${String(found.month).padStart(2, '0')}` : String(text ?? '').trim();
};

const normalizeMeta = (meta) => splitMeta(meta).map(normalizeDate).join(' – ');

const thisMonth = () => {
  const now = new Date();
  return now.getFullYear() * 100 + (now.getMonth() + 1);
};

// 이 상태들은 아직 안 끝나서 종료일이 없다. 종료칸에 상태 글자를 그대로 넣는다
const ONGOING = ['재학 중', '휴학', '재직 중'];

export const isOngoing = (badge) => ONGOING.includes(badge);

// 최종학력마다 반드시 있어야 하는 학교 구분
export const FINAL_EDUCATIONS = {
  고졸: ['고등학교'],
  초대졸: ['고등학교', '전문대'],
  대졸: ['고등학교', '대학교'],
  석사: ['고등학교', '대학교', '대학원'],
  박사: ['고등학교', '대학교', '대학원'],
};

const LEVEL_ORDER = ['고등학교', '전문대', '대학교', '대학원'];
const byLevel = (a, b) => LEVEL_ORDER.indexOf(a.level) - LEVEL_ORDER.indexOf(b.level);

// 최종학력에 필요한데 빠진 구분을 채워 넣는다
export function fillMissingEducations(draft) {
  const need = FINAL_EDUCATIONS[draft.educationLevel] ?? [];
  const missing = need.filter((level) => !draft.educations.some((item) => item.level === level));

  if (missing.length === 0) return draft;

  const added = missing.map((level) => ({
    level,
    title: '',
    sub: '',
    meta: ' – ',
    badge: '졸업',
    final: draft.educationLevel,
  }));


  return { ...draft, educations: [...draft.educations, ...added].sort(byLevel) };
}

// 섹션마다 반드시 채워야 하는 칸
const REQUIRED = {
  educations: { keys: ['title'], dates: true },
  careers: { keys: ['title', 'sub'], dates: true },
  languages: { keys: ['title', 'sub'], dates: false },
  awards: { keys: ['title'], dates: false },
};

const DATE_HINT = '2020.03 형태로 적어주세요';
const FUTURE_HINT = '오늘 이후는 입력할 수 없어요';

// 칸마다 뭐가 잘못됐는지 알려준다
// { message, fields: { 0: { title: 'blank', from: 'format' } } }
export function validate(section, draft) {
  const fields = {};
  const mark = (index, key, kind) => {
    fields[index] = { ...(fields[index] ?? {}), [key]: kind };
  };

  if (section === 'basic') {
    return isBlank(draft.name)
      ? { message: '이름을 입력해주세요.', fields: { 0: { name: 'blank' } } }
      : null;
  }

  if (section === 'bio') {
    return isBlank(draft.bio) ? { message: '자기소개를 입력해주세요.', fields } : null;
  }

  // 최종학력에 필요한 줄이 아예 없으면 그것부터 알린다
  if (section === 'educations') {
    const need = FINAL_EDUCATIONS[draft.educationLevel] ?? [];
    const missing = need.filter((level) => !draft.educations.some((item) => item.level === level));
    if (missing.length > 0) {
      return { message: '최종학력을 확인해주세요.', fields, missing };
    }
  }

  const rule = REQUIRED[section];
  if (!rule) return null;

  // 비어 있으면 'blank', 그 밖에는 칸 아래에 띄울 안내 문구를 담는다
  const checkDate = (index, key, text) => {
    if (isBlank(text)) {
      mark(index, key, 'blank');
      return null;
    }

    const month = toMonth(text);
    if (month === null) {
      mark(index, key, DATE_HINT);
      return null;
    }
    if (month > thisMonth()) {
      mark(index, key, FUTURE_HINT);
      return null;
    }
    return month;
  };

  const startLabel = section === 'educations' ? '입학' : '시작';

  draft[section].forEach((item, index) => {
    rule.keys.forEach((key) => {
      if (isBlank(item[key])) mark(index, key, 'blank');
    });

    if (section === 'awards') checkDate(index, 'date', item.date);

    if (rule.dates) {
      const [from, to] = splitMeta(item.meta);
      const start = checkDate(index, 'from', from);
      if (isOngoing(item.badge)) return;

      const end = checkDate(index, 'to', to);
      if (start !== null && end !== null && end < start) {
        mark(index, 'to', `${startLabel}보다 빠를 수 없어요`);
      }
    }
  });

  const kinds = Object.values(fields).flatMap((row) => Object.values(row));
  if (kinds.length === 0) return null;

  const hasBlank = kinds.includes('blank');

  // 빈칸이 하나라도 있으면 그것부터 채우게 안내한다
  const message = hasBlank
    ? section === 'educations'
      ? '최종학력에 맞게 빈 곳을 모두 입력해주세요.'
      : '빈칸이 있어요. 전부 입력해주세요.'
    : '입력 내용을 확인해주세요.';

  return { message, fields };
}

// 치는 도중에 쓰는 검사. 아직 판단이 이르면 빈 문자열
export function dateHint(text, { after, afterLabel } = {}) {
  const value = squash(text);
  if (!value || DATE_TYPING_RE.test(value)) return '';

  const month = toMonth(value);
  if (month === null) return DATE_HINT;
  if (month > thisMonth()) return FUTURE_HINT;
  if (after != null && month < after) return `${afterLabel}보다 빠를 수 없어요`;

  return '';
}

export const monthValue = toMonth;

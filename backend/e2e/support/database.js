const KEY = Symbol.for('callback.e2e.database');

export const TABLES = [
  'profiles',
  'code_master',
  'companies',
  'resume_templates',
  'documents',
  'portfolios',
  'posts',
  'comments',
  'reactions',
  'reaction_counts',
  'interview_sessions',
  'interview_qas',
];

export const USERS = {
  a: { id: 'aaaaaaaa-0000-4000-8000-000000000001', email: 'a@callback.test', name: 'User A' },
  b: { id: 'bbbbbbbb-0000-4000-8000-000000000002', email: 'b@callback.test', name: 'User B' },
  minimal: { id: 'cccccccc-0000-4000-8000-000000000003', name: null, providers: null },
  legacy: {
    id: 'dddddddd-0000-4000-8000-000000000004',
    email: 'legacy@callback.test',
    name: 'Legacy User',
    appMetadata: { provider: 'kakao' },
    noTimestamps: true,
  },
};

const CODES = [
  ['industry', 'it', 'IT·소프트웨어', 1],
  ['industry', 'game', '게임', 2],
  ['company_size', 'large', '대기업', 1],
  ['job_role', 'fe', '프론트엔드', 1],
  ['job_role', 'be', '백엔드', 2],
  ['difficulty', 'easy', '쉬움', 1],
  ['difficulty', 'hard', '어려움', 2],
  ['pass_result', 'pass', '합격', 1],
  ['pass_result', 'fail', '불합격', 2],
  ['interview_channel', 'online', '온라인 지원', 1],
  ['interview_channel', 'etc', '기타', 2],
  ['education_level', 'bachelor', '대졸', 1],
  ['career_level', 'junior', '신입', 1],
  ['edu_status', 'graduated', '졸업', 1],
  ['language_level', 'high', '상', 1],
  ['tech_stack', 'react', 'React', 1],
  ['tech_stack', 'next', 'Next.js', 2],
];

const COMPANIES = [
  {
    id: 'c0000000-0000-4000-8000-000000000001',
    slug: 'naver',
    name: '네이버',
    logo_url: 'https://cdn.test/naver.png',
    industry_code: 'it',
    size_code: 'large',
    job_role_codes: ['fe', 'be'],
    location: '분당',
    tags: ['플랫폼'],
    rating: 4.3,
    employee_count: 4500,
    avg_salary_text: '5,240만원',
    tagline: '연결의 힘',
    description: '검색 포털',
    homepage: 'https://naver.com',
    hq_address: '경기 성남시',
    founded_on: '1999-06-02',
    ceo: '최수연',
    capital_text: '82억',
    hiring_status: '상시 채용',
    view_count: 300,
    rating_dimensions: { salary: 4.5 },
    salary_detail: { overall: 5240 },
    core_values: [{ icon: 'star', title: '도전', desc: '설명A' }],
    services: [{ name: '지식iN', logo_url: 'https://cdn.test/kin.png', link: 'https://kin.test' }],
    benefits: [{ icon: 'gift', title: '복지1', description: '설명1' }],
    highlights: ['AI 중심 기업', { icon: 'flag', description: '객체형' }],
    news: [{ title: '뉴스A', published_on: '2026-08-01', url: 'https://n.test/1' }],
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-4000-8000-000000000002',
    slug: 'kakao',
    name: '카카오',
    logo_url: null,
    industry_code: 'game',
    size_code: 'large',
    job_role_codes: ['be'],
    location: '제주',
    tags: [],
    rating: 4.1,
    employee_count: 3200,
    avg_salary_text: '5,000만원',
    view_count: 120,
    created_at: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 'c0000000-0000-4000-8000-000000000003',
    slug: 'sparse',
    name: '정보없는회사',
    industry_code: 'unknown_code',
    created_at: '2026-01-03T00:00:00.000Z',
  },
];

const TEMPLATES = [
  {
    id: 't0000000-0000-4000-8000-000000000001',
    title: '신입 개발자 이력서',
    doc_type: 'resume',
    category_code: 'dev',
    thumbnail_url: 'https://cdn.test/t1.png',
    content: { type: 'doc' },
    content_html: '<h1>이력서</h1>',
    view_count: 120,
    sort_order: 1,
    is_active: true,
    created_at: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 't0000000-0000-4000-8000-000000000002',
    title: '자기소개서 양식',
    doc_type: 'cover_letter',
    category_code: 'dev',
    thumbnail_url: null,
    content: null,
    content_html: null,
    view_count: 40,
    sort_order: 2,
    is_active: true,
    created_at: '2026-01-02T00:00:00.000Z',
  },
  {
    id: 't0000000-0000-4000-8000-000000000004',
    title: '정보없는 양식',
    doc_type: 'resume',
    is_active: true,
    sort_order: 4,
    created_at: '2026-01-04T00:00:00.000Z',
  },
  {
    id: 't0000000-0000-4000-8000-000000000003',
    title: '비활성 양식',
    doc_type: 'resume',
    category_code: 'dev',
    view_count: 999,
    sort_order: 3,
    is_active: false,
    created_at: '2026-01-03T00:00:00.000Z',
  },
];

export const SCHEMA = {
  profiles: [
    'id', 'name', 'avatar_url', 'desired_role', 'career_level', 'email', 'github_url', 'bio',
    'educations', 'careers', 'awards', 'languages', 'skill_codes', 'interest_codes',
    'created_at', 'updated_at',
  ],
  code_master: ['id', 'group_name', 'code', 'label', 'sort_order', 'is_active'],
  companies: Object.keys(COMPANIES[0]),
  resume_templates: Object.keys(TEMPLATES[0]),
  documents: [
    'id', 'user_id', 'doc_type', 'title', 'template_id',
    'content', 'content_html', 'content_text', 'created_at', 'updated_at',
  ],
  portfolios: [
    'id', 'user_id', 'title', 'category', 'thumbnail_url', 'description', 'content',
    'bg_color', 'gap_px', 'status', 'view_count', 'created_at', 'updated_at',
  ],
  posts: [
    'id', 'user_id', 'company_id', 'post_type', 'title', 'body', 'questions',
    'difficulty_code', 'difficulty_score', 'problem_score', 'question_count',
    'pass_result_code', 'channel_code', 'channel_etc', 'job_role_code', 'position_level',
    'education_level', 'tags', 'overall_comment', 'view_count', 'created_at', 'updated_at',
  ],
  comments: ['id', 'post_id', 'user_id', 'body', 'created_at', 'updated_at'],
  reactions: ['id', 'user_id', 'target_type', 'target_id', 'kind', 'created_at'],
  reaction_counts: ['target_type', 'target_id', 'kind', 'cnt'],
  interview_sessions: [
    'id', 'user_id', 'company_id', 'resume_ids', 'cover_letter_ids', 'interviewer_style',
    'selected_categories', 'show_timer', 'duration_sec', 'status', 'total_score', 'sub_scores',
    'created_at', 'finished_at',
  ],
  interview_qas: [
    'id', 'session_id', 'user_id', 'seq', 'category', 'question', 'answer',
    'feedback', 'score', 'created_at',
  ],
};

function emptyTables() {
  return Object.fromEntries(TABLES.map((t) => [t, []]));
}

export function getDatabase() {
  if (!globalThis[KEY]) globalThis[KEY] = { tables: emptyTables(), clock: 0 };
  return globalThis[KEY];
}

export function nextTimestamp() {
  const db = getDatabase();
  db.clock += 1000;
  return new Date(Date.UTC(2026, 7, 8, 0, 0, 0) + db.clock).toISOString();
}

let idCounter = 0;

export function nextId(prefix = 'e2e') {
  idCounter += 1;
  return `${prefix}-${String(idCounter).padStart(12, '0')}`;
}

export function rows(table) {
  return getDatabase().tables[table];
}

export function resetDatabase() {
  const db = getDatabase();
  db.tables = emptyTables();
  db.clock = 0;
  idCounter = 0;

  db.tables.code_master = CODES.map(([group_name, code, label, sort_order], index) => ({
    id: `code-${index}`,
    group_name,
    code,
    label,
    sort_order,
    is_active: true,
  }));

  db.tables.companies = COMPANIES.map((c) => ({ ...c }));
  db.tables.resume_templates = TEMPLATES.map((t) => ({ ...t }));
}

export function ensureProfile(user) {
  const existing = rows('profiles').find((p) => p.id === user.id);
  if (existing) return existing;

  const created = nextTimestamp();
  const profile = {
    id: user.id,
    name: user.name ?? null,
    avatar_url: null,
    desired_role: null,
    career_level: null,
    email: null,
    github_url: null,
    bio: null,
    educations: [],
    careers: [],
    awards: [],
    languages: [],
    skill_codes: [],
    interest_codes: [],
    created_at: created,
    updated_at: created,
  };
  rows('profiles').push(profile);
  return profile;
}

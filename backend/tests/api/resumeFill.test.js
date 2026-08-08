import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../../lib/api/_fetch', () => ({ apiFetch: vi.fn() }));
vi.mock('../../lib/api/profile', () => ({ getMyProfile: vi.fn() }));
vi.mock('../../lib/api/codes', () => ({ getCodes: vi.fn() }));

const { getMyProfile } = await import('../../lib/api/profile');
const { getCodes } = await import('../../lib/api/codes');
const { buildResumeHtmlFromMyProfile, buildResumeHtmlFromProfile } = await import(
  '../../lib/api/resumeFill'
);

const LABELS = {
  career_level: { junior: '신입' },
  edu_status: { graduated: '졸업' },
  language_level: { high: '상' },
  tech_stack: { react: 'React', next: 'Next.js' },
};

const FULL_PROFILE = {
  name: '장도담',
  desired_role: '백엔드 개발자',
  career_level: 'junior',
  email: 'a@b.c',
  github_url: 'https://github.com/dodam',
  bio: '안녕하세요',
  educations: [
    { school: '한국대학교', major: '컴퓨터공학', status: 'graduated', admission: '2016.03', graduation: '2020.02' },
  ],
  careers: [{ start: '2020.03', end: '재직 중', company: '옵티미', role: '백엔드' }],
  awards: [{ date: '2025.11', name: '해커톤 대상' }],
  languages: [{ language: '영어', level: 'high', detail: 'TOEIC 900' }],
  skill_codes: ['react', 'next'],
};

beforeEach(() => {
  getMyProfile.mockReset();
  getCodes.mockReset();
});

describe('buildResumeHtmlFromProfile', () => {
  it('returns an empty string when there is no profile', () => {
    expect(buildResumeHtmlFromProfile(null)).toBe('');
  });

  it('builds no section for an empty profile', () => {
    expect(buildResumeHtmlFromProfile({})).toBe('');
  });

  it('renders the name as an h1', () => {
    expect(buildResumeHtmlFromProfile({ name: '장도담' })).toBe('<h1>장도담</h1>');
  });

  it('joins desired role and career level with a middle dot', () => {
    const html = buildResumeHtmlFromProfile(
      { desired_role: '백엔드 개발자', career_level: 'junior' },
      LABELS
    );

    expect(html).toBe('<p><em>백엔드 개발자 · 신입</em></p>');
  });

  it('uses the code itself when there is no label', () => {
    const html = buildResumeHtmlFromProfile({ career_level: 'junior' });

    expect(html).toContain('junior');
  });

  it('adds no middle dot when only the desired role is set', () => {
    expect(buildResumeHtmlFromProfile({ desired_role: '백엔드 개발자' })).toBe(
      '<p><em>백엔드 개발자</em></p>'
    );
  });

  it('renders email and github as the contact table', () => {
    const html = buildResumeHtmlFromProfile({ email: 'a@b.c', github_url: 'https://github.com/x' });

    expect(html).toContain('<h2>인적사항</h2>');
    expect(html).toContain('<td>이메일</td><td>a@b.c</td>');
    expect(html).toContain('<td>깃허브</td><td>https://github.com/x</td>');
  });

  it('renders a single row when only email is set', () => {
    const html = buildResumeHtmlFromProfile({ email: 'a@b.c' });

    expect(html).toContain('이메일');
    expect(html).not.toContain('깃허브');
  });

  it('renders the bio as a paragraph', () => {
    expect(buildResumeHtmlFromProfile({ bio: '안녕하세요' })).toBe(
      '<h2>자기소개</h2><p>안녕하세요</p>'
    );
  });

  it('renders education as period, school and status', () => {
    const html = buildResumeHtmlFromProfile(
      { educations: [{ school: '한국대', major: '컴공', status: 'graduated', admission: '2016.03', graduation: '2020.02' }] },
      LABELS
    );

    expect(html).toContain('<h2>학력</h2>');
    expect(html).toContain('<td>2016.03 – 2020.02</td><td>한국대 · 컴공</td><td>졸업</td>');
  });

  it('shows only the admission date when graduation is missing', () => {
    const html = buildResumeHtmlFromProfile({
      educations: [{ school: '한국대', admission: '2016.03' }],
    });

    expect(html).toContain('<td>2016.03</td><td>한국대</td>');
  });

  it('renders careers as period, company and role', () => {
    const html = buildResumeHtmlFromProfile({
      careers: [{ start: '2020.03', end: '재직 중', company: '옵티미', role: '백엔드' }],
    });

    expect(html).toContain('<h2>경력</h2>');
    expect(html).toContain('<td>2020.03 – 재직 중</td><td>옵티미</td><td>백엔드</td>');
  });

  it('fills blank career cells with an empty string', () => {
    const html = buildResumeHtmlFromProfile({ careers: [{ company: '옵티미' }] });

    expect(html).toContain('<td></td><td>옵티미</td><td></td>');
  });

  it('renders a career that has a role but no company', () => {
    const html = buildResumeHtmlFromProfile({ careers: [{ role: '백엔드' }] });

    expect(html).toContain('<td></td><td></td><td>백엔드</td>');
  });

  it('renders the tech stack as a list', () => {
    const html = buildResumeHtmlFromProfile({ skill_codes: ['react', 'next'] }, LABELS);

    expect(html).toBe('<h2>기술 스택</h2><ul><li>React</li><li>Next.js</li></ul>');
  });

  it('builds no section when the tech stack is empty', () => {
    expect(buildResumeHtmlFromProfile({ skill_codes: [] })).toBe('');
  });

  it('renders awards as a table', () => {
    const html = buildResumeHtmlFromProfile({ awards: [{ date: '2025.11', name: '대상' }] });

    expect(html).toContain('<h2>수상 내역</h2>');
    expect(html).toContain('<td>2025.11</td><td>대상</td>');
  });

  it('fills blank award cells too', () => {
    const html = buildResumeHtmlFromProfile({ awards: [{}] });

    expect(html).toContain('<td></td><td></td>');
  });

  it('renders languages as language, detail and level', () => {
    const html = buildResumeHtmlFromProfile(
      { languages: [{ language: '영어', level: 'high', detail: 'TOEIC 900' }] },
      LABELS
    );

    expect(html).toContain('<h2>어학</h2>');
    expect(html).toContain('<td>영어</td><td>TOEIC 900</td><td>상</td>');
  });

  it('fills blank language cells too', () => {
    const html = buildResumeHtmlFromProfile({ languages: [{}] });

    expect(html).toContain('<td></td><td></td><td></td>');
  });

  it('omits sections whose array is empty', () => {
    const html = buildResumeHtmlFromProfile({
      name: '장도담',
      educations: [],
      careers: [],
      awards: [],
      languages: [],
    });

    expect(html).toBe('<h1>장도담</h1>');
  });

  it('escapes HTML special characters', () => {
    const html = buildResumeHtmlFromProfile({ name: '<script>alert("x")</script> & Co' });

    expect(html).toBe('<h1>&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt; &amp; Co</h1>');
  });

  it('escapes values inside tables too', () => {
    const html = buildResumeHtmlFromProfile({ email: '<b>a@b.c</b>' });

    expect(html).toContain('&lt;b&gt;a@b.c&lt;/b&gt;');
  });

  it('assembles a full profile in a fixed order', () => {
    const html = buildResumeHtmlFromProfile(FULL_PROFILE, LABELS);

    const order = ['<h1>', '<em>', '인적사항', '자기소개', '학력', '경력', '기술 스택', '수상 내역', '어학'];
    const positions = order.map((token) => html.indexOf(token));

    expect(positions.every((p) => p >= 0)).toBe(true);
    expect([...positions].sort((a, b) => a - b)).toEqual(positions);
  });
});

describe('buildResumeHtmlFromMyProfile', () => {
  it('returns an empty string and fetches no codes when there is no profile', async () => {
    getMyProfile.mockResolvedValue(null);

    await expect(buildResumeHtmlFromMyProfile()).resolves.toBe('');
    expect(getCodes).not.toHaveBeenCalled();
  });

  it('builds the HTML with code labels applied', async () => {
    getMyProfile.mockResolvedValue(FULL_PROFILE);
    getCodes.mockImplementation(async (group) =>
      Object.entries(LABELS[group]).map(([code, label]) => ({ code, label }))
    );

    const html = await buildResumeHtmlFromMyProfile();

    expect(html).toContain('신입');
    expect(html).toContain('졸업');
    expect(html).toContain('React');
    expect(html).toContain('<td>영어</td><td>TOEIC 900</td><td>상</td>');
  });

  it('loads only the four code groups it needs', async () => {
    getMyProfile.mockResolvedValue({ name: '장도담' });
    getCodes.mockResolvedValue([]);

    await buildResumeHtmlFromMyProfile();

    expect(getCodes.mock.calls.map(([g]) => g)).toEqual([
      'career_level',
      'edu_status',
      'language_level',
      'tech_stack',
    ]);
  });
});

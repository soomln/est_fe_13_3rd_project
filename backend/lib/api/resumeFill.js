import { getCodes } from './codes';
import { getMyProfile } from './profile';

const escapeHtml = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const row = (cells) => `<tr>${cells.map((c) => `<td>${escapeHtml(c)}</td>`).join('')}</tr>`;

const table = (rows) => (rows.length ? `<table><tbody>${rows.join('')}</tbody></table>` : '');

const section = (title, body) => (body ? `<h2>${escapeHtml(title)}</h2>${body}` : '');

const period = (start, end) => [start, end].filter(Boolean).join(' – ');

export function buildResumeHtmlFromProfile(profile, labels = {}) {
  if (!profile) return '';

  const label = (group, code) => labels[group]?.[code] ?? code ?? '';

  const headline = [profile.desired_role, label('career_level', profile.career_level)]
    .filter(Boolean)
    .join(' · ');

  const contact = table(
    [
      profile.email && row(['이메일', profile.email]),
      profile.github_url && row(['깃허브', profile.github_url]),
    ].filter(Boolean)
  );

  const educations = table(
    (profile.educations ?? []).map((e) =>
      row([
        period(e.admission, e.graduation),
        [e.school, e.major].filter(Boolean).join(' · '),
        label('edu_status', e.status),
      ])
    )
  );

  const careers = table(
    (profile.careers ?? []).map((c) =>
      row([period(c.start, c.end), c.company ?? '', c.role ?? ''])
    )
  );

  const awards = table((profile.awards ?? []).map((a) => row([a.date ?? '', a.name ?? ''])));

  const languages = table(
    (profile.languages ?? []).map((l) =>
      row([l.language ?? '', l.detail ?? '', label('language_level', l.level)])
    )
  );

  const skills = (profile.skill_codes ?? []).length
    ? `<ul>${profile.skill_codes
        .map((code) => `<li>${escapeHtml(label('tech_stack', code))}</li>`)
        .join('')}</ul>`
    : '';

  return [
    profile.name ? `<h1>${escapeHtml(profile.name)}</h1>` : '',
    headline ? `<p><em>${escapeHtml(headline)}</em></p>` : '',
    section('인적사항', contact),
    profile.bio ? section('자기소개', `<p>${escapeHtml(profile.bio)}</p>`) : '',
    section('학력', educations),
    section('경력', careers),
    section('기술 스택', skills),
    section('수상 내역', awards),
    section('어학', languages),
  ]
    .filter(Boolean)
    .join('');
}

export async function buildResumeHtmlFromMyProfile() {
  const profile = await getMyProfile();
  if (!profile) return '';

  const groups = ['career_level', 'edu_status', 'language_level', 'tech_stack'];
  const codes = await Promise.all(groups.map((g) => getCodes(g)));

  const labels = Object.fromEntries(
    groups.map((group, index) => [
      group,
      Object.fromEntries(codes[index].map((c) => [c.code, c.label])),
    ])
  );

  return buildResumeHtmlFromProfile(profile, labels);
}

import { badRequest, forbidden, notFound } from '../http/errors';
import { defineRoute, resolveUserId, unwrap } from '../http/route';
import { assertCodes } from './codeGuard';

const COLUMNS = `
  id, name, avatar_url, desired_role, career_level, education_level, github_url, bio,
  skill_codes, interest_codes, created_at, updated_at
`;

const LISTS = {
  educations: {
    table: 'profile_educations',
    columns: 'sort_order, school_type, school, major, status, admission, graduation',
    toJson: (row) => ({
      type: row.school_type,
      school: row.school,
      major: row.major,
      status: row.status,
      admission: row.admission,
      graduation: row.graduation,
    }),
  },
  careers: {
    table: 'profile_careers',
    columns: 'sort_order, started_on, ended_on, company, job_role',
    toJson: (row) => ({
      start: row.started_on,
      end: row.ended_on,
      company: row.company,
      role: row.job_role,
    }),
  },
  awards: {
    table: 'profile_awards',
    columns: 'sort_order, awarded_on, title',
    toJson: (row) => ({ date: row.awarded_on, name: row.title }),
  },
  languages: {
    table: 'profile_languages',
    columns: 'sort_order, language, level, detail',
    toJson: (row) => ({ language: row.language, level: row.level, detail: row.detail }),
  },
};

const LIST_FIELDS = Object.keys(LISTS);

const EDITABLE = [
  'name',
  'avatar_url',
  'desired_role',
  'career_level',
  'education_level',
  'email',
  'github_url',
  'bio',
  'skill_codes',
  'interest_codes',
];

const ARRAY_FIELDS = ['skill_codes', 'interest_codes'];

const CODE_FIELDS = {
  career_level: 'career_level',
  education_level: 'education_level',
  skill_codes: 'tech_stack',
  interest_codes: 'interest_field',
};

export async function loadProfileLists(supabase, userId) {
  const entries = await Promise.all(
    Object.entries(LISTS).map(async ([field, spec]) => {
      const rows = unwrap(
        await supabase
          .from(spec.table)
          .select(spec.columns)
          .eq('user_id', userId)
          .order('sort_order', { ascending: true })
      );
      return [field, (rows ?? []).map(spec.toJson)];
    })
  );

  return Object.fromEntries(entries);
}

export async function withEmail(profile, supabase, isOwner) {
  if (!isOwner) return { ...profile, email: null };
  return { ...profile, email: unwrap(await supabase.rpc('my_profile_email')) };
}

export async function assembleProfile(profile, supabase, isOwner) {
  const [lists, withContact] = await Promise.all([
    loadProfileLists(supabase, profile.id),
    withEmail(profile, supabase, isOwner),
  ]);

  return { ...withContact, ...lists };
}

export const GET = defineRoute(async ({ params, supabase, user }) => {
  const userId = resolveUserId(params.userId, user);

  const profile = unwrap(
    await supabase.from('profiles').select(COLUMNS).eq('id', userId).maybeSingle()
  );

  if (!profile) throw notFound('프로필을 찾을 수 없습니다.');
  return assembleProfile(profile, supabase, userId === user?.id);
});

export const PATCH = defineRoute(
  async ({ request, params, supabase, user }) => {
    const userId = resolveUserId(params.userId, user);
    if (userId !== user.id) throw forbidden('본인 프로필만 수정할 수 있습니다.');

    let patch;
    try {
      patch = await request.json();
    } catch {
      throw badRequest('JSON 본문이 필요합니다.');
    }

    const body = {};
    for (const key of EDITABLE) {
      if (key in patch) body[key] = patch[key];
    }

    const lists = {};
    for (const key of LIST_FIELDS) {
      if (key in patch) lists[key] = patch[key];
    }

    if (Object.keys(body).length === 0 && Object.keys(lists).length === 0) {
      throw badRequest('수정할 내용이 없습니다.');
    }
    if (typeof body.bio === 'string' && body.bio.length > 1000) {
      throw badRequest('자기소개는 1000자까지 입력할 수 있습니다.');
    }
    for (const key of [...ARRAY_FIELDS, ...LIST_FIELDS]) {
      const value = key in body ? body[key] : lists[key];
      if ((key in body || key in lists) && !Array.isArray(value)) {
        throw badRequest(`${key} 는 배열이어야 합니다.`);
      }
    }

    await assertCodes(supabase, body, CODE_FIELDS);

    if (Object.keys(lists).length > 0) {
      unwrap(
        await supabase.rpc('save_profile_lists', {
          p_educations: lists.educations ?? null,
          p_careers: lists.careers ?? null,
          p_awards: lists.awards ?? null,
          p_languages: lists.languages ?? null,
        })
      );
    }

    const profile =
      Object.keys(body).length > 0
        ? unwrap(
            await supabase.from('profiles').update(body).eq('id', user.id).select(COLUMNS).single()
          )
        : unwrap(
            await supabase.from('profiles').select(COLUMNS).eq('id', user.id).single()
          );

    return assembleProfile(profile, supabase, true);
  },
  { auth: true }
);

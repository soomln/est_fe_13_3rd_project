import { badRequest, forbidden, notFound } from '../http/errors';
import { defineRoute, resolveUserId, unwrap } from '../http/route';

const COLUMNS = `
  id, name, avatar_url, desired_role, career_level, education_level, github_url, bio,
  educations, careers, awards, languages, skill_codes, interest_codes,
  created_at, updated_at
`;

export async function withEmail(profile, supabase, isOwner) {
  if (!isOwner) return { ...profile, email: null };
  return { ...profile, email: unwrap(await supabase.rpc('my_profile_email')) };
}

const EDITABLE = [
  'name',
  'avatar_url',
  'desired_role',
  'career_level',
  'education_level',
  'email',
  'github_url',
  'bio',
  'educations',
  'careers',
  'awards',
  'languages',
  'skill_codes',
  'interest_codes',
];

const ARRAY_FIELDS = ['educations', 'careers', 'awards', 'languages', 'skill_codes', 'interest_codes'];

export const GET = defineRoute(async ({ params, supabase, user }) => {
  const userId = resolveUserId(params.userId, user);

  const profile = unwrap(
    await supabase.from('profiles').select(COLUMNS).eq('id', userId).maybeSingle()
  );

  if (!profile) throw notFound('프로필을 찾을 수 없습니다.');
  return withEmail(profile, supabase, userId === user?.id);
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

    if (Object.keys(body).length === 0) {
      throw badRequest('수정할 내용이 없습니다.');
    }
    if (typeof body.bio === 'string' && body.bio.length > 1000) {
      throw badRequest('자기소개는 1000자까지 입력할 수 있습니다.');
    }
    for (const key of ARRAY_FIELDS) {
      if (key in body && !Array.isArray(body[key])) {
        throw badRequest(`${key} 는 배열이어야 합니다.`);
      }
    }

    const profile = unwrap(
      await supabase.from('profiles').update(body).eq('id', user.id).select(COLUMNS).single()
    );

    return withEmail(profile, supabase, true);
  },
  { auth: true }
);

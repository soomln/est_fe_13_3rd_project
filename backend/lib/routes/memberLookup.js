import { badRequest } from '../http/errors';
import { defineRoute, unwrap } from '../http/route';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const GET = defineRoute(
  async ({ request, supabase }) => {
    const email = (request.nextUrl.searchParams.get('email') ?? '').trim();

    if (!email) throw badRequest('email 파라미터가 필요합니다.');
    if (!EMAIL.test(email)) throw badRequest('이메일 형식이 올바르지 않습니다.');

    const rows = unwrap(await supabase.rpc('find_member_by_email', { p_email: email }));
    const found = rows?.[0];

    if (!found) return { member: null };

    return {
      member: {
        id: found.id,
        name: found.name,
        avatarUrl: found.avatar_url,
      },
    };
  },
  { auth: true }
);

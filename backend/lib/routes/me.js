import { defineRoute, unwrap } from '../http/route';

export const GET = defineRoute(async ({ user }) => ({ user }));

export const DELETE = defineRoute(
  async ({ supabase }) => {
    unwrap(await supabase.rpc('delete_my_account'));
    return { deleted: true };
  },
  { auth: true }
);

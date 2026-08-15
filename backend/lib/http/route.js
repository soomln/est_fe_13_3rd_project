import { createClient } from '../supabase/server';
import { unauthorized } from './errors';
import { jsonError, jsonOk } from './respond';

export function defineRoute(handler, { auth = false } = {}) {
  return async function routeHandler(request, context) {
    try {
      const supabase = await createClient();

      let user = null;
      try {
        const { data } = await supabase.auth.getClaims();
        if (data?.claims) {
          user = { id: data.claims.sub, email: data.claims.email ?? null };
        }
      } catch {
      }

      if (auth && !user) throw unauthorized();

      const params = context?.params ? await context.params : {};

      return jsonOk(await handler({ request, params, supabase, user }));
    } catch (error) {
      return jsonError(error);
    }
  };
}

export function unwrap({ data, error }) {
  if (error) throw error;
  return data;
}

export function pageOf(items, page, pageSize) {
  const from = (page - 1) * pageSize;
  return { items: items.slice(from, from + pageSize), total: items.length, page, pageSize };
}

export function resolveUserId(rawUserId, user) {
  if (rawUserId !== 'me') return rawUserId;
  if (!user) throw unauthorized();
  return user.id;
}

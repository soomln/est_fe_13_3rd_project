import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSupabaseStub } from '../helpers/supabase';
import { callRoute, makeRequest, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { defineRoute, resolveUserId, unwrap } = await import('../../lib/http/route');
const { HttpError } = await import('../../lib/http/errors');

beforeEach(() => {
  setSupabase(createSupabaseStub());
});

describe('defineRoute', () => {
  it('wraps the handler result in a 200 JSON response', async () => {
    const route = defineRoute(async () => ({ ok: true }));

    const { status, body } = await callRoute(route);

    expect(status).toBe(200);
    expect(body).toEqual({ ok: true });
  });

  it('passes the supabase client to the handler', async () => {
    const stub = createSupabaseStub();
    setSupabase(stub);
    const route = defineRoute(async ({ supabase }) => ({ same: supabase === stub }));

    const { body } = await callRoute(route);

    expect(body).toEqual({ same: true });
  });

  it('builds a user from the claims', async () => {
    setSupabase(createSupabaseStub({ user: { id: 'u1', email: 'a@b.c' } }));
    const route = defineRoute(async ({ user }) => user);

    const { body } = await callRoute(route);

    expect(body).toEqual({ id: 'u1', email: 'a@b.c' });
  });

  it('falls back to null when the claims have no email', async () => {
    setSupabase(
      createSupabaseStub({ auth: { getClaims: { data: { claims: { sub: 'u1' } } } } })
    );
    const route = defineRoute(async ({ user }) => user);

    const { body } = await callRoute(route);

    expect(body).toEqual({ id: 'u1', email: null });
  });

  it('leaves user null when there are no claims', async () => {
    const route = defineRoute(async ({ user }) => ({ user }));

    const { body } = await callRoute(route);

    expect(body).toEqual({ user: null });
  });

  it('treats a throwing getClaims as signed out', async () => {
    setSupabase(
      createSupabaseStub({
        auth: {
          getClaims: () => {
            throw new Error('network down');
          },
        },
      })
    );
    const route = defineRoute(async ({ user }) => ({ user }));

    const { status, body } = await callRoute(route);

    expect(status).toBe(200);
    expect(body).toEqual({ user: null });
  });

  it('answers 401 when auth is required and the caller is signed out', async () => {
    const route = defineRoute(async () => ({ never: true }), { auth: true });

    const { status, body } = await callRoute(route);

    expect(status).toBe(401);
    expect(body.error.code).toBe('NOT_AUTHENTICATED');
  });

  it('passes through when auth is required and the caller is signed in', async () => {
    setSupabase(createSupabaseStub({ user: { id: 'u1' } }));
    const route = defineRoute(async ({ user }) => ({ id: user.id }), { auth: true });

    const { status, body } = await callRoute(route);

    expect(status).toBe(200);
    expect(body).toEqual({ id: 'u1' });
  });

  it('awaits context.params when it is a Promise', async () => {
    const route = defineRoute(async ({ params }) => params);

    const { body } = await callRoute(route, { params: Promise.resolve({ id: 'p1' }) });

    expect(body).toEqual({ id: 'p1' });
  });

  it('passes context.params through when it is a plain object', async () => {
    const route = defineRoute(async ({ params }) => params);

    const { body } = await callRoute(route, { params: { id: 'p2' } });

    expect(body).toEqual({ id: 'p2' });
  });

  it('params is an empty object when there is no context', async () => {
    const route = defineRoute(async ({ params }) => ({ keys: Object.keys(params) }));

    const { body } = await callRoute(route);

    expect(body).toEqual({ keys: [] });
  });

  it('passes the request to the handler untouched', async () => {
    const request = makeRequest('http://localhost/api/x?a=1');
    const route = defineRoute(async ({ request: r }) => ({ a: r.nextUrl.searchParams.get('a') }));

    const { body } = await callRoute(route, { request });

    expect(body).toEqual({ a: '1' });
  });

  it('turns an HttpError thrown by the handler into a response', async () => {
    const route = defineRoute(async () => {
      throw new HttpError(404, 'NOT_FOUND', '없어요');
    });

    const { status, body } = await callRoute(route);

    expect(status).toBe(404);
    expect(body).toEqual({ error: { code: 'NOT_FOUND', message: '없어요' } });
  });

  it('answers 204 when the handler returns undefined', async () => {
    const route = defineRoute(async () => undefined);

    const { status } = await callRoute(route);

    expect(status).toBe(204);
  });

  it('answers 500 when createClient fails', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setSupabase(null);
    const route = defineRoute(async ({ supabase }) => supabase.auth);

    const { status, body } = await callRoute(route);

    expect(status).toBe(500);
    expect(body.error.code).toBe('INTERNAL_ERROR');
    spy.mockRestore();
  });
});

describe('unwrap', () => {
  it('returns data when there is no error', () => {
    expect(unwrap({ data: [1, 2], error: null })).toEqual([1, 2]);
  });

  it('returns null data as-is', () => {
    expect(unwrap({ data: null, error: null })).toBeNull();
  });

  it('throws when there is an error', () => {
    const error = { code: 'PGRST116' };
    expect(() => unwrap({ data: null, error })).toThrow();
  });
});

describe('resolveUserId', () => {
  it("returns any id other than 'me' unchanged", () => {
    expect(resolveUserId('other-id', { id: 'u1' })).toBe('other-id');
  });

  it("resolves 'me' to the signed-in user id", () => {
    expect(resolveUserId('me', { id: 'u1' })).toBe('u1');
  });

  it("throws 401 when 'me' is requested while signed out", () => {
    expect(() => resolveUserId('me', null)).toThrowError(
      expect.objectContaining({ status: 401 })
    );
  });

  it("allows an id other than 'me' even when signed out", () => {
    expect(resolveUserId('other-id', null)).toBe('other-id');
  });
});

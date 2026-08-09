import { beforeEach, describe, expect, it, vi } from 'vitest';

import { argsOf, createSupabaseStub, queryFor } from '../helpers/supabase';
import { callRoute, makeRequest, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { GET } = await import('../../lib/routes/codes');

const url = (qs = '') => `http://localhost/api/codes${qs}`;

let supabase;

beforeEach(() => {
  supabase = createSupabaseStub({
    tables: {
      code_master: {
        data: [
          { group_name: 'job_role', code: 'fe', label: '프론트엔드' },
          { group_name: 'job_role', code: 'be', label: '백엔드' },
          { group_name: 'difficulty', code: 'easy', label: '쉬움' },
        ],
        error: null,
      },
    },
  });
  setSupabase(supabase);
});

describe('GET /api/codes', () => {
  it('answers 400 when groups is missing', async () => {
    const { status, body } = await callRoute(GET, { request: makeRequest(url()) });

    expect(status).toBe(400);
    expect(body.error.code).toBe('BAD_REQUEST');
    expect(body.error.message).toContain('groups');
  });

  it('answers 400 when groups is only commas', async () => {
    const { status } = await callRoute(GET, { request: makeRequest(url('?groups=,,')) });

    expect(status).toBe(400);
  });

  it('groups the codes by the requested group', async () => {
    const { status, body } = await callRoute(GET, {
      request: makeRequest(url('?groups=job_role,difficulty')),
    });

    expect(status).toBe(200);
    expect(body).toEqual({
      job_role: [
        { code: 'fe', label: '프론트엔드' },
        { code: 'be', label: '백엔드' },
      ],
      difficulty: [{ code: 'easy', label: '쉬움' }],
    });
  });

  it('drops rows of groups that were not requested', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url('?groups=difficulty')) });

    expect(body).toEqual({ difficulty: [{ code: 'easy', label: '쉬움' }] });
  });

  it('fills groups with no rows with an empty array', async () => {
    const { body } = await callRoute(GET, { request: makeRequest(url('?groups=tech_stack')) });

    expect(body).toEqual({ tech_stack: [] });
  });

  it('trims whitespace before querying', async () => {
    await callRoute(GET, { request: makeRequest(url('?groups= job_role , difficulty ')) });

    expect(argsOf(queryFor(supabase, 'code_master'), 'in')[0]).toEqual([
      'group_name',
      ['job_role', 'difficulty'],
    ]);
  });

  it('queries only active codes ordered by sort_order', async () => {
    await callRoute(GET, { request: makeRequest(url('?groups=job_role')) });

    const query = queryFor(supabase, 'code_master');
    expect(argsOf(query, 'eq')[0]).toEqual(['is_active', true]);
    expect(argsOf(query, 'order')[0]).toEqual(['sort_order', { ascending: true }]);
  });

  it('propagates a DB error', async () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    setSupabase(
      createSupabaseStub({ tables: { code_master: { data: null, error: { code: 'PGRST205' } } } })
    );

    const { status, body } = await callRoute(GET, { request: makeRequest(url('?groups=job_role')) });

    expect(status).toBe(500);
    expect(body.error.code).toBe('SCHEMA_NOT_READY');
    spy.mockRestore();
  });
});

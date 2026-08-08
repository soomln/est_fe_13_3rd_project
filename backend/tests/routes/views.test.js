import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createSupabaseStub } from '../helpers/supabase';
import { brokenJsonRequest, callRoute, makeRequest, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const { POST } = await import('../../lib/routes/views');

const url = 'http://localhost/api/views';

let supabase;

beforeEach(() => {
  supabase = createSupabaseStub({ rpc: { increment_view: { data: null, error: null } } });
  setSupabase(supabase);
});

describe('POST /api/views', () => {
  it('answers 400 for a broken JSON body', async () => {
    const { status, body } = await callRoute(POST, { request: brokenJsonRequest(url) });

    expect(status).toBe(400);
    expect(body.error.message).toBe('JSON 본문이 필요합니다.');
  });

  it.each(['company', 'portfolio', 'post', 'template'])(
    '%s is an allowed targetType',
    async (targetType) => {
      const request = makeRequest(url, { body: { targetType, targetId: 't1' } });

      const { status, body } = await callRoute(POST, { request });

      expect(status).toBe(200);
      expect(body).toEqual({ ok: true });
    }
  );

  it('answers 400 for a targetType outside the allow list', async () => {
    const request = makeRequest(url, { body: { targetType: 'comment', targetId: 't1' } });

    const { status, body } = await callRoute(POST, { request });

    expect(status).toBe(400);
    expect(body.error.message).toContain('targetType');
  });

  it('answers 400 when targetId is missing', async () => {
    const request = makeRequest(url, { body: { targetType: 'post' } });

    const { status, body } = await callRoute(POST, { request });

    expect(status).toBe(400);
    expect(body.error.message).toBe('targetId 가 필요합니다.');
  });

  it('calls the RPC with the exact arguments', async () => {
    const request = makeRequest(url, { body: { targetType: 'post', targetId: 'p1' } });

    await callRoute(POST, { request });

    expect(supabase.rpcCalls).toEqual([
      { name: 'increment_view', args: { p_target_type: 'post', p_target_id: 'p1' } },
    ]);
  });

  it('signed-out visitors can bump the view count', async () => {
    const request = makeRequest(url, { body: { targetType: 'company', targetId: 'c1' } });

    const { status } = await callRoute(POST, { request });

    expect(status).toBe(200);
  });

  it('turns an RPC failure into an error response', async () => {
    setSupabase(
      createSupabaseStub({ rpc: { increment_view: { data: null, error: { code: '42501' } } } })
    );
    const request = makeRequest(url, { body: { targetType: 'post', targetId: 'p1' } });

    const { status, body } = await callRoute(POST, { request });

    expect(status).toBe(403);
    expect(body.error.code).toBe('FORBIDDEN');
  });
});

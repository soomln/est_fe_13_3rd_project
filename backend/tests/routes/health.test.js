import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { createSupabaseStub } from '../helpers/supabase';
import { callRoute, setSupabase } from '../helpers/routeHarness';

vi.mock('../../lib/supabase/server', async () => {
  const { getSupabase } = await import('../helpers/routeHarness.js');
  return { createClient: async () => getSupabase() };
});

const loadHealth = () => import('../../lib/routes/health');

const healthyStub = (extra = {}) =>
  createSupabaseStub({
    tables: {
      code_master: {
        data: [{ group_name: 'job_role' }, { group_name: 'difficulty' }],
        error: null,
        count: 123,
      },
      companies: { data: [], error: null, count: 20 },
      v_companies: { data: [{ id: 'c1' }], error: null },
      profiles: { data: { name: '장도담', avatar_url: 'https://cdn/a.png' }, error: null },
      documents: { data: [], error: null, count: 4 },
    },
    rpc: { get_recommended_companies: { data: [{ id: 'c1' }, { id: 'c2' }], error: null } },
    ...extra,
  });

const byLabel = (body, label) => body.checks.find((c) => c.label === label);

beforeEach(() => {
  vi.resetModules();
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('GET /api/health', () => {
  it('every check reports ok when the stack is healthy', async () => {
    setSupabase(healthyStub({ user: { id: 'u1', email: 'a@b.c' } }));

    const { GET } = await loadHealth();
    const { status, body } = await callRoute(GET);

    expect(status).toBe(200);
    expect(body.checks).toHaveLength(8);
    expect(body.checks.every((c) => c.ok)).toBe(true);
  });

  it('only the env check fails when the env var is missing', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', '');
    setSupabase(healthyStub());

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    const check = byLabel(body, '환경변수');
    expect(check.ok).toBe(false);
    expect(check.detail).toContain('.env.local');
  });

  it('shows the url when the env var is set', async () => {
    vi.stubEnv('NEXT_PUBLIC_SUPABASE_URL', 'https://abc.supabase.co');
    setSupabase(healthyStub());

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, '환경변수').detail).toBe('https://abc.supabase.co');
  });

  it('shows the email and id when signed in', async () => {
    setSupabase(healthyStub({ user: { id: 'u1', email: 'a@b.c' } }));

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, '로그인 상태').detail).toBe('a@b.c / u1');
  });

  it('falls back to a placeholder when there is no email', async () => {
    setSupabase(healthyStub({ auth: { getClaims: { data: { claims: { sub: 'u1' } } } } }));

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, '로그인 상태').detail).toBe('(이메일 없음) / u1');
  });

  it('reports signed out when there is no user', async () => {
    setSupabase(healthyStub());

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, '로그인 상태').detail).toBe('비로그인');
  });

  it('counts code_master rows and groups', async () => {
    setSupabase(healthyStub());

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'code_master Seed').detail).toBe('123건 / 2개 그룹');
  });

  it('flags an empty code_master as a missing seed', async () => {
    setSupabase(healthyStub({ tables: { code_master: { data: [], error: null, count: 0 } } }));

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    const check = byLabel(body, 'code_master Seed');
    expect(check.ok).toBe(false);
    expect(check.detail).toContain('Seed SQL 미실행');
  });

  it('carries the error message when the code_master query fails', async () => {
    setSupabase(
      healthyStub({ tables: { code_master: { data: null, error: { message: '권한 없음' } } } })
    );

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'code_master Seed')).toMatchObject({ ok: false, detail: '권한 없음' });
  });

  it('stringifies an error that has no message', async () => {
    setSupabase(healthyStub({ tables: { companies: { data: null, error: 'boom' } } }));

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'companies 테이블')).toMatchObject({ ok: false, detail: 'boom' });
  });

  it('shows the companies row count', async () => {
    setSupabase(healthyStub());

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'companies 테이블').detail).toContain('20건');
  });

  it('shows 0 when the companies count is null', async () => {
    setSupabase(healthyStub({ tables: { companies: { data: [], error: null, count: null } } }));

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'companies 테이블').detail).toContain('0건');
  });

  it('catches a failing v_companies view query', async () => {
    setSupabase(healthyStub({ tables: { v_companies: { data: null, error: { message: '뷰 없음' } } } }));

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'v_companies 뷰')).toMatchObject({ ok: false, detail: '뷰 없음' });
  });

  it('shows how many rows the recommendation RPC returned', async () => {
    setSupabase(healthyStub());

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'RPC get_recommended_companies').detail).toBe('2건 반환');
  });

  it('reads a null recommendation RPC result as 0 rows', async () => {
    setSupabase(healthyStub({ rpc: { get_recommended_companies: { data: null, error: null } } }));

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'RPC get_recommended_companies').detail).toBe('0건 반환');
  });

  it('catches a failing recommendation RPC', async () => {
    setSupabase(
      healthyStub({
        rpc: { get_recommended_companies: { data: null, error: { message: '함수 없음' } } },
      })
    );

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'RPC get_recommended_companies').ok).toBe(false);
  });

  it('skips the profile trigger check when signed out', async () => {
    setSupabase(healthyStub());

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'Profile 자동 생성 트리거').detail).toBe('비로그인 - 건너뜀');
  });

  it('shows the name and whether an avatar exists', async () => {
    setSupabase(healthyStub({ user: { id: 'u1', email: 'a@b.c' } }));

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'Profile 자동 생성 트리거').detail).toBe('name=장도담 / avatar=O');
  });

  it('still reports when the name and avatar are empty', async () => {
    setSupabase(
      healthyStub({
        user: { id: 'u1' },
        tables: { profiles: { data: { name: null, avatar_url: null }, error: null } },
      })
    );

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'Profile 자동 생성 트리거').detail).toBe('name=(없음) / avatar=X');
  });

  it('flags a missing profile row as a trigger problem', async () => {
    setSupabase(
      healthyStub({ user: { id: 'u1' }, tables: { profiles: { data: null, error: null } } })
    );

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    const check = byLabel(body, 'Profile 자동 생성 트리거');
    expect(check.ok).toBe(false);
    expect(check.detail).toContain('handle_new_user');
  });

  it('carries the error when the profile query fails', async () => {
    setSupabase(
      healthyStub({
        user: { id: 'u1' },
        tables: { profiles: { data: null, error: { message: 'RLS 차단' } } },
      })
    );

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'Profile 자동 생성 트리거').detail).toBe('RLS 차단');
  });

  it('shows my document count when signed in', async () => {
    setSupabase(healthyStub({ user: { id: 'u1' } }));

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'RLS - documents 는 본인 것만').detail).toBe('내 문서 4건');
  });

  it('explains that 0 rows is expected when signed out', async () => {
    setSupabase(healthyStub({ tables: { documents: { data: [], error: null, count: 0 } } }));

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'RLS - documents 는 본인 것만').detail).toContain('0이어야 정상');
  });

  it('shows 0 when the documents count is null', async () => {
    setSupabase(
      healthyStub({ user: { id: 'u1' }, tables: { documents: { data: [], error: null, count: null } } })
    );

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'RLS - documents 는 본인 것만').detail).toBe('내 문서 0건');
  });

  it('shows 0 for a null count while signed out', async () => {
    setSupabase(healthyStub({ tables: { documents: { data: [], error: null, count: null } } }));

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'RLS - documents 는 본인 것만').detail).toBe(
      '비로그인 조회 0건 (0이어야 정상)'
    );
  });

  it('catches a failing documents query', async () => {
    setSupabase(healthyStub({ tables: { documents: { data: null, error: { message: '차단' } } } }));

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(byLabel(body, 'RLS - documents 는 본인 것만').ok).toBe(false);
  });

  it('includes the user in the response', async () => {
    setSupabase(healthyStub({ user: { id: 'u1', email: 'a@b.c' } }));

    const { GET } = await loadHealth();
    const { body } = await callRoute(GET);

    expect(body.user).toEqual({ id: 'u1', email: 'a@b.c' });
  });
});

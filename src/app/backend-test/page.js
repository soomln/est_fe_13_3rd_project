'use client';

import { getCurrentUser, OAUTH_PROVIDERS, onAuthChange, signInWith, signOut } from '@backend/lib/api/auth';
import { getCodes } from '@backend/lib/api/codes';
import { getMyProfile, getProfileStats } from '@backend/lib/api/profile';
import { useCallback, useEffect, useState } from 'react';

export default function BackendTestPage() {
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);
  const [checks, setChecks] = useState([]);
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    setAuthError(new URLSearchParams(window.location.search).get('auth_error'));
  }, []);

  useEffect(() => onAuthChange(setUser), []);

  const runChecks = useCallback(async () => {
    setBusy(true);
    const results = [];

    const step = async (label, fn) => {
      try {
        results.push({ label, ok: true, detail: await fn() });
      } catch (e) {
        results.push({ label, ok: false, detail: e.message });
      }
    };

    try {
      const health = await fetch('/api/health').then((r) => r.json());
      if (health.error) throw new Error(health.error.message);
      results.push(...health.checks.map((c) => ({ ...c, label: `[server] ${c.label}` })));
      setUser(health.user);
    } catch (e) {
      results.push({ label: '[server] /api/health', ok: false, detail: e.message });
    }

    await step('[client] getCurrentUser()', async () => {
      const me = await getCurrentUser();
      return me ? `${me.email ?? '(이메일 없음)'} / ${me.id}` : '비로그인';
    });

    await step('[client] getCodes(job_role)', async () => {
      const roles = await getCodes('job_role');
      if (!roles.length) throw new Error('0건 - Seed SQL 확인 필요');
      return `${roles.slice(0, 3).map((r) => r.label).join(', ')} … (총 ${roles.length}개)`;
    });

    await step('[client] getMyProfile()', async () => {
      const profile = await getMyProfile();
      return profile ? `name=${profile.name ?? '(없음)'}` : '비로그인 또는 프로필 없음';
    });

    await step('[client] getProfileStats(me)', async () => {
      const me = await getCurrentUser();
      if (!me) return '비로그인 - 건너뜀';
      const s = await getProfileStats('me');
      return `문서 ${s.docCount} · 포트폴리오 ${s.portfolioCount} · 면접스크랩 ${s.interviewScrapCount}`;
    });

    setChecks(results);
    setBusy(false);
  }, []);

  useEffect(() => {
    runChecks();
  }, [runChecks]);

  return (
    <main style={S.page}>
      <h1 style={S.h1}>백엔드 Smoke Test</h1>
      <p style={S.sub}>
        백엔드 동작 확인용입니다. 디자인 화면과 무관하며 배포 전에 삭제해도 됩니다.
      </p>

      {authError && (
        <div style={S.error}>
          <strong>로그인 실패</strong>
          <div style={{ marginTop: 6, wordBreak: 'break-all' }}>{authError}</div>
        </div>
      )}

      <section style={S.card}>
        <h2 style={S.h2}>1. 소셜 로그인</h2>
        {user ? (
          <>
            <p style={S.mono}>
              로그인됨 — {user.email ?? '(이메일 없음)'}
              <br />
              id: {user.id}
            </p>
            <button
              style={S.btn}
              onClick={async () => {
                await signOut();
                runChecks();
              }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {OAUTH_PROVIDERS.map((p) => (
              <button
                key={p.id}
                style={S.btn}
                onClick={() =>
                  signInWith(p.id, { next: '/backend-test' }).catch((e) => setAuthError(e.message))
                }
              >
                {p.label}로 로그인
              </button>
            ))}
          </div>
        )}
        <p style={S.hint}>
          Supabase 대시보드에서 Provider를 켜야 각 소셜 로그인이 동작합니다.
        </p>
      </section>

      <section style={S.card}>
        <h2 style={S.h2}>2. 연결 확인</h2>
        <button style={S.btn} onClick={runChecks} disabled={busy}>
          {busy ? '확인 중…' : '다시 확인'}
        </button>
        <ul style={S.list}>
          {checks.map((c) => (
            <li key={c.label} style={S.item}>
              <span style={{ ...S.badge, background: c.ok ? '#00A63D' : '#DC2626' }}>
                {c.ok ? 'OK' : 'FAIL'}
              </span>
              <span style={S.itemLabel}>{c.label}</span>
              <span style={S.itemDetail}>{c.detail}</span>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

const S = {
  page: { maxWidth: 820, margin: '0 auto', padding: '48px 24px', fontFamily: 'system-ui, sans-serif' },
  h1: { fontSize: 24, fontWeight: 700, marginBottom: 8 },
  h2: { fontSize: 16, fontWeight: 700, marginBottom: 12 },
  sub: { color: '#6F6F6F', fontSize: 13, marginBottom: 24 },
  card: { border: '1px solid #EEEEEE', borderRadius: 12, padding: 20, marginBottom: 16 },
  btn: {
    padding: '8px 14px',
    border: '1px solid #ACAEAD',
    borderRadius: 8,
    background: '#FFFFFF',
    cursor: 'pointer',
    fontSize: 14,
  },
  list: { marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 },
  item: { display: 'flex', alignItems: 'baseline', gap: 10, fontSize: 13 },
  itemLabel: { minWidth: 280, fontWeight: 600 },
  itemDetail: { color: '#6F6F6F', wordBreak: 'break-all' },
  badge: {
    color: '#FFFFFF',
    borderRadius: 4,
    padding: '1px 6px',
    fontSize: 11,
    fontWeight: 700,
    minWidth: 38,
    textAlign: 'center',
  },
  mono: { fontSize: 13, lineHeight: 1.6, marginBottom: 12, wordBreak: 'break-all' },
  hint: { marginTop: 12, fontSize: 12, color: '#6F6F6F' },
  error: {
    border: '1px solid #FECACA',
    background: '#FEF2F2',
    color: '#DC2626',
    borderRadius: 8,
    padding: 14,
    fontSize: 13,
    marginBottom: 16,
  },
};

'use client';

import { getCurrentUser, OAUTH_PROVIDERS, onAuthChange, signInWith, signOut } from '@backend/lib/api/auth';
import { getCodes } from '@backend/lib/api/codes';
import { getCompany, listCompanies } from '@backend/lib/api/companies';
import { getMyProfile, getProfileStats } from '@backend/lib/api/profile';
import { useCallback, useEffect, useState } from 'react';

export default function BackendTestPage() {
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);
  const [checks, setChecks] = useState([]);
  const [busy, setBusy] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [companyError, setCompanyError] = useState(null);
  const [detail, setDetail] = useState(null);

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

    try {
      const { items } = await listCompanies({ sort: 'name', pageSize: 50 });
      setCompanies(items);
      setCompanyError(null);
      if (items.length > 0) setDetail(await getCompany(items[0].slug));
    } catch (e) {
      setCompanies([]);
      setCompanyError(e.message);
    }

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

      <section style={S.card}>
        <h2 style={S.h2}>3. 기업 데이터 ({companies.length}곳)</h2>

        {companyError && (
          <p className='font_body_s_r' style={S.error} role='alert'>
            {companyError}
          </p>
        )}

        {companies.length > 0 && (
          <>
            <ul style={S.summary}>
              <li>
                로고 <b>{companies.filter((c) => c.logo).length}</b>/{companies.length}
              </li>
              <li>
                평점 <b>{companies.filter((c) => c.rating != null).length}</b>/{companies.length}
              </li>
              <li>
                태그 <b>{companies.filter((c) => c.tags?.length).length}</b>/{companies.length}
              </li>
            </ul>

            <div style={S.grid}>
              {companies.map((c) => (
                <button
                  key={c.id}
                  type='button'
                  style={S.companyCard}
                  onClick={() => getCompany(c.slug).then(setDetail)}
                >
                  <span style={S.logoBox}>
                    {c.logo ? (
                      <img src={c.logo} alt='' style={S.logoImg} />
                    ) : (
                      <span style={S.noLogo}>없음</span>
                    )}
                  </span>
                  <span style={S.companyName}>{c.name}</span>
                  <span style={S.companyMeta}>{c.category}</span>
                  <span style={S.companyMeta}>
                    ★ {c.rating ?? '-'} · 관심 {c.favorite} · 후기 {c.review}
                  </span>
                </button>
              ))}
            </div>

            {detail && (
              <div style={S.detailBox}>
                <div style={S.detailTitle}>
                  {detail.name} <span style={S.itemDetail}>/api/companies/{detail.slug}</span>
                </div>
                <ul style={S.list}>
                  {[
                    ['로고', detail.logo],
                    ['업종', detail.industry],
                    ['소개', detail.intro],
                    ['대표자', detail.ceo],
                    ['설립일', detail.founded],
                    ['본사', detail.address],
                    ['홈페이지', detail.homepage],
                    ['핵심가치', detail.values?.length ? `${detail.values.length}개` : null],
                    ['주요서비스', detail.services?.length ? `${detail.services.length}개` : null],
                    ['복지', detail.benefits?.length ? `${detail.benefits.length}개` : null],
                    ['한눈에보기', detail.summary?.length ? `${detail.summary.length}개` : null],
                    ['뉴스', detail.news?.length ? `${detail.news.length}건` : null],
                  ].map(([label, value]) => (
                    <li key={label} style={S.item}>
                      <span style={{ ...S.badge, background: value ? '#00A63D' : '#ACAEAD' }}>
                        {value ? 'OK' : '없음'}
                      </span>
                      <span style={{ ...S.itemLabel, minWidth: 90 }}>{label}</span>
                      <span style={S.itemDetail}>{String(value ?? '').slice(0, 60)}</span>
                    </li>
                  ))}
                </ul>
                {detail.news?.length > 0 && (
                  <ul style={{ ...S.list, marginTop: 12 }}>
                    {detail.news.map((n) => (
                      <li key={n.url ?? n.title} style={S.item}>
                        <span style={S.itemDetail}>{n.date}</span>
                        <a href={n.url} target='_blank' rel='noreferrer' style={S.newsLink}>
                          {n.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}
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
  summary: { display: 'flex', gap: 16, marginTop: 12, fontSize: 13, color: '#6F6F6F' },
  grid: {
    marginTop: 16,
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: 10,
  },
  companyCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 4,
    padding: 12,
    border: '1px solid #EEEEEE',
    borderRadius: 10,
    background: '#FFFFFF',
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
  },
  logoBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: 40,
    marginBottom: 6,
    background: '#FAFAFA',
    borderRadius: 6,
    overflow: 'hidden',
  },
  logoImg: { maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' },
  noLogo: { fontSize: 11, color: '#DC2626' },
  companyName: { fontSize: 13, fontWeight: 700, color: '#111111' },
  companyMeta: { fontSize: 11, color: '#6F6F6F' },
  detailBox: { marginTop: 20, padding: 16, background: '#FAFAFA', borderRadius: 10 },
  detailTitle: { fontSize: 14, fontWeight: 700, marginBottom: 4 },
  newsLink: { fontSize: 12, color: '#00A63D', textDecoration: 'none' },
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

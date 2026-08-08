'use client';

import { getCurrentUser, OAUTH_PROVIDERS, onAuthChange, signInWith, signOut } from '@backend/lib/api/auth';
import { getCodes } from '@backend/lib/api/codes';
import { getCompany, listCompanies } from '@backend/lib/api/companies';
import {
  createDocument,
  createDocumentFromTemplate,
  deleteDocuments,
  listMyDocuments,
  updateDocument,
} from '@backend/lib/api/documents';
import {
  createPortfolio,
  deletePortfolios,
  getPortfolio,
  listMyPortfolios,
  listPortfolios,
  publishPortfolio,
  togglePortfolioBookmark,
  togglePortfolioLike,
  updatePortfolio,
  uploadPortfolioImages,
} from '@backend/lib/api/portfolio';
import { createComment, deleteComment, listComments, toggleCommentLike } from '@backend/lib/api/comments';
import {
  createPost,
  deletePosts,
  listMyPosts,
  listPosts,
  togglePostLike,
  togglePostScrap,
} from '@backend/lib/api/posts';
import { getMyProfile, getProfileStats } from '@backend/lib/api/profile';
import { buildResumeHtmlFromMyProfile } from '@backend/lib/api/resumeFill';
import { listTemplates } from '@backend/lib/api/templates';
import { useCallback, useEffect, useRef, useState } from 'react';

export default function BackendTestPage() {
  const [authError, setAuthError] = useState(null);
  const [user, setUser] = useState(null);
  const [checks, setChecks] = useState([]);
  const [busy, setBusy] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [companyError, setCompanyError] = useState(null);
  const [detail, setDetail] = useState(null);
  const [templates, setTemplates] = useState(null);
  const [documents, setDocuments] = useState(null);
  const [docLog, setDocLog] = useState([]);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [gallery, setGallery] = useState(null);
  const [myPortfolios, setMyPortfolios] = useState(null);
  const [posts, setPosts] = useState(null);
  const [openPostId, setOpenPostId] = useState(null);
  const [comments, setComments] = useState(null);

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

    try {
      setTemplates(await listTemplates({ sort: 'popular', pageSize: 20 }));
    } catch (e) {
      setTemplates({ error: e.message });
    }

    try {
      setDocuments(await listMyDocuments({ pageSize: 20 }));
    } catch (e) {
      setDocuments({ error: e.message });
    }

    try {
      setGallery(await listPortfolios({ pageSize: 20 }));
    } catch (e) {
      setGallery({ error: e.message });
    }

    try {
      setMyPortfolios(await listMyPortfolios({ pageSize: 20 }));
    } catch (e) {
      setMyPortfolios({ error: e.message });
    }

    try {
      setPosts(await listPosts({ pageSize: 20 }));
    } catch (e) {
      setPosts({ error: e.message });
    }

    setChecks(results);
    setBusy(false);
  }, []);

  const reloadPosts = useCallback(async () => {
    setPosts(await listPosts({ pageSize: 20 }));
  }, []);

  const openComments = useCallback(async (postId) => {
    setOpenPostId(postId);
    setComments(await listComments(postId, { pageSize: 20 }).catch((e) => ({ error: e.message })));
  }, []);

  const reloadPortfolios = useCallback(async () => {
    setGallery(await listPortfolios({ pageSize: 20 }));
    setMyPortfolios(await listMyPortfolios({ pageSize: 20 }).catch((e) => ({ error: e.message })));
  }, []);

  const logSeq = useRef(0);

  const log = useCallback((ok, message) => {
    logSeq.current += 1;
    const entry = { id: logSeq.current, ok, message, at: new Date().toLocaleTimeString() };
    setDocLog((prev) => [entry, ...prev].slice(0, 20));
  }, []);

  const reloadDocuments = useCallback(async () => {
    setDocuments(await listMyDocuments({ pageSize: 20 }));
  }, []);

  const runDocAction = useCallback(
    async (label, fn) => {
      try {
        log(true, `${label} — ${(await fn()) ?? '완료'}`);
        await reloadDocuments();
      } catch (e) {
        log(false, `${label} — ${e.message}`);
        await reloadDocuments().catch(() => {});
      }
    },
    [log, reloadDocuments]
  );

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

      <section style={S.card}>
        <h2 style={S.h2}>4. 무료 양식</h2>
        {templates?.error && (
          <p className='font_body_s_r' style={S.error} role='alert'>
            {templates.error}
          </p>
        )}
        {templates?.counts && (
          <>
            <ul style={S.summary}>
              <li>
                전체 <b>{templates.counts.all}</b>
              </li>
              <li>
                이력서 <b>{templates.counts.resume}</b>
              </li>
              <li>
                자기소개서 <b>{templates.counts.cover_letter}</b>
              </li>
            </ul>
            <div style={S.grid}>
              {templates.items.map((t) => (
                <div key={t.id} style={S.companyCard}>
                  <span style={{ ...S.logoBox, height: 90 }}>
                    {t.thumbnail ? (
                      <img src={t.thumbnail} alt='' style={S.logoImg} />
                    ) : (
                      <span style={S.noLogo}>썸네일 없음</span>
                    )}
                  </span>
                  <span style={S.companyMeta}>
                    {t.docType === 'resume' ? '이력서' : '자기소개서'}
                  </span>
                  <span style={S.companyName}>{t.title}</span>
                  <span style={S.companyMeta}>조회 {t.views.toLocaleString()}</span>
                  <button
                    type='button'
                    style={S.miniBtn}
                    onClick={() =>
                      runDocAction(`양식으로 문서 생성 (${t.title})`, async () => {
                        const d = await createDocumentFromTemplate(t.id);
                        return `id=${d.id.slice(0, 8)}…`;
                      })
                    }
                  >
                    이 양식으로 문서 만들기
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <section style={S.card}>
        <h2 style={S.h2}>5. 문서함</h2>
        {documents?.error && (
          <p className='font_body_s_r' style={S.error} role='alert'>
            {documents.error}
          </p>
        )}
        {documents?.counts && (
          <>
            <ul style={S.summary}>
              <li>
                전체 <b>{documents.counts.all}</b>
              </li>
              <li>
                이력서 <b>{documents.counts.resume}</b>/10
              </li>
              <li>
                자기소개서 <b>{documents.counts.cover_letter}</b>/10
              </li>
            </ul>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
              <button
                type='button'
                style={S.btn}
                onClick={() =>
                  runDocAction('빈 이력서 생성', async () => {
                    const d = await createDocument({ docType: 'resume', title: '테스트 이력서' });
                    return `id=${d.id.slice(0, 8)}…`;
                  })
                }
              >
                빈 이력서 생성
              </button>
              <button
                type='button'
                style={S.btn}
                onClick={() =>
                  runDocAction('10개 제한 확인 (11개까지 시도)', async () => {
                    for (let i = 0; i < 11; i += 1) {
                      try {
                        await createDocument({ docType: 'resume', title: `제한테스트 ${i + 1}` });
                      } catch (e) {
                        return `${i}개 생성 후 차단됨 → "${e.message}"`;
                      }
                    }
                    return '11개가 모두 생성됨 (트리거 미작동)';
                  })
                }
              >
                10개 제한 확인
              </button>
              <button
                type='button'
                style={S.btn}
                onClick={() =>
                  runDocAction('내 정보 불러오기', async () => {
                    const html = await buildResumeHtmlFromMyProfile();
                    if (!html) return '프로필이 비어 있습니다';
                    const d = await createDocument({
                      docType: 'resume',
                      title: '내 정보로 만든 이력서',
                      contentHtml: html,
                    });
                    return `${html.length}자 생성 → 문서 id=${d.id.slice(0, 8)}…`;
                  })
                }
              >
                내 정보 불러오기 → 문서 생성
              </button>
              <button
                type='button'
                style={S.btn}
                onClick={() =>
                  runDocAction('전체 삭제', async () => {
                    const n = await deleteDocuments(documents.items.map((d) => d.id));
                    return `${n}건 삭제`;
                  })
                }
              >
                전체 삭제
              </button>
            </div>

            <ul style={S.list}>
              {documents.items.map((d, i) => (
                <li key={d.id} style={S.item}>
                  <span style={{ ...S.badge, background: d.docType === 'resume' ? '#00A63D' : '#FF9900' }}>
                    {d.docType === 'resume' ? '이력서' : '자소서'}
                  </span>
                  <span style={{ ...S.itemLabel, minWidth: 200 }}>
                    {i + 1}. {d.title}
                  </span>
                  <span style={S.itemDetail}>{new Date(d.updatedAt).toLocaleString()}</span>
                  <button
                    type='button'
                    style={S.miniBtn}
                    onClick={() =>
                      runDocAction('제목 수정', async () => {
                        const r = await updateDocument(d.id, { title: `${d.title} (수정됨)` });
                        return r.title;
                      })
                    }
                  >
                    수정
                  </button>
                  <button
                    type='button'
                    style={S.miniBtn}
                    onClick={() => runDocAction('삭제', async () => `${await deleteDocuments([d.id])}건`)}
                  >
                    삭제
                  </button>
                </li>
              ))}
              {documents.items.length === 0 && (
                <li style={S.itemDetail}>문서가 없습니다. 위 버튼으로 만들어 보세요.</li>
              )}
            </ul>

          </>
        )}
      </section>

      <section style={S.card}>
        <h2 style={S.h2}>6. 포트폴리오</h2>

        {gallery?.error && (
          <p className='font_body_s_r' style={S.error} role='alert'>
            {gallery.error}
          </p>
        )}

        <ul style={S.summary}>
          <li>
            갤러리(공개) <b>{gallery?.total ?? 0}</b>
          </li>
          <li>
            내 포트폴리오 <b>{myPortfolios?.error ? '-' : myPortfolios?.total ?? 0}</b>
          </li>
        </ul>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <button
            type='button'
            style={S.btn}
            onClick={() =>
              runDocAction('임시저장 생성', async () => {
                const p = await createPortfolio({
                  title: '테스트 포트폴리오',
                  category: 'web',
                  description: '스모크 테스트',
                  content: [{ type: 'text', html: '<p>본문</p>' }],
                });
                await reloadPortfolios();
                return `draft 생성 id=${p.id.slice(0, 8)}…`;
              })
            }
          >
            임시저장 생성
          </button>

          <label style={{ ...S.btn, display: 'inline-flex', alignItems: 'center' }}>
            이미지 업로드
            <input
              type='file'
              accept='image/*'
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = '';
                if (files.length === 0) return;

                runDocAction(`이미지 업로드 (${files.length}장)`, async () => {
                  let target = myPortfolios?.items?.[0];
                  if (!target) {
                    target = await createPortfolio({
                      title: '이미지 업로드 테스트',
                      category: 'web',
                    });
                  }

                  const urls = await uploadPortfolioImages(target.id, files);
                  const current = await getPortfolio(target.id);

                  await updatePortfolio(target.id, {
                    thumbnailUrl: current.thumbnailUrl || urls[0],
                    content: [
                      ...(current.content ?? []),
                      ...urls.map((url) => ({ type: 'image', url })),
                    ],
                  });

                  await reloadPortfolios();
                  return `${urls.length}장 → ${urls[0]}`;
                });
              }}
            />
          </label>

          <button
            type='button'
            style={S.btn}
            onClick={() =>
              runDocAction('내 포트폴리오 전체 삭제', async () => {
                const n = await deletePortfolios((myPortfolios?.items ?? []).map((p) => p.id));
                await reloadPortfolios();
                return `${n}건 삭제`;
              })
            }
          >
            내 포트폴리오 전체 삭제
          </button>
        </div>

        {myPortfolios?.error && (
          <p className='font_body_s_r' style={{ ...S.hint, color: '#DC2626' }}>
            내 포트폴리오: {myPortfolios.error}
          </p>
        )}

        <ul style={S.list}>
          {(myPortfolios?.items ?? []).map((p) => (
            <li key={p.id} style={S.item}>
              <span style={{ ...S.badge, background: p.status === 'published' ? '#00A63D' : '#ACAEAD' }}>
                {p.status === 'published' ? '공개' : '초안'}
              </span>
              <span style={{ ...S.itemLabel, minWidth: 180 }}>{p.title}</span>
              <span style={S.itemDetail}>
                {p.category ?? '-'} · 👍 {p.likeCount} · 🔖 {p.bookmarkCount} · 👁 {p.viewCount}
              </span>
              {p.status !== 'published' && (
                <button
                  type='button'
                  style={S.miniBtn}
                  onClick={() =>
                    runDocAction('공개 전환', async () => {
                      const r = await publishPortfolio(p.id);
                      await reloadPortfolios();
                      return r.status;
                    })
                  }
                >
                  공개
                </button>
              )}
            </li>
          ))}
        </ul>

        <div style={S.grid}>
          {(gallery?.items ?? []).map((p) => (
            <div key={p.id} style={S.companyCard}>
              <span style={{ ...S.logoBox, height: 90 }}>
                {p.thumbnailUrl ? (
                  <img src={p.thumbnailUrl} alt='' style={S.logoImg} />
                ) : (
                  <span style={S.noLogo}>썸네일 없음</span>
                )}
              </span>
              <span style={S.companyName}>{p.title}</span>
              <span style={S.companyMeta}>
                {p.authorName ?? '작성자 없음'} · {p.category ?? '-'}
              </span>
              <span style={S.companyMeta}>
                👍 {p.likeCount} · 🔖 {p.bookmarkCount} · 👁 {p.viewCount}
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                <button
                  type='button'
                  style={S.miniBtn}
                  onClick={() =>
                    runDocAction('좋아요 토글', async () => {
                      const on = await togglePortfolioLike(p.id);
                      await reloadPortfolios();
                      return on ? '켜짐' : '꺼짐';
                    })
                  }
                >
                  좋아요
                </button>
                <button
                  type='button'
                  style={S.miniBtn}
                  onClick={() =>
                    runDocAction('북마크 토글', async () => {
                      const on = await togglePortfolioBookmark(p.id);
                      await reloadPortfolios();
                      return on ? '켜짐' : '꺼짐';
                    })
                  }
                >
                  북마크
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={S.card}>
        <h2 style={S.h2}>7. 면접 후기 · 족보</h2>

        {posts?.error && (
          <p className='font_body_s_r' style={S.error} role='alert'>
            {posts.error}
          </p>
        )}

        <ul style={S.summary}>
          <li>
            전체 <b>{posts?.total ?? 0}</b>
          </li>
          <li>
            후기 <b>{(posts?.items ?? []).filter((p) => p.postType === 'review').length}</b>
          </li>
          <li>
            족보 <b>{(posts?.items ?? []).filter((p) => p.postType === 'qbank').length}</b>
          </li>
        </ul>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <button
            type='button'
            style={S.btn}
            onClick={() =>
              runDocAction('면접 후기 작성', async () => {
                const p = await createPost({
                  postType: 'review',
                  companyId: companies[0]?.id ?? null,
                  title: '테스트 면접 후기',
                  body: '분위기는 편안했고 꼬리질문이 많았습니다.',
                  difficultyCode: 'normal',
                  difficultyScore: 3.0,
                  passResultCode: 'pass',
                  channelCode: 'online',
                  jobRoleCode: 'frontend',
                  positionLevel: '신입',
                  educationLevel: '대졸',
                  tags: ['CS', '기술면접'],
                  overallComment: '준비한 만큼 나옵니다',
                });
                await reloadPosts();
                return `${p.companyName} · ${p.difficulty} · ${p.result} · ${p.route}`;
              })
            }
          >
            면접 후기 작성
          </button>

          <button
            type='button'
            style={S.btn}
            onClick={() =>
              runDocAction('면접 족보 작성', async () => {
                const p = await createPost({
                  postType: 'qbank',
                  companyId: companies[0]?.id ?? null,
                  questions: ['REST API의 장점은?', '브라우저 렌더링 과정을 설명하세요', '클로저란?'],
                  difficultyCode: 'hard',
                  difficultyScore: 4.5,
                  passResultCode: 'waiting',
                  channelCode: 'etc',
                  channelEtc: '잡코리아',
                  jobRoleCode: 'backend',
                  positionLevel: '신입',
                  educationLevel: '대졸',
                });
                await reloadPosts();
                return `질문 ${p.questions.length}개 · 경로 "${p.route}" (기타 처리 확인)`;
              })
            }
          >
            면접 족보 작성
          </button>

          <button
            type='button'
            style={S.btn}
            onClick={() =>
              runDocAction('내 글 전체 삭제', async () => {
                const mine = await listMyPosts({ pageSize: 50 });
                const n = await deletePosts(mine.items.map((p) => p.id));
                setOpenPostId(null);
                setComments(null);
                await reloadPosts();
                return `${n}건 삭제`;
              })
            }
          >
            내 글 전체 삭제
          </button>
        </div>

        <ul style={S.list}>
          {(posts?.items ?? []).map((p) => (
            <li key={p.id} style={{ ...S.item, flexWrap: 'wrap' }}>
              <span style={{ ...S.badge, background: p.postType === 'review' ? '#00A63D' : '#8635F6' }}>
                {p.postType === 'review' ? '후기' : '족보'}
              </span>
              <span style={{ ...S.itemLabel, minWidth: 170 }}>
                {p.title || `질문 ${p.questions.length}개`}
              </span>
              <span style={S.itemDetail}>
                {p.companyName} · {p.difficulty} · {p.result} · {p.route} · {p.jobInfo}
              </span>
              <span style={S.itemDetail}>
                👍 {p.likeCount} · 🔖 {p.scrapCount} · 💬 {p.commentCount}
              </span>
              <button
                type='button'
                style={S.miniBtn}
                onClick={() =>
                  runDocAction('도움돼요 토글', async () => {
                    const on = await togglePostLike(p.id);
                    await reloadPosts();
                    return on ? '켜짐' : '꺼짐';
                  })
                }
              >
                도움돼요
              </button>
              <button
                type='button'
                style={S.miniBtn}
                onClick={() =>
                  runDocAction('퍼가요 토글', async () => {
                    const on = await togglePostScrap(p.id);
                    await reloadPosts();
                    return on ? '켜짐' : '꺼짐';
                  })
                }
              >
                퍼가요
              </button>
              <button type='button' style={S.miniBtn} onClick={() => openComments(p.id)}>
                댓글 보기
              </button>
              <button
                type='button'
                style={S.miniBtn}
                onClick={() =>
                  runDocAction('댓글 작성', async () => {
                    const c = await createComment(p.id, `테스트 댓글 ${new Date().toLocaleTimeString()}`);
                    await reloadPosts();
                    await openComments(p.id);
                    return c.body;
                  })
                }
              >
                댓글 달기
              </button>
            </li>
          ))}
          {(posts?.items ?? []).length === 0 && (
            <li style={S.itemDetail}>글이 없습니다. 위 버튼으로 작성해 보세요.</li>
          )}
        </ul>

        {openPostId && (
          <div style={S.detailBox}>
            <div style={S.detailTitle}>댓글 ({comments?.total ?? 0})</div>
            {comments?.error && <p style={{ ...S.itemDetail, color: '#DC2626' }}>{comments.error}</p>}
            <ul style={S.list}>
              {(comments?.items ?? []).map((c) => (
                <li key={c.id} style={S.item}>
                  <span style={S.itemLabel}>{c.authorName}</span>
                  <span style={S.itemDetail}>{c.body}</span>
                  <span style={S.itemDetail}>👍 {c.likeCount}</span>
                  <button
                    type='button'
                    style={S.miniBtn}
                    onClick={() =>
                      runDocAction('댓글 좋아요', async () => {
                        const on = await toggleCommentLike(c.id);
                        await openComments(openPostId);
                        return on ? '켜짐' : '꺼짐';
                      })
                    }
                  >
                    좋아요
                  </button>
                  <button
                    type='button'
                    style={S.miniBtn}
                    onClick={() =>
                      runDocAction('댓글 삭제', async () => {
                        await deleteComment(c.id);
                        await reloadPosts();
                        await openComments(openPostId);
                        return '삭제됨';
                      })
                    }
                  >
                    삭제
                  </button>
                </li>
              ))}
              {(comments?.items ?? []).length === 0 && !comments?.error && (
                <li style={S.itemDetail}>댓글이 없습니다.</li>
              )}
            </ul>
          </div>
        )}
      </section>

      <section style={S.logBar}>
        <div style={S.logHead}>
          <button type='button' style={S.miniBtn} onClick={() => setIsLogOpen((v) => !v)}>
            {isLogOpen ? '접기' : '펼치기'}
          </button>
          <span style={S.logTitle}>실행 로그 ({docLog.length})</span>

          {docLog[0] ? (
            <>
              <span style={{ ...S.badge, background: docLog[0].ok ? '#00A63D' : '#DC2626' }}>
                {docLog[0].ok ? 'OK' : 'FAIL'}
              </span>
              <span style={S.logLatest}>{docLog[0].message}</span>
            </>
          ) : (
            <span style={S.itemDetail}>아직 실행한 동작이 없습니다.</span>
          )}

          {docLog.length > 0 && (
            <button type='button' style={S.miniBtn} onClick={() => setDocLog([])}>
              지우기
            </button>
          )}
        </div>

        {isLogOpen && docLog.length > 0 && (
          <ul style={S.logList}>
            {docLog.map((l) => (
              <li key={l.id} style={S.item}>
                <span style={{ ...S.badge, background: l.ok ? '#00A63D' : '#DC2626' }}>
                  {l.ok ? 'OK' : 'FAIL'}
                </span>
                <span style={S.itemDetail}>{l.at}</span>
                <span style={S.itemDetail}>{l.message}</span>
              </li>
            ))}
          </ul>
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
  logBar: {
    position: 'sticky',
    bottom: 0,
    marginTop: 16,
    padding: '10px 16px',
    background: '#FFFFFF',
    border: '1px solid #EEEEEE',
    borderRadius: 12,
    boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.06)',
  },
  logHead: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' },
  logTitle: { fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' },
  logLatest: {
    flex: 1,
    minWidth: 0,
    fontSize: 12,
    color: '#6F6F6F',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  logList: {
    marginTop: 12,
    maxHeight: 220,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  miniBtn: {
    padding: '4px 8px',
    border: '1px solid #ACAEAD',
    borderRadius: 6,
    background: '#FFFFFF',
    cursor: 'pointer',
    fontSize: 11,
    marginTop: 4,
  },
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

'use client';

import { getCurrentUser, OAUTH_PROVIDERS, onAuthChange, signInWith, signOut } from '@backend/lib/api/auth';
import { getCodeGroups, getCodes, labelOf } from '@backend/lib/api/codes';
import {
  getCompany,
  getMyBookmarkedCompanyIds,
  getRecommendedCompanies,
  incrementCompanyView,
  listCompanies,
  toggleCompanyBookmark,
} from '@backend/lib/api/companies';
import {
  createDocument,
  createDocumentFromTemplate,
  createDocumentDraftId,
  deleteDocument,
  deleteDocuments,
  listMyDocuments,
  removeDocumentImages,
  updateDocument,
  uploadDocumentImages,
} from '@backend/lib/api/documents';
import {
  createPortfolio,
  deletePortfolios,
  findMemberByEmail,
  getPortfolio,
  incrementPortfolioView,
  listMyPortfolios,
  listPortfolios,
  publishPortfolio,
  setPortfolioCollaborators,
  togglePortfolioBookmark,
  togglePortfolioLike,
  updatePortfolio,
  uploadPortfolioImages,
} from '@backend/lib/api/portfolio';
import {
  createComment,
  deleteComment,
  listComments,
  toggleCommentLike,
  updateComment,
} from '@backend/lib/api/comments';
import {
  createSession,
  deleteSession,
  finishSession,
  getMyScrappedQaIds,
  getSession,
  listMyQas,
  listMyScraps,
  listMySessions,
  saveQas,
  toggleQaScrap,
} from '@backend/lib/api/interview';
import {
  createPost,
  deletePosts,
  getPost,
  incrementPostView,
  listMyPosts,
  listPosts,
  togglePostLike,
  togglePostScrap,
  updatePost,
} from '@backend/lib/api/posts';
import {
  getMyAccount,
  getMySummary,
  listMyQbanks,
  listMyReviews,
  listMyScrappedCompanies,
  listMyScrappedPortfolios,
  removeCompanyBookmarks,
  removePortfolioBookmarks,
  removePostScraps,
  removeQaScraps,
} from '@backend/lib/api/mypage';
import {
  getMyProfile,
  getProfileStats,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from '@backend/lib/api/profile';
import { listMyScrappedPosts } from '@backend/lib/api/posts';
import { buildResumeHtmlFromMyProfile } from '@backend/lib/api/resumeFill';
import {
  getTemplate,
  incrementTemplateView,
  listTemplates,
  toggleTemplateBookmark,
} from '@backend/lib/api/templates';
import { useCallback, useEffect, useRef, useState } from 'react';

const ALAN_BASE = process.env.NEXT_PUBLIC_ALAN_BASE_URL;
const ALAN_CLIENT_ID = process.env.NEXT_PUBLIC_ALAN_CLIENT_ID;
const ALAN_DIRECT = 'https://kdt-api-function.azurewebsites.net/api/v1';

const DEFAULT_LIST_OPTS = {
  gallery: 'latest',
  galleryQuery: '',
  posts: 'latest',
  scrapCompanies: 'latest',
  scrapPosts: 'latest',
  scrapPortfolios: 'latest',
};

const SORT_OPTIONS = {
  gallery: [
    ['latest', '최신순'],
    ['oldest', '오래된순'],
    ['title', '이름순'],
    ['popular', '인기순'],
    ['views', '조회순'],
    ['scraps', '스크랩순'],
  ],
  posts: [
    ['latest', '최신순'],
    ['oldest', '오래된순'],
    ['company', '기업이름순'],
    ['popular', '인기순'],
    ['scraps', '스크랩순'],
    ['comments', '댓글순'],
    ['views', '조회순'],
  ],
  scrapCompanies: [
    ['latest', '최근 스크랩순'],
    ['oldest', '오래전 스크랩순'],
    ['name', '기업이름순'],
  ],
  scrapPosts: [
    ['latest', '최근 스크랩순'],
    ['oldest', '오래전 스크랩순'],
    ['company', '기업이름순'],
  ],
  scrapPortfolios: [
    ['latest', '최근 스크랩순'],
    ['oldest', '오래전 스크랩순'],
    ['title', '이름순'],
  ],
};

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
  const [sessions, setSessions] = useState(null);
  const [scraps, setScraps] = useState(null);
  const [account, setAccount] = useState(null);
  const [summary, setSummary] = useState(null);
  const [myScraps, setMyScraps] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profileForm, setProfileForm] = useState(null);
  const [recommended, setRecommended] = useState(null);
  const [templateDetail, setTemplateDetail] = useState(null);
  const [postDetail, setPostDetail] = useState(null);
  const [collabTarget, setCollabTarget] = useState(null);
  const [collabEmail, setCollabEmail] = useState('');
  const [collabFound, setCollabFound] = useState(null);
  const [myWritings, setMyWritings] = useState(null);
  const [codeGroups, setCodeGroups] = useState(null);
  const [listOpts, setListOpts] = useState(DEFAULT_LIST_OPTS);
  const [docDraft, setDocDraft] = useState(null);
  const [postJobRole, setPostJobRole] = useState('frontend');
  const [alan, setAlan] = useState(null);
  const [alanBusy, setAlanBusy] = useState(false);
  const [alanPrompt, setAlanPrompt] = useState('한 문장으로: 좋은 이력서의 조건은?');

  const listOptsRef = useRef(DEFAULT_LIST_OPTS);

  const setListOpt = useCallback((patch) => {
    listOptsRef.current = { ...listOptsRef.current, ...patch };
    setListOpts(listOptsRef.current);
  }, []);

  const patchForm = useCallback((patch) => setProfileForm((prev) => ({ ...prev, ...patch })), []);

  const patchRow = useCallback((field, index, patch) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: prev[field].map((row, i) => (i === index ? { ...row, ...patch } : row)),
    }));
  }, []);

  const addRow = useCallback((field, blank) => {
    setProfileForm((prev) => ({ ...prev, [field]: [...prev[field], blank] }));
  }, []);

  const removeRow = useCallback((field, index) => {
    setProfileForm((prev) => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }));
  }, []);

  const toggleCode = useCallback((field, code) => {
    setProfileForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(code)
        ? prev[field].filter((c) => c !== code)
        : [...prev[field], code],
    }));
  }, []);

  useEffect(() => {
    setAuthError(new URLSearchParams(window.location.search).get('auth_error'));
  }, []);

  useEffect(() => onAuthChange(setUser), []);

  const loadMypage = useCallback(async () => {
    const me = await getCurrentUser().catch(() => null);
    if (!me) {
      setAccount(null);
      setSummary(null);
      setMyScraps(null);
      return;
    }

    try {
      const o = listOptsRef.current;
      const [nextAccount, nextSummary, companyScraps, postScraps, portfolioScraps] =
        await Promise.all([
          getMyAccount(),
          getMySummary(),
          listMyScrappedCompanies({ sort: o.scrapCompanies, pageSize: 9 }),
          listMyScrappedPosts({ sort: o.scrapPosts, pageSize: 10 }),
          listMyScrappedPortfolios({ sort: o.scrapPortfolios, pageSize: 9 }),
        ]);

      setAccount(nextAccount);
      setSummary(nextSummary);
      setMyScraps({
        companies: companyScraps,
        posts: postScraps,
        portfolios: portfolioScraps,
      });
    } catch (e) {
      setAccount({ error: e.message });
      setSummary(null);
      setMyScraps(null);
    }
  }, []);

  const reloadCompanies = useCallback(async () => {
    const { items } = await listCompanies({ sort: 'name', pageSize: 50 });
    setCompanies(items);
  }, []);

  const reloadTemplates = useCallback(async () => {
    setTemplates(await listTemplates({ sort: 'popular', pageSize: 20 }));
  }, []);

  const reloadProfile = useCallback(async () => {
    const me = await getMyProfile();
    setProfile(me);
    setProfileForm(
      me
        ? {
            name: me.name ?? '',
            desired_role: me.desired_role ?? '',
            career_level: me.career_level ?? '',
            github_url: me.github_url ?? '',
            bio: me.bio ?? '',
            education_level: me.education_level ?? '',
            educations: me.educations ?? [],
            careers: me.careers ?? [],
            languages: me.languages ?? [],
            awards: me.awards ?? [],
            skill_codes: me.skill_codes ?? [],
            interest_codes: me.interest_codes ?? [],
          }
        : null
    );
  }, []);

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

    await step('[client] getCodeGroups(프로필 편집 8종)', async () => {
      const groups = await getCodeGroups([
        'job_role',
        'career_level',
        'education_level',
        'school_type',
        'edu_status',
        'language_level',
        'tech_stack',
        'interest_field',
      ]);
      setCodeGroups(groups);
      return Object.entries(groups)
        .map(([g, list]) => `${g} ${list.length}`)
        .join(' · ');
    });

    await step('[client] labelOf(education_level, bachelor)', async () => {
      const label = await labelOf('education_level', 'bachelor');
      if (label !== '대졸') throw new Error(`'대졸' 이 나와야 하는데 '${label}'`);
      return label;
    });

    await step('[client] getMyProfile()', async () => {
      const me = await getMyProfile();
      return me ? `name=${me.name ?? '(없음)'}` : '비로그인 또는 프로필 없음';
    });

    await step('[client] getRecommendedCompanies(6)', async () => {
      const items = await getRecommendedCompanies(6);
      setRecommended(items);
      return `${items.length}곳 — ${items.slice(0, 3).map((c) => c.name).join(', ')}`;
    });

    await step('[client] getMyBookmarkedCompanyIds()', async () => {
      const me = await getCurrentUser();
      if (!me) return '비로그인 - 건너뜀';
      const { items } = await listCompanies({ pageSize: 50 });
      const marked = await getMyBookmarkedCompanyIds(items.map((c) => c.id));
      return `${marked.size}곳 관심 등록됨`;
    });

    await reloadProfile().catch(() => {});

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
      const { gallery: sort, galleryQuery } = listOptsRef.current;
      setGallery(await listPortfolios({ sort, q: galleryQuery || undefined, pageSize: 20 }));
    } catch (e) {
      setGallery({ error: e.message });
    }

    try {
      setMyPortfolios(await listMyPortfolios({ pageSize: 20 }));
    } catch (e) {
      setMyPortfolios({ error: e.message });
    }

    try {
      setPosts(await listPosts({ sort: listOptsRef.current.posts, pageSize: 20 }));
    } catch (e) {
      setPosts({ error: e.message });
    }

    try {
      setSessions(await listMySessions({ pageSize: 10 }));
      setScraps(await listMyScraps({ pageSize: 20 }));
    } catch (e) {
      setSessions({ error: e.message });
      setScraps(null);
    }

    await loadMypage();

    setChecks(results);
    setBusy(false);
  }, [loadMypage, reloadProfile]);

  const reloadInterview = useCallback(async () => {
    setSessions(await listMySessions({ pageSize: 10 }).catch((e) => ({ error: e.message })));
    setScraps(await listMyScraps({ pageSize: 20 }).catch(() => null));
  }, []);

  const reloadPosts = useCallback(async () => {
    setPosts(await listPosts({ sort: listOptsRef.current.posts, pageSize: 20 }));
  }, []);

  const openComments = useCallback(async (postId) => {
    setOpenPostId(postId);
    setComments(await listComments(postId, { pageSize: 20 }).catch((e) => ({ error: e.message })));
  }, []);

  const reloadPortfolios = useCallback(async () => {
    const { gallery: sort, galleryQuery } = listOptsRef.current;
    setGallery(await listPortfolios({ sort, q: galleryQuery || undefined, pageSize: 20 }));
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

  const runProfileAction = useCallback(
    async (label, fn) => {
      try {
        log(true, `${label} — ${(await fn()) ?? '완료'}`);
      } catch (e) {
        log(false, `${label} — ${e.message}`);
      }
      await reloadProfile().catch(() => {});
    },
    [log, reloadProfile]
  );

  const runCompanyAction = useCallback(
    async (label, fn) => {
      try {
        log(true, `${label} — ${(await fn()) ?? '완료'}`);
      } catch (e) {
        log(false, `${label} — ${e.message}`);
      }
      await reloadCompanies().catch(() => {});
    },
    [log, reloadCompanies]
  );

  const runTemplateAction = useCallback(
    async (label, fn) => {
      try {
        log(true, `${label} — ${(await fn()) ?? '완료'}`);
      } catch (e) {
        log(false, `${label} — ${e.message}`);
      }
      await reloadTemplates().catch(() => {});
    },
    [log, reloadTemplates]
  );

  const runMypageAction = useCallback(
    async (label, fn) => {
      try {
        log(true, `${label} — ${(await fn()) ?? '완료'}`);
      } catch (e) {
        log(false, `${label} — ${e.message}`);
      }
      await loadMypage();
    },
    [log, loadMypage]
  );

  const changeSort = useCallback(
    async (name, value) => {
      setListOpt({ [name]: value });
      const reload =
        name === 'posts' ? reloadPosts : name.startsWith('scrap') ? loadMypage : reloadPortfolios;
      try {
        await reload();
        log(true, `정렬 ${name} → ${value}`);
      } catch (e) {
        log(false, `정렬 ${name} → ${value} — ${e.message}`);
      }
    },
    [log, loadMypage, reloadPortfolios, reloadPosts, setListOpt]
  );

  const callAlan = useCallback(
    async (base, label) => {
      if (!ALAN_CLIENT_ID) {
        setAlan({ ok: false, text: 'NEXT_PUBLIC_ALAN_CLIENT_ID 가 비어 있습니다.' });
        return;
      }

      setAlanBusy(true);
      const startedAt = Date.now();
      try {
        const q = new URLSearchParams({ content: alanPrompt, client_id: ALAN_CLIENT_ID });
        const res = await fetch(`${base}/question?${q}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const { answer } = await res.json();
        const secs = ((Date.now() - startedAt) / 1000).toFixed(1);
        setAlan({ ok: true, text: `${label} ${secs}초 — ${answer || '(빈 응답)'}` });
        log(true, `Alan ${label} — ${secs}초`);
      } catch (e) {
        setAlan({ ok: false, text: `${label} 실패 — ${e.message}` });
        log(false, `Alan ${label} — ${e.message}`);
      }
      setAlanBusy(false);
    },
    [alanPrompt, log]
  );

  const askAlan = useCallback(() => callAlan(ALAN_BASE, '/alan 경유'), [callAlan]);

  const askAlanDirect = useCallback(() => callAlan(ALAN_DIRECT, '직접 호출'), [callAlan]);

  const searchGallery = useCallback(async () => {
    const keyword = listOptsRef.current.galleryQuery;
    try {
      await reloadPortfolios();
      log(true, `갤러리 검색 "${keyword || '(전체)'}"`);
    } catch (e) {
      log(false, `갤러리 검색 "${keyword}" — ${e.message}`);
    }
  }, [log, reloadPortfolios]);

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
        <h2 style={S.h2}>2-1. Alan AI 연결</h2>

        <ul style={S.summary}>
          <li>
            BASE_URL <b>{ALAN_BASE || '(없음)'}</b>
          </li>
          <li>
            CLIENT_ID <b>{ALAN_CLIENT_ID ? `${ALAN_CLIENT_ID.slice(0, 8)}…` : '(없음)'}</b>
          </li>
        </ul>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <input
            value={alanPrompt}
            onChange={(e) => setAlanPrompt(e.target.value)}
            placeholder='Alan 에게 물어볼 내용'
            style={{ ...S.input, minWidth: 280 }}
          />
          <button type='button' style={S.btn} disabled={alanBusy} onClick={askAlan}>
            {alanBusy ? '묻는 중…' : '질문 보내기'}
          </button>
          <button type='button' style={S.btn} disabled={alanBusy} onClick={askAlanDirect}>
            직접 호출 (CORS 확인용)
          </button>
        </div>

        {alan && (
          <p style={{ ...S.mono, marginTop: 12, color: alan.ok ? '#111111' : '#DC2626' }}>
            {alan.text}
          </p>
        )}

        <p style={S.hint}>
          <code>client_id</code> 는 사람마다 다릅니다. 팀 단톡 배정표에서 본인 것을 찾아{' '}
          <code>.env.local</code> 의 <code>NEXT_PUBLIC_ALAN_CLIENT_ID</code> 에 넣으세요. 오른쪽
          버튼은 Alan 을 브라우저에서 직접 부르면 CORS 로 막힌다는 것을 보여줍니다 — 실패가
          정상입니다.
        </p>
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
                <div key={c.id} style={S.companyCard}>
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
                  <span style={S.companyMeta}>
                    {c.bookmarkedByMe ? '★ 내가 관심 등록함' : '☆ 관심 없음'}
                  </span>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type='button'
                      style={S.miniBtn}
                      onClick={() =>
                        runCompanyAction(`상세 열기 + 조회수 (${c.name})`, async () => {
                          await incrementCompanyView(c.id);
                          const full = await getCompany(c.slug);
                          setDetail(full);
                          return `조회 ${full.views}`;
                        })
                      }
                    >
                      상세 + 조회수
                    </button>
                    <button
                      type='button'
                      style={S.miniBtn}
                      onClick={() =>
                        runCompanyAction(`관심 토글 (${c.name})`, async () =>
                          (await toggleCompanyBookmark(c.id)) ? '등록됨' : '해제됨'
                        )
                      }
                    >
                      {c.bookmarkedByMe ? '관심 해제' : '관심 등록'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {recommended && (
              <p style={S.mono}>
                추천 기업 {recommended.length}곳 —{' '}
                {recommended.map((c) => c.name).join(', ') || '없음'}
              </p>
            )}

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
                  <span style={S.companyMeta}>
                    {t.bookmarkedByMe ? '★ 내가 북마크함' : '☆ 북마크 없음'}
                  </span>
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
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <button
                      type='button'
                      style={S.miniBtn}
                      onClick={() =>
                        runTemplateAction(`양식 상세 + 조회수 (${t.title})`, async () => {
                          await incrementTemplateView(t.id);
                          const full = await getTemplate(t.id);
                          setTemplateDetail(full);
                          return `조회 ${full.views} · content ${full.content ? '있음' : '없음'}`;
                        })
                      }
                    >
                      상세 + 조회수
                    </button>
                    <button
                      type='button'
                      style={S.miniBtn}
                      onClick={() =>
                        runTemplateAction(`양식 북마크 토글 (${t.title})`, async () =>
                          (await toggleTemplateBookmark(t.id)) ? '등록됨' : '해제됨'
                        )
                      }
                    >
                      {t.bookmarkedByMe ? '북마크 해제' : '북마크'}
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {templateDetail && (
              <div style={S.detailBox}>
                <p style={S.detailTitle}>{templateDetail.title} — 상세</p>
                <ul style={S.list}>
                  <li style={S.item}>
                    <span style={S.itemLabel}>조회수</span>
                    <span style={S.itemDetail}>{templateDetail.views}</span>
                  </li>
                  <li style={S.item}>
                    <span style={S.itemLabel}>북마크</span>
                    <span style={S.itemDetail}>
                      {templateDetail.bookmarkedByMe ? '내가 함' : '안 함'}
                    </span>
                  </li>
                  <li style={S.item}>
                    <span style={S.itemLabel}>contentHtml</span>
                    <span style={S.itemDetail}>
                      {templateDetail.contentHtml ? `${templateDetail.contentHtml.length}자` : '없음'}
                    </span>
                  </li>
                </ul>
              </div>
            )}
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
              <label style={{ ...S.btn, display: 'inline-flex', alignItems: 'center' }}>
                draft 상태로 이미지 업로드
                <input
                  type='file'
                  accept='image/*'
                  multiple
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    e.target.value = '';
                    if (files.length === 0) return;

                    runDocAction(`draft 이미지 업로드 (${files.length}장)`, async () => {
                      const draftId = docDraft?.id ?? createDocumentDraftId();
                      const urls = await uploadDocumentImages(draftId, files);

                      setDocDraft((prev) => ({
                        id: draftId,
                        saved: prev?.id === draftId ? prev.saved : false,
                        urls: [...(prev?.id === draftId ? prev.urls : []), ...urls],
                      }));

                      return `문서 저장 전 ${urls.length}장 업로드됨 (draft ${draftId.slice(0, 8)}…)`;
                    });
                  }}
                />
              </label>
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

            {docDraft && (
              <div style={S.detailBox}>
                <div style={S.detailTitle}>
                  draft {docDraft.id.slice(0, 8)}… — 이미지 {docDraft.urls.length}장 ·{' '}
                  {docDraft.saved ? '저장됨' : '아직 저장 안 됨'}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {docDraft.urls.map((url) => (
                    <img
                      key={url}
                      src={url}
                      alt=''
                      style={{ width: 90, height: 90, objectFit: 'cover', borderRadius: 8 }}
                    />
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  <button
                    type='button'
                    style={S.miniBtn}
                    disabled={docDraft.saved}
                    onClick={() =>
                      runDocAction('draft 를 같은 id 로 저장', async () => {
                        const html = docDraft.urls.map((u) => `<img src="${u}" />`).join('');
                        const doc = await createDocument({
                          id: docDraft.id,
                          docType: 'resume',
                          title: 'draft 에서 저장한 이력서',
                          contentHtml: html,
                        });
                        setDocDraft((prev) => ({ ...prev, saved: true }));
                        return `id 유지됨 (${doc.id === docDraft.id ? '동일' : '다름!'}) · 이미지 ${docDraft.urls.length}장 그대로`;
                      })
                    }
                  >
                    이 draft 저장
                  </button>

                  <button
                    type='button'
                    style={S.miniBtn}
                    onClick={() =>
                      runDocAction('문서 삭제 → 이미지도 지워지는지', async () => {
                        const [first] = docDraft.urls;
                        await deleteDocument(docDraft.id);
                        const res = await fetch(first);
                        setDocDraft(null);
                        return res.ok
                          ? `이미지가 아직 살아있음 (${res.status}) — 문제`
                          : `이미지도 함께 삭제됨 (${res.status})`;
                      })
                    }
                  >
                    문서 삭제 (이미지 연쇄 확인)
                  </button>

                  <button
                    type='button'
                    style={S.miniBtn}
                    onClick={() =>
                      runDocAction('저장 없이 draft 버리기', async () => {
                        const [first] = docDraft.urls;
                        await removeDocumentImages(docDraft.id);
                        const res = await fetch(first);
                        setDocDraft(null);
                        return res.ok ? `아직 살아있음 (${res.status}) — 문제` : `정리됨 (${res.status})`;
                      })
                    }
                  >
                    draft 버리기
                  </button>
                </div>

                <p style={S.hint}>
                  <code>documents</code> 버킷은 <b>비공개</b>입니다. 위 이미지는{' '}
                  <code>/api/documents/{'{id}'}/images/{'{name}'}</code> 로 서빙되며, 로그아웃하거나
                  다른 계정으로 열면 보이지 않습니다. 저장하지 않고 떠난 draft 는 24시간 뒤 문서함을
                  열 때 자동으로 정리됩니다.
                </p>
              </div>
            )}

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

        <div style={S.sortBar}>
          <SortSelect
            label='갤러리 정렬'
            name='gallery'
            value={listOpts.gallery}
            onChange={changeSort}
          />
          <input
            type='search'
            placeholder='포트폴리오 이름 검색'
            value={listOpts.galleryQuery}
            onChange={(e) => setListOpt({ galleryQuery: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && searchGallery()}
            style={{ ...S.sortSelect, minWidth: 200 }}
          />
          <button type='button' style={S.miniBtn} onClick={searchGallery}>
            검색
          </button>
        </div>

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
                  overview: [{ type: 'text', html: '<p>개요</p>' }],
                  document: [{ type: 'image', url: 'https://cdn.test/1.png' }],
                  code: [{ type: 'code', lang: 'js', body: 'const a = 1;' }],
                });

                const read = await getPortfolio(p.id);
                await reloadPortfolios();

                return `draft 생성 id=${p.id.slice(0, 8)}… · overview ${read.overview.length} · document ${read.document.length} · code ${read.code.length}`;
              })
            }
          >
            임시저장 생성
          </button>

          <button
            type='button'
            style={S.btn}
            onClick={() =>
              runDocAction('이미지 15장 합산 확인', async () => {
                const img = (n) => Array.from({ length: n }, () => ({ type: 'image' }));

                const tried = async (label, call) => {
                  try {
                    await call();
                    return `${label} 통과`;
                  } catch (e) {
                    if (e.status !== 400) throw e;
                    return `${label} 400`;
                  }
                };

                const spread = await tried('세 탭 합쳐 16장 →', () =>
                  createPortfolio({
                    title: '15장 확인',
                    overview: img(5),
                    document: img(5),
                    code: img(6),
                  })
                );

                const base = await createPortfolio({ title: '15장 확인 누적', overview: img(10) });
                const cumulative = await tried('저장된 10장 + 6장 →', () =>
                  updatePortfolio(base.id, { code: img(6) })
                );

                const legacy = await tried('content 필드 →', () =>
                  createPortfolio({ title: 'content 확인', content: [] })
                );

                await reloadPortfolios();
                return `${spread} · ${cumulative} · ${legacy}`;
              })
            }
          >
            이미지 15장 합산 확인
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
                    document: [
                      ...(current.document ?? []),
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
              <span style={S.itemDetail}>
                공동작업자{' '}
                {p.collaborators?.length
                  ? p.collaborators.map((m) => m.name ?? m.id.slice(0, 6)).join(', ')
                  : '없음'}
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
              <button
                type='button'
                style={S.miniBtn}
                onClick={() => {
                  setCollabTarget(p);
                  setCollabFound(null);
                }}
              >
                공동작업자
              </button>
            </li>
          ))}
        </ul>

        {user && (myPortfolios?.items?.length ?? 0) === 0 && (
          <p style={S.hint}>
            공동작업자는 <b>내가 만든 포트폴리오에만</b> 추가할 수 있습니다. 위에서 먼저 하나
            만들어주세요.
          </p>
        )}

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
                {p.authorName ?? '작성자 없음'} · {p.category ?? '-'} · {p.createdAt?.slice(0, 10)}
              </span>
              <span style={S.companyMeta}>
                👍 {p.likeCount}
                {p.likedByMe ? '(내가)' : ''} · 🔖 {p.bookmarkCount}
                {p.bookmarkedByMe ? '(내가)' : ''} · 👁 {p.viewCount}
              </span>
              <span style={S.companyMeta}>
                공동작업자{' '}
                {p.collaborators?.length
                  ? p.collaborators.map((m) => m.name ?? m.id.slice(0, 6)).join(', ')
                  : '없음'}
              </span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
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
                <button
                  type='button'
                  style={S.miniBtn}
                  onClick={() =>
                    runDocAction('조회수 +1', async () => {
                      await incrementPortfolioView(p.id);
                      await reloadPortfolios();
                      const full = await getPortfolio(p.id);
                      return `조회 ${full.viewCount}`;
                    })
                  }
                >
                  조회수 +1
                </button>
                {p.authorId === user?.id ? (
                  <button
                    type='button'
                    style={S.miniBtn}
                    onClick={() => {
                      setCollabTarget(p);
                      setCollabFound(null);
                    }}
                  >
                    공동작업자
                  </button>
                ) : (
                  <span style={S.itemDetail}>공동작업자는 소유자만</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {collabTarget && (
          <div style={S.detailBox}>
            <p style={S.detailTitle}>공동작업자 — {collabTarget.title}</p>

            <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <input
                type='email'
                placeholder='초대할 사람의 로그인 이메일'
                value={collabEmail}
                onChange={(e) => setCollabEmail(e.target.value)}
                style={{ ...S.input, minWidth: 260 }}
              />
              <button
                type='button'
                style={S.miniBtn}
                onClick={() =>
                  runDocAction(`이메일 조회 (${collabEmail})`, async () => {
                    const member = await findMemberByEmail(collabEmail);
                    setCollabFound(member);
                    return member ? `찾음 — ${member.name ?? '(이름없음)'}` : '가입자 없음';
                  })
                }
              >
                이메일로 찾기
              </button>
              <button type='button' style={S.miniBtn} onClick={() => setCollabTarget(null)}>
                닫기
              </button>
            </p>

            {collabFound && (
              <p style={S.mono}>
                {collabFound.avatarUrl && (
                  <img
                    src={collabFound.avatarUrl}
                    alt=''
                    style={{ width: 24, height: 24, borderRadius: '50%', verticalAlign: 'middle' }}
                  />
                )}{' '}
                {collabFound.name ?? '(이름 없음)'} · {collabFound.id.slice(0, 8)}…{' '}
                <button
                  type='button'
                  style={S.miniBtn}
                  onClick={() =>
                    runDocAction('공동작업자 추가', async () => {
                      const current = (collabTarget.collaborators ?? []).map((m) => m.id);
                      const saved = await setPortfolioCollaborators(collabTarget.id, [
                        ...current,
                        collabFound.id,
                      ]);
                      await reloadPortfolios();
                      setCollabTarget(saved);
                      return `${saved.collaborators.length}명`;
                    })
                  }
                >
                  이 사람 추가
                </button>
              </p>
            )}

            <ul style={S.list}>
              {(collabTarget.collaborators ?? []).map((m) => (
                <li key={m.id} style={S.item}>
                  <span style={S.itemLabel}>{m.name ?? '(이름 없음)'}</span>
                  <span style={S.itemDetail}>{m.id.slice(0, 8)}…</span>
                  <button
                    type='button'
                    style={S.miniBtn}
                    onClick={() =>
                      runDocAction('공동작업자 제거', async () => {
                        const rest = collabTarget.collaborators
                          .filter((x) => x.id !== m.id)
                          .map((x) => x.id);
                        const saved = await setPortfolioCollaborators(collabTarget.id, rest);
                        await reloadPortfolios();
                        setCollabTarget(saved);
                        return `${saved.collaborators.length}명 남음`;
                      })
                    }
                  >
                    제거
                  </button>
                </li>
              ))}
            </ul>

            <p style={S.hint}>
              이메일은 정확히 일치해야 찾힙니다. 응답에는 이름과 사진만 들어 있고 이메일은 없습니다.
            </p>
          </div>
        )}
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

        <div style={S.sortBar}>
          <label style={S.sortLabel}>
            직무 (작성 시 기입)
            <select
              style={S.sortSelect}
              value={postJobRole}
              onChange={(e) => setPostJobRole(e.target.value)}
            >
              <option value=''>미기입 (null)</option>
              {(codeGroups?.job_role ?? []).map((c) => (
                <option key={c.code} value={c.code}>
                  {c.label} ({c.code})
                </option>
              ))}
            </select>
          </label>
          <button
            type='button'
            style={S.miniBtn}
            onClick={() =>
              runDocAction('없는 직무 코드로 작성 시도', async () => {
                try {
                  await createPost({
                    postType: 'review',
                    companyId: companies[0]?.id ?? null,
                    title: '거부돼야 하는 글',
                    jobRoleCode: 'frontned',
                  });
                  return '저장됨 — 문제 (검증이 안 걸림)';
                } catch (e) {
                  return `거부됨 (정상) — ${e.message}`;
                }
              })
            }
          >
            없는 직무 코드 거부 확인
          </button>
          <button
            type='button'
            style={S.miniBtn}
            onClick={() =>
              runDocAction('코드 자리에 라벨 투입 (5개 필드)', async () => {
                const cases = [
                  ['jobRoleCode', '프론트엔드'],
                  ['difficultyCode', '어려움'],
                  ['passResultCode', '합격'],
                  ['channelCode', '온라인'],
                  ['educationLevel', '대졸'],
                ];

                const leaked = [];
                for (const [field, label] of cases) {
                  try {
                    const p = await createPost({
                      postType: 'review',
                      companyId: companies[0]?.id ?? null,
                      title: `라벨 투입 ${field}`,
                      [field]: label,
                    });
                    leaked.push(field);
                    await deletePosts([p.id]);
                  } catch {
                    /* 400 이 정상 */
                  }
                }

                await reloadPosts();
                return leaked.length === 0
                  ? `5개 필드 모두 차단됨 (정상)`
                  : `통과해버림 — 문제: ${leaked.join(', ')}`;
              })
            }
          >
            라벨 투입 거부 확인
          </button>
        </div>

        <div style={S.sortBar}>
          <SortSelect label='정렬' name='posts' value={listOpts.posts} onChange={changeSort} />
          <span style={S.sortLabel}>
            {(posts?.items ?? [])
              .slice(0, 3)
              .map((p) => `${p.companyName || '-'}/${p.date}`)
              .join(' → ')}
          </span>
        </div>

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
                  difficultyScore: 3,
                  passResultCode: 'pass',
                  channelCode: 'online',
                  jobRoleCode: postJobRole || null,
                  positionLevel: '신입',
                  educationLevel: 'bachelor',
                  tags: ['CS', '기술면접'],
                  overallComment: '준비한 만큼 나옵니다',
                });
                await reloadPosts();
                return `${p.companyName} · ${p.difficulty} · ${p.result} · 직무 "${p.jobRole || '미기입'}"(${p.jobRoleCode ?? 'null'})`;
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
                  questions: 'REST API의 장점은?\n브라우저 렌더링 과정을 설명하세요\n클로저란?',
                  difficultyCode: 'hard',
                  difficultyScore: 5,
                  passResultCode: 'waiting',
                  channelCode: 'etc',
                  channelEtc: '잡코리아',
                  jobRoleCode: postJobRole || null,
                  positionLevel: '신입',
                  educationLevel: 'bachelor',
                });
                await reloadPosts();
                return `질문 ${p.questionCount}개 · 직무 "${p.jobRole || '미기입'}" · 경로 "${p.route}"`;
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
                {p.title || `질문 ${p.questionCount}개`}
              </span>
              <span style={S.itemDetail}>
                {p.companyName} · {p.difficulty} · {p.result} · {p.route} · {p.jobInfo} · 직무코드{' '}
                <code>{p.jobRoleCode ?? 'null'}</code>
              </span>
              <span style={S.itemDetail}>
                👍 {p.likeCount}
                {p.likedByMe ? '(내가)' : ''} · 🔖 {p.scrapCount}
                {p.scrappedByMe ? '(내가)' : ''} · 💬 {p.commentCount} · 👁 {p.viewCount}
              </span>
              {p.postType === 'qbank' && (
                <span style={S.itemDetail}>
                  질문 {p.questionCount ?? 0}개 — {(p.questionList ?? []).join(' / ') || '없음'}
                </span>
              )}
              <button
                type='button'
                style={S.miniBtn}
                onClick={() =>
                  runDocAction('상세 + 조회수', async () => {
                    await incrementPostView(p.id);
                    const full = await getPost(p.id);
                    setPostDetail(full);
                    await reloadPosts();
                    return `조회 ${full.viewCount} · 질문 ${full.questionList?.length ?? 0}개`;
                  })
                }
              >
                상세 + 조회수
              </button>
              <button
                type='button'
                style={S.miniBtn}
                onClick={() =>
                  runDocAction('글 제목 수정', async () => {
                    const edited = await updatePost(p.id, {
                      title: `${p.title || '제목 없음'} (수정 ${new Date().toLocaleTimeString()})`,
                    });
                    await reloadPosts();
                    return edited.title;
                  })
                }
              >
                제목 수정
              </button>
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
                    좋아요{c.likedByMe ? ' ✓' : ''}
                  </button>
                  <button
                    type='button'
                    style={S.miniBtn}
                    onClick={() =>
                      runDocAction('댓글 수정', async () => {
                        const edited = await updateComment(
                          c.id,
                          `${c.body} (수정 ${new Date().toLocaleTimeString()})`
                        );
                        await openComments(openPostId);
                        return edited.body;
                      })
                    }
                  >
                    수정
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

      {postDetail && (
        <section style={S.card}>
          <h2 style={S.h2}>7-1. 글 상세 (getPost)</h2>
          <ul style={S.list}>
            <li style={S.item}>
              <span style={S.itemLabel}>제목</span>
              <span style={S.itemDetail}>{postDetail.title || '(없음)'}</span>
            </li>
            <li style={S.item}>
              <span style={S.itemLabel}>라벨 변환</span>
              <span style={S.itemDetail}>
                난이도 {postDetail.difficulty || '-'} · 결과 {postDetail.result || '-'} · 경로{' '}
                {postDetail.channel || '-'} · 학력 {postDetail.educationLevel || '-'}
              </span>
            </li>
            <li style={S.item}>
              <span style={S.itemLabel}>내 반응</span>
              <span style={S.itemDetail}>
                도움돼요 {String(postDetail.likedByMe)} · 퍼가요 {String(postDetail.scrappedByMe)}
              </span>
            </li>
            <li style={S.item}>
              <span style={S.itemLabel}>질문</span>
              <span style={S.itemDetail}>
                {postDetail.questionCount ?? 0}개 — {(postDetail.questionList ?? []).join(' / ') || '없음'}
              </span>
            </li>
          </ul>
          <button type='button' style={S.miniBtn} onClick={() => setPostDetail(null)}>
            닫기
          </button>
        </section>
      )}

      <section style={S.card}>
        <h2 style={S.h2}>8. AI 면접 (저장·조회)</h2>

        {sessions?.error && (
          <p className='font_body_s_r' style={S.error} role='alert'>
            {sessions.error}
          </p>
        )}

        <ul style={S.summary}>
          <li>
            내 세션 <b>{sessions?.error ? '-' : sessions?.total ?? 0}</b>
          </li>
          <li>
            스크랩한 질문 <b>{scraps?.total ?? 0}</b>
          </li>
        </ul>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
          <button
            type='button'
            style={S.btn}
            onClick={() =>
              runDocAction('면접 1회 완주 (세션 → QA 저장 → 종료)', async () => {
                const session = await createSession({
                  companyId: companies[0]?.id ?? null,
                  interviewerStyle: 'pressure',
                  selectedCategories: ['intro', 'tech1', 'closing'],
                  showTimer: true,
                });

                const { saved } = await saveQas(session.id, [
                  {
                    seq: 1,
                    category: 'intro',
                    question: '자기소개를 해주세요.',
                    answer: '문제를 화면 단위로 쪼개 해결하는 프론트엔드 개발자입니다.',
                    feedback: { summary: '두괄식이라 좋습니다.', strengths: ['두괄식'], improvements: ['사례 추가'] },
                    score: 4,
                  },
                  {
                    seq: 2,
                    category: 'tech1',
                    question: '클로저란 무엇인가요?',
                    answer: '함수와 렉시컬 환경의 조합입니다.',
                    feedback: { summary: '정의는 정확합니다.' },
                    score: 3,
                  },
                ]);

                const done = await finishSession(session.id, {
                  durationSec: 612,
                  totalScore: 7,
                  subScores: { 답변내용: 4, 전달력: 3, 논리성: 4, 전문성: 3, 태도: 4 },
                });

                await reloadInterview();
                return `QA ${saved}건 저장 · ${done.status} · ${done.durationSec}초 · 총점 ${done.totalScore}`;
              })
            }
          >
            면접 1회 완주
          </button>

          <button
            type='button'
            style={S.btn}
            onClick={() =>
              runDocAction('본문 검색 ("클로저")', async () => {
                const [qaAll, qaHit, scrapAll, scrapHit] = await Promise.all([
                  listMyQas({ pageSize: 50 }),
                  listMyQas({ q: '클로저', pageSize: 50 }),
                  listMyScraps({ pageSize: 50 }),
                  listMyScraps({ q: '클로저', pageSize: 50 }),
                ]);
                return `전체 QA ${qaAll.total}건 중 ${qaHit.total}건 · 스크랩 ${scrapAll.total}건 중 ${scrapHit.total}건`;
              })
            }
          >
            스크랩 본문 검색
          </button>

          <button
            type='button'
            style={S.btn}
            onClick={() =>
              runDocAction('세션 전체 삭제 (QA·스크랩 연쇄 삭제 확인)', async () => {
                const list = sessions?.items ?? [];
                for (const s of list) await deleteSession(s.id);
                await reloadInterview();
                const after = await listMyScraps({ pageSize: 20 });
                return `세션 ${list.length}건 삭제 → 남은 스크랩 ${after.total}건`;
              })
            }
          >
            세션 전체 삭제
          </button>
        </div>

        <ul style={S.list}>
          {(sessions?.items ?? []).map((s) => (
            <li key={s.id} style={S.item}>
              <span style={{ ...S.badge, background: s.status === 'finished' ? '#00A63D' : '#ACAEAD' }}>
                {s.status === 'finished' ? '종료' : '진행중'}
              </span>
              <span style={{ ...S.itemLabel, minWidth: 150 }}>{s.date}</span>
              <span style={S.itemDetail}>
                {s.interviewerStyle} · {s.selectedCategories.join(', ')} · {s.durationSec}초 · 총점{' '}
                {s.totalScore ?? '-'}
              </span>
            </li>
          ))}
          {(sessions?.items ?? []).length === 0 && !sessions?.error && (
            <li style={S.itemDetail}>세션이 없습니다. `면접 1회 완주` 를 눌러보세요.</li>
          )}
        </ul>

        {scraps?.items?.length > 0 && (
          <div style={S.detailBox}>
            <div style={S.detailTitle}>스크랩한 질문 ({scraps.total})</div>
            <ul style={S.list}>
              {scraps.items.map((qa) => (
                <li key={qa.id} style={{ ...S.item, alignItems: 'flex-start' }}>
                  <span style={{ ...S.badge, background: '#111111' }}>Q</span>
                  <span style={{ ...S.itemLabel, minWidth: 200 }}>{qa.question}</span>
                  <span style={S.itemDetail}>
                    A. {qa.answer.slice(0, 30)}… / AI. {qa.feedbackText.slice(0, 30)}…
                  </span>
                  <span style={S.itemDetail}>{qa.date}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {sessions?.items?.length > 0 && (
          <p style={S.hint}>
            스크랩 {scraps?.total ?? 0}건.
            <button
              type='button'
              style={{ ...S.miniBtn, marginLeft: 8 }}
              onClick={() =>
                runDocAction('최근 세션의 모든 질문 스크랩', async () => {
                  const full = await getSession(sessions.items[0].id);
                  if (!full.qas?.length) return '저장된 질문이 없습니다';

                  const already = await getMyScrappedQaIds(full.qas.map((q) => q.id));
                  let added = 0;
                  for (const qa of full.qas) {
                    if (!already.has(qa.id)) {
                      await toggleQaScrap(qa.id);
                      added += 1;
                    }
                  }
                  await reloadInterview();
                  return `${added}건 스크랩 (이미 ${already.size}건)`;
                })
              }
            >
              최근 세션 질문 전체 스크랩
            </button>
          </p>
        )}
      </section>

      <section style={S.card}>
        <div style={S.headRow}>
          <div>
            <h2 style={S.h2}>9. 프로필 편집</h2>
            <p style={S.sub}>여기서 채운 정보로 이력서를 자동으로 채울 수 있어요.</p>
          </div>
          {user && profileForm && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button type='button' style={S.cancelBtn} onClick={() => reloadProfile()}>
                수정 취소
              </button>
              <button
                type='button'
                style={S.saveBtn}
                onClick={() =>
                  runProfileAction('프로필 저장', async () => {
                    const f = profileForm;
                    const saved = await updateProfile({
                      name: f.name || null,
                      desired_role: f.desired_role || null,
                      career_level: f.career_level || null,
                      github_url: f.github_url || null,
                      bio: f.bio || null,
                      education_level: f.education_level || null,
                      educations: f.educations,
                      careers: f.careers,
                      languages: f.languages,
                      awards: f.awards,
                      skill_codes: f.skill_codes,
                      interest_codes: f.interest_codes,
                    });
                    return `학력 ${saved.educations.length} · 경력 ${saved.careers.length} · 어학 ${saved.languages.length} · 수상 ${saved.awards.length} · 기술 ${saved.skill_codes.length}`;
                  })
                }
              >
                수정 완료
              </button>
            </div>
          )}
        </div>

        {!user && <p style={S.hint}>로그인하면 편집할 수 있습니다.</p>}

        {user && profileForm && (
          <>
            <p style={S.notice}>
              실제 마이페이지 수정 화면과 같은 구성입니다. 저장하면 백엔드 응답이 로그에 남습니다.
            </p>

            <div style={S.basicRow}>
              <div style={S.avatarCol}>
                <span style={S.avatarBox}>
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt='' style={S.avatarImg} />
                  ) : (
                    <span style={S.itemDetail}>사진 없음</span>
                  )}
                </span>
                <label style={{ ...S.miniBtn, cursor: 'pointer', textAlign: 'center' }}>
                  사진 변경
                  <input
                    type='file'
                    accept='image/jpeg,image/png,image/webp'
                    style={{ display: 'none' }}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      e.target.value = '';
                      if (!file) return;
                      runProfileAction('사진 변경', async () => await uploadAvatar(file));
                    }}
                  />
                </label>
                <button
                  type='button'
                  style={S.miniBtn}
                  onClick={() => runProfileAction('사진 삭제', async () => (await removeAvatar()) ?? '삭제됨')}
                >
                  사진 삭제
                </button>
              </div>

              <div style={S.fieldGrid}>
                <Field label='이름'>
                  <input
                    style={S.input}
                    placeholder='홍길동'
                    value={profileForm.name}
                    onChange={(e) => patchForm({ name: e.target.value })}
                  />
                </Field>
                <Field label='희망 직무'>
                  <CodeSelect
                    group={codeGroups?.job_role}
                    value={profileForm.desired_role}
                    onChange={(v) => patchForm({ desired_role: v })}
                  />
                </Field>
                <Field label='경력 구분'>
                  <CodeSelect
                    group={codeGroups?.career_level}
                    value={profileForm.career_level}
                    onChange={(v) => patchForm({ career_level: v })}
                  />
                </Field>
                <Field label='링크 (선택)'>
                  <input
                    style={S.input}
                    placeholder='github.com/아이디'
                    value={profileForm.github_url}
                    onChange={(e) => patchForm({ github_url: e.target.value })}
                  />
                </Field>
              </div>
            </div>

            <div style={S.sectionBox}>
              <p style={S.sectionTitle}>자기소개</p>
              <textarea
                style={{ ...S.input, minHeight: 90, resize: 'vertical' }}
                placeholder='어떤 사람인지 짧게 적어주세요.'
                value={profileForm.bio}
                onChange={(e) => patchForm({ bio: e.target.value })}
              />
              <p style={S.hint}>{profileForm.bio.length} / 1000자</p>
            </div>

            <div style={S.sectionBox}>
              <p style={S.sectionTitle}>학력</p>
              <div style={{ maxWidth: 240 }}>
                <Field label='최종학력'>
                  <CodeSelect
                    group={codeGroups?.education_level}
                    value={profileForm.education_level}
                    onChange={(v) => patchForm({ education_level: v })}
                  />
                </Field>
              </div>
              <p style={S.hint}>고등학교부터 순서대로 적어요.</p>

              {profileForm.educations.map((item, i) => (
                <div key={`edu-${i}`} style={S.rowBox}>
                  <Field label='구분'>
                    <CodeSelect
                      group={codeGroups?.school_type}
                      value={item.type ?? ''}
                      onChange={(v) => patchRow('educations', i, { type: v })}
                    />
                  </Field>
                  <Field label='학교명'>
                    <input
                      style={S.input}
                      value={item.school ?? ''}
                      onChange={(e) => patchRow('educations', i, { school: e.target.value })}
                    />
                  </Field>
                  <Field label='전공'>
                    <input
                      style={S.input}
                      value={item.major ?? ''}
                      onChange={(e) => patchRow('educations', i, { major: e.target.value })}
                    />
                  </Field>
                  <Field label='상태'>
                    <CodeSelect
                      group={codeGroups?.edu_status}
                      value={item.status ?? ''}
                      onChange={(v) => patchRow('educations', i, { status: v })}
                    />
                  </Field>
                  <Field label='입학'>
                    <input
                      style={S.input}
                      placeholder='2015-03'
                      value={item.admission ?? ''}
                      onChange={(e) => patchRow('educations', i, { admission: e.target.value })}
                    />
                  </Field>
                  <Field label='졸업'>
                    <input
                      style={S.input}
                      placeholder='2019-02'
                      value={item.graduation ?? ''}
                      onChange={(e) => patchRow('educations', i, { graduation: e.target.value })}
                    />
                  </Field>
                  <button type='button' style={S.miniBtn} onClick={() => removeRow('educations', i)}>
                    삭제
                  </button>
                </div>
              ))}
              <button
                type='button'
                style={S.miniBtn}
                onClick={() => addRow('educations', { type: '', school: '', major: '', status: '', admission: '', graduation: '' })}
              >
                학력 추가
              </button>
            </div>

            <div style={S.sectionBox}>
              <p style={S.sectionTitle}>경력</p>
              {profileForm.careers.map((item, i) => (
                <div key={`car-${i}`} style={S.rowBox}>
                  <Field label='회사명'>
                    <input
                      style={S.input}
                      value={item.company ?? ''}
                      onChange={(e) => patchRow('careers', i, { company: e.target.value })}
                    />
                  </Field>
                  <Field label='직무'>
                    <input
                      style={S.input}
                      value={item.role ?? ''}
                      onChange={(e) => patchRow('careers', i, { role: e.target.value })}
                    />
                  </Field>
                  <Field label='시작'>
                    <input
                      style={S.input}
                      placeholder='2024-03'
                      value={item.start ?? ''}
                      onChange={(e) => patchRow('careers', i, { start: e.target.value })}
                    />
                  </Field>
                  <Field label='종료'>
                    <input
                      style={S.input}
                      placeholder='재직 중'
                      value={item.end ?? ''}
                      onChange={(e) => patchRow('careers', i, { end: e.target.value })}
                    />
                  </Field>
                  <button type='button' style={S.miniBtn} onClick={() => removeRow('careers', i)}>
                    삭제
                  </button>
                </div>
              ))}
              <button
                type='button'
                style={S.miniBtn}
                onClick={() => addRow('careers', { company: '', role: '', start: '', end: '재직 중' })}
              >
                경력 추가
              </button>
            </div>

            <div style={S.sectionBox}>
              <p style={S.sectionTitle}>언어</p>
              {profileForm.languages.map((item, i) => (
                <div key={`lan-${i}`} style={S.rowBox}>
                  <Field label='언어'>
                    <input
                      style={S.input}
                      placeholder='영어'
                      value={item.language ?? ''}
                      onChange={(e) => patchRow('languages', i, { language: e.target.value })}
                    />
                  </Field>
                  <Field label='설명 (예: TOEIC 800점)'>
                    <input
                      style={S.input}
                      value={item.detail ?? ''}
                      onChange={(e) => patchRow('languages', i, { detail: e.target.value })}
                    />
                  </Field>
                  <Field label='수준'>
                    <CodeSelect
                      group={codeGroups?.language_level}
                      value={item.level ?? ''}
                      onChange={(v) => patchRow('languages', i, { level: v })}
                    />
                  </Field>
                  <button type='button' style={S.miniBtn} onClick={() => removeRow('languages', i)}>
                    삭제
                  </button>
                </div>
              ))}
              <button
                type='button'
                style={S.miniBtn}
                onClick={() => addRow('languages', { language: '', detail: '', level: '' })}
              >
                언어 추가
              </button>
            </div>

            <div style={S.sectionBox}>
              <p style={S.sectionTitle}>수상 내역</p>
              {profileForm.awards.map((item, i) => (
                <div key={`awd-${i}`} style={S.rowBox}>
                  <Field label='수상명'>
                    <input
                      style={S.input}
                      value={item.name ?? ''}
                      onChange={(e) => patchRow('awards', i, { name: e.target.value })}
                    />
                  </Field>
                  <Field label='수상일'>
                    <input
                      style={S.input}
                      placeholder='2026-05'
                      value={item.date ?? ''}
                      onChange={(e) => patchRow('awards', i, { date: e.target.value })}
                    />
                  </Field>
                  <button type='button' style={S.miniBtn} onClick={() => removeRow('awards', i)}>
                    삭제
                  </button>
                </div>
              ))}
              <button type='button' style={S.miniBtn} onClick={() => addRow('awards', { name: '', date: '' })}>
                수상 추가
              </button>
            </div>

            <div style={S.sectionBox}>
              <p style={S.sectionTitle}>기술 스택</p>
              <div style={S.chipWrap}>
                {(codeGroups?.tech_stack ?? []).map((c) => (
                  <button
                    key={c.code}
                    type='button'
                    style={profileForm.skill_codes.includes(c.code) ? S.chipOn : S.chip}
                    onClick={() => toggleCode('skill_codes', c.code)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div style={S.sectionBox}>
              <p style={S.sectionTitle}>관심 분야</p>
              <div style={S.chipWrap}>
                {(codeGroups?.interest_field ?? []).map((c) => (
                  <button
                    key={c.code}
                    type='button'
                    style={profileForm.interest_codes.includes(c.code) ? S.chipOn : S.chip}
                    onClick={() => toggleCode('interest_codes', c.code)}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <p style={S.hint}>
              저장된 값: 최종학력 <b>{profile?.education_level ?? '-'}</b> · 학력{' '}
              <b>{profile?.educations?.length ?? 0}</b> · 경력 <b>{profile?.careers?.length ?? 0}</b> ·
              어학 <b>{profile?.languages?.length ?? 0}</b> · 수상{' '}
              <b>{profile?.awards?.length ?? 0}</b> · 이메일 <b>{profile?.email ?? '(없음)'}</b>
            </p>

            <button
              type='button'
              style={S.miniBtn}
              onClick={() =>
                runProfileAction('잘못된 코드 거부 확인 (구분=대학교)', async () => {
                  try {
                    await updateProfile({ educations: [{ type: '대학교', school: 'x' }] });
                    throw new Error('거부되지 않았습니다 — FK 확인 필요');
                  } catch (e) {
                    if (e.message.includes('거부되지 않았습니다')) throw e;
                    return `정상 거부됨 (${e.status}) ${e.message}`;
                  }
                })
              }
            >
              잘못된 코드 거부 확인
            </button>
          </>
        )}
      </section>

      <section style={S.card}>
        <h2 style={S.h2}>10. 마이페이지 (요약·스크랩·계정)</h2>

        {user && (
          <p style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <button
              type='button'
              style={S.miniBtn}
              onClick={() =>
                runMypageAction('내가 쓴 후기·족보 조회', async () => {
                  const [reviews, qbanks] = await Promise.all([listMyReviews(), listMyQbanks()]);
                  setMyWritings({ reviews, qbanks });
                  return `후기 ${reviews.total} · 족보 ${qbanks.total}`;
                })
              }
            >
              내가 쓴 후기·족보
            </button>
            {myWritings && (
              <span style={S.itemDetail}>
                후기 {myWritings.reviews.total}건 · 족보 {myWritings.qbanks.total}건 —{' '}
                {[...myWritings.reviews.items, ...myWritings.qbanks.items]
                  .map((p) => p.title || `질문 ${p.questionCount ?? 0}개`)
                  .slice(0, 3)
                  .join(', ') || '없음'}
              </span>
            )}
          </p>
        )}

        {account?.error && (
          <p className='font_body_s_r' style={S.error} role='alert'>
            {account.error}
          </p>
        )}

        {!user && <p style={S.hint}>로그인하면 마이페이지 데이터를 확인할 수 있습니다.</p>}

        {summary && (
          <>
            <ul style={S.summary}>
              <li>
                문서 <b>{summary.stats.docCount}</b>
              </li>
              <li>
                포트폴리오 <b>{summary.stats.portfolioCount}</b> (공개{' '}
                {summary.stats.publishedPortfolioCount} · 초안 {summary.stats.draftPortfolioCount})
              </li>
              <li>
                면접 스크랩 <b>{summary.stats.interviewScrapCount}</b>
              </li>
              <li>
                완주 면접 <b>{summary.stats.finishedInterviewCount}</b>
              </li>
            </ul>

            <ul style={S.summary}>
              <li>
                스크랩 기업 <b>{summary.stats.scrappedCompanyCount}</b>
              </li>
              <li>
                스크랩 글 <b>{summary.stats.scrappedPostCount}</b>
              </li>
              <li>
                스크랩 포트폴리오 <b>{summary.stats.scrappedPortfolioCount}</b>
              </li>
              <li>
                내 후기 <b>{summary.stats.myReviewCount}</b> · 내 족보{' '}
                <b>{summary.stats.myQbankCount}</b>
              </li>
            </ul>
          </>
        )}

        {account && !account.error && (
          <div style={S.detailBox}>
            <div style={S.detailTitle}>계정 설정</div>
            <ul style={S.list}>
              <li style={S.item}>
                <span style={{ ...S.itemLabel, minWidth: 120 }}>이메일</span>
                <span style={S.itemDetail}>{account.email ?? '(없음)'}</span>
              </li>
              <li style={S.item}>
                <span style={{ ...S.itemLabel, minWidth: 120 }}>가입일</span>
                <span style={S.itemDetail}>
                  {account.createdAt ? new Date(account.createdAt).toLocaleString() : '-'}
                </span>
              </li>
              <li style={S.item}>
                <span style={{ ...S.itemLabel, minWidth: 120 }}>최근 로그인</span>
                <span style={S.itemDetail}>
                  {account.lastSignInAt ? new Date(account.lastSignInAt).toLocaleString() : '-'}
                </span>
              </li>
              <li style={S.item}>
                <span style={{ ...S.itemLabel, minWidth: 120 }}>연결된 소셜</span>
                <span style={S.itemDetail}>{account.providers.join(', ') || '-'}</span>
              </li>
              <li style={S.item}>
                <span style={{ ...S.itemLabel, minWidth: 120 }}>프로필 사진</span>
                <span style={S.itemDetail}>{summary?.profile?.avatar_url ?? '(없음)'}</span>
              </li>
            </ul>
          </div>
        )}

        {myScraps && (
          <div style={S.detailBox}>
            <div style={S.detailTitle}>스크랩 목록 (정렬 · 복수 삭제)</div>
            <ul style={S.list}>
              <li style={S.item}>
                <span style={{ ...S.itemLabel, minWidth: 120 }}>기업</span>
                <SortSelect
                  label=''
                  name='scrapCompanies'
                  value={listOpts.scrapCompanies}
                  onChange={changeSort}
                />
                <span style={S.itemDetail}>
                  {myScraps.companies.total}건
                  {myScraps.companies.items.length > 0 &&
                    ` — ${myScraps.companies.items.map((c) => c.name).join(', ')}`}
                </span>
              </li>
              <li style={S.item}>
                <span style={{ ...S.itemLabel, minWidth: 120 }}>면접 후기·족보</span>
                <SortSelect
                  label=''
                  name='scrapPosts'
                  value={listOpts.scrapPosts}
                  onChange={changeSort}
                />
                <span style={S.itemDetail}>
                  {myScraps.posts.total}건
                  {myScraps.posts.items.length > 0 &&
                    ` — ${myScraps.posts.items
                      .map((p) => `${p.companyName || '-'}/${p.title || p.id.slice(0, 8)}`)
                      .join(', ')}`}
                </span>
              </li>
              <li style={S.item}>
                <span style={{ ...S.itemLabel, minWidth: 120 }}>포트폴리오</span>
                <SortSelect
                  label=''
                  name='scrapPortfolios'
                  value={listOpts.scrapPortfolios}
                  onChange={changeSort}
                />
                <span style={S.itemDetail}>
                  {myScraps.portfolios.total}건
                  {myScraps.portfolios.items.length > 0 &&
                    ` — ${myScraps.portfolios.items.map((p) => p.title).join(', ')}`}
                </span>
              </li>
            </ul>
            <p style={S.hint}>
              스크랩 목록의 <code>latest</code> 는 <b>내가 스크랩한 시각</b> 기준입니다. 목록
              화면의 <code>latest</code>(글이 등록된 시각)와 뜻이 다릅니다.
            </p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
          <button
            type='button'
            style={S.btn}
            onClick={() =>
              runMypageAction('스크랩 기업 전체 해제', async () => {
                const ids = (myScraps?.companies?.items ?? []).map((c) => c.id);
                if (ids.length === 0) return '해제할 기업이 없습니다';
                return `${await removeCompanyBookmarks(ids)}건 해제`;
              })
            }
          >
            스크랩 기업 전체 해제
          </button>

          <button
            type='button'
            style={S.btn}
            onClick={() =>
              runMypageAction('스크랩 글 전체 해제', async () => {
                const ids = (myScraps?.posts?.items ?? []).map((p) => p.id);
                if (ids.length === 0) return '해제할 글이 없습니다';
                return `${await removePostScraps(ids)}건 해제`;
              })
            }
          >
            스크랩 글 전체 해제
          </button>

          <button
            type='button'
            style={S.btn}
            onClick={() =>
              runMypageAction('스크랩 포트폴리오 전체 해제', async () => {
                const ids = (myScraps?.portfolios?.items ?? []).map((p) => p.id);
                if (ids.length === 0) return '해제할 포트폴리오가 없습니다';
                return `${await removePortfolioBookmarks(ids)}건 해제`;
              })
            }
          >
            스크랩 포트폴리오 전체 해제
          </button>

          <button
            type='button'
            style={S.btn}
            onClick={() =>
              runMypageAction('면접 스크랩 전체 해제', async () => {
                const ids = (scraps?.items ?? []).map((qa) => qa.id);
                if (ids.length === 0) return '해제할 면접 스크랩이 없습니다';
                const removed = await removeQaScraps(ids);
                await reloadInterview();
                return `${removed}건 해제`;
              })
            }
          >
            면접 스크랩 전체 해제
          </button>

          <button type='button' style={S.btn} onClick={() => runMypageAction('요약 새로고침', async () => '완료')}>
            요약 새로고침
          </button>
        </div>

        <p style={S.hint}>
          회원 탈퇴는 <code>deleteMyAccount()</code> 한 줄이며 계정·문서·포트폴리오·스크랩이 모두
          삭제됩니다. Storage 파일도 <code>documents</code> · <code>portfolios</code> ·{' '}
          <code>avatars</code> 세 버킷에서 함께 지워집니다. 되돌릴 수 없으므로 이 페이지에는 버튼을
          두지 않았습니다.
        </p>
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

function Field({ label, children }) {
  return (
    <label style={S.field}>
      <span style={S.fieldLabel}>{label}</span>
      {children}
    </label>
  );
}

function SortSelect({ label, name, value, onChange }) {
  return (
    <label style={S.sortLabel}>
      {label}
      <select
        style={S.sortSelect}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
      >
        {SORT_OPTIONS[name].map(([code, text]) => (
          <option key={code} value={code}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

function CodeSelect({ group, value, onChange }) {
  return (
    <select style={S.input} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value=''>선택 안 함</option>
      {(group ?? []).map((c) => (
        <option key={c.code} value={c.code}>
          {c.label}
        </option>
      ))}
    </select>
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
  input: {
    padding: '6px 8px',
    border: '1px solid #D4D4D4',
    borderRadius: 6,
    fontSize: 13,
    fontFamily: 'inherit',
    width: '100%',
    boxSizing: 'border-box',
  },
  headRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    flexWrap: 'wrap',
  },
  saveBtn: {
    padding: '8px 16px',
    border: 'none',
    borderRadius: 8,
    background: '#8635F6',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  cancelBtn: {
    padding: '8px 16px',
    border: '1px solid #D4D4D4',
    borderRadius: 8,
    background: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  notice: {
    margin: '10px 0',
    padding: '8px 12px',
    background: '#F4FCFE',
    borderRadius: 8,
    fontSize: 13,
    color: '#3C3C3C',
  },
  basicRow: { display: 'flex', gap: 20, alignItems: 'flex-start', flexWrap: 'wrap', margin: '12px 0' },
  avatarCol: { display: 'grid', gap: 6, width: 120 },
  avatarBox: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: '#F2F2F2',
    display: 'grid',
    placeItems: 'center',
    overflow: 'hidden',
  },
  avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
  fieldGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: 12,
    flex: 1,
    minWidth: 280,
  },
  field: { display: 'grid', gap: 4 },
  fieldLabel: { fontSize: 12, color: '#6D6D6D', fontWeight: 700 },
  sectionBox: {
    border: '1px solid #EDEDED',
    borderRadius: 10,
    padding: 14,
    marginTop: 12,
    display: 'grid',
    gap: 8,
  },
  sectionTitle: { fontSize: 15, fontWeight: 700, margin: 0 },
  rowBox: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: 10,
    alignItems: 'end',
    padding: 10,
    background: '#FAFAFA',
    borderRadius: 8,
  },
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: 6 },
  chip: {
    padding: '4px 10px',
    border: '1px solid #D4D4D4',
    borderRadius: 999,
    background: '#fff',
    fontSize: 12,
    cursor: 'pointer',
  },
  chipOn: {
    padding: '4px 10px',
    border: '1px solid #8635F6',
    borderRadius: 999,
    background: '#8635F6',
    color: '#fff',
    fontSize: 12,
    cursor: 'pointer',
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
  sortBar: { display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 12 },
  sortLabel: { display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: 12, color: '#6F6F6F' },
  sortSelect: {
    padding: '6px 10px',
    border: '1px solid #ACAEAD',
    borderRadius: 8,
    background: '#FFFFFF',
    fontSize: 13,
  },
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

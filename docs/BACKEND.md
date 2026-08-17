# 프론트엔드 백엔드 가이드 & API 스펙

> 팀원이 읽는 문서입니다. **Supabase를 몰라도 됩니다.**
>
> - **1부**는 "빨리 붙이는 법"입니다. 함수만 import 하면 끝납니다. 화면 작업 중이면 여기만 보세요.
> - **2부**는 "정확한 스펙"입니다. 필드 의미·허용값·에러가 전부 적혀 있습니다. 값이 이상하게 나올 때 보세요.

---

## 목차

**1부 — 사용법**

- [0. 시작하기](#0-시작하기)
- [1. 구조](#1-구조)
- [2. 공통 규칙 3가지](#2-공통-규칙-3가지)
- [3. 함수 레퍼런스](#3-함수-레퍼런스)

**2부 — API 스펙**

- [4. 공통 규약](#4-공통-규약)
- [5. 데이터 모델](#5-데이터-모델)
- [6. 엔드포인트 상세](#6-엔드포인트-상세)
- [7. 코드 값 사전](#7-코드-값-사전-code_master)
- [8. 파일 업로드 (Storage)](#8-파일-업로드-storage)

**3부 — 참고**

- [9. 스펙 제약 · 미구현](#9-스펙-제약--미구현)
- [10. 프론트에 부탁하는 것](#10-프론트에-부탁하는-것)

---

# 1부 — 사용법

## 0. 시작하기

```bash
git pull
npm install
npm run dev
```

프로젝트 루트에 `.env.local` 을 만들고 아래 4개를 채우세요. **값은 팀 단톡 고정 메시지 참고.**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_ALAN_BASE_URL=/alan
NEXT_PUBLIC_ALAN_CLIENT_ID=
```

동작 확인: <http://localhost:3000/backend-test> — 전부 초록불이면 준비 완료입니다.

> `.env.local` 이 없어도 앱은 뜹니다. 다만 로그인/데이터 기능은 동작하지 않습니다.

> ⚠️ **`/backend-test` 는 배포본에서 404 입니다.** 글을 만들고 지우는 버튼이 있는 개발용 페이지라
> 프로덕션에서는 `src/proxy.js` 가 막습니다. 로컬(`npm run dev`)에서는 그냥 열립니다.
> 배포본에서 확인해야 할 때만 Vercel 환경변수에 `ENABLE_BACKEND_TEST=1` 을 넣고 재배포하세요.
> **끝나면 반드시 다시 지우거나 `0` 으로 바꿉니다.**

### Alan AI 환경변수 ⚠️ 각자 값이 다릅니다

`NEXT_PUBLIC_ALAN_CLIENT_ID` 는 **사람마다 다르게** 배정돼 있습니다. 팀 단톡의 배정표에서
본인 것을 찾아 넣으세요. 남의 것을 쓰면 그 사람 할당량이 깎입니다.

`NEXT_PUBLIC_ALAN_BASE_URL` 은 `/alan` 그대로 두세요. 호출법은 [9장 — Alan AI](#9-스펙-제약--미구현) 참고.

## 1. 구조

브라우저는 **우리가 만든 REST API(`/api/*`)만** 호출합니다. Supabase는 서버에서만 접근합니다.

```
화면  ──►  lib/api/*.js  ──fetch──►  /api/*  ──►  Supabase
```

`lib/api/*` 가 `fetch`와 에러 처리를 감싸므로, 화면에서는 **함수만 부르면 됩니다.**
엔드포인트를 직접 호출할 일은 없습니다. (2부는 그 함수가 실제로 무엇을 주고받는지에 대한 명세입니다.)

**예외 2가지** — 이것만 Supabase를 직접 씁니다.

| 기능 | 이유 |
|---|---|
| 소셜 로그인 / 로그아웃 (`signInWith`, `signOut`) | OAuth 리다이렉트는 브라우저가 직접 해야 합니다 |
| 이미지 업로드 (`uploadAvatar`, `uploadPortfolioImages`) | 파일을 서버로 한 번 더 넘기면 느리고 용량 제한에 걸립니다 |

## 2. 공통 규칙 3가지

**① 실패하면 예외가 납니다.**

```js
try {
  const profile = await getProfile(userId);
} catch (e) {
  alert(e.message);  // 이미 한국어 메시지입니다
  e.status;          // 401, 403, 404 ... 분기가 필요할 때
  e.code;            // 'NOT_AUTHENTICATED', 'FORBIDDEN' ...
}
```

**② 목록 함수는 항상 같은 모양을 돌려줍니다.** 기존 `Pagination.js` 에 바로 연결됩니다.

```js
const { items, total, page, pageSize } = await listCompanies({ page: 1 });
```

**③ 클라이언트 컴포넌트에서 호출하세요.** 파일 맨 위에 `'use client'` 가 필요합니다.

```js
'use client';
import { getCodes } from '@backend/lib/api/codes';
```

> 서버 컴포넌트에서 부르면 `lib/api 함수는 클라이언트 컴포넌트에서만 호출할 수 있습니다.` 예외가 납니다.

## 3. 함수 레퍼런스

### 로그인 — `useAuth()` ⭐ 이것만 쓰면 됩니다

로그인 상태는 `app/layout.js`의 `<AuthProvider>`가 전역으로 제공합니다.
**로그인/회원가입 모달도 Provider가 들고 있으므로, 어느 컴포넌트에서든 열 수 있습니다.**

```js
'use client';
import { useAuth } from '@/app/_components/auth';

function MyComponent() {
  const { user, isLoading, isLoggedIn, openLogin, openSignup, signOut } = useAuth();

  if (isLoading) return null;               // 로그인 여부 확인 중 (깜빡임 방지)
  if (!isLoggedIn) return <button onClick={openLogin}>로그인</button>;

  return (
    <>
      <span>{user.email}</span>
      <button onClick={signOut}>로그아웃</button>
    </>
  );
}
```

| 값 | 설명 |
|---|---|
| `user` | `{ id, email }` \| `null` |
| `isLoading` | 최초 확인 중이면 `true`. 이때 UI를 그리면 깜빡입니다 |
| `isLoggedIn` | `user !== null` |
| `openLogin()` | 로그인 모달 열기 |
| `openSignup()` | 회원가입 모달 열기 |
| `signOut()` | 로그아웃 |

**로그인이 필요한 페이지**는 `src/proxy.js`의 `PROTECTED_PATHS` 에 경로를 추가하세요.
비로그인 접근 시 홈으로 보내고 로그인 모달이 자동으로 뜹니다. 로그인 후에는 원래 가려던 경로로 돌아갑니다.

```js
const PROTECTED_PATHS = ['/mypage'];   // 하위 경로까지 함께 막힙니다
```

<details>
<summary>저수준 API (직접 쓸 일은 거의 없습니다)</summary>

```js
import { signInWith, signOut, getCurrentUser, onAuthChange, deleteMyAccount, OAUTH_PROVIDERS } from '@backend/lib/api/auth';
```

| 함수 | 반환 |
|---|---|
| `signInWith(provider, { next })` | 없음 (페이지 이동) |
| `signOut()` | 없음 |
| `getCurrentUser()` | `{ id, email }` \| `null` |
| `onAuthChange(handler)` | 구독 해제 함수 |
| `deleteMyAccount()` | 없음 — ⚠️ 즉시·완전 삭제. 문구 확인은 화면에서 |

</details>

> `OAUTH_PROVIDERS` 는 **GitHub / Google / 카카오 3종 모두 활성화**되어 있습니다.
> 특정 provider 에서만 에러가 나면 코드 문제가 아니라 Supabase 대시보드 설정 문제이니 알려주세요.
> 로그인은 **탭을 닫아도 유지**됩니다(영속 쿠키 400일). 로그아웃 버튼을 반드시 노출해 주세요.

### 드롭다운·필터 옵션 — `@backend/lib/api/codes`

하드코딩하지 마세요. 옵션이 바뀌어도 코드를 안 고쳐도 됩니다.

```js
import { getCodes, getCodeGroups, labelOf } from '@backend/lib/api/codes';

const roles = await getCodes('job_role');
// [{ code: 'frontend', label: '프론트엔드' }, ...]

// 필터 바처럼 드롭다운이 여러 개면 한 번에 (이미 받아온 그룹은 재요청하지 않습니다)
const { job_role, company_size, industry } = await getCodeGroups(['job_role', 'company_size', 'industry']);

await labelOf('job_role', 'frontend');  // '프론트엔드'
```

전체 코드 값은 [7장](#7-코드-값-사전-code_master)에 있습니다.

| 그룹 | 쓰는 곳 | 개수 |
|---|---|---|
| `job_role` | 기업 탐색 직무 필터 | 13 |
| `company_size` | 기업 규모 필터 | 6 |
| `industry` | 산업 필터 | 12 |
| `tech_stack` | 프로필 기술 스택 | 42 |
| `interest_field` | 프로필 관심 분야 | 11 |
| `interview_channel` | 면접 경로 | 6 |
| `pass_result` | 합격 여부 | 3 |
| `difficulty` | 면접 난이도 | 3 |
| `language_level` | 어학 수준 | 3 |
| `education_level` | 최종 학력 (프로필) · 학력 (면접 후기) | 5 |
| `school_type` | 학교 구분 (프로필 학력) | 4 |
| `career_level` | 경력 구분 | 4 |
| `edu_status` | 재학/휴학/졸업/중퇴 | 4 |
| `interviewer_style` | AI 면접관 성격 | 4 |
| `interview_category` | AI 면접 질문 카테고리 | 5 |
| `portfolio_category` | 포트폴리오 웹/앱 | 2 |

> ⚠️ `interest_field`(관심 분야)와 `job_role`(직무)은 **다른 목록**입니다. 섞어 쓰지 마세요.

### 프로필 — `@backend/lib/api/profile`

```js
import { getProfile, getMyProfile, updateProfile, uploadAvatar, getProfileStats } from '@backend/lib/api/profile';

const me = await getMyProfile();            // 미로그인이면 null
const other = await getProfile(userId);     // 타인 프로필

await updateProfile({
  name: '홍길동',
  desired_role: '프론트엔드 개발자',
  career_level: 'entry',
  education_level: 'bachelor',                  // 최종 학력 — code_master(education_level)
  bio: '...',                                   // 1000자 제한
  educations: [{ type, school, major, status, admission, graduation }],
  //            ↑ 학교 구분 — code_master(school_type)
  careers:    [{ start, end, company, role }],  // end 에 '재직 중' 문자열 허용
  awards:     [{ date, name }],
  languages:  [{ language, level, detail }],
  skill_codes:    ['react', 'typescript'],      // code_master(tech_stack)
  interest_codes: ['frontend', 'a11y'],         // code_master(interest_field)
});

const url = await uploadAvatar(file);           // 업로드 + avatar_url 갱신까지 한 번에
const { docCount, portfolioCount, interviewScrapCount } = await getProfileStats('me');
```

⚠️ **프로필만 필드 이름이 `snake_case`입니다.** DB 컬럼을 그대로 주고받기 때문입니다.
나머지 API는 전부 `camelCase` 입니다. 자세한 스키마는 [5.1 Profile](#51-profile) 참고.

**`email` 은 본인에게만 내려갑니다.** 남의 프로필을 조회하면 항상 `null` 입니다.
DB 컬럼 권한으로 막혀 있어 `anon` 키로 Supabase 를 직접 찔러도 읽히지 않습니다. 자세한 내용은 `SECURITY.md`.

**학력 드롭다운 2개는 서로 다른 코드 그룹**입니다. 라벨이 비슷해 헷갈리기 쉬우니 주의하세요.

| 화면 항목 | 저장 위치 | 코드 그룹 | 값 |
|---|---|---|---|
| 최종 학력 | `education_level` (프로필 컬럼) | `education_level` | 고졸 / 초대졸 / **대졸** / 석사 / 박사 |
| 구분 | `educations[].type` (학력 항목 안) | `school_type` | 고등학교 / 전문대 / **대학교** / 대학원 |

```js
const { education_level, school_type } = await getCodeGroups(['education_level', 'school_type']);
```

**소셜 로그인 이메일이 자동으로 채워집니다.** 가입 시 한 번, 그리고 값이 비어 있는 기존 회원은
다음 로그인 때 채워집니다. 사용자가 직접 고쳐 넣은 값은 **덮어쓰지 않습니다.**
따라서 프로필 편집 폼의 이메일 칸은 대개 이미 채워진 상태로 열립니다.

> 프로필 항목은 **전부 선택 입력**입니다. 빈 값이어도 저장됩니다.
> `getProfileStats` 의 `docCount` / `interviewScrapCount` 는 **본인 프로필을 볼 때만** 값이 나옵니다.
> (남의 비공개 문서 개수를 알려주지 않기 위해서입니다.)

### 좋아요 · 북마크 · 스크랩 — `@backend/lib/api/reactions`

화면상 5곳에 흩어져 있지만 **함수는 하나**입니다.

```js
import { REACTION } from '@backend/lib/constants';
import { toggleReaction, getMyReactionIds } from '@backend/lib/api/reactions';

// 누르기 / 취소  →  true = 켜짐, false = 꺼짐
const on = await toggleReaction(...REACTION.companyBookmark, companyId);
```

**"내가 이미 눌렀는지"는 목록·상세 응답에 이미 들어 있습니다.** 따로 물어볼 필요가 없습니다.

```js
const { items } = await listPortfolios();
items[0].likedByMe;        // true 면 아이콘을 채운 상태로 그리세요
items[0].bookmarkedByMe;
```

| 리소스 | 필드 |
|---|---|
| 포트폴리오 | `likedByMe` · `bookmarkedByMe` |
| 면접 후기·족보 | `likedByMe`(도움이 되었어요) · `scrappedByMe`(퍼가요) |
| 댓글 | `likedByMe` |
| 기업 | `bookmarkedByMe` |
| AI 면접 질문 | `scrappedByMe` |
| 무료 양식 | `bookmarkedByMe` |

비로그인이면 전부 `false` 입니다. **다른 사람이 누른 것은 절대 `true` 로 오지 않습니다.**

> ⚠️ 토글 버튼의 초기 상태를 `useState(false)` 로 두면, 다른 페이지를 갔다 돌아왔을 때
> **이미 누른 것이 꺼진 채로 보입니다.** 반드시 이 필드로 초기값을 잡아주세요.

| `REACTION.___` | 화면 | `targetType` / `kind` |
|---|---|---|
| `portfolioLike` | 포트폴리오 좋아요 👍 | `portfolio` / `like` |
| `portfolioBookmark` | 포트폴리오 북마크 | `portfolio` / `bookmark` |
| `postLike` | 면접 후기·족보 "도움이 되었어요" | `post` / `like` |
| `postScrap` | 면접 후기·족보 "퍼가요" | `post` / `bookmark` |
| `companyBookmark` | 관심 회사 / 스크랩한 기업 | `company` / `bookmark` |
| `commentLike` | 댓글 좋아요 | `comment` / `like` |
| `interviewQaScrap` | AI 면접 질문 스크랩 | `interview_qa` / `bookmark` |
| `templateBookmark` | 양식 북마크 | `template` / `bookmark` |

⚠️ **`reactions` 테이블을 직접 조회하지 마세요.** 보안 점검(D11) 이후 **본인 행만** 읽을 수 있습니다.
**숫자**(`likeCount` `bookmarkCount` `scrapCount`)와 **내가 눌렀는지**(`likedByMe` 등) 모두 목록 응답에
이미 들어 있습니다. 직접 세면 "내가 누른 것"만 세어져 전부 0 또는 1로 나옵니다.

`getMyReactionIds()` / `getMyPortfolioReactions()` / `getMyScrappedQaIds()` / `getMyBookmarkedTemplateIds()` 는
호환을 위해 남겨 뒀지만 **이제 부를 필요가 없습니다.** 반응 대상 7종 전부 목록·상세 응답에 들어 있습니다.

### 기업 탐색 — `@backend/lib/api/companies`

```js
import {
  listCompanies, getCompany, getRecommendedCompanies,
  incrementCompanyView, toggleCompanyBookmark,
  getMyBookmarkedCompanyIds, listMyBookmarkedCompanies,
} from '@backend/lib/api/companies';

// 목록 (기업 탐색 그리드)
const { items, total, page, pageSize } = await listCompanies({
  q: '토스',            // 회사명 검색 (기획 9-2: 제목만)
  industry: 'fintech',  // code_master(industry)
  size: 'large',        // code_master(company_size) — 카드의 size 는 라벨("대기업")로 옵니다
  jobRole: 'frontend',  // code_master(job_role)
  sort: 'popular',      // popular | rating | views | name | latest
  page: 1,
});

const company = await getCompany('estsoft');            // 상세
const recommended = await getRecommendedCompanies(6);   // 메인 화면 추천 기업
const on = await toggleCompanyBookmark(company.id);     // true = 등록됨
const marked = await getMyBookmarkedCompanyIds(items.map((c) => c.id));
// 마이페이지 "스크랩한 기업" — sort 는 latest | oldest | name
const mine = await listMyBookmarkedCompanies({ sort: 'latest', page: 1 });
await incrementCompanyView(company.id);                 // 상세 진입 시 조회수 +1
```

**응답 모양** — `detail/data/company.js` 목업과 키를 맞춰 뒀습니다. `import company from './data/company'` 를 `await getCompany(slug)` 로 바꾸면 그대로 동작합니다. 필드별 의미는 [5.4 Company](#54-company).

⚠️ **`logo` 는 현재 전부 `null` 입니다.** `company-logos` 버킷에 업로드한 뒤 Table Editor 에서 `logo_url` 을 채워야 합니다.
⚠️ **`ceo` `founded` `capital` `address` `news` 도 비어 있습니다.** 부정확한 값을 넣지 않으려고 비워 뒀으니 공개 자료를 보고 Table Editor 에서 채워주세요.
⚠️ **`rating` `salary` 는 샘플 값입니다.** 실제 평점·연봉이 아니며 화면 확인용입니다.

### 무료 양식 — `@backend/lib/api/templates`

```js
import { listTemplates, getTemplate, incrementTemplateView } from '@backend/lib/api/templates';

const { items, total, counts } = await listTemplates({
  docType: 'resume',    // resume | cover_letter | (생략 = 전체)
  q: '개발자',           // 제목 검색
  sort: 'popular',      // popular | latest | title | order
  page: 1,
});

const template = await getTemplate(id);   // content / contentHtml 포함
await incrementTemplateView(id);          // 미리보기 열 때 조회수 +1
```

탭 카운트(`전체 N / 이력서 N / 자기소개서 N`)는 응답의 **`counts`** 를 그대로 쓰세요.
세 번 호출할 필요 없습니다. → `counts.all` / `counts.resume` / `counts.cover_letter`

### 문서함 (이력서·자소서) — `@backend/lib/api/documents`

```js
import {
  listMyDocuments, getDocument, createDocument, createDocumentFromTemplate,
  updateDocument, deleteDocument, deleteDocuments,
  createDocumentDraftId, uploadDocumentImage, uploadDocumentImages, removeDocumentImages,
} from '@backend/lib/api/documents';

const { items, total, counts } = await listMyDocuments({
  docType: 'resume',
  q: '신입',          // 제목만 검색 (기획 9-2)
  sort: 'latest',     // latest(수정순) | created | title
  page: 1,
});

// 양식 고르고 시작하기 → 문서 1건 생성 + 양식 내용 복사까지 한 번에
const doc = await createDocumentFromTemplate(templateId, '네이버 지원 이력서');

// 빈 문서
const empty = await createDocument({ docType: 'cover_letter', title: '제목 없음' });

// 저장 (에디터에서 세 값을 함께 보내주세요)
await updateDocument(doc.id, {
  title,
  content: editor.getJSON(),
  contentHtml: editor.getHTML(),
  contentText: editor.getText(),
});

// 본문에 이미지 넣기 — 저장 전(draft)에도 됩니다. 8장 참고
const draftId  = createDocumentDraftId();
const imageUrl = await uploadDocumentImage(draftId, file);   // 5MB / jpg·png·webp·gif

await deleteDocuments([id1, id2]);   // 문서함 복수 삭제
```

⚠️ **이력서 10개 / 자소서 10개 제한**은 DB 트리거가 막습니다. 11번째 생성 시
`DOCUMENT_LIMIT_EXCEEDED` (409) 가 던져지므로 `try/catch` 로 안내 문구를 띄워주세요.

### 내 정보 불러오기 — `@backend/lib/api/resumeFill`

```js
import { buildResumeHtmlFromMyProfile } from '@backend/lib/api/resumeFill';

const html = await buildResumeHtmlFromMyProfile();
editor.commands.insertContent(html);
```

**AI를 호출하지 않습니다.** 프로필(학력·경력·수상·언어·기술스택)을 HTML로 조립하는 순수 함수라
즉시 반환됩니다. 로딩 UI가 필요 없습니다.

### 포트폴리오 — `@backend/lib/api/portfolio`

```js
import {
  listPortfolios, listMyPortfolios, getPortfolio,
  createPortfolio, updatePortfolio, publishPortfolio,
  deletePortfolio, deletePortfolios,
  uploadPortfolioImages, incrementPortfolioView,
  togglePortfolioLike, togglePortfolioBookmark, getMyPortfolioReactions,
  listMyBookmarkedPortfolios, removePortfolioBookmarks,
  findMemberByEmail, setPortfolioCollaborators,
} from '@backend/lib/api/portfolio';

// 갤러리 (공개된 것만)
const { items, total } = await listPortfolios({
  category: 'web',     // web | app
  q: '협업',           // 제목 검색
  sort: 'latest',      // latest | oldest | title | views | popular(좋아요) | bookmarks(스크랩)
  page: 1,
});

// 업로드 순서 ⭐ — 먼저 초안을 만들고, 그 id로 이미지를 올립니다
const draft = await createPortfolio({ title: '제목 없음', category: 'web' });
const urls = await uploadPortfolioImages(draft.id, files);   // 최대 15장 / 5MB
await updatePortfolio(draft.id, {
  document: [...blocks, ...urls.map((url) => ({ type: 'image', url }))],
  bgColor: '#F4FCFE',
  gapPx: 16,
});
await publishPortfolio(draft.id);   // 임시저장 → 공개

// 목록에서 내가 누른 것 표시 (카드마다 호출 금지)
const { liked, bookmarked } = await getMyPortfolioReactions(items.map((p) => p.id));
```

**공동작업자** — 이메일로 찾아서 id 배열로 저장합니다.

```js
// 1) 이메일로 찾기 (정확히 일치해야 하고, 로그인 필요)
const member = await findMemberByEmail('teammate@example.com');
// { id, name, avatarUrl }  ·  가입자가 없으면 null

// 2) N명을 통째로 저장 (목록 교체 방식)
const saved = await setPortfolioCollaborators(portfolioId, [member.id, another.id]);
saved.collaborators;   // [{ id, name, avatarUrl }, ...]

// 생성할 때 한 번에 넣어도 됩니다
await createPortfolio({ title: '작업', collaboratorIds: [member.id] });
```

| 규칙 | 동작 |
|---|---|
| 저장 방식 | **통째로 교체.** 한 명만 빼려면 나머지 전체를 다시 보내세요 |
| 본인 id | 자동으로 제외됩니다 (소유자는 공동작업자가 아님) |
| 중복 id | 자동으로 한 번만 저장 |
| 없는 사용자 id | **400** |
| 최대 인원 | **20명** |
| 남의 포트폴리오 | **404** — 소유자만 수정할 수 있습니다 |

응답의 `collaborators` 는 **목록·상세 모두**에 들어 있어 따로 조회할 필요가 없습니다.
비공개(`draft`) 포트폴리오의 공동작업자는 소유자에게만 보입니다.

> ⚠️ `findMemberByEmail` 은 **이메일을 되돌려주지 않습니다.** 이름과 사진만 옵니다.
> 부분 검색도 안 됩니다 — 정확한 이메일 전체를 알아야 찾을 수 있습니다.

**본문은 탭 3개로 나뉘어 있습니다** — `content` 는 없어졌습니다.

| 필드 | 탭 | 타입 |
|---|---|---|
| `overview` | 개요 | `Block[]` |
| `document` | 문서 | `Block[]` |
| `code` | 코드 | `Block[]` |

```js
await createPortfolio({
  title: '내 작업',
  category: 'web',
  overview: [{ type: 'text',  html: '<p>소개</p>' }],
  document:  [{ type: 'image', url: 'https://.../1.png' }],
  code:     [{ type: 'code',  lang: 'js', body: 'const a = 1;' }],
});
```

| 규칙 | 동작 |
|---|---|
| 셋 다 선택 | 안 보낸 탭은 생성 시 `[]`, 수정 시 **건드리지 않습니다** |
| 값 | 반드시 배열. 아니면 **400** `overview 는 블록 배열이어야 합니다.` |
| 블록 `type` | 아래 4종 밖이면 **400** `overview 의 블록 type 은 …` |
| 이미지 15장 | **세 탭을 합쳐서** 15장. 수정할 때는 **이미 저장된 탭까지 합산**합니다 |
| `content` 를 보내면 | **400** — 조용히 버려지지 않도록 막아뒀습니다 |

**Block 형식** — 세 탭 모두 동일합니다.

| type | 필드 |
|---|---|
| `image` | `{ url }` — `uploadPortfolioImages` 가 돌려준 URL |
| `video` | `{ youtubeUrl }` — **동영상 업로드는 없습니다. YouTube 링크만** |
| `text` | `{ html }` |
| `code` | `{ lang, body }` |

> 이미지 15장은 **포트폴리오 하나당** 총량입니다. `overview` 에 10장을 저장해두고
> `document` 에 6장을 추가하면 400입니다 — 서버가 저장된 탭을 다시 읽어서 함께 셉니다.

### 면접 후기·족보 — `@backend/lib/api/posts`

후기(`review`)와 족보(`qbank`)는 **한 테이블**입니다. `type` 으로 나뉩니다.

```js
import {
  listPosts, listMyPosts, getPost, createPost, updatePost,
  deletePost, deletePosts, incrementPostView,
  togglePostLike, togglePostScrap, getMyPostReactions,
  listMyScrappedPosts, removePostScraps,
} from '@backend/lib/api/posts';

const { items, total } = await listPosts({
  type: 'review',            // review | qbank | (생략 = 전체)
  companySlug: 'naver',      // 기업 상세의 후기 탭
  jobRole: 'frontend',       // code_master(job_role)
  difficulty: 'hard',        // code_master(difficulty)
  passResult: 'pass',        // code_master(pass_result)
  q: '프론트엔드',            // 제목 검색
  sort: 'latest',            // latest | oldest | company | popular | scraps | comments | views
  page: 1,
});
// 필터 3종은 DB 에서 걸러내므로 total 도 걸러낸 개수입니다.
// 받아온 뒤 화면에서 filter() 하면 2페이지부터 개수가 어긋납니다.

// 후기 작성
await createPost({
  postType: 'review',
  companyId, title, body,
  difficultyCode: 'normal', difficultyScore: 3,
  passResultCode: 'pass',
  channelCode: 'online', channelEtc: null,    // '기타'(etc) 선택 시에만 channelEtc
  jobRoleCode: 'frontend', positionLevel: '신입', educationLevel: 'bachelor',
  tags: ['CS', '기술 면접'],
  overallComment: '...',
});

// 족보 작성 — title 없이, 질문은 여러 줄 텍스트 (textarea 값을 그대로)
await createPost({
  postType: 'qbank',
  companyId,
  questions: 'REST API의 장점은?\n클로저를 설명해주세요.',
  problemScore: 4,
});
```

**질문은 `textarea` 값을 그대로 보내면 됩니다.** 한 줄에 질문 하나입니다. 배열을 보내면 400.

응답은 **두 가지 모양으로 함께** 옵니다.

| 필드 | 용도 |
|---|---|
| `questions` | **입력한 원본 텍스트.** 수정 화면의 `textarea` 에 그대로 넣으세요 |
| `questionList` | 줄 단위로 자르고 공백·빈 줄을 걸러낸 **배열.** 목록 렌더링에 쓰세요 |

```jsx
{post.questionList.map((q, i) => <li key={i}>{q}</li>)}
```

`questionCount` 는 **서버가 빈 줄을 뺀 줄 수로 계산**합니다. 보내지 마세요 (보내도 무시됩니다).
수정으로 질문을 늘리거나 줄이면 개수도 함께 갱신됩니다.

**점수는 전부 1~5 정수만** 받습니다 — 면접 난이도(`difficultyScore`)와 문제 난이도(`problemScore`) 둘 다.
별 5개짜리 선택 UI를 그대로 보내면 됩니다. `3.5` 같은 반 칸 점수나 범위 밖 값은 **400** 입니다.

```js
import { SCORE_SCALE } from '@backend/lib/constants';   // { min: 1, max: 5, step: 1 }
```

### 댓글 — `@backend/lib/api/comments`

```js
import {
  listComments, createComment, updateComment, deleteComment,
  toggleCommentLike, getMyCommentLikes,
} from '@backend/lib/api/comments';

const { items, total } = await listComments(postId, {
  sort: 'latest',   // latest(기본) | popular(추천순)
  page: 1,
});
await createComment(postId, '좋은 후기 감사합니다.');
```

### AI 면접 (저장·조회) — `@backend/lib/api/interview`

⚠️ **질문 생성과 피드백은 Alan AI 담당입니다.** 이 모듈은 **결과를 저장하고 다시 꺼내는 것**만 합니다.

```js
import {
  createSession, listMySessions, getSession, saveQas, finishSession, deleteSession,
  listMyQas, listSessionQas, listMyScraps,
  toggleQaScrap, getMyScrappedQaIds, removeQaScraps, deleteQas,
} from '@backend/lib/api/interview';

// 1) 면접 시작
const session = await createSession({
  companyId,
  resumeIds: [docId],  coverLetterIds: [],
  interviewerStyle: 'pressure',       // friendly | neutral | pressure | technical
  selectedCategories: ['intro', 'tech1', 'closing'],
  showTimer: true,
});

// 2) 진행 중 채팅은 저장하지 않습니다. 끝날 때 한 번에 넣으세요
await saveQas(session.id, [
  { seq: 1, category: 'intro', question, answer, feedback: { summary, strengths, improvements }, score: 4 },
]);

// 3) 종료
await finishSession(session.id, { durationSec: 612, totalScore: 7, subScores: { 답변내용: 4 } });

// 마이페이지 스크랩 목록 — 여기만 본문(질문·답변) 검색이 됩니다
const { items, total } = await listMyScraps({ q: '클로저', page: 1 });
```

### 마이페이지 — `@backend/lib/api/mypage`

마이페이지에서 쓰는 것을 **한 파일로 모아 뒀습니다.** 도메인 파일을 각각 import 하지 않아도 됩니다.

```js
import {
  getMySummary, getMyAccount,
  listMyDocuments, listMyPortfolios, listMyScraps,
  listMyScrappedCompanies, listMyScrappedPortfolios, listMyScrappedPosts,
  listMyReviews, listMyQbanks,
  deleteDocuments, deletePortfolios, deletePosts, deleteQas,
  removeCompanyBookmarks, removePortfolioBookmarks, removePostScraps, removeQaScraps,
  updateProfile, uploadAvatar, removeAvatar, deleteMyAccount,
} from '@backend/lib/api/mypage';
```

**1) 진입 시 한 번만 — 프로필 + 모든 카운터**

```js
const { profile, stats } = await getMySummary();

stats.docCount;                  // 문서함
stats.portfolioCount;            // 내 포트폴리오 (공개 + 초안)
stats.publishedPortfolioCount;   // 공개
stats.draftPortfolioCount;       // 초안
stats.interviewScrapCount;       // AI 면접 스크랩
stats.finishedInterviewCount;    // 완주한 면접 횟수
stats.scrappedCompanyCount;      // 스크랩한 기업
stats.scrappedPostCount;         // 스크랩한 후기·족보
stats.scrappedPortfolioCount;    // 스크랩한 포트폴리오
stats.myReviewCount;             // 내가 쓴 후기
stats.myQbankCount;              // 내가 쓴 족보
```

탭 뱃지 숫자를 이걸로 채우고, 탭을 눌렀을 때 해당 목록만 부르세요.

**2) 계정 설정**

```js
const { email, createdAt, lastSignInAt, providers } = await getMyAccount();
// providers: ['github'] / ['google', 'kakao'] — 같은 이메일이면 자동 통합됩니다
```

디자인상 **비밀번호·이메일 변경 항목이 없습니다** (소셜 로그인 전용이므로 정상입니다).
프로필 사진은 `uploadAvatar(file)` / `removeAvatar()` 를 쓰세요.

**3) 수정·삭제 모드 (복수 삭제)**

체크박스로 고른 id 배열을 그대로 넘기면 됩니다. **남의 것은 RLS가 알아서 걸러냅니다.**

| 목록 | 삭제 함수 | 의미 |
|---|---|---|
| 문서함 | `deleteDocuments(ids)` | 문서를 **지움** |
| 내 포트폴리오 | `deletePortfolios(ids)` | 포트폴리오를 **지움** |
| 내가 쓴 후기·족보 | `deletePosts(ids)` | 글을 **지움** |
| AI 면접 스크랩 | `removeQaScraps(ids)` | 스크랩만 **해제** (질문 기록은 남음) |
| 스크랩한 기업 | `removeCompanyBookmarks(ids)` | 관심 **해제** |
| 스크랩한 후기·족보 | `removePostScraps(ids)` | 퍼가요 **해제** |
| 스크랩한 포트폴리오 | `removePortfolioBookmarks(ids)` | 스크랩 **해제** |

> `delete___` 는 원본을 지우고 `remove___` 는 내 스크랩만 뗍니다. 이름으로 구분하세요.
> 반환값은 전부 **실제로 처리된 건수(number)** 입니다.

**4) 회원 탈퇴**

```js
await deleteMyAccount();   // 확인 문구 검증은 프론트에서
router.replace('/');
```

계정·프로필·문서·포트폴리오·글·댓글·스크랩·**업로드한 이미지 파일까지 즉시 삭제**되고
로그아웃까지 함께 처리됩니다. **되돌릴 수 없습니다.**
`회원탈퇴 하겠습니다` 문구 검증은 화면에서 해주세요.

### 상수 — `@backend/lib/constants`

```js
import {
  PAGE_SIZE, SORT, DOCUMENT_LIMIT, SCORE_SCALE, UPLOAD_LIMIT, REACTION,
} from '@backend/lib/constants';

PAGE_SIZE.companies;   // 20  (디자인 그리드를 세어 정한 값)
SORT.latest;           // 'latest' | 'popular' | 'views' | 'bookmarks'
SCORE_SCALE;           // { min: 1, max: 5, step: 1 }
```

| 상수 | 값 | 쓰는 곳 |
|---|---|---|
| `PAGE_SIZE.companies` | 20 | 기업 탐색 |
| `PAGE_SIZE.templates` | 16 | 무료 양식 |
| `PAGE_SIZE.portfolioGallery` | 20 | 포트폴리오 갤러리 |
| `PAGE_SIZE.profilePortfolios` | 15 | 타인 프로필 포트폴리오 |
| `PAGE_SIZE.reviews` | 10 | 면접 후기 |
| `PAGE_SIZE.qbank` | 10 | 면접 족보 |
| `PAGE_SIZE.documents` | 10 | 문서함 |
| `PAGE_SIZE.comments` | 20 | 댓글 |
| `PAGE_SIZE.myPortfolios` | 9 | 마이페이지 포트폴리오 / 스크랩 |
| `PAGE_SIZE.scrappedCompanies` | 9 | 마이페이지 스크랩한 기업 |
| `PAGE_SIZE.interviewScraps` | 6 | 마이페이지 AI 면접 스크랩 |
| `PAGE_SIZE.myQbank` | 4 | 마이페이지 내 활동 족보 |
| `DOCUMENT_LIMIT` | 10 | 이력서·자소서 각각 |
| `SCORE_SCALE` | `{ min: 1, max: 5, step: 1 }` | 면접 난이도 · 문제 난이도 점수 입력 UI |
| `UPLOAD_LIMIT.avatar` | 2MB | jpg / png / webp |
| `UPLOAD_LIMIT.portfolio` | 5MB × 15장 | jpg / png / webp / gif |

---

# 2부 — API 스펙

## 4. 공통 규약

### 4.1 기본

| 항목 | 값 |
|---|---|
| Base URL | 같은 오리진 (`http://localhost:3000`, 배포 시 Vercel 도메인) |
| 인증 | **HttpOnly 쿠키 자동 전송.** `Authorization` 헤더 없음 |
| 요청 Content-Type | `application/json` (본문이 있을 때만) |
| 응답 Content-Type | `application/json` |
| 문자 인코딩 | UTF-8 |

로그인 여부는 서버가 쿠키의 JWT를 검증해 판단합니다. 프론트가 유저 id를 body에 실어 보낼 필요가 **없습니다**.
(보내도 무시되고, 서버는 항상 토큰의 주인을 씁니다.)

### 4.2 성공 응답

봉투(envelope)가 없습니다. **리소스가 곧 최상위 JSON** 입니다.

```json
{ "id": "…", "title": "네이버 지원 이력서", "docType": "resume" }
```

**목록은 예외 없이 아래 4개 키**를 가집니다.

```json
{ "items": [], "total": 137, "page": 1, "pageSize": 20 }
```

| 필드 | 타입 | 의미 |
|---|---|---|
| `items` | `T[]` | 현재 페이지의 항목. 결과가 없으면 `[]` (`null` 아님) |
| `total` | number | **필터 적용 후** 전체 건수. 마지막 페이지 = `Math.ceil(total / pageSize)` |
| `page` | number | 요청한 페이지 (1부터) |
| `pageSize` | number | 실제 적용된 페이지 크기 (서버가 상한으로 깎을 수 있음) |

**목록 응답의 예외 3가지**

| 엔드포인트 | 차이 |
|---|---|
| `GET /api/companies/recommended` | `{ items }` 만. `total`·`page` 없음 |
| `GET /api/templates` | `counts: { all, resume, cover_letter }` 추가 |
| `GET /api/documents` | `counts: { all, resume, cover_letter }` 추가 |

### 4.3 에러 응답

**모든 실패는 같은 모양**입니다.

```json
{ "error": { "code": "NOT_AUTHENTICATED", "message": "로그인이 필요합니다." } }
```

`message` 는 **이미 한국어 사용자 문구**입니다. 그대로 토스트에 띄워도 됩니다.
`lib/api/*` 를 쓰면 이게 `ApiError` 로 변환되어 `throw` 됩니다 (`e.message` / `e.code` / `e.status`).

| status | code | 언제 | 화면에서 할 일 |
|---|---|---|---|
| 400 | `BAD_REQUEST` | 파라미터 누락·형식 오류 | 개발 중 버그. 콘솔 확인 |
| 400 | `INVALID_REFERENCE` | 존재하지 않는 FK (없는 `companyId` 등) | 선택값 재확인 |
| 400 | `INVALID_VALUE` | DB 제약 위반 (평점 범위, 댓글 길이 등) | 입력 검증 |
| 401 | `NOT_AUTHENTICATED` | 미로그인 상태로 인증 필요 API 호출 | 로그인 모달 (`openLogin()`) |
| 403 | `FORBIDDEN` | 남의 리소스 수정 시도 | "권한이 없습니다" |
| 404 | `NOT_FOUND` | 없는 id / 남의 비공개 문서 | 404 화면 |
| 409 | `DUPLICATE` | 유니크 제약 위반 | 중복 안내 |
| 409 | `DOCUMENT_LIMIT_EXCEEDED` | 문서 11개째 생성 | "10개까지 만들 수 있습니다" |
| 500 | `SCHEMA_NOT_READY` | 마이그레이션 미적용 | **백엔드(도담)에게 알려주세요** |
| 500 | `INTERNAL_ERROR` | 그 외 서버 오류 | **백엔드(도담)에게 알려주세요** |

> **404 와 403 의 구분** — 남의 비공개 문서·초안 포트폴리오는 **404** 로 내려갑니다.
> "있는데 못 본다"를 알려주면 그 자체가 정보 노출이기 때문입니다. 의도된 동작입니다.

### 4.4 공통 파라미터

모든 목록 API가 받습니다.

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `page` | number | `1` | 1보다 작으면 1로 보정 |
| `pageSize` | number | 엔드포인트별 | **최대 50** (댓글만 100). 초과하면 상한으로 깎임 |
| `sort` | string | 엔드포인트별 | 허용값 밖이면 **400**. 표는 각 엔드포인트 참고 |
| `q` | string | — | 검색어. **기본적으로 제목만** 검색 (기획 9-2). 부분 일치·대소문자 무시 |
| `scrapped` | `1` | — | 내가 스크랩한 것만. `/api/companies` · `/api/portfolios` · `/api/posts`. **인증 필요** |

### 4.4-1 ⚠️ 스크랩 목록에서 `latest` 의 뜻

**`scrapped=1` 을 붙이면 `latest`/`oldest` 는 리소스가 만들어진 시각이 아니라 "내가 스크랩한 시각" 입니다.**

| 요청 | `latest` 의 기준 |
|---|---|
| `GET /api/companies?sort=latest` | 기업이 **등록된** 시각 |
| `GET /api/companies?scrapped=1&sort=latest` | 내가 **스크랩한** 시각 |

| 스크랩 목록 | 허용 sort |
|---|---|
| 기업 (`/api/companies?scrapped=1`) | `latest` · `oldest` · `name` |
| 포트폴리오 (`/api/portfolios?scrapped=1`) | `latest` · `oldest` · `title` |
| 후기·족보 (`/api/posts?scrapped=1`) | `latest` · `oldest` · `company` |

마이페이지의 "스크랩한 기업/포트폴리오"는 **내 행동 목록**이라 방금 담은 것이 위로 오는 게 맞습니다.
그래서 스크랩 목록에서는 리소스 기준 정렬(`popular` `views` 등)을 **허용하지 않고 400** 을 돌려줍니다 —
같은 이름이 두 가지를 뜻하는 상황을 만들지 않기 위해서입니다.

> `q` 가 본문까지 검색하는 곳은 `GET /api/interview-qas` **한 군데뿐**입니다 (질문·답변).

### 4.5 타입 표기

| 표기 | 실제 |
|---|---|
| `uuid` | `"3f9c…-…"` 36자 문자열 |
| `datetime` | ISO 8601 UTC — `"2026-08-12T04:31:22.113Z"`. `new Date(v)` 로 바로 파싱 가능 |
| `date` | **표시용 문자열** — `"2026.08.12"`. 정렬·계산에 쓰지 말고 `createdAt` 을 쓰세요 |
| `T[]` | 배열. 비어 있으면 `[]`, `null` 이 아님 |
| `T \| null` | 값이 없을 수 있음 |
| `enum` | 정해진 문자열만. 표에 전부 나열 |

### 4.6 네이밍 규칙 ⚠️

| 대상 | 규칙 |
|---|---|
| 대부분의 API | **camelCase** (`docType`, `likeCount`, `createdAt`) |
| **`/api/profiles/*` 만** | **snake_case** (`desired_role`, `skill_codes`, `avatar_url`) |

프로필은 DB 컬럼을 그대로 주고받기 때문입니다. 요청·응답 양쪽 다 snake_case 입니다.

---

## 5. 데이터 모델

엔드포인트들이 공유하는 객체 스키마입니다. 6장에서는 이 이름으로 참조합니다.

### 5.1 Profile

`GET /api/profiles/{id}` · `PATCH /api/profiles/me` · `GET /api/me/summary` 의 `profile`
**⚠️ 이 모델만 snake_case 입니다.**

| 필드 | 타입 | 수정 | 설명 · 허용값 |
|---|---|---|---|
| `id` | uuid | ✕ | `auth.users.id` 와 동일. 타인 프로필 링크에 쓰는 값 |
| `name` | string \| null | ○ | 이름. 소셜 로그인 시 자동 채워짐 |
| `avatar_url` | string \| null | ○ | 프로필 사진 공개 URL. `uploadAvatar()` 가 갱신 |
| `desired_role` | string \| null | ○ | 희망 직무. **자유 텍스트** (`"프론트엔드 개발자"`) |
| `career_level` | string \| null | ○ | `code_master(career_level)` 코드 — `entry` `1_3` `3_5` `5_plus` |
| `education_level` | string \| null | ○ | **최종 학력.** `code_master(education_level)` 코드 — `high_school` `associate` `bachelor` `master` `doctor` |
| `email` | string \| null | ○ | 이력서용 연락처. **본인 조회일 때만 값이 옵니다.** 타인·비로그인 조회에서는 항상 `null`. 가입·재로그인 시 소셜 계정 이메일이 자동으로 채워짐(빈 값일 때만) |
| `github_url` | string \| null | ○ | 깃허브 주소 |
| `bio` | string \| null | ○ | 자기소개. **최대 1000자** (초과 시 400) |
| `educations` | Education[] | ○ | 기본 `[]` |
| `careers` | Career[] | ○ | 기본 `[]` |
| `awards` | Award[] | ○ | 기본 `[]` |
| `languages` | Language[] | ○ | 기본 `[]` |
| `skill_codes` | string[] | ○ | `code_master(tech_stack)` 코드 배열 |
| `interest_codes` | string[] | ○ | `code_master(interest_field)` 코드 배열 |
| `created_at` | datetime | ✕ | 가입 시각 |
| `updated_at` | datetime | ✕ | 마지막 수정 시각 |

**중첩 객체** — 각각 **별도 테이블**에 저장되고 응답에서는 아래 배열로 다시 조립됩니다.
**코드 필드는 DB가 검증합니다** — 라벨(`'대학교'`)을 코드 자리에 넣으면 **400** 입니다.

| 타입 | 모양 | 비고 |
|---|---|---|
| `Education` | `{ type, school, major, status, admission, graduation }` | `type` = **학교 구분**, `code_master(school_type)` 코드 ⚠️검증됨. `status` = `code_master(edu_status)` 코드 ⚠️검증됨. 디자인상 **1개만** 입력하지만 저장은 배열 |
| `Career` | `{ start, end, company, role }` | `end` 에 `"재직 중"` 문자열 허용 |
| `Award` | `{ date, name }` | |
| `Language` | `{ language, level, detail }` | `level` = `code_master(language_level)` 코드 (`high`/`mid`/`low`) ⚠️검증됨 |

> **저장은 목록 단위 통째 교체이고, 4개가 한 트랜잭션으로 처리됩니다.**
> 항목 하나만 추가하려면 기존 배열에 넣어 전체를 보내세요. 저장이 실패하면 **기존 목록이 그대로 남습니다** —
> 지워지고 못 채워지는 중간 상태는 생기지 않습니다.
> 보내지 않은 목록은 건드리지 않습니다. `[]` 를 보내면 그 목록만 비웁니다.

### 5.2 ProfileStats

`GET /api/profiles/{id}/stats` · `GET /api/me/summary` 의 `stats`. 전부 number, 값이 없으면 `0`.

| 필드 | 의미 | 타인 프로필 조회 시 |
|---|---|---|
| `docCount` | 문서함 문서 수 | **항상 0** (RLS로 남의 문서는 보이지 않음) |
| `portfolioCount` | 포트폴리오 수 (본인은 초안 포함) | 공개분만 집계 |
| `publishedPortfolioCount` | 공개된 포트폴리오 | 정확 |
| `draftPortfolioCount` | 초안 포트폴리오 | **항상 0** |
| `interviewScrapCount` | AI 면접 질문 스크랩 | **항상 0** |
| `scrappedCompanyCount` | 스크랩한 기업 | **항상 0** |
| `scrappedPostCount` | 스크랩한 후기·족보 | **항상 0** |
| `scrappedPortfolioCount` | 스크랩한 포트폴리오 | **항상 0** |
| `myReviewCount` | 작성한 면접 후기 | 정확 |
| `myQbankCount` | 작성한 면접 족보 | 정확 |
| `finishedInterviewCount` | 완주한 AI 면접 횟수 | **항상 0** |

> "항상 0"은 버그가 아니라 **의도된 보안 동작**입니다. 타인 프로필 화면에는 0이 나오는 항목을 노출하지 마세요.

### 5.3 Account

`GET /api/me/account` — **본인만** 볼 수 있는 계정 정보.

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 유저 id |
| `email` | string \| null | **로그인 계정 이메일.** `profile.email` 과 다름 |
| `createdAt` | datetime | 가입일 |
| `lastSignInAt` | datetime \| null | 마지막 로그인 |
| `providers` | string[] | 연결된 소셜 — `["github"]`, `["google","kakao"]`. 같은 이메일이면 자동 통합 |

### 5.4 Company

#### CompanyCard — 목록·추천에서 내려오는 카드

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 북마크·조회수 API에 쓰는 값 |
| `slug` | string | URL용 식별자 (`naver`). **상세 조회는 이 값으로** |
| `name` | string | 회사명 |
| `logo` | string \| null | 로고 URL. **현재 전부 null** |
| `category` | string | 산업 **라벨**(`"플랫폼·포털"`). 코드가 아님 |
| `size` | string \| null | 기업 규모 **라벨**(`"중견기업"`). 코드가 아님. 미입력이면 `null` |
| `location` | string \| null | 근무지 (`"경기 성남"`) |
| `tags` | string[] | 키워드 (`["검색","AI"]`) |
| `rating` | number \| null | 종합 평점 `0.0~5.0` (샘플 값) |
| `employees` | number \| null | 사원 수 |
| `avgSalary` | string \| null | 평균 연봉 **표시 문자열** (`"5,800만원"`) |
| `favorite` | number | 관심 등록 수 |
| `bookmarkedByMe` | boolean | **내가 관심 등록했는지.** 비로그인이면 `false` |
| `review` | number | 면접 후기 수 |
| `jokbo` | number | 면접 족보 수 |
| `passrate` | number \| null | 합격률 **퍼센트 정수** `0~100`. 합/불 후기가 없으면 `null` |
| `difficulty` | number \| null | 후기들의 `difficultyScore` 평균 `1.0~5.0` (소수 1자리). 후기가 없으면 `null` |

> ⚠️ `difficulty` 는 **숫자**입니다. [Post](#57-post) 의 `difficulty` 는 **라벨 문자열**(`"보통"`)입니다. 이름은 같지만 다른 값입니다.

#### CompanyDetail — 상세 (CompanyCard + 아래 전부)

| 필드 | 타입 | 설명 |
|---|---|---|
| `industry` | string | 산업 라벨 (`category` 와 같은 값) |
| `tagline` | string \| null | 한 줄 소개 |
| `intro` | string \| null | 기업 소개 본문 |
| `homepage` | string \| null | 홈페이지 URL |
| `address` | string \| null | 본사 주소. **현재 비어 있음** |
| `founded` | string \| null | 설립일 `"1999-06-02"`. **현재 비어 있음** |
| `ceo` | string \| null | 대표자. **현재 비어 있음** |
| `capital` | string \| null | 자본금 문자열. **현재 비어 있음** |
| `hire` | string \| null | 채용 형태 (`"상시 채용"` / `"공채 중심"`) |
| `views` | number | 조회수 |
| `ratings` | object | 세부 평점 `{ salary, wlb, culture, growth }` 각 `0.0~5.0` |
| `salary` | object | 연봉 상세 `{ overall, entry, top25 }` — **단위 만원** (`5800` = 5,800만원) |
| `values` | array | 핵심 가치 `[{ icon, title, description }]` |
| `services` | array | 주요 서비스 `[{ name, description, logo, link }]` — 시드에 이름만 있어 `description` 은 `name` 과 같고 `logo`/`link` 는 `null` |
| `benefits` | array | 복지 `[{ icon, title, description }]` |
| `summary` | array | 한눈에 보기 `[{ icon, description }]` |
| `news` | array | 뉴스 `[{ title, date, url }]`. **현재 `[]`** |

> `icon` 은 **Material Symbols 아이콘 이름**입니다 (`rocket_launch`, `restaurant`).
> 프로젝트에 `material-symbols` 패키지가 이미 있으니 그대로 렌더하면 됩니다.

### 5.5 Template

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | |
| `title` | string | 양식 이름 |
| `docType` | enum | `resume` \| `cover_letter` |
| `category` | string \| null | 분류 코드 |
| `thumbnail` | string \| null | 미리보기 이미지 URL |
| `views` | number | 조회수 |
| `bookmarkedByMe` | boolean | **내가 북마크했는지.** 비로그인이면 `false` |
| `content` | object \| null | **상세에서만.** 에디터 원본 JSON (Tiptap `getJSON()` 형식) |
| `contentHtml` | string \| null | **상세에서만.** 렌더링용 HTML |

### 5.6 Document

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | |
| `docType` | enum | `resume` \| `cover_letter`. **생성 후 변경 불가** |
| `title` | string | 빈 값이면 서버가 `"제목 없음"` 으로 저장 |
| `templateId` | uuid \| null | 시작할 때 고른 양식 |
| `createdAt` / `updatedAt` | datetime | `sort: 'latest'` 는 `updatedAt` 기준 |
| `content` | object \| null | **상세에서만.** 에디터 원본 JSON → 재편집용 |
| `contentHtml` | string \| null | **상세에서만.** 미리보기·인쇄·PDF용 |
| `contentText` | string \| null | **상세에서만.** 태그 없는 순수 텍스트 → AI 입력용 |

> **세 값을 함께 저장해야 하는 이유**: `content` 없이 HTML만 저장하면 재편집 시 서식이 깨지고,
> `contentText` 가 없으면 AI 면접 질문 생성에 HTML 태그가 그대로 들어가 답변 품질이 떨어집니다.
> 목록 응답에는 세 값이 **포함되지 않습니다** (용량 때문). 상세에서만 옵니다.

### 5.7 Post

면접 후기(`review`)와 면접 족보(`qbank`)가 **같은 모델**입니다. 안 쓰는 필드는 `null` 또는 `""`.

| 필드 | 타입 | review | qbank | 설명 |
|---|---|:---:|:---:|---|
| `id` | uuid | ● | ● | |
| `postType` | enum | ● | ● | `review` \| `qbank` |
| `companyId` | uuid \| null | ● | ● | |
| `companyName` | string | ● | ● | 없으면 `""` |
| `companyLogo` | string \| null | ● | ● | |
| `companySlug` | string \| null | ● | ● | 기업 상세로 링크할 때 |
| `title` | string | ● | △ | 없으면 `""` |
| `body` | string | ● | ✕ | 후기 본문 |
| `questions` | string | ✕ | ● | 족보 질문. **한 줄에 하나인 여러 줄 텍스트** (입력 원본 그대로). 없으면 `""` |
| `questionList` | string[] | ✕ | ● | `questions` 를 줄 단위로 자르고 빈 줄을 뺀 배열. **목록 렌더링용** |
| `questionCount` | number \| null | ✕ | ● | `questionList.length` — **서버가 계산**. 요청으로 못 바꿈 |
| `difficulty` | string | ● | ● | 난이도 **라벨** (`"쉬움"`/`"보통"`/`"어려움"`). 값 없으면 `""` |
| `difficultyScore` | number \| null | ● | ● | 면접 난이도 점수. **1 · 2 · 3 · 4 · 5 중 하나** (정수). 미입력이면 `null` |
| `problemScore` | number \| null | ✕ | ● | 문제 난이도 점수. **1 · 2 · 3 · 4 · 5 중 하나** (정수). 미입력이면 `null` |
| `result` | string | ● | ✕ | 합격 여부 **라벨** (`"합격"`/`"대기"`/`"불합격"`) |
| `channel` | string | ● | ● | 면접 경로 **라벨**. `channelCode='etc'` 면 `channelEtc` 값이 대신 들어감 |
| `jobRole` | string | ● | ● | 직무 **라벨** (`"프론트엔드"`) |
| `positionLevel` | string \| null | ● | ● | 자유 텍스트 (`"신입"`) |
| `educationLevel` | string | ● | ● | 학력 **라벨** (`"대졸"`). 값 없으면 `""` |
| `jobInfo` | string | ● | ● | `jobRole / positionLevel / educationLevel` 을 `" / "` 로 이은 표시용 문자열. 빈 값은 건너뜀 |
| `jobRoleCode` | string \| null | ● | ● | 직무 **원본 코드** (`"frontend"`). 수정 폼의 dropdown 을 되채울 때 씁니다. 미기입이면 `null` |
| `educationLevelCode` | string \| null | ● | ● | 학력 원본 코드 |
| `difficultyCode` | string \| null | ● | ● | 난이도 원본 코드 |
| `passResultCode` | string \| null | ● | ✕ | 합격 여부 원본 코드 |
| `channelCode` | string \| null | ● | ● | 면접 경로 원본 코드. `'etc'` 면 `channelEtc` 를 함께 보세요 |
| `channelEtc` | string \| null | ● | ● | `channelCode='etc'` 일 때 자유 입력값 |
| `tags` | string[] | ● | ● | 해시태그 |
| `overallComment` | string | ● | ● | 면접 총평 |
| `authorId` | uuid | ● | ● | |
| `authorName` | string \| null | ● | ● | |
| `authorAvatar` | string \| null | ● | ● | |
| `likeCount` | number | ● | ● | "도움이 되었어요" 수 |
| `likedByMe` | boolean | ● | ● | **내가 눌렀는지.** 비로그인이면 `false` |
| `scrapCount` | number | ● | ● | "퍼가요" 수 |
| `scrappedByMe` | boolean | ● | ● | **내가 퍼갔는지.** 비로그인이면 `false` |
| `commentCount` | number | ● | ● | |
| `viewCount` | number | ● | ● | |
| `date` | date | ● | ● | 표시용 `"2026.08.12"` |
| `createdAt` / `updatedAt` | datetime | ● | ● | |

> **코드로 보내고, 라벨과 코드를 함께 받습니다.** `difficulty` `result` `channel` `jobRole` `educationLevel`
> 다섯 필드는 요청에서 `difficultyCode` 처럼 **코드**로 보냅니다.
> 응답에는 화면에 그대로 찍을 **라벨**(`jobRole: "프론트엔드"`)과
> dropdown 을 되채울 **원본 코드**(`jobRoleCode: "frontend"`)가 **둘 다** 들어 있습니다.
>
> 목록/상세는 라벨을, **수정 폼은 코드**를 쓰세요.

**목업 호환 별칭** — 같은 값이 다른 이름으로도 들어 있습니다. **신규 코드에서는 쓰지 마세요.**

| 별칭 | 원래 필드 |
|---|---|
| `content` | `body` |
| `route` | `channel` |
| `job` | `jobRole` |
| `education` | `educationLevel` |
| `saveCount`, `bookmark` | `scrapCount` |
| `comment` | `commentCount` |

### 5.8 Comment

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | |
| `postId` | uuid | |
| `body` | string | **1~2000자** |
| `authorId` | uuid | |
| `authorName` | string \| null | |
| `authorAvatar` | string \| null | |
| `likeCount` | number | 좋아요 수 |
| `likedByMe` | boolean | **내가 눌렀는지.** 비로그인이면 `false` |
| `date` | date | 표시용 `"2026.08.12"` |
| `createdAt` / `updatedAt` | datetime | |

### 5.9 Portfolio

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | |
| `title` | string | 빈 값이면 `"제목 없음"` |
| `thumbnailUrl` | string | 없으면 `""` (`null` 아님) |
| `category` | enum \| null | `web` \| `app` |
| `description` | string \| null | |
| `status` | enum | `draft`(임시저장) \| `published`(공개) |
| `authorId` | uuid | |
| `authorName` | string \| null | |
| `authorAvatar` | string \| null | |
| `authorRole` | string \| null | 작성자의 희망 직무 |
| `likeCount` | number | 좋아요 수 |
| `likedByMe` | boolean | **내가 눌렀는지.** 비로그인이면 `false` |
| `bookmarkCount` | number | 스크랩 수 |
| `bookmarkedByMe` | boolean | **내가 스크랩했는지.** 비로그인이면 `false` |
| `collaborators` | Collaborator[] | 공동작업자. 없으면 `[]`. 목록·상세 모두 포함 |
| `viewCount` | number | |
| `createdAt` / `updatedAt` | datetime | |
| `overview` / `document` / `code` | Block[] | **상세에서만.** 탭별 블록 배열. 비어 있으면 `[]` |
| `bgColor` | string | **상세에서만.** 배경색 hex. 기본 `"#F4FCFE"` |
| `gapPx` | number | **상세에서만.** 블록 간격 px. 기본 `16` |

> `content` 는 없어졌습니다. 목록 응답에는 세 탭이 **포함되지 않습니다**(용량 때문). 상세에서만 옵니다.

**Block** — 탭 배열의 원소. `type` 은 4종만 허용되고 그 외는 **400**.

| type | 필드 | 비고 |
|---|---|---|
| `image` | `{ type:'image', url }` | **배열 전체에서 최대 15개** (초과 시 400) |
| `video` | `{ type:'video', youtubeUrl }` | 파일 업로드 없음. YouTube 링크만 |
| `text` | `{ type:'text', html }` | |
| `code` | `{ type:'code', lang, body }` | |

> `type` 외의 내부 키는 서버가 검증하지 않습니다. 위 모양은 **프론트와의 약속**입니다.

**Collaborator** — `collaborators` 배열의 원소

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 공동작업자의 유저 id |
| `name` | string | null | 이름 |
| `avatarUrl` | string | null | 프로필 사진 |

> 이메일은 포함되지 않습니다.

### 5.10 InterviewSession

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | |
| `companyId` | uuid \| null | 지원 기업 |
| `resumeIds` | uuid[] | 선택한 이력서 문서 id들 |
| `coverLetterIds` | uuid[] | 선택한 자소서 문서 id들 |
| `interviewerStyle` | enum | `friendly` \| `neutral` \| `pressure` \| `technical`. 기본 `neutral` |
| `selectedCategories` | string[] | `code_master(interview_category)` 코드 — `intro` `tech1` `tech2` `personality` `closing` |
| `showTimer` | boolean | 타이머 표시 여부. 기본 `true` |
| `durationSec` | number | 누적 진행 시간(초). 기본 `0` |
| `status` | enum | `ongoing` \| `finished`. 기본 `ongoing` |
| `totalScore` | number \| null | 종합 점수 |
| `subScores` | object | 항목별 점수 `{ "답변내용": 4, "전달력": 3, … }`. 기본 `{}` |
| `date` | date | 표시용 |
| `createdAt` | datetime | |
| `finishedAt` | datetime \| null | `status: 'finished'` 로 바꾸면 **서버가 자동 기록** |
| `qas` | InterviewQa[] | **상세·생성 응답에만** 존재. 목록·수정 응답에는 **키 자체가 없음** |

### 5.11 InterviewQa

| 필드 | 타입 | 설명 |
|---|---|---|
| `id` | uuid | 스크랩 토글의 `targetId` |
| `sessionId` | uuid | |
| `seq` | number | 질문 순서. 안 보내면 배열 index+1 |
| `category` | string \| null | `code_master(interview_category)` 코드 |
| `question` | string | **필수** |
| `answer` | string | 내 답변. 없으면 `""` |
| `feedback` | object | AI 피드백 원본. 권장 모양 `{ summary, strengths[], improvements[] }`. 기본 `{}` |
| `feedbackText` | string | 서버가 `feedback` 을 **한 줄 문자열로 요약**한 것. 아코디언 요약줄에 그대로 쓰세요 |
| `score` | number \| null | 이 답변의 점수 |
| `scrappedByMe` | boolean | **내가 스크랩했는지.** 스크랩 아이콘 초기 상태에 쓰세요 |
| `date` | date | 표시용 |
| `createdAt` | datetime | |

> `feedbackText` 계산 규칙: `feedback` 이 문자열이면 그대로 → `summary` 가 있으면 그 값 → 없으면 `strengths + improvements` 를 공백으로 이어 붙임.

---

## 6. 엔드포인트 상세

### 6.0 한눈에 보기

| # | Method | Path | 인증 | 대응 함수 |
|---|---|---|:---:|---|
| 1 | GET | `/api/health` | — | (진단 페이지 전용) |
| 2 | GET | `/api/me` | — | `getCurrentUser()` |
| 2-1 | GET | `/api/members/lookup` | ✔ | `findMemberByEmail()` |
| 3 | DELETE | `/api/me` | ✔ | `deleteMyAccount()` |
| 4 | GET | `/api/me/account` | ✔ | `getMyAccount()` |
| 5 | GET | `/api/me/summary` | ✔ | `getMySummary()` |
| 6 | GET | `/api/codes` | — | `getCodes()` / `getCodeGroups()` |
| 7 | GET | `/api/profiles/{userId}` | — | `getProfile()` / `getMyProfile()` |
| 8 | PATCH | `/api/profiles/me` | ✔ | `updateProfile()` |
| 9 | GET | `/api/profiles/{userId}/stats` | — | `getProfileStats()` |
| 10 | POST | `/api/reactions` | ✔ | `toggleReaction()` |
| 11 | GET | `/api/reactions` | — | `getMyReactionIds()` / `listMyReactionTargetIds()` |
| 12 | DELETE | `/api/reactions` | ✔ | `removeReactions()` |
| 13 | GET | `/api/companies` | — | `listCompanies()` |
| 14 | GET | `/api/companies/{slug}` | — | `getCompany()` |
| 15 | GET | `/api/companies/recommended` | — | `getRecommendedCompanies()` |
| 16 | POST | `/api/views` | — | `incrementCompanyView()` 등 |
| 17 | GET | `/api/templates` | — | `listTemplates()` |
| 18 | GET | `/api/templates/{id}` | — | `getTemplate()` |
| 19 | GET · POST · DELETE | `/api/documents` | ✔ | `listMyDocuments()` / `createDocument()` / `deleteDocuments()` |
| 19-1 | GET | `/api/documents/{id}/images/{name}` | ✔ | 본문 이미지 서빙 (본인 것만) |
| 19-2 | DELETE | `/api/documents/{id}/images` | ✔ | `removeDocumentImages()` — draft 정리 |
| 20 | GET · PATCH · DELETE | `/api/documents/{id}` | ✔ | `getDocument()` / `updateDocument()` / `deleteDocument()` |
| 21 | GET · POST · DELETE | `/api/portfolios` | 일부 | `listPortfolios()` / `createPortfolio()` / `deletePortfolios()` |
| 22 | GET · PATCH · DELETE | `/api/portfolios/{id}` | 일부 | `getPortfolio()` / `updatePortfolio()` / `deletePortfolio()` |
| 23 | GET · POST · DELETE | `/api/posts` | 일부 | `listPosts()` / `createPost()` / `deletePosts()` |
| 24 | GET · PATCH · DELETE | `/api/posts/{id}` | 일부 | `getPost()` / `updatePost()` / `deletePost()` |
| 25 | GET · POST | `/api/posts/{id}/comments` | 일부 | `listComments()` / `createComment()` |
| 26 | PATCH · DELETE | `/api/comments/{id}` | ✔ | `updateComment()` / `deleteComment()` |
| 27 | GET · POST | `/api/interviews` | ✔ | `listMySessions()` / `createSession()` |
| 28 | GET · PATCH · DELETE | `/api/interviews/{id}` | ✔ | `getSession()` / `finishSession()` / `deleteSession()` |
| 29 | POST | `/api/interviews/{id}/qas` | ✔ | `saveQas()` |
| 30 | GET · DELETE | `/api/interview-qas` | ✔ | `listMyScraps()` / `deleteQas()` |

---

### 6.1 시스템 · 계정

#### `GET /api/health` — 연결 상태 점검

인증 불필요. `/backend-test` 페이지 전용입니다. 화면 코드에서 부를 일은 없습니다.

**응답 200**

| 필드 | 타입 | 설명 |
|---|---|---|
| `user` | `{id,email}` \| null | 현재 로그인 사용자 |
| `checks` | `[{label, ok, detail}]` | 항목별 점검 결과. `ok:false` 면 `detail` 에 원인 |

---

#### `GET /api/me` — 현재 사용자

인증 불필요. **미로그인이어도 200** 이고 `user` 가 `null` 입니다.

**응답 200**

```json
{ "user": { "id": "8f3c…", "email": "dodam@example.com" } }
```

| 필드 | 타입 | 설명 |
|---|---|---|
| `user.id` | uuid | |
| `user.email` | string \| null | 로그인 계정 이메일 (JWT claim) |
| `user` | null | 미로그인 |

---

#### `DELETE /api/me` — 회원 탈퇴

**인증 필요.** 요청 본문 없음.

계정·프로필·문서·포트폴리오·글·댓글·스크랩·**Storage 업로드 파일까지 즉시 완전 삭제**됩니다. 되돌릴 수 없습니다.
`회원탈퇴 하겠습니다` 문구 검증은 **프론트 책임**입니다.

**응답 200** — `{ "deleted": true }`
**에러** — `401`

---

#### `GET /api/me/account` — 계정 설정

**인증 필요.** 응답: [Account](#53-account)

```json
{
  "id": "8f3c…",
  "email": "dodam@example.com",
  "createdAt": "2026-08-01T02:10:00.000Z",
  "lastSignInAt": "2026-08-12T01:00:00.000Z",
  "providers": ["github"]
}
```

---

#### `GET /api/me/summary` — 마이페이지 진입 1회 호출

**인증 필요.** 프로필과 카운터 11종을 **한 번에** 가져옵니다. 탭마다 따로 부르지 마세요.

**응답 200**

| 필드 | 타입 | 설명 |
|---|---|---|
| `profile` | [Profile](#51-profile) \| null | 프로필 행이 아직 없으면 `null` |
| `stats` | [ProfileStats](#52-profilestats) | 행이 없어도 전부 `0` 으로 채워짐 |

---

### 6.2 코드 (드롭다운 옵션)

#### `GET /api/codes` — 코드 목록

인증 불필요.

**Query**

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|:---:|---|
| `groups` | string | **필수** | 그룹 이름 **쉼표 구분** (`job_role,industry`). 빠지면 400 |

**응답 200** — 요청한 그룹 이름이 그대로 키가 됩니다. `is_active` 인 것만, `sort_order` 오름차순.

```json
{
  "job_role": [
    { "code": "frontend", "label": "프론트엔드" },
    { "code": "backend",  "label": "백엔드" }
  ],
  "difficulty": [
    { "code": "easy", "label": "쉬움" }
  ]
}
```

> 존재하지 않는 그룹을 요청하면 **에러가 아니라 빈 배열** `[]` 이 옵니다. 오타를 못 잡아주니 그룹 이름은 [7장](#7-코드-값-사전-code_master)에서 복사해 쓰세요.

**에러** — `400 BAD_REQUEST` (`groups` 누락)

---

### 6.3 프로필

#### `GET /api/profiles/{userId}` — 프로필 조회

인증 불필요 (타인 프로필 공개).

**Path**

| 값 | 설명 |
|---|---|
| `{userId}` | 조회할 유저 uuid |
| `me` | **내 프로필.** 미로그인 시 401 |

**응답 200** — [Profile](#51-profile) (**snake_case**)

> ⚠️ **`email` 은 본인 조회일 때만 값이 옵니다.** 타인·비로그인 조회에서는 키는 있지만 항상 `null` 입니다.
> "값이 없음"과 "가려짐"을 구분할 수 없습니다 — 의도된 동작입니다.

**에러** — `401`(`me` + 미로그인) · `404 NOT_FOUND`(없는 유저)

> `getMyProfile()` 은 401/404 를 잡아 `null` 로 바꿔 줍니다. 직접 호출할 때만 신경 쓰면 됩니다.

---

#### `PATCH /api/profiles/me` — 내 프로필 수정

**인증 필요.** 본인 것만. 다른 uuid를 경로에 넣으면 **403**.

**Body** — **보낸 키만 바뀝니다** (부분 수정). 전부 선택이지만 **최소 1개는 있어야** 합니다.

| 필드 | 타입 | 검증 |
|---|---|---|
| `name` | string \| null | |
| `avatar_url` | string \| null | `null` 로 보내면 사진 제거 |
| `desired_role` | string \| null | |
| `career_level` | string \| null | `code_master(career_level)` 코드 |
| `education_level` | string \| null | 최종 학력. `code_master(education_level)` 코드 |
| `email` | string \| null | 이력서용 연락처. 본인만 볼 수 있음. 직접 넣은 값은 자동 채우기가 덮어쓰지 않음 |
| `github_url` | string \| null | |
| `bio` | string \| null | **1000자 초과 시 400** |
| `educations` | array | **배열 아니면 400.** 목록 통째 교체. 코드값이 틀리면 400 `INVALID_REFERENCE` |
| `careers` | array | **배열 아니면 400.** 목록 통째 교체 |
| `awards` | array | **배열 아니면 400.** 목록 통째 교체 |
| `languages` | array | **배열 아니면 400.** 목록 통째 교체. `level` 코드가 틀리면 400 `INVALID_REFERENCE` |
| `skill_codes` | string[] | **배열 아니면 400** |
| `interest_codes` | string[] | **배열 아니면 400** |

> 위 목록에 없는 키는 **조용히 무시**됩니다 (`id`, `created_at` 등을 보내도 안전).
> 배열 필드는 **통째로 교체**입니다. 항목 1개만 추가하려면 기존 배열에 push 해서 전체를 보내세요.

**응답 200** — 수정된 [Profile](#51-profile) 전체

**요청 예시**

```json
{
  "name": "장도담",
  "career_level": "5_plus",
  "bio": "Flutter 5년차입니다.",
  "skill_codes": ["flutter", "dart", "supabase"],
  "educations": [
    { "school": "OO대학교", "major": "컴퓨터공학", "status": "graduated",
      "admission": "2015-03", "graduation": "2019-02" }
  ]
}
```

**에러** — `400`(수정할 내용 없음 / bio 초과 / 배열 아님) · `401` · `403`(남의 프로필)

---

#### `GET /api/profiles/{userId}/stats` — 프로필 카운터

인증 불필요. `{userId}` 에 `me` 사용 가능.

**응답 200** — [ProfileStats](#52-profilestats). 행이 없어도 전부 `0`.

---

### 6.4 반응 (좋아요 · 북마크 · 스크랩)

세 화면 개념이 하나의 API로 통합돼 있습니다. `targetType` + `kind` 조합표는 [3장 REACTION 표](#좋아요--북마크--스크랩--backendlibapireactions).

공통 허용값

| 파라미터 | 허용값 |
|---|---|
| `targetType` | `portfolio` \| `post` \| `company` \| `comment` \| `interview_qa` \| `template` |
| `kind` | `like` \| `bookmark` (기본 `bookmark`) |

허용값 밖이면 전부 **400**.

#### `POST /api/reactions` — 토글

**인증 필요.**

**Body**

| 필드 | 타입 | 필수 | 설명 |
|---|---|:---:|---|
| `targetType` | enum | ✔ | 위 표 |
| `targetId` | uuid | ✔ | 대상 id |
| `kind` | enum | ✕ | 기본 `bookmark` |

**응답 200**

```json
{ "active": true }
```

| 값 | 의미 |
|---|---|
| `true` | 방금 **켜짐** (좋아요/스크랩 등록됨) |
| `false` | 방금 **꺼짐** (해제됨) |

> 낙관적 UI를 쓴다면 이 값으로 최종 상태를 맞춰 주세요. 연타해도 DB는 항상 일관됩니다.

**에러** — `400`(타입 오류 / `targetId` 누락) · `401`

---

#### `GET /api/reactions` — 내가 누른 대상 조회

인증 선택. **미로그인이면 200 + 빈 배열**을 돌려줍니다 (에러 아님).

**Query**

| 파라미터 | 타입 | 필수 | 설명 |
|---|---|:---:|---|
| `targetType` | enum | ✔ | |
| `kind` | enum | ✕ | 기본 `bookmark` |
| `targetIds` | string | ✕ | **쉼표 구분** id 목록. 주면 그 안에서만 필터, 안 주면 **내 전체** |

**응답 200** — 최신 등록순

```json
{ "targetIds": ["3f9c…", "a71b…"] }
```

**두 가지 사용법**

| 목적 | 호출 |
|---|---|
| 목록 화면에서 "내가 누른 카드" 표시 | `targetIds` 에 **화면의 id들을 전부** 넘김 → 카드마다 호출 금지 |
| 마이페이지 "스크랩한 X" 목록 | `targetIds` 생략 → 내 전체 id를 받아 페이징 |

**에러** — `400`(타입 오류)

---

#### `DELETE /api/reactions` — 복수 해제

**인증 필요.** 마이페이지 "선택 삭제"용.

**Body**

| 필드 | 타입 | 필수 | 설명 |
|---|---|:---:|---|
| `targetType` | enum | ✔ | |
| `kind` | enum | ✕ | 기본 `bookmark` |
| `targetIds` | uuid[] | ✔ | **비어 있으면 400** |

**응답 200** — `{ "deleted": 3 }` (실제로 지워진 건수. 이미 해제된 것은 세지 않음)

---

### 6.5 기업

#### `GET /api/companies` — 기업 목록 · 검색 · 필터

인증 불필요.

**Query**

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `q` | string | — | **회사명** 부분 일치 (대소문자 무시) |
| `industry` | string | — | `code_master(industry)` 코드 |
| `size` | string | — | `code_master(company_size)` 코드 |
| `jobRole` | string | — | `code_master(job_role)` 코드. 해당 직군을 채용하는 기업만 |
| `ids` | string | — | **쉼표 구분** id 목록 |
| `scrapped` | `1` | — | **내가 스크랩한 기업만.** 미로그인이면 401. sort 해석이 달라집니다 |
| `sort` | enum | `popular` | 아래 표 |
| `page` | number | `1` | |
| `pageSize` | number | `20` | 최대 50 |

**`sort` 허용값**

| 값 | 정렬 기준 |
|---|---|
| `popular` | 관심 등록 수 많은 순 (기본) |
| `rating` | 평점 높은 순 |
| `views` | 조회수 많은 순 |
| `name` | 이름 가나다순 |
| `latest` | 등록 최신순 |

**`scrapped=1` 일 때는 `latest`(기본) · `oldest` · `name` 만** 허용합니다. 그 외는 400 입니다.
`latest`/`oldest` 는 **내가 스크랩한 시각** 기준입니다 — [4.4-1](#441-️-스크랩-목록에서-latest-의-뜻) 참고.

> 값이 같으면 **이름 오름차순**으로 2차 정렬합니다. 페이지를 넘겨도 순서가 흔들리지 않습니다.

**응답 200** — `items`: [CompanyCard](#companycard--목록추천에서-내려오는-카드)[]

```json
{
  "items": [{
    "id": "3f9c…", "slug": "naver", "name": "네이버", "logo": null,
    "category": "플랫폼·포털", "size": "대기업", "location": "경기 성남",
    "tags": ["검색", "AI", "클라우드", "커머스"],
    "rating": 4.3, "employees": 4500, "avgSalary": "5,800만원",
    "favorite": 12, "review": 5, "jokbo": 3, "passrate": 60, "difficulty": 3.4
  }],
  "total": 20, "page": 1, "pageSize": 20
}
```

**에러** — `400`(`sort` 허용값 밖)

---

#### `GET /api/companies/{slug}` — 기업 상세

인증 불필요. **`id` 가 아니라 `slug`** 입니다 (`/companies/naver`).

**응답 200** — [CompanyDetail](#companydetail--상세-companycard--아래-전부)
**에러** — `404 NOT_FOUND`

---

#### `GET /api/companies/recommended` — 추천 기업

인증 불필요. 관심 등록 수 → 조회수 → 이름 순으로 정렬합니다.

**Query**

| 파라미터 | 타입 | 기본값 | 범위 |
|---|---|---|---|
| `limit` | number | `6` | 1~20 (벗어나면 보정) |

**응답 200** — ⚠️ **`{ items }` 만 있습니다.** `total`·`page` 없음.

```json
{ "items": [ /* CompanyCard[] */ ] }
```

> `getRecommendedCompanies()` 는 `items` 배열을 **바로** 돌려줍니다 (객체 아님).

---

### 6.6 조회수

#### `POST /api/views` — 조회수 +1

인증 불필요 (비로그인 조회도 집계).

**Body**

| 필드 | 타입 | 필수 | 허용값 |
|---|---|:---:|---|
| `targetType` | enum | ✔ | `company` \| `portfolio` \| `post` \| `template` |
| `targetId` | uuid | ✔ | |

**응답 200** — `{ "ok": true }`

> **중복 방지가 없습니다.** 새로고침할 때마다 올라갑니다. 상세 진입 시 `useEffect` 에서 **한 번만** 부르세요.
> 존재하지 않는 id를 보내도 조용히 성공합니다(해당 행이 없어 아무것도 안 바뀜).

**에러** — `400`(타입 오류 / id 누락)

---

### 6.7 무료 양식

#### `GET /api/templates` — 양식 목록

인증 불필요. `is_active` 인 양식만 내려갑니다.

**Query**

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `docType` | enum | — | `resume` \| `cover_letter`. 생략 = 전체. **다른 값이면 400** |
| `q` | string | — | 제목 부분 일치 |
| `sort` | enum | `popular` | `popular`(조회수) \| `latest` \| `title` \| `order`(지정 순서) |
| `page` | number | `1` | |
| `pageSize` | number | `16` | 최대 50 |

**응답 200**

```json
{
  "items": [{ "id": "…", "title": "신입 개발자 이력서", "docType": "resume",
              "category": null, "thumbnail": "https://…", "views": 42 }],
  "total": 8, "page": 1, "pageSize": 16,
  "counts": { "all": 12, "resume": 7, "cover_letter": 5 }
}
```

| 필드 | 설명 |
|---|---|
| `total` | **필터 적용 후** 건수 (탭 뱃지에 쓰면 안 됨) |
| `counts` | **필터와 무관한 전체 개수.** 탭 뱃지는 이걸 쓰세요 |

---

#### `GET /api/templates/{id}` — 양식 상세

인증 불필요. 목록 필드 + `content`, `contentHtml`.

**응답 200** — [Template](#55-template)
**에러** — `404`(없거나 비활성)

---

### 6.8 문서함 (이력서 · 자소서)

**모든 메서드 인증 필요.** 남의 문서는 조회·수정·삭제 전부 **404** 입니다.

#### `GET /api/documents` — 내 문서 목록

**Query**

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `docType` | enum | — | `resume` \| `cover_letter`. **다른 값이면 400** |
| `q` | string | — | **제목만** 검색 |
| `sort` | enum | `latest` | `latest`(수정 최신순) \| `created`(생성순) \| `title`(가나다) |
| `page` | number | `1` | |
| `pageSize` | number | `10` | 최대 50 |

**응답 200** — `items`: [Document](#56-document)[] (**본문 3종 제외**) + `counts`

```json
{
  "items": [{ "id": "…", "docType": "resume", "title": "네이버 지원 이력서",
              "templateId": "…", "createdAt": "…", "updatedAt": "…" }],
  "total": 3, "page": 1, "pageSize": 10,
  "counts": { "all": 5, "resume": 3, "cover_letter": 2 }
}
```

> `counts` 로 **10개 제한에 얼마나 남았는지** 계산하세요. `counts.resume >= 10` 이면 "새 이력서" 버튼을 비활성화하는 편이 409를 만나는 것보다 낫습니다.

---

#### `POST /api/documents` — 문서 생성

**Body**

| 필드 | 타입 | 필수 | 기본값 | 설명 |
|---|---|:---:|---|---|
| `docType` | enum | ✔ | — | `resume` \| `cover_letter`. **없거나 다르면 400** |
| `title` | string | ✕ | `"제목 없음"` | 공백만 보내도 기본값으로 대체 |
| `templateId` | uuid | ✕ | `null` | 없는 id면 **400 INVALID_REFERENCE** |
| `content` | object | ✕ | `null` | 에디터 JSON |
| `contentHtml` | string | ✕ | `null` | |
| `contentText` | string | ✕ | `null` | |

**응답 200** — 생성된 [Document](#56-document) (본문 3종 포함)

**에러**

| status | code | 상황 |
|---|---|---|
| 400 | `BAD_REQUEST` | `docType` 누락/오류 |
| 401 | `NOT_AUTHENTICATED` | |
| **409** | **`DOCUMENT_LIMIT_EXCEEDED`** | **같은 `docType` 문서가 이미 10개** |

```js
try {
  await createDocument({ docType: 'resume' });
} catch (e) {
  if (e.code === 'DOCUMENT_LIMIT_EXCEEDED') openLimitModal();
}
```

---

#### `DELETE /api/documents` — 복수 삭제

**Body** — `{ "ids": ["uuid", …] }` (**빈 배열이면 400**)
**응답 200** — `{ "deleted": 2 }` (내 것만 세어짐)

---

#### `GET /api/documents/{id}` — 문서 상세

**응답 200** — [Document](#56-document) + `content` / `contentHtml` / `contentText`
**에러** — `401` · `404`(없거나 내 것이 아님)

---

#### `PATCH /api/documents/{id}` — 저장

**Body** — 보낸 키만 수정. **최소 1개 필요** (없으면 400).

| 필드 | 타입 | 설명 |
|---|---|---|
| `title` | string | 공백이면 `"제목 없음"` |
| `templateId` | uuid \| null | |
| `content` | object \| null | |
| `contentHtml` | string \| null | |
| `contentText` | string \| null | |

> `docType` 은 **바꿀 수 없습니다** (보내도 무시).

**응답 200** — 수정된 [Document](#56-document)
**에러** — `400`(수정할 내용 없음) · `401` · `404`

---

#### `DELETE /api/documents/{id}` — 단건 삭제

**응답 200** — `{ "deleted": 1 }`
**에러** — `401` · `404`

---

### 6.9 포트폴리오

#### `GET /api/portfolios` — 갤러리 / 내 목록

인증은 **`mine=1` 일 때만** 필요합니다.

**Query**

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `mine` | `1` | — | **내 것만.** 초안 포함. 미로그인이면 401 |
| `status` | enum | — | `draft` \| `published`. **`mine=1` 일 때만 적용** |
| `userId` | uuid | — | 특정 작성자의 **공개** 포트폴리오 (타인 프로필 페이지용) |
| `category` | enum | — | `web` \| `app`. **다른 값이면 400** |
| `ids` | string | — | 쉼표 구분 id 목록 (스크랩 목록용) |
| `q` | string | — | **제목만** 검색 |
| `scrapped` | `1` | — | **내가 스크랩한 것만.** 미로그인이면 401. sort 해석이 달라집니다(아래) |
| `sort` | enum | `latest` | `latest` \| `oldest` \| `title` \| `popular`(좋아요) \| `views`(조회) \| `bookmarks`(스크랩) |
| `page` | number | `1` | |
| `pageSize` | number | `20` | 최대 50 |

> `mine` 없이 부르면 **항상 `published` 만** 내려갑니다. 남의 초안은 어떤 조합으로도 볼 수 없습니다.

**응답 200** — `items`: [Portfolio](#59-portfolio)[] (**`overview` / `document` / `code` / `bgColor` / `gapPx` 제외**)

---

#### `POST /api/portfolios` — 생성

**인증 필요.**

**Body** — 전부 선택입니다. 빈 객체 `{}` 로도 초안이 만들어집니다.

| 필드 | 타입 | 기본값 | 검증 |
|---|---|---|---|
| `title` | string | `"제목 없음"` | |
| `category` | enum \| null | `null` | `web` \| `app`, 그 외 **400** |
| `thumbnailUrl` | string \| null | `null` | |
| `description` | string \| null | `null` | |
| `overview` / `document` / `code` | Block[] | `[]` | 배열 아니면 400 / `type` 오류 400 / **세 탭 합쳐 image 15개 초과 400** |
| `content` | — | — | **보내면 400.** `overview` / `document` / `code` 로 나뉘었습니다 |
| `bgColor` | string | `"#F4FCFE"` | |
| `gapPx` | number | `16` | |
| `status` | enum | `"draft"` | `draft` \| `published`, 그 외 **400** |

**응답 200** — 생성된 [Portfolio](#59-portfolio)

> ⚠️ **생성 응답의 `authorName` 은 `null`, `likeCount`/`bookmarkCount` 는 `0`** 입니다.
> 작성자 정보가 필요하면 `getPortfolio(id)` 로 다시 읽으세요. (실무상 방금 만든 초안에는 필요 없습니다.)

**업로드 순서** — 이미지 경로에 포트폴리오 id가 들어가므로 **반드시 이 순서**입니다.

```
createPortfolio()  →  id 확보
      ↓
uploadPortfolioImages(id, files)  →  URL 배열
      ↓
updatePortfolio(id, { overview: [...], document: [...], code: [...] })
      ↓
publishPortfolio(id)
```

---

#### `DELETE /api/portfolios` — 복수 삭제

**인증 필요.** Body `{ "ids": [...] }` → `{ "deleted": n }`

---

#### `GET /api/portfolios/{id}` — 상세

인증 선택.

| 상태 | 결과 |
|---|---|
| `published` | 누구나 200 |
| `draft` + 본인 | 200 |
| `draft` + 타인/비로그인 | **404** (403 아님) |

**응답 200** — [Portfolio](#59-portfolio) + `overview` / `document` / `code` / `bgColor` / `gapPx`

---

#### `PATCH /api/portfolios/{id}` — 수정

**인증 필요.** 보낸 키만 수정, **최소 1개 필요**.

| 필드 | 비고 |
|---|---|
| `title` `description` `thumbnailUrl` `bgColor` `gapPx` | 그대로 저장 |
| `overview` `document` `code` | 블록 검증 후 **보낸 탭만 통째로 교체.** 안 보낸 탭은 그대로 둡니다 |
| `content` | **보내면 400** — 세 탭으로 나뉘었습니다 |
| `category` | `web`/`app`/`null` 외 400 |
| `status` | `draft`/`published` 외 400. `publishPortfolio()` 가 이걸 씁니다 |

> 탭을 하나라도 보내면 서버가 **저장돼 있는 나머지 탭을 읽어서 이미지를 합산**합니다.
> `overview` 에 10장이 있으면 `code` 로는 5장까지만 올라갑니다.

**응답 200** — 수정된 [Portfolio](#59-portfolio)
**에러** — `400` · `401` · `404`(없거나 내 것 아님)

---

#### `DELETE /api/portfolios/{id}` — 단건 삭제

**인증 필요.** 응답 `{ "deleted": 1 }`
**에러** — `403 FORBIDDEN`(내 것이 아님) — ⚠️ 여기만 404가 아니라 **403** 입니다.

---

### 6.10 면접 후기 · 족보

#### `GET /api/posts` — 목록

인증은 **`mine=1` 일 때만** 필요.

**Query**

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `type` | enum | — | `review` \| `qbank`. 생략 = 전체. **다른 값 400** |
| `mine` | `1` | — | 내가 쓴 글만. 미로그인 401 |
| `companyId` | uuid | — | 기업 id로 필터 |
| `companySlug` | string | — | 기업 slug로 필터 (기업 상세 탭에서 편함) |
| `jobRole` | string | — | 직무로 필터. `code_master(job_role)` 코드 |
| `difficulty` | string | — | 면접 난이도로 필터. `code_master(difficulty)` 코드 (`easy`/`normal`/`hard`) |
| `passResult` | string | — | 합격 여부로 필터. `code_master(pass_result)` 코드 (`pass`/`waiting`/`fail`) |
| `q` | string | — | **제목만** 검색 |
| `ids` | string | — | 쉼표 구분 id 목록 (스크랩 목록용) |
| `sort` | enum | `latest` | `latest` \| `oldest` \| `company`(기업명) \| `popular`(도움돼요) \| `scraps`(퍼가요) \| `comments` \| `views` |
| `page` | number | `1` | |
| `pageSize` | number | `10` | 최대 50 |

**응답 200** — `items`: [Post](#57-post)[]

> `jobRole` · `difficulty` · `passResult` 는 **DB 에서 걸러내므로 `total` 도 걸러낸 뒤의 개수**입니다.
> 목록을 받아 화면에서 `filter()` 하면 2페이지부터 개수가 어긋나니 쿼리로 보내주세요.
> 없는 코드를 보내면 400 이 아니라 **빈 목록**이 옵니다 (`code_master` 대조를 하지 않습니다).

---

#### `POST /api/posts` — 작성

**인증 필요.**

**Body**

| 필드 | 타입 | 필수 | 대상 | 설명 |
|---|---|:---:|---|---|
| `postType` | enum | ✔ | 공통 | `review` \| `qbank`. **없거나 다르면 400** |
| `companyId` | uuid | ✕ | 공통 | 없는 id면 400 `INVALID_REFERENCE` |
| `title` | string | ✕ | 후기 | 족보는 생략 |
| `body` | string | ✕ | 후기 | 본문 |
| `questions` | string | ✕ | 족보 | **여러 줄 텍스트.** 한 줄에 질문 하나. 문자열이 아니면 400. 보내면 `questionCount` 도 함께 갱신됨 |
| `difficultyCode` | string | ✕ | 공통 | `code_master(difficulty)` — `easy`/`normal`/`hard` |
| `difficultyScore` | number \| null | ✕ | 공통 | **1~5 정수만.** 소수·범위 밖이면 400. `null` 은 "점수 없음" |
| `problemScore` | number \| null | ✕ | 족보 | **1~5 정수만.** 소수·범위 밖이면 400. `null` 은 "점수 없음" |
| `passResultCode` | string | ✕ | 후기 | `pass` \| `waiting` \| `fail` |
| `channelCode` | string | ✕ | 공통 | `code_master(interview_channel)` 코드 |
| `channelEtc` | string | ✕ | 공통 | **`channelCode: 'etc'` 일 때만** 자유 입력값 |
| `jobRoleCode` | string \| null | ✕ | 공통 | 직무. `code_master(job_role)` 코드. **없는 코드면 400** (사용 가능한 코드 목록이 메시지에 들어옵니다). `null` 이면 미기입 |
| `positionLevel` | string | ✕ | 공통 | 자유 텍스트 (`"신입"`) |
| `educationLevel` | string | ✕ | 공통 | `code_master(education_level)` 코드 |
| `tags` | string[] | ✕ | 공통 | **배열 아니면 400** |
| `overallComment` | string | ✕ | 공통 | 총평 |

> 위에 없는 키는 **조용히 무시**됩니다. `userId` 를 보낼 필요도, 보내도 소용도 없습니다(항상 토큰 주인으로 저장).
> `questionCount` 도 마찬가지입니다 — 서버가 빈 줄을 뺀 줄 수로 계산합니다.

**응답 200** — 생성된 [Post](#57-post) (라벨·카운트가 모두 채워진 완성형)

**에러** — `400` · `401`

---

#### `DELETE /api/posts` — 복수 삭제

**인증 필요.** Body `{ "ids": [...] }` → `{ "deleted": n }`

---

#### `GET /api/posts/{id}` — 상세

인증 불필요. **응답 200** — [Post](#57-post) · **에러** `404`

---

#### `PATCH /api/posts/{id}` — 수정

**인증 필요.** `POST` 와 같은 필드를 보낸 것만 수정. **최소 1개 필요.**
`postType` 은 변경 불가(보내도 무시). `questions` 를 보내면 `questionCount` 가 다시 계산됩니다.

**응답 200** — 수정된 [Post](#57-post) · **에러** `400` · `401` · `404`

---

#### `DELETE /api/posts/{id}` — 단건 삭제

**인증 필요.** `{ "deleted": 1 }` · **에러** `404`
> 글을 지우면 **댓글과 반응도 함께** 사라집니다 (DB CASCADE).

---

### 6.11 댓글

#### `GET /api/posts/{id}/comments` — 댓글 목록

인증 불필요.

**Query**

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `sort` | enum | `latest` | `latest`(기본) \| `popular`(추천순) |
| `page` | number | `1` | |
| `pageSize` | number | `20` | **최대 100** (여기만 100) |

**응답 200** — `items`: [Comment](#58-comment)[]

> 없는 `postId` 를 넣어도 **404가 아니라 빈 목록**입니다.

---

#### `POST /api/posts/{id}/comments` — 댓글 작성

**인증 필요.**

**Body**

| 필드 | 타입 | 필수 | 검증 |
|---|---|:---:|---|
| `body` | string | ✔ | 앞뒤 공백 제거 후 **1~2000자**. 빈 값 400 / 초과 400 |

**응답 200** — 생성된 [Comment](#58-comment)
**에러** — `400`(빈 내용 `"댓글 내용을 입력해 주세요."` / 2000자 초과) · `401` · `400 INVALID_REFERENCE`(없는 글)

---

#### `PATCH /api/comments/{id}` — 댓글 수정

**인증 필요.** Body `{ "body": "..." }` (1~2000자)
**응답 200** — [Comment](#58-comment) · **에러** `400` · `401` · `404`(없거나 내 것 아님)

---

#### `DELETE /api/comments/{id}` — 댓글 삭제

**인증 필요.** `{ "deleted": 1 }` · **에러** `401` · `404`

---

### 6.12 AI 면접

⚠️ **질문 생성·피드백은 Alan AI(프론트 직접 호출) 담당입니다.** 이 API는 **저장과 조회만** 합니다.
**모든 엔드포인트 인증 필요**이며, 남의 세션은 전부 404 입니다.

**전체 흐름**

```
POST /api/interviews            → 세션 생성 (id 확보)
   ↓  (Alan 으로 질문 생성 · 답변 · 피드백 — 백엔드 관여 없음)
POST /api/interviews/{id}/qas   → 질문·답변·피드백 일괄 저장
   ↓
PATCH /api/interviews/{id}      → status: 'finished' + 점수
```

#### `GET /api/interviews` — 내 세션 목록

**Query** — `page`(기본 1) · `pageSize`(기본 10, 최대 50). 항상 최신순.

**응답 200** — `items`: [InterviewSession](#510-interviewsession)[] — ⚠️ **`qas` 키가 없습니다.**

---

#### `POST /api/interviews` — 세션 생성

**Body** — 전부 선택.

| 필드 | 타입 | 기본값 | 검증 |
|---|---|---|---|
| `companyId` | uuid \| null | `null` | 없는 id면 400 |
| `resumeIds` | uuid[] | `[]` | 문서함에서 다중 선택한 이력서 |
| `coverLetterIds` | uuid[] | `[]` | 자소서 |
| `interviewerStyle` | enum | `"neutral"` | `friendly`\|`neutral`\|`pressure`\|`technical`, 그 외 **400** |
| `selectedCategories` | string[] | `[]` | `code_master(interview_category)` 코드 |
| `showTimer` | boolean | `true` | |

**응답 200** — [InterviewSession](#510-interviewsession) + **`qas: []`**

---

#### `GET /api/interviews/{id}` — 세션 상세

**응답 200** — [InterviewSession](#510-interviewsession) + **`qas`**(seq 오름차순) · **에러** `404`

---

#### `PATCH /api/interviews/{id}` — 세션 종료 / 갱신

보낸 키만 수정. **최소 1개 필요.**

| 필드 | 타입 | 설명 |
|---|---|---|
| `status` | enum | `ongoing` \| `finished`. **`finished` 로 바꾸면 `finishedAt` 자동 기록** |
| `durationSec` | number | 누적 진행 시간(초) |
| `totalScore` | number | 종합 점수 |
| `subScores` | object | `{ "답변내용": 4, "전달력": 3, … }` — **키는 프론트가 정하는 자유 형식** |
| `companyId` | uuid \| null | |

**응답 200** — [InterviewSession](#510-interviewsession) (⚠️ `qas` 없음)
**에러** — `400`(status 오류 / 수정할 내용 없음) · `401` · `404`

---

#### `DELETE /api/interviews/{id}` — 세션 삭제

`{ "deleted": 1 }`. **해당 세션의 질문·답변도 함께 삭제**됩니다 (CASCADE). · **에러** `404`

---

#### `POST /api/interviews/{id}/qas` — 질문·답변 일괄 저장

면접이 끝난 뒤 **한 번에** 넣으세요. 진행 중 채팅은 저장하지 않습니다.

**Body** — `{ "qas": [...] }` 또는 **배열을 그대로** 보내도 됩니다.

| 필드 | 타입 | 필수 | 기본값 |
|---|---|:---:|---|
| `seq` | number | ✕ | 배열 index + 1 |
| `category` | string | ✕ | `null` |
| `question` | string | ✔ | — (**공백이면 400**) |
| `answer` | string | ✕ | `null` |
| `feedback` | object | ✕ | `{}` — 권장 `{ summary, strengths[], improvements[] }` |
| `score` | number | ✕ | `null` |

**응답 200**

```json
{ "items": [ /* InterviewQa[] */ ], "saved": 5 }
```

> **여러 번 호출하면 계속 추가**됩니다(중복 제거 없음). 재시도 시 중복 주의.

**에러** — `400`(빈 배열 / `question` 누락) · `401` · `404`(남의 세션)

---

#### `GET /api/interview-qas` — 질문 목록 · 스크랩 · 검색

**Query**

| 파라미터 | 타입 | 기본값 | 설명 |
|---|---|---|---|
| `scrapped` | `1` | — | **내가 스크랩한 것만** (마이페이지 AI 면접 스크랩) |
| `sessionId` | uuid | — | 특정 세션의 질문만 |
| `q` | string | — | ⭐ **질문 + 답변 본문** 검색 (전 API 중 유일) |
| `sort` | enum | `latest` | `latest` \| `oldest` |
| `page` | number | `1` | |
| `pageSize` | number | `6` | 최대 50 |

**응답 200** — `items`: [InterviewQa](#511-interviewqa)[]

> 스크랩 토글은 `toggleQaScrap(qaId)` → `POST /api/reactions` (`interview_qa` / `bookmark`).

---

#### `DELETE /api/interview-qas` — 질문 기록 복수 삭제

Body `{ "ids": [...] }` → `{ "deleted": n }`

> ⚠️ **`removeQaScraps(ids)` 와 다릅니다.** 이건 **질문 기록 자체를 삭제**합니다.
> 마이페이지 "스크랩 해제"는 `removeQaScraps` (= `DELETE /api/reactions`) 를 쓰세요.

---

## 7. 코드 값 사전 (`code_master`)

`GET /api/codes?groups=…` 로 내려오는 전체 목록입니다. **하드코딩하지 말고 API로 받으세요.**
아래 표는 값 확인용입니다. 라벨은 대시보드에서 바뀔 수 있지만 **코드는 바뀌지 않습니다.**

### ⚠️ 라벨을 보내면 400 입니다

코드 컬럼에는 **반드시 `code` 를 보내세요.** `label`(`"프론트엔드"`)을 보내면 저장되지 않고 400 입니다.

```json
{ "error": { "code": "BAD_REQUEST",
  "message": "jobRoleCode 의 \"프론트엔드\" 는 code_master(job_role) 의 코드가 아닙니다. 사용 가능: frontend | backend | ..." } }
```

에러 메시지에 **사용 가능한 코드가 전부 들어 있으니** 그대로 보고 고치면 됩니다.

검사는 두 겹입니다 — API 가 먼저 위 메시지로 막고, 그걸 우회해도 **DB 의 FK 가 막습니다.**
대상은 아래 전부입니다.

| 테이블 | 컬럼 | 그룹 |
|---|---|---|
| `posts` | `job_role_code` · `difficulty_code` · `pass_result_code` · `channel_code` · `education_level` | job_role · difficulty · pass_result · interview_channel · education_level |
| `profiles` | `career_level` · `education_level` · `skill_codes[]` · `interest_codes[]` | career_level · education_level · tech_stack · interest_field |
| `companies` | `industry_code` · `size_code` · `job_role_codes[]` | industry · company_size · job_role |
| `portfolios` | `category` | portfolio_category |
| `resume_templates` | `category_code` | template_category |
| `interview_sessions` | `interviewer_style` | interviewer_style |
| `interview_qas` | `category` | interview_category |

`null` 은 "미기입"으로 통과합니다. 배열은 **원소 하나라도 틀리면** 전체가 400 입니다.

<details>
<summary><b>job_role</b> — 직무 (13) · 기업 필터 / 후기 작성</summary>

| code | label |
|---|---|
| `frontend` | 프론트엔드 |
| `backend` | 백엔드 |
| `fullstack` | 풀스택 |
| `android` | 안드로이드 |
| `ios` | iOS |
| `devops` | 데브옵스·인프라 |
| `data_ai` | 데이터·AI |
| `game` | 게임 |
| `security` | 보안 |
| `qa` | QA |
| `embedded` | 임베디드 |
| `pm` | PM·기획 |
| `designer` | UI/UX 디자인 |

</details>

<details>
<summary><b>template_category</b> — 양식 분류 (8) · 무료 양식</summary>

| code | label |
|---|---|
| `basic` | 기본 |
| `standard` | 표준 |
| `newcomer` | 신입 |
| `career` | 경력 |
| `project` | 프로젝트 중심 |
| `competency` | 역량 중심 |
| `portfolio` | 포트폴리오형 |
| `english` | 영문 |

</details>

<details>
<summary><b>company_size</b> — 기업 규모 (6)</summary>

| code | label |
|---|---|
| `startup` | 스타트업 |
| `small` | 중소기업 |
| `midsize` | 중견기업 |
| `large` | 대기업 |
| `foreign` | 외국계 |
| `public_finance` | 공공·금융 |

</details>

<details>
<summary><b>industry</b> — 산업 (12)</summary>

| code | label |
|---|---|
| `it_software` | IT·소프트웨어 |
| `platform` | 플랫폼·포털 |
| `game` | 게임 |
| `fintech` | 핀테크·금융 |
| `ecommerce` | 이커머스 |
| `ai_data` | AI·데이터 |
| `security` | 보안 |
| `mobility` | 모빌리티 |
| `healthcare` | 헬스케어 |
| `education` | 교육 |
| `si_sm` | SI·SM |
| `media` | 미디어·콘텐츠 |

</details>

<details>
<summary><b>tech_stack</b> — 기술 스택 (42) · 프로필</summary>

`html` `css` `javascript` `typescript` `react` `nextjs` `vue` `svelte` `nodejs` `nestjs` `spring` `java` `kotlin` `python` `django` `fastapi` `go` `rust` `c` `cpp` `csharp` `dotnet` `php` `ruby` `swift` `flutter` `dart` `react_native` `mysql` `postgresql` `mongodb` `redis` `graphql` `docker` `kubernetes` `aws` `gcp` `azure` `firebase` `supabase` `git` `figma`

라벨은 표기 그대로입니다 (`nextjs` → `Next.js`, `cpp` → `C++`, `dotnet` → `.NET`).

</details>

<details>
<summary><b>interest_field</b> — 관심 분야 (11) · 프로필 ⚠️ job_role과 다름</summary>

| code | label |
|---|---|
| `frontend` | 프론트엔드 |
| `backend` | 백엔드 |
| `fullstack` | 풀스택 |
| `mobile` | 모바일 |
| `data` | 데이터 |
| `ai_ml` | AI·ML |
| `devops` | DevOps |
| `security` | 보안 |
| `a11y` | 웹 접근성 |
| `planning` | 기획 |
| `design` | 디자인 |

</details>

<details>
<summary><b>interview_channel</b> — 면접 경로 (6)</summary>

| code | label |
|---|---|
| `online` | 온라인 지원 |
| `referral_friend` | 지인 추천 |
| `referral_school` | 학교 추천 |
| `job_fair` | 채용 박람회 |
| `recruiter` | 채용 담당자 제안 |
| `etc` | 기타 ← **이때만 `channelEtc` 자유 입력** |

</details>

<details>
<summary><b>그 외 소규모 그룹</b></summary>

| 그룹 | code → label |
|---|---|
| `pass_result` | `pass` 합격 · `waiting` 대기 · `fail` 불합격 |
| `difficulty` | `easy` 쉬움 · `normal` 보통 · `hard` 어려움 |
| `language_level` | `high` 상 · `mid` 중 · `low` 하 |
| `education_level` | `high_school` 고졸 · `associate` 초대졸 · `bachelor` 대졸 · `master` 석사 · `doctor` 박사 |
| `school_type` | `high_school` 고등학교 · `college` 전문대 · `university` 대학교 · `graduate` 대학원 |
| `career_level` | `entry` 신입 · `1_3` 1~3년 · `3_5` 3~5년 · `5_plus` 5년+ |
| `edu_status` | `enrolled` 재학 · `leave` 휴학 · `graduated` 졸업 · `dropped` 중퇴 |
| `interviewer_style` | `friendly` 친절한 · `neutral` 보통 · `pressure` 압박하는 · `technical` 기술 심층 |
| `interview_category` | `intro` 자기소개 · `tech1` 기술질문1 · `tech2` 기술질문2 · `personality` 인성질문 · `closing` 마무리질문 |
| `portfolio_category` | `web` 웹 · `app` 앱 |

</details>

---

## 8. 파일 업로드 (Storage)

이미지는 **REST API를 거치지 않고** 브라우저가 Supabase Storage로 직접 올립니다.
`lib/api` 함수가 검증·업로드·URL 획득을 전부 처리하므로 **함수만 부르면 됩니다.**

```js
const url  = await uploadAvatar(file);                    // 업로드 + 프로필 갱신까지
const urls = await uploadPortfolioImages(portfolioId, files);
const url  = await uploadDocumentImage(documentId, file); // 이력서·자소서 본문 이미지 (비공개)
```

| 용도 | 버킷 | 용량 | 허용 형식 | 개수 |
|---|---|---|---|---|
| 프로필 사진 | `avatars` | **2MB** | jpg / png / webp | 1장 |
| 포트폴리오 이미지 | `portfolios` | **5MB / 장** | jpg / png / webp / gif | **최대 15장** |
| 이력서·자소서 이미지 | `documents` 🔒 | **5MB / 장** | jpg / png / webp / gif | 한 번에 **최대 10장** |
| 기업 로고 | `company-logos` | 1MB | png / svg / webp | 대시보드에서만 |
| 양식 미리보기 | `templates` | 2MB | png / webp | 대시보드에서만 |

**동영상 업로드는 없습니다.** 포트폴리오 영상은 `{ type:'video', youtubeUrl }` 블록으로 YouTube 링크만 저장합니다.

**경로 규칙** (자동 생성)

```
avatars/{userId}/avatar-{timestamp}.{ext}
portfolios/{userId}/{portfolioId}/{timestamp}-{random}.{ext}
documents/{userId}/{documentId}/{timestamp}-{random}.{ext}
```

### 이력서·자소서 본문 이미지

⚠️ **`documents` 버킷만 비공개입니다.** 이력서는 남에게 보이면 안 되므로 다른 버킷과 다르게 동작합니다.

- Supabase 공개 URL 이 **없습니다**. 대신 `uploadDocumentImage` 가 **우리 API 경로**를 돌려줍니다.
- 그 경로는 **만료되지 않습니다.** `contentHtml` 안에 그대로 저장하면 됩니다.
- 서버가 **항상 로그인한 사람 본인 폴더로만** 경로를 만듭니다. 남의 이미지는 URL 을 알아도 404 입니다.

```
GET /api/documents/{documentId}/images/{fileName}
   → 비로그인 401 · 남의 것 404 · 내 것 200 (Cache-Control: private)
```

#### 저장 전(draft)에도 업로드됩니다

문서를 저장하기 전에도 이미지를 넣을 수 있어야 하므로, **id 를 먼저 만들어** 쓰는 방식입니다.

```js
import {
  createDocument, createDocumentDraftId,
  uploadDocumentImage, removeDocumentImages,
} from '@backend/lib/api/documents';

// 1) 에디터를 열 때 id 를 하나 만들어 둡니다 (아직 DB 에 아무것도 없습니다)
const draftId = createDocumentDraftId();

// 2) 저장 전에도 이미지가 올라갑니다
const url = await uploadDocumentImage(draftId, file);
editor.chain().focus().setImage({ src: url }).run();

// 3) 저장할 때 그 id 를 그대로 넘기면 이미지가 그대로 붙어 있습니다
await createDocument({
  id: draftId,
  docType: 'resume',
  title,
  content: editor.getJSON(),
  contentHtml: editor.getHTML(),
  contentText: editor.getText(),
});

// 3') 저장하지 않고 나갈 때는 올렸던 이미지를 정리해 주세요
await removeDocumentImages(draftId);
```

`createDocument` 의 `id` 는 **선택**입니다. 안 넘기면 서버가 만들어 줍니다.
넘길 경우 uuid 여야 하며, 아니면 400 입니다.

#### 문서를 지우면 이미지도 지워집니다

`deleteDocument(id)` · `deleteDocuments(ids)` 는 해당 문서 폴더의 이미지를 **서버에서 함께 지웁니다.**
프론트가 따로 정리할 필요가 없습니다.

여러 장을 한 번에 올릴 땐 `uploadDocumentImages(documentId, files)` — URL 배열이 돌아옵니다.

#### 버려진 draft 도 알아서 정리됩니다

3') 를 못 부르고 창을 닫아도(브라우저 강제 종료 등) 이미지가 남지 않습니다.
문서함을 열 때(`listMyDocuments()`) 서버가 **문서 없는 이미지 폴더**를 함께 청소합니다.

- 마지막 업로드로부터 **24시간**이 지난 것만 지웁니다. **지금 편집 중인 draft 는 안전합니다.**
- 저장된 문서의 이미지는 대상이 아닙니다.
- 남의 것은 건드리지 않습니다.

즉시 지우고 싶으면 3') 의 `removeDocumentImages(draftId)` 를 쓰세요. 기다릴 필요가 없습니다.

#### 회원 탈퇴하면 파일도 사라집니다

`deleteMyAccount()` 는 DB 행뿐 아니라 그 사람의 **Storage 파일 전부**를 지웁니다 —
`documents`(이력서 이미지) · `portfolios` · `avatars` 세 버킷의 본인 폴더.

**보안** — 자기 폴더(`{userId}/`)에만 쓸 수 있습니다.
읽기는 `documents` 만 **본인 전용**이고, 나머지 버킷은 전체 공개(`getPublicUrl`)입니다.
용량·형식은 **함수에서 한 번, 버킷 설정에서 한 번** 두 겹으로 막힙니다.

**에러** — 검증 실패 시 `ApiError` 가 던져집니다.

| 메시지 | 원인 |
|---|---|
| `JPG, PNG, WEBP 이미지만 올릴 수 있습니다.` | MIME 타입 불허 |
| `프로필 사진은 2MB 이하만 올릴 수 있습니다.` | 용량 초과 |
| `이미지는 최대 15장까지 올릴 수 있습니다.` | 포트폴리오 개수 초과 |
| `이미지는 한 번에 10장까지 올릴 수 있습니다.` | 문서 이미지 개수 초과 |
| `로그인이 필요합니다.` (status 401) | 미로그인 |

> `next/image` 로 렌더할 수 있게 `next.config.mjs` 에 `*.supabase.co` 가 등록돼 있습니다.

---

# 3부 — 참고

## 9. 스펙 제약 · 미구현

### 데이터 제약

| 항목 | 현재 스펙 |
|---|---|
| 기업 `logo` `ceo` `founded` `capital` `address` `news` | 값이 채워져 있지 않습니다. `null` 또는 `[]` 로 내려가므로 폴백 UI가 필요합니다 |
| 기업 `rating` `ratings` `salary` | 샘플 값입니다. 실제 평점·연봉이 아닙니다 |
| `POST /api/views` | 중복 호출 방지가 없습니다. 부른 만큼 조회수가 올라갑니다 |
| `profiles` 직접 조회 | `email` 컬럼 권한이 회수돼 있어 `select('*')` 는 **403** 입니다. 컬럼을 명시해야 합니다 (어차피 REST API 만 쓰면 됩니다) |
| jsonb 필드 내부 구조 | 서버는 배열/객체 여부만 검사하고 내부 키는 검증하지 않습니다. [5장](#5-데이터-모델)의 모양은 프론트와의 약속입니다 |

### 미구현

| 모듈 | 내용 | 상태 |
|---|---|---|
| `ai.js` | AI 코치, 보조도구 5종, 면접 질문 생성 | **프론트가 Alan 을 직접 호출** — 래퍼 함수 없음 |

질문 생성·피드백·첨삭은 프론트에서 Alan 을 부르고, 그 **결과만** `@backend/lib/api/interview` 로 저장합니다.
그 외 모듈은 전부 사용할 수 있습니다.

### Alan AI 호출

**⚠️ `https://kdt-api-function.azurewebsites.net` 을 브라우저에서 직접 부르면 100% 실패합니다.**
Alan 서버가 `Access-Control-Allow-Origin` 을 내려주지 않아 CORS 로 차단됩니다.

```
Access to fetch at 'https://kdt-api-function.azurewebsites.net/...' from origin
'http://localhost:3000' has been blocked by CORS policy
```

그래서 `next.config.mjs` 에 same-origin 우회 경로를 열어뒀습니다. **`/alan` 으로 부르세요.**

```
브라우저 ──► /alan/question ──(Next.js rewrite)──► kdt-api-function.azurewebsites.net/api/v1/question
```

| 엔드포인트 | 용도 |
|---|---|
| `GET /alan/question?content=&client_id=` | 한 번에 답변 (`{ answer, references }`) |
| `GET /alan/question/sse-streaming?content=&client_id=` | 스트리밍 (`text/event-stream`) |
| `DELETE /alan/reset-state` (body `{ client_id }`) | 대화 상태 초기화 |

```js
const BASE = process.env.NEXT_PUBLIC_ALAN_BASE_URL;
const CLIENT_ID = process.env.NEXT_PUBLIC_ALAN_CLIENT_ID;

export async function askAlan(content) {
  const q = new URLSearchParams({ content, client_id: CLIENT_ID });
  const res = await fetch(`${BASE}/question?${q}`);
  if (!res.ok) throw new Error(`Alan ${res.status}`);
  const { answer } = await res.json();
  return answer;
}
```

스트리밍은 `event: speak | action | complete` 형태로 내려옵니다.

```
event: speak
data: {"type": "speak", "data": "질문의 의도를 이해하고 있어요."}
event: action
data: {"type": "action", "data": "search_web"}
```

**주의할 점**

- **느립니다.** 실측으로 단답형 6초, 웹 검색이 붙으면 **23초**까지 갑니다. 로딩 UI 없이
  붙이면 멈춘 것처럼 보입니다. 체감이 중요하면 `sse-streaming` 을 쓰세요.
- `client_id` 는 **할당량 키**입니다. 사람마다 다르고, 브라우저 번들에 그대로 실립니다.
  공용 계정 키가 아니므로 큰 문제는 아니지만, 배포본에서 남이 가져다 쓰면 본인 할당량이 깎입니다.
- 답이 빈 문자열(`""`)로 오는 경우가 있습니다. 폴백을 준비하세요.
- 프롬프트 조립은 전부 프론트 몫입니다. 서버는 관여하지 않습니다.

### 테스트

이 문서의 스펙은 **유닛 963개 + E2E 485개 = 1,448개** 테스트로 검증돼 있습니다. 자세한 내용은 `TESTING.md`.

```bash
npm run test:all
```

## 10. 프론트에 부탁하는 것

1. **리치 텍스트 에디터는 Tiptap 권장** — 저장할 때 세 값을 함께 보내주세요.
   ```js
   { content: editor.getJSON(), contentHtml: editor.getHTML(), contentText: editor.getText() }
   ```
   (재편집 / 인쇄·PDF / AI 입력에 각각 필요합니다. 서버에서 HTML을 파싱하지 않습니다.)
2. **정렬 라벨을 `최신순` / `인기순` 으로 통일**해주세요. 지금 화면마다 다릅니다.
3. **면접 경로는 드롭다운(6개) + `기타`(`etc`) 선택 시에만 자유 입력**으로 해주세요.
   자유 텍스트로 쌓이면 통계를 영원히 못 만듭니다.
4. **PDF 다운로드는 `window.print()` + `@media print`** 로 해주세요.
   서버 렌더링은 반나절 이상 걸립니다.
5. **타인 프로필 화면에서 이메일 칸을 그리지 마세요.** 항상 `null` 로 내려갑니다.
   본인 프로필·편집 화면에서만 쓰면 됩니다.
6. **목록 화면에서 카드마다 반응 API를 부르지 마세요.** 목록을 받은 뒤 id 배열로 **한 번만** 부르면 됩니다.
7. 나머지 확인 요청 사항은 `DECISIONS.md` 에 정리해 뒀습니다.

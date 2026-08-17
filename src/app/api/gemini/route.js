import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const GITHUB_QUESTION = 'GitHub 레포지토리를 분석해서 어필할 부분을 찾아줘';

const SOURCE_EXTENSIONS = [
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.json',
  '.md',
  '.html',
  '.css',
  '.scss',
  '.sass',
  '.py',
  '.java',
  '.kt',
  '.cs',
  '.go',
  '.rs',
  '.php',
  '.vue',
  '.svelte',
  '.sql',
  '.yml',
  '.yaml',
];

const EXCLUDED_PATHS = ['node_modules/', '.next/', 'dist/', 'build/', 'coverage/', 'vendor/', '.git/'];

const MAX_FILES = 20;
const MAX_FILE_LENGTH = 12000;
const MAX_REPOSITORY_LENGTH = 100000;

function getGithubHeaders() {
  const headers = {
    Accept: 'application/vnd.github+json',

    'X-GitHub-Api-Version': '2022-11-28',

    'User-Agent': 'optime-portfolio-ai',
  };

  // *********** 토근 발급 후 주석 해제 *********** //
  // if (process.env.GITHUB_TOKEN) {
  //   headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  // }

  return headers;
}

function parseGithubUrl(githubUrl) {
  try {
    const url = new URL(githubUrl);

    if (url.hostname !== 'github.com' && url.hostname !== 'www.github.com') {
      return null;
    }

    const pathParts = url.pathname.split('/').filter(Boolean);

    if (pathParts.length < 2) {
      return null;
    }

    const owner = pathParts[0];

    const repo = pathParts[1].replace(/\.git$/, '');

    if (!owner || !repo) {
      return null;
    }

    return {
      owner,
      repo,
    };
  } catch {
    return null;
  }
}

function isSourceFile(path) {
  const lowerPath = path.toLowerCase();

  const isExcluded = EXCLUDED_PATHS.some((excludedPath) => lowerPath.includes(excludedPath));

  if (isExcluded) {
    return false;
  }

  if (
    lowerPath.endsWith('.min.js') ||
    lowerPath.endsWith('.map') ||
    lowerPath.endsWith('package-lock.json') ||
    lowerPath.endsWith('pnpm-lock.yaml') ||
    lowerPath.endsWith('yarn.lock')
  ) {
    return false;
  }

  return SOURCE_EXTENSIONS.some((extension) => lowerPath.endsWith(extension));
}

function getFilePriority(path) {
  const lowerPath = path.toLowerCase();

  if (lowerPath === 'readme.md' || lowerPath.endsWith('/readme.md')) {
    return 100;
  }

  if (lowerPath === 'package.json') {
    return 95;
  }

  if (
    lowerPath.includes('next.config') ||
    lowerPath.includes('vite.config') ||
    lowerPath.includes('tsconfig') ||
    lowerPath.includes('jsconfig')
  ) {
    return 90;
  }

  if (lowerPath.startsWith('src/') || lowerPath.startsWith('app/')) {
    return 80;
  }

  if (
    lowerPath.includes('/components/') ||
    lowerPath.includes('/hooks/') ||
    lowerPath.includes('/lib/') ||
    lowerPath.includes('/api/') ||
    lowerPath.includes('/services/')
  ) {
    return 75;
  }

  if (
    lowerPath.endsWith('.js') ||
    lowerPath.endsWith('.jsx') ||
    lowerPath.endsWith('.ts') ||
    lowerPath.endsWith('.tsx')
  ) {
    return 70;
  }

  return 50;
}

async function githubFetch(url, options = {}) {
  const response = await fetch(url, {
    ...options,

    headers: {
      ...getGithubHeaders(),
      ...options.headers,
    },

    cache: 'no-store',
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('GitHub 레포지토리를 찾을 수 없습니다. 주소가 올바른지 확인해주세요.');
    }

    if (response.status === 403) {
      throw new Error('GitHub API 요청 한도를 초과했거나 레포지토리에 접근할 권한이 없습니다.');
    }

    throw new Error(`GitHub API 요청에 실패했습니다. (${response.status})`);
  }

  return response;
}

async function getRepositoryInfo(owner, repo) {
  const response = await githubFetch(`https://api.github.com/repos/${owner}/${repo}`);

  return response.json();
}

async function getRepositoryTree(owner, repo, branch) {
  const response = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`,
  );

  const data = await response.json();

  return data.tree ?? [];
}

async function getFileContent(owner, repo, path, branch) {
  const encodedPath = path.split('/').map(encodeURIComponent).join('/');

  const response = await githubFetch(
    `https://api.github.com/repos/${owner}/${repo}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Accept: 'application/vnd.github.raw+json',
      },
    },
  );

  return response.text();
}

async function getGithubRepositoryData(githubUrl) {
  const parsed = parseGithubUrl(githubUrl);

  if (!parsed) {
    throw new Error('올바른 GitHub 레포지토리 주소를 입력해주세요.');
  }

  const { owner, repo } = parsed;

  const repository = await getRepositoryInfo(owner, repo);

  const branch = repository.default_branch;

  const tree = await getRepositoryTree(owner, repo, branch);

  const sourceFiles = tree
    .filter((file) => file.type === 'blob' && isSourceFile(file.path))
    .sort((a, b) => getFilePriority(b.path) - getFilePriority(a.path))
    .slice(0, MAX_FILES);

  const files = [];

  let totalLength = 0;

  for (const file of sourceFiles) {
    if (totalLength >= MAX_REPOSITORY_LENGTH) {
      break;
    }

    try {
      const content = await getFileContent(owner, repo, file.path, branch);

      if (!content) continue;

      const remainingLength = MAX_REPOSITORY_LENGTH - totalLength;

      const slicedContent = content.slice(0, Math.min(MAX_FILE_LENGTH, remainingLength));

      files.push({
        path: file.path,
        content: slicedContent,
      });

      totalLength += slicedContent.length;
    } catch (error) {
      console.error(`GitHub 파일 조회 실패: ${file.path}`, error);
    }
  }

  if (!files.length) {
    throw new Error('레포지토리에서 분석할 수 있는 소스 파일을 찾지 못했습니다.');
  }

  return {
    name: repository.name,

    fullName: repository.full_name,

    description: repository.description ?? '',

    language: repository.language ?? '',

    defaultBranch: branch,

    topics: repository.topics ?? [],

    files,
  };
}

function createConversationText(messages) {
  if (!messages?.length) {
    return '이전 대화 없음';
  }

  return messages
    .map((message) => {
      const role = message.role === 'user' ? '사용자' : 'AI';

      return `${role}: ${message.content}`;
    })
    .join('\n\n');
}

function createGithubPrompt({ message, repository, messages }) {
  const conversationText = createConversationText(messages);

  const fileContents = repository.files
    .map(
      (file) => `
        ==============================
        파일: ${file.path}
        ==============================

        ${file.content}
      `,
    )
    .join('\n');

  return `
    너는 개발자 취업용 포트폴리오를 피드백하는 AI 어시스턴트야.

    이전 대화:
    ${conversationText}

    현재 사용자의 질문:
    ${message}

    이전 대화가 있다면 그 맥락을 이어서 답변해줘.

    분석할 GitHub 레포지토리:

    레포지토리:
    ${repository.fullName}

    설명:
    ${repository.description || '없음'}

    주요 언어:
    ${repository.language || '알 수 없음'}

    Topics:
    ${repository.topics.join(', ') || '없음'}

    다음은 레포지토리에서 선별한 주요 파일들이야.

    ${fileContents}

    위 GitHub 레포지토리 내용을 바탕으로 사용자의 질문에 답변해줘.

    분석 기준:
    - 개발자 채용 담당자와 기술 면접관의 관점에서 분석해줘.
    - 단순히 사용 기술을 나열하지 마.
    - 실제 코드에서 확인할 수 있는 내용을 근거로 설명해줘.
    - 개발자의 기술적 선택이 드러나는 부분을 찾아줘.
    - 문제 해결 능력이 드러나는 구현을 찾아줘.
    - 구조적으로 잘 설계된 부분을 찾아줘.
    - 상태 관리, 데이터 흐름, 컴포넌트 구조, 재사용성, API 설계 등 개발 역량이 드러나는 부분을 찾아줘.
    - 포트폴리오에서 특히 강조하면 좋은 구현을 알려줘.
    - 면접에서 설명하기 좋은 코드 포인트를 알려줘.
    - 가능하면 근거가 되는 파일명도 함께 알려줘.
    - 확인할 수 없는 내용은 추측해서 사실처럼 말하지 마.

    답변은 다음 순서로 정리해줘.

    1. 가장 어필할 만한 부분
    2. 기술적으로 잘 구현된 부분
    3. 포트폴리오에서 강조하면 좋은 내용
    4. 면접에서 설명하기 좋은 코드 포인트
    5. 개선하면 좋은 부분
  `;
}

function createPortfolioPrompt({ message, activeTab, content, messages }) {
  const conversationText = createConversationText(messages);
  const basePrompt = `
    너는 개발자 취업용 포트폴리오 작성을 도와주는 AI 어시스턴트야.

    이전 대화:
    ${conversationText}

    현재 사용자의 질문:
    ${message}

    답변 원칙:
    - 이전 대화가 있다면 맥락을 이어서 답변해줘.
    - "그중에서", "왜?", "좀 더 자세히", "그걸 어떻게 설명해?" 같은 표현은 이전 대화를 참고해서 이해해줘.
    - 사용자의 현재 질문에 가장 직접적으로 답변해줘.
    - 개발자 취업용 포트폴리오라는 목적을 고려해서 답변해줘.
    - 구체적이고 실제로 적용할 수 있는 내용을 제안해줘.
    - 불필요하게 긴 설명은 피하고 이해하기 쉽게 정리해줘.
    - 제공된 내용에서 확인할 수 없는 사실은 임의로 만들어내지 마.
  `;

  if (activeTab === 'overview') {
    return `
      ${basePrompt}

      현재 사용자가 Overview 탭에 작성한 내용:
      ${JSON.stringify(content, null, 2)}

      위 내용을 참고해서 사용자의 질문에 답변해줘.

      Overview 분석 기준:
      - 프로젝트의 목적이 명확하게 전달되는지 확인해줘.
      - 프로젝트의 핵심 기능이 잘 드러나는지 확인해줘.
      - 개발자가 어떤 문제를 해결했는지 드러나는지 확인해줘.
      - 사용자의 역할이나 기여도가 충분히 드러나는지 확인해줘.
      - 개발자 포트폴리오에서 강조하면 좋을 부분을 찾아줘.
      - 부족한 내용이 있다면 무엇을 어떻게 보완하면 좋은지 구체적으로 알려줘.
      - 이미 잘 작성된 부분은 억지로 수정하도록 권하지 마.
      - 단순히 좋다거나 부족하다고 평가하지 말고 이유를 설명해줘.
    `;
  }

  if (activeTab === 'code') {
    return `
      ${basePrompt}

      현재 사용자가 Code 탭에 등록한 내용:
      ${JSON.stringify(content, null, 2)}

      위 내용을 참고해서 사용자의 질문에 답변해줘.

      Code 분석 기준:
      - 개발자 채용 담당자와 기술 면접관 관점에서 분석해줘.
      - 코드가 단순히 무엇을 하는지 설명하는 데 그치지 마.
      - 구현 의도와 기술적인 선택을 중심으로 분석해줘.
      - 문제 해결 능력이 드러나는 부분을 찾아줘.
      - 구조적으로 잘 설계된 부분이 있다면 알려줘.
      - 개발 역량을 어필할 수 있는 기술적인 포인트를 찾아줘.
      - 면접에서 질문받기 좋은 부분이 있다면 예상 질문이나 설명 포인트를 알려줘.
      - 개선할 부분이 있다면 이유와 함께 설명해줘.
    `;
  }

  if (activeTab === 'document') {
    return `
      ${basePrompt}

      현재 사용자가 Document 탭에 작성한 내용:
      ${JSON.stringify(content, null, 2)}

      위 내용을 참고해서 사용자의 질문에 답변해줘.

      Document 작성 기준:
      - 문장이 자연스럽고 전문적으로 보이는지 확인해줘.
      - 지나치게 길거나 반복되는 내용을 찾아줘.
      - 개발자의 경험과 역할이 명확하게 드러나도록 도와줘.
      - 필요하면 더 간결하고 읽기 좋은 표현을 제안해줘.
    `;
  }

  return basePrompt;
}

export async function POST(request) {
  try {
    const { message, activeTab, content = [], messages = [], githubUrl } = await request.json();

    if (!message?.trim()) {
      return Response.json(
        {
          error: '메시지를 입력해주세요.',
        },
        {
          status: 400,
        },
      );
    }

    const isGithubRequest = activeTab === 'code' && message === GITHUB_QUESTION;

    let prompt;

    if (isGithubRequest) {
      if (!githubUrl) {
        return Response.json(
          {
            error: 'GitHub 레포지토리 주소를 입력해주세요.',
          },
          {
            status: 400,
          },
        );
      }

      const repository = await getGithubRepositoryData(githubUrl);

      prompt = createGithubPrompt({
        message,
        repository,
        messages,
      });
    } else {
      prompt = createPortfolioPrompt({
        message,
        activeTab,
        content,
        messages,
      });
    }

    const stream = await ai.models.generateContentStream({
      model: 'gemini-3.6-flash',

      contents: prompt,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.text;

            if (text) {
              controller.enqueue(encoder.encode(text));
            }
          }

          controller.close();
        } catch (error) {
          console.error('Gemini Stream Error:', error);

          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',

        'Cache-Control': 'no-cache',
      },
    });
  } catch (error) {
    console.error('Gemini API Error:', error);

    return Response.json(
      {
        error: error?.message || 'AI 응답 생성에 실패했습니다.',
      },
      {
        status: 500,
      },
    );
  }
}

// Alan AI 호출. 브라우저에서 직접 부르면 CORS 로 막혀서 /alan 우회 경로를 쓴다
//
// 스트리밍(/question/sse-streaming)은 쓰지 않는다. 우회 경로가 응답을 통째로 모았다가
// 한 번에 보내서, 28초 동안 아무것도 안 오다가 한꺼번에 도착한다. 글자가 하나씩 나오지 않는다
const BASE = process.env.NEXT_PUBLIC_ALAN_BASE_URL;
const CLIENT_ID = process.env.NEXT_PUBLIC_ALAN_CLIENT_ID;

// 한 번 물으면 25~30초 걸린다
const TIMEOUT_MS = 60000;

// 문서 기준 한글 1000자 내외. 여유를 두고 900 으로 쓴다 (654자 통과 확인)
export const MAX_QUESTION = 900;

// 주의: 하루 요청량이 client_id 당 100회다. 테스트할 때 아껴 써야 한다

export const isAlanReady = Boolean(BASE && CLIENT_ID);

// 서버가 client_id 마다 대화를 기억한다. 지우지 않으면 지난 대화가 섞여 나온다.
// 쿼리로 보내면 500 이고 JSON 본문으로 보내야 한다
export function resetState() {
  if (!isAlanReady) return Promise.resolve();

  return fetch(`${BASE}/reset-state`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: CLIENT_ID }),
  }).catch(() => {});
}

// 실패는 무엇이든 이 문구들 중 하나로만 보여준다. 코드나 영어 메시지를 그대로 띄우지 않는다
const FALLBACK = 'AI 가 응답하지 않았어요. 잠시 뒤 다시 시도해주세요.';
const OVER_LIMIT = '오늘 AI 사용량을 다 쓴 것 같아요. 내일 다시 시도해주세요. 🙏';

const STATUS_MESSAGE = {
  401: OVER_LIMIT,
  403: OVER_LIMIT,
  429: '잠깐 사이에 너무 많이 물어봤어요. 1분쯤 뒤에 다시 시도해주세요.',
};

// 다시 물어도 소용없는 실패
function stop(message) {
  const error = new Error(message);
  error.final = true;
  return error;
}

// 답에 마크다운과 출처 링크가 섞여 온다. 말풍선에 그대로 두면 지저분하다
export function cleanAnswer(text) {
  return (text ?? '')
    .replace(/\[\(?출처\s*\d+\)?\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    // 목록 기호가 별표로 온다
    .replace(/^[ \t]*[*-][ \t]+/gm, '· ')
    .replace(/[ \t]{2,}/g, ' ')
    // 링크를 걷어내면 "합니다 ." 처럼 공백이 남는다
    .replace(/[ \t]+([.,!?)\]])/g, '$1')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

async function once(question, signal) {
  const timeout = AbortSignal.timeout(TIMEOUT_MS);
  const query = new URLSearchParams({ content: question, client_id: CLIENT_ID });

  let response;
  try {
    response = await fetch(`${BASE}/question?${query}`, {
      signal: signal ? AbortSignal.any([signal, timeout]) : timeout,
    });
  } catch (error) {
    // 사용자가 새 질문을 보내 취소한 경우는 그대로 올려보낸다
    if (error.name === 'AbortError') throw error;
    if (error.name === 'TimeoutError') throw stop('AI 응답이 너무 오래 걸려요. 다시 시도해주세요.');

    // 연결이 끊긴 경우. 원문이 영어라 그대로 보여줄 수 없다
    throw new Error(FALLBACK);
  }

  // 4xx 는 다시 물어도 똑같다. 5xx 는 잠깐 쉬고 한 번 더 물어본다
  if (!response.ok) {
    const message = STATUS_MESSAGE[response.status] ?? FALLBACK;
    throw response.status < 500 ? stop(message) : new Error(message);
  }

  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error(FALLBACK);
  }

  const cleaned = cleanAnswer(body?.answer);
  if (!cleaned) throw new Error('AI 가 답을 만들지 못했어요. 다시 시도해주세요.');

  return cleaned;
}

// 연달아 물으면 500 이나 빈 답이 오는 일이 있다. 한 번은 쉬었다 다시 물어본다
const RETRY_DELAY = 5000;

export async function ask(question, { signal } = {}) {
  // 주의: 키가 없으면 .env.local 의 NEXT_PUBLIC_ALAN_CLIENT_ID 를 확인한다
  if (!isAlanReady) throw stop(FALLBACK);

  try {
    return await once(question, signal);
  } catch (error) {
    if (error.name === 'AbortError' || error.final) throw error;

    await new Promise((done) => setTimeout(done, RETRY_DELAY));
    return once(question, signal);
  }
}

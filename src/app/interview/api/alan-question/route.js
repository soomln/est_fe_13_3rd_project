// Alan API(실습용 공유 서버)는 느려서 실패하기보다 빈 응답을 빠르게 반환하며 실패하는
// 경우가 많다. 오래 기다리는 대신 짧은 간격으로 더 여러 번 시도한다.
const RETRY_DELAYS_MS = [1000, 1000, 1000];

async function callAlan(url, signal) {
  const res = await fetch(url, { signal });
  const data = await res.json();
  return { data, status: res.status };
}

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const content = body?.content;
  const clientId = body?.client_id;

  if (!content || !clientId) {
    return Response.json({ error: 'content와 client_id가 모두 필요합니다.' }, { status: 400 });
  }

  const base = process.env.ALAN_BASE_URL || 'https://kdt-api-function.azurewebsites.net/api/v1';
  const url = `${base}/question?${new URLSearchParams({ content, client_id: clientId })}`;

  let lastError;
  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    if (attempt > 0) {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt - 1]));
    }

    try {
      const { data, status } = await callAlan(url, request.signal);
      if (status >= 500) throw new Error(`Alan 응답 실패 (HTTP ${status})`);
      return Response.json(data, { status });
    } catch (err) {
      lastError = err;
      if (request.signal?.aborted) break;
    }
  }

  console.error('Alan AI 호출에 실패했습니다:', lastError);
  return Response.json({ error: 'Alan AI 호출에 실패했습니다.' }, { status: 502 });
}

const RETRY_DELAY_MS = 1000;

async function callAlan(url) {
  const res = await fetch(url);
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

  try {
    const { data, status } = await callAlan(url);
    if (status >= 500) throw new Error(`Alan 응답 실패 (HTTP ${status})`);
    return Response.json(data, { status });
  } catch {
    try {
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      const { data, status } = await callAlan(url);
      return Response.json(data, { status });
    } catch {
      return Response.json({ error: 'Alan AI 호출에 실패했습니다.' }, { status: 502 });
    }
  }
}

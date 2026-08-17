// Alan AI(kdt-api-function.azurewebsites.net)는 브라우저에서 직접 호출하면 CORS로 막힌다.
// 그래서 이 라우트가 서버(같은 오리진)에서 대신 호출해서 결과만 그대로 돌려준다.
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const content = searchParams.get('content');
  const clientId = searchParams.get('client_id');

  if (!content || !clientId) {
    return Response.json({ error: 'content와 client_id가 모두 필요합니다.' }, { status: 400 });
  }

  const base = process.env.ALAN_BASE_URL || 'https://kdt-api-function.azurewebsites.net/api/v1';
  const url = `${base}/question?${new URLSearchParams({ content, client_id: clientId })}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ error: 'Alan AI 호출에 실패했습니다.' }, { status: 502 });
  }
}

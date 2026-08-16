// src/app/api/alan/question 은 다른 페이지 팀원들과 공유하는 라우트라 이 페이지에서 고치지 않는다.
// 이력서·자소서·기업정보를 합친 긴 프롬프트를 GET 쿼리스트링으로 보내면 URL 길이 제한(414/431)에
// 걸리므로, interview 페이지 전용으로 POST body를 받아 서버에서 Alan을 대신 호출하는 라우트를 둔다.
// Alan(kdt-api-function.azurewebsites.net) 쪽은 여전히 GET만 지원하므로, 서버→Alan 구간은 그대로 GET이다.
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
    const res = await fetch(url);
    const data = await res.json();
    return Response.json(data, { status: res.status });
  } catch {
    return Response.json({ error: 'Alan AI 호출에 실패했습니다.' }, { status: 502 });
  }
}

import { ApiError } from './errors';

export async function apiFetch(path, { method = 'GET', query, body } = {}) {
  if (typeof window === 'undefined') {
    throw new ApiError('lib/api 함수는 클라이언트 컴포넌트에서만 호출할 수 있습니다.');
  }

  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(query ?? {})) {
    if (value !== undefined && value !== null && value !== '') search.set(key, String(value));
  }
  const qs = search.toString();

  const response = await fetch(qs ? `${path}?${qs}` : path, {
    method,
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  if (response.status === 204) return null;

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(payload?.error?.message ?? `요청에 실패했습니다. (${response.status})`, {
      code: payload?.error?.code,
      status: response.status,
    });
  }

  return payload;
}

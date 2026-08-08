const KEY = Symbol.for('callback.tests.supabase');

export function setSupabase(stub) {
  globalThis[KEY] = stub;
}

export function getSupabase() {
  return globalThis[KEY] ?? null;
}

export function makeRequest(url = 'http://localhost/api/test', { body, json } = {}) {
  return {
    url,
    nextUrl: new URL(url),
    json: json ?? (async () => body),
  };
}

export function brokenJsonRequest(url = 'http://localhost/api/test') {
  return makeRequest(url, {
    json: async () => {
      throw new SyntaxError('Unexpected end of JSON input');
    },
  });
}

export async function callRoute(handler, { request = makeRequest(), params } = {}) {
  const context = params === undefined ? undefined : { params };
  const response = await handler(request, context);
  const status = response.status;
  const body = status === 204 ? null : await response.json();
  return { status, body, response };
}

export function mockApiFetch(apiFetch, routes) {
  apiFetch.mockImplementation(async (path, options = {}) => {
    const key = `${options.method ?? 'GET'} ${path}`;
    if (!(key in routes)) throw new Error(`unexpected apiFetch call: ${key}`);
    const value = routes[key];
    return typeof value === 'function' ? value(options) : value;
  });
}

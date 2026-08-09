import { createServer } from 'node:http';
import { NextRequest } from 'next/server';

import { runWithUser, userFromCookieHeader } from './session';

const ROUTES = [
  ['/api/codes', () => import('@/app/api/codes/route.js')],
  ['/api/health', () => import('@/app/api/health/route.js')],
  ['/api/views', () => import('@/app/api/views/route.js')],
  ['/api/reactions', () => import('@/app/api/reactions/route.js')],
  ['/api/interview-qas', () => import('@/app/api/interview-qas/route.js')],

  ['/api/me/account', () => import('@/app/api/me/account/route.js')],
  ['/api/me/summary', () => import('@/app/api/me/summary/route.js')],
  ['/api/me', () => import('@/app/api/me/route.js')],

  ['/api/companies/recommended', () => import('@/app/api/companies/recommended/route.js')],
  ['/api/companies/[slug]', () => import('@/app/api/companies/[slug]/route.js')],
  ['/api/companies', () => import('@/app/api/companies/route.js')],

  ['/api/templates/[id]', () => import('@/app/api/templates/[id]/route.js')],
  ['/api/templates', () => import('@/app/api/templates/route.js')],

  ['/api/documents/[id]', () => import('@/app/api/documents/[id]/route.js')],
  ['/api/documents', () => import('@/app/api/documents/route.js')],

  ['/api/portfolios/[id]', () => import('@/app/api/portfolios/[id]/route.js')],
  ['/api/portfolios', () => import('@/app/api/portfolios/route.js')],

  ['/api/posts/[id]/comments', () => import('@/app/api/posts/[id]/comments/route.js')],
  ['/api/posts/[id]', () => import('@/app/api/posts/[id]/route.js')],
  ['/api/posts', () => import('@/app/api/posts/route.js')],

  ['/api/comments/[id]', () => import('@/app/api/comments/[id]/route.js')],

  ['/api/interviews/[id]/qas', () => import('@/app/api/interviews/[id]/qas/route.js')],
  ['/api/interviews/[id]', () => import('@/app/api/interviews/[id]/route.js')],
  ['/api/interviews', () => import('@/app/api/interviews/route.js')],

  ['/api/profiles/[userId]/stats', () => import('@/app/api/profiles/[userId]/stats/route.js')],
  ['/api/profiles/[userId]', () => import('@/app/api/profiles/[userId]/route.js')],
];

const compiled = ROUTES.map(([pattern, load]) => {
  const names = [];
  const source = pattern
    .split('/')
    .map((segment) => {
      const dynamic = /^\[(.+)]$/.exec(segment);
      if (!dynamic) return segment;
      names.push(dynamic[1]);
      return '([^/]+)';
    })
    .join('/');
  return { pattern, load, names, regexp: new RegExp(`^${source}$`) };
});

function match(pathname) {
  for (const route of compiled) {
    const found = route.regexp.exec(pathname);
    if (!found) continue;
    const params = Object.fromEntries(
      route.names.map((name, index) => [name, decodeURIComponent(found[index + 1])])
    );
    return { route, params };
  }
  return null;
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', (chunk) => chunks.push(chunk));
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });
}

async function handle(nodeRequest, nodeResponse) {
  const url = new URL(nodeRequest.url, 'http://127.0.0.1');
  const found = match(url.pathname);

  if (!found) {
    nodeResponse.writeHead(404, { 'content-type': 'application/json' });
    nodeResponse.end(JSON.stringify({ error: { code: 'NO_ROUTE', message: url.pathname } }));
    return;
  }

  const routeModule = await found.route.load();
  const handler = routeModule[nodeRequest.method];

  if (!handler) {
    nodeResponse.writeHead(405, { 'content-type': 'application/json' });
    nodeResponse.end(JSON.stringify({ error: { code: 'METHOD_NOT_ALLOWED', message: nodeRequest.method } }));
    return;
  }

  const body = await readBody(nodeRequest);
  const headers = new Headers();
  if (nodeRequest.headers['content-type']) headers.set('content-type', nodeRequest.headers['content-type']);
  if (nodeRequest.headers.cookie) headers.set('cookie', nodeRequest.headers.cookie);

  const init = { method: nodeRequest.method, headers };
  if (body.length > 0) init.body = body;

  const request = new NextRequest(url, init);
  const user = userFromCookieHeader(nodeRequest.headers.cookie);

  const response = await runWithUser(user, () =>
    handler(request, { params: Promise.resolve(found.params) })
  );

  const payload = Buffer.from(await response.arrayBuffer());
  nodeResponse.writeHead(response.status, Object.fromEntries(response.headers));
  nodeResponse.end(payload.length > 0 ? payload : undefined);
}

export function startApiServer() {
  const server = createServer((req, res) => {
    handle(req, res).catch((error) => {
      nodeFailure(res, error);
    });
  });

  return new Promise((resolve) => {
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      resolve({
        baseUrl: `http://127.0.0.1:${port}`,
        close: () => new Promise((done) => server.close(done)),
      });
    });
  });
}

function nodeFailure(res, error) {
  res.writeHead(500, { 'content-type': 'application/json' });
  res.end(JSON.stringify({ error: { code: 'HARNESS_ERROR', message: String(error?.stack ?? error) } }));
}

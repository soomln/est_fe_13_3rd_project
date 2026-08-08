import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { ApiError } from '../../lib/api/errors';
import { apiFetch } from '../../lib/api/_fetch';

const jsonResponse = (payload, { status = 200, ok = status < 400 } = {}) => ({
  status,
  ok,
  json: async () => payload,
});

let fetchMock;

beforeEach(() => {
  fetchMock = vi.fn(async () => jsonResponse({ items: [] }));
  vi.stubGlobal('window', { location: { origin: 'http://localhost:3000' } });
  vi.stubGlobal('fetch', fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('ApiError', () => {
  it('can be built from a message alone', () => {
    const error = new ApiError('실패했습니다');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('ApiError');
    expect(error.message).toBe('실패했습니다');
    expect(error.code).toBeUndefined();
    expect(error.status).toBeUndefined();
  });

  it('carries code, status and cause', () => {
    const cause = new Error('원본');
    const error = new ApiError('실패', { code: 'NOT_FOUND', status: 404, cause });

    expect(error.code).toBe('NOT_FOUND');
    expect(error.status).toBe(404);
    expect(error.cause).toBe(cause);
  });
});

describe('apiFetch call site', () => {
  it('rejects immediately when called on the server', async () => {
    vi.stubGlobal('window', undefined);

    await expect(apiFetch('/api/me')).rejects.toThrowError(
      /클라이언트 컴포넌트에서만 호출할 수 있습니다/
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('throws an ApiError when it rejects', async () => {
    vi.stubGlobal('window', undefined);

    await expect(apiFetch('/api/me')).rejects.toBeInstanceOf(ApiError);
  });
});

describe('apiFetch query building', () => {
  it('requests the bare path when there is no query', async () => {
    await apiFetch('/api/me');

    expect(fetchMock).toHaveBeenCalledWith('/api/me', expect.any(Object));
  });

  it('appends the query as a query string', async () => {
    await apiFetch('/api/posts', { query: { type: 'review', page: 2 } });

    expect(fetchMock.mock.calls[0][0]).toBe('/api/posts?type=review&page=2');
  });

  it('drops undefined, null and empty strings', async () => {
    await apiFetch('/api/posts', {
      query: { a: undefined, b: null, c: '', d: 'keep' },
    });

    expect(fetchMock.mock.calls[0][0]).toBe('/api/posts?d=keep');
  });

  it('keeps 0 and false', async () => {
    await apiFetch('/api/posts', { query: { page: 0, mine: false } });

    expect(fetchMock.mock.calls[0][0]).toBe('/api/posts?page=0&mine=false');
  });

  it('leaves the bare path when every value is empty', async () => {
    await apiFetch('/api/posts', { query: { a: undefined, b: '' } });

    expect(fetchMock.mock.calls[0][0]).toBe('/api/posts');
  });

  it('encodes korean text and special characters', async () => {
    await apiFetch('/api/posts', { query: { q: '네이버 &' } });

    expect(fetchMock.mock.calls[0][0]).toContain('q=%EB%84%A4%EC%9D%B4%EB%B2%84+%26');
  });
});

describe('apiFetch request body', () => {
  it('sends no headers when there is no body', async () => {
    await apiFetch('/api/me');

    expect(fetchMock.mock.calls[0][1]).toEqual({
      method: 'GET',
      headers: undefined,
      body: undefined,
    });
  });

  it('serializes the body as JSON', async () => {
    await apiFetch('/api/posts', { method: 'POST', body: { title: '후기' } });

    expect(fetchMock.mock.calls[0][1]).toEqual({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: '후기' }),
    });
  });

  it('serializes a null body too', async () => {
    await apiFetch('/api/x', { method: 'POST', body: null });

    expect(fetchMock.mock.calls[0][1].body).toBe('null');
  });
});

describe('apiFetch response handling', () => {
  it('returns the payload on success', async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 'p1' }));

    await expect(apiFetch('/api/posts/p1')).resolves.toEqual({ id: 'p1' });
  });

  it('turns 204 into null', async () => {
    fetchMock.mockResolvedValue({ status: 204, ok: true, json: async () => ({}) });

    await expect(apiFetch('/api/me', { method: 'DELETE' })).resolves.toBeNull();
  });

  it('turns the server error envelope into an ApiError', async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ error: { code: 'NOT_FOUND', message: '글을 찾을 수 없습니다.' } }, { status: 404 })
    );

    await expect(apiFetch('/api/posts/x')).rejects.toMatchObject({
      name: 'ApiError',
      message: '글을 찾을 수 없습니다.',
      code: 'NOT_FOUND',
      status: 404,
    });
  });

  it('falls back to the status code when the body is not JSON', async () => {
    fetchMock.mockResolvedValue({
      status: 500,
      ok: false,
      json: async () => {
        throw new SyntaxError('not json');
      },
    });

    await expect(apiFetch('/api/posts')).rejects.toMatchObject({
      message: '요청에 실패했습니다. (500)',
      code: undefined,
      status: 500,
    });
  });

  it('builds a message even when the error envelope is empty', async () => {
    fetchMock.mockResolvedValue(jsonResponse({}, { status: 400 }));

    await expect(apiFetch('/api/posts')).rejects.toThrowError('요청에 실패했습니다. (400)');
  });

  it('resolves to null when a successful response is not JSON', async () => {
    fetchMock.mockResolvedValue({
      status: 200,
      ok: true,
      json: async () => {
        throw new SyntaxError('not json');
      },
    });

    await expect(apiFetch('/api/posts')).resolves.toBeNull();
  });
});

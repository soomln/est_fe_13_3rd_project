import { afterEach, describe, expect, it, vi } from 'vitest';

import { HttpError } from '../../lib/http/errors';
import { jsonError, jsonOk } from '../../lib/http/respond';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('jsonOk', () => {
  it('wraps a value in a 200 JSON response', async () => {
    const response = jsonOk({ hello: 'world' });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ hello: 'world' });
  });

  it('uses the status when one is given', async () => {
    const response = jsonOk({ id: 1 }, 201);
    expect(response.status).toBe(201);
  });

  it('answers undefined with a 204', () => {
    expect(jsonOk(undefined).status).toBe(204);
  });

  it('answers null with a 204 as well', () => {
    expect(jsonOk(null).status).toBe(204);
  });

  it('an empty array is 200, not 204', async () => {
    const response = jsonOk([]);
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual([]);
  });
});

describe('jsonError', () => {
  it('turns an HttpError into a code and message envelope', async () => {
    const response = jsonError(new HttpError(404, 'NOT_FOUND', '없음'));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({
      error: { code: 'NOT_FOUND', message: '없음' },
    });
  });

  it('does not log 4xx to the console', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

    jsonError(new HttpError(400, 'BAD_REQUEST', '잘못됨'));

    expect(spy).not.toHaveBeenCalled();
  });

  it('logs the original error for 5xx', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const raw = new Error('boom');

    const response = jsonError(raw);

    expect(response.status).toBe(500);
    expect(spy).toHaveBeenCalledWith('[api]', raw);
  });
});

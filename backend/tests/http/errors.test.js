import { describe, expect, it } from 'vitest';

import {
  HttpError,
  badRequest,
  describeError,
  forbidden,
  notFound,
  unauthorized,
} from '../../lib/http/errors';

describe('HttpError', () => {
  it('carries status, code and message as given', () => {
    const error = new HttpError(418, 'TEAPOT', '주전자');

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe('HttpError');
    expect(error.status).toBe(418);
    expect(error.code).toBe('TEAPOT');
    expect(error.message).toBe('주전자');
  });
});

describe('constructor helpers', () => {
  it.each([
    [badRequest, 400, 'BAD_REQUEST', '요청 형식이 올바르지 않습니다.'],
    [unauthorized, 401, 'NOT_AUTHENTICATED', '로그인이 필요합니다.'],
    [forbidden, 403, 'FORBIDDEN', '권한이 없습니다.'],
    [notFound, 404, 'NOT_FOUND', '데이터를 찾을 수 없습니다.'],
  ])('helper %# is built with its default message', (make, status, code, message) => {
    const error = make();
    expect(error.status).toBe(status);
    expect(error.code).toBe(code);
    expect(error.message).toBe(message);
  });

  it.each([badRequest, unauthorized, forbidden, notFound])(
    'overrides the message when one is given',
    (make) => {
      expect(make('커스텀').message).toBe('커스텀');
    }
  );
});

describe('describeError', () => {
  it('passes an HttpError through unchanged', () => {
    expect(describeError(new HttpError(403, 'FORBIDDEN', '안됨'))).toEqual({
      status: 403,
      code: 'FORBIDDEN',
      message: '안됨',
    });
  });

  it('maps DOCUMENT_LIMIT_EXCEEDED in the message to 409', () => {
    const result = describeError(new Error('DOCUMENT_LIMIT_EXCEEDED'));
    expect(result.status).toBe(409);
    expect(result.code).toBe('DOCUMENT_LIMIT_EXCEEDED');
    expect(result.message).toContain('10개까지');
  });

  it('also catches DOCUMENT_LIMIT_EXCEEDED in the hint', () => {
    expect(describeError({ hint: 'DOCUMENT_LIMIT_EXCEEDED' }).status).toBe(409);
  });

  it('maps NOT_AUTHENTICATED in the details to 401', () => {
    expect(describeError({ details: 'NOT_AUTHENTICATED' })).toEqual({
      status: 401,
      code: 'NOT_AUTHENTICATED',
      message: '로그인이 필요합니다.',
    });
  });

  it.each([
    ['23505', 409, 'DUPLICATE'],
    ['23503', 400, 'INVALID_REFERENCE'],
    ['23514', 400, 'INVALID_VALUE'],
    ['42501', 403, 'FORBIDDEN'],
    ['PGRST301', 403, 'FORBIDDEN'],
    ['PGRST116', 404, 'NOT_FOUND'],
    ['PGRST202', 500, 'SCHEMA_NOT_READY'],
    ['PGRST205', 500, 'SCHEMA_NOT_READY'],
  ])('maps Postgres code %s to %d', (code, status, mapped) => {
    const result = describeError({ code });
    expect(result.status).toBe(status);
    expect(result.code).toBe(mapped);
  });

  it('falls back to 500 INTERNAL_ERROR for unknown errors', () => {
    expect(describeError({ code: 'WAT' })).toEqual({
      status: 500,
      code: 'INTERNAL_ERROR',
      message: '서버 오류가 발생했습니다.',
    });
  });

  it('does not throw when given null', () => {
    expect(describeError(null).status).toBe(500);
  });

  it('DOCUMENT_LIMIT_EXCEEDED wins over the Postgres code', () => {
    const result = describeError({ code: '23505', message: 'DOCUMENT_LIMIT_EXCEEDED' });
    expect(result.code).toBe('DOCUMENT_LIMIT_EXCEEDED');
  });
});

describe('portfolio ownership from the RPC', () => {
  it('maps PORTFOLIO_NOT_MINE to 403', () => {
    expect(describeError({ message: 'PORTFOLIO_NOT_MINE' })).toEqual({
      status: 403,
      code: 'FORBIDDEN',
      message: '본인 포트폴리오만 수정할 수 있습니다.',
    });
  });
});

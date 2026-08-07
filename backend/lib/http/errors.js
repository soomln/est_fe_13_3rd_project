export class HttpError extends Error {
  constructor(status, code, message) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

export const badRequest = (m = '요청 형식이 올바르지 않습니다.') => new HttpError(400, 'BAD_REQUEST', m);
export const unauthorized = (m = '로그인이 필요합니다.') => new HttpError(401, 'NOT_AUTHENTICATED', m);
export const forbidden = (m = '권한이 없습니다.') => new HttpError(403, 'FORBIDDEN', m);
export const notFound = (m = '데이터를 찾을 수 없습니다.') => new HttpError(404, 'NOT_FOUND', m);

export function describeError(error) {
  if (error instanceof HttpError) {
    return { status: error.status, code: error.code, message: error.message };
  }

  const raw = `${error?.message ?? ''} ${error?.hint ?? ''} ${error?.details ?? ''}`;

  if (raw.includes('DOCUMENT_LIMIT_EXCEEDED')) {
    return {
      status: 409,
      code: 'DOCUMENT_LIMIT_EXCEEDED',
      message: '문서는 종류당 10개까지 만들 수 있습니다. 기존 문서를 삭제한 뒤 다시 시도해 주세요.',
    };
  }
  if (raw.includes('NOT_AUTHENTICATED')) {
    return { status: 401, code: 'NOT_AUTHENTICATED', message: '로그인이 필요합니다.' };
  }

  switch (error?.code) {
    case '23505':
      return { status: 409, code: 'DUPLICATE', message: '이미 존재하는 값입니다.' };
    case '23503':
      return { status: 400, code: 'INVALID_REFERENCE', message: '연결된 데이터를 찾을 수 없습니다.' };
    case '23514':
      return { status: 400, code: 'INVALID_VALUE', message: '입력값이 허용된 범위를 벗어났습니다.' };
    case '42501':
    case 'PGRST301':
      return { status: 403, code: 'FORBIDDEN', message: '권한이 없습니다. 로그인 상태를 확인해 주세요.' };
    case 'PGRST116':
      return { status: 404, code: 'NOT_FOUND', message: '데이터를 찾을 수 없습니다.' };
    case 'PGRST202':
    case 'PGRST205':
      return {
        status: 500,
        code: 'SCHEMA_NOT_READY',
        message: 'DB 스키마가 아직 적용되지 않았습니다. 마이그레이션을 먼저 실행해 주세요.',
      };
    default:
      return { status: 500, code: 'INTERNAL_ERROR', message: '서버 오류가 발생했습니다.' };
  }
}

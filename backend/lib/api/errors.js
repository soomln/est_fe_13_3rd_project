export class ApiError extends Error {
  constructor(message, { code, status, cause } = {}) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.cause = cause;
  }
}

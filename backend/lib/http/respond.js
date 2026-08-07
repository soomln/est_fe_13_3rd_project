import { NextResponse } from 'next/server';

import { describeError } from './errors';

export function jsonOk(data, status = 200) {
  if (data === undefined || data === null) {
    return new NextResponse(null, { status: 204 });
  }
  return NextResponse.json(data, { status });
}

export function jsonError(error) {
  const { status, code, message } = describeError(error);

  if (status >= 500) {
    console.error('[api]', error);
  }

  return NextResponse.json({ error: { code, message } }, { status });
}

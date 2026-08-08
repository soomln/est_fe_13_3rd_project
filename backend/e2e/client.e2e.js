import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { resetWorld, signInAs, startWorld, stopWorld, USERS } from './support/harness';
import { browserState, failNextOAuth, failNextSignOut, failNextUpload } from './support/browser';
import { failNextQuery } from './support/supabase';
import { listCompanies } from '@backend/lib/api/companies';
import { getCodes, labelOf } from '@backend/lib/api/codes';
import { getMyProfile, uploadAvatar } from '@backend/lib/api/profile';
import { createPortfolio, uploadPortfolioImage, uploadPortfolioImages } from '@backend/lib/api/portfolio';
import { signInWith, signOut } from '@backend/lib/api/auth';

let savedWindow;

const withoutBrowser = (fn) => async () => {
  savedWindow = globalThis.window;
  delete globalThis.window;
  try {
    await fn();
  } finally {
    globalThis.window = savedWindow;
  }
};

beforeAll(startWorld);
afterAll(stopWorld);
beforeEach(resetWorld);

afterEach(() => {
  if (savedWindow && !globalThis.window) globalThis.window = savedWindow;
});

describe('calling the data layer from the wrong place', () => {
  it(
    'refuses to fetch during server rendering',
    withoutBrowser(async () => {
      await expect(listCompanies()).rejects.toThrowError(/클라이언트 컴포넌트에서만/);
    })
  );

  it(
    'refuses to start a login during server rendering',
    withoutBrowser(async () => {
      await expect(signInWith('github')).rejects.toThrowError(/브라우저에서만/);
      expect(browserState().oauth).toHaveLength(0);
    })
  );
});

describe('when the auth provider is unhappy', () => {
  it('explains a failed login start', async () => {
    failNextOAuth({ message: 'provider disabled' });

    await expect(signInWith('google')).rejects.toThrowError(
      'google 로그인을 시작하지 못했습니다: provider disabled'
    );
  });

  it('explains a failed sign out', async () => {
    failNextSignOut({ message: 'network down' });

    await expect(signOut()).rejects.toThrowError('로그아웃에 실패했습니다: network down');
  });

  it('signs out cleanly when the provider is healthy', async () => {
    await expect(signOut()).resolves.toBeUndefined();

    expect(browserState().signOuts).toBe(1);
  });
});

describe('code labels', () => {
  it('asks for nothing when the code is empty', async () => {
    await expect(labelOf('job_role', '')).resolves.toBe('');
    await expect(labelOf('job_role', null)).resolves.toBe('');
  });

  it('caches a group after the first lookup', async () => {
    const first = await getCodes('job_role');
    const second = await getCodes('job_role');

    expect(second).toBe(first);
  });
});

describe('unexpected profile failures', () => {
  it('rethrows anything that is not a missing or private profile', async () => {
    signInAs(USERS.a);
    failNextQuery('profiles', { code: 'XX000', message: 'connection reset' });

    await expect(getMyProfile()).rejects.toMatchObject({ status: 500 });
  });

  it('reports a not-authenticated trigger error as 401', async () => {
    signInAs(USERS.a);
    failNextQuery('profiles', { message: 'NOT_AUTHENTICATED' });

    await expect(getMyProfile()).resolves.toBeNull();
  });
});

describe('files with awkward names', () => {
  beforeEach(() => signInAs(USERS.a));

  it('falls back to png when the avatar has no extension', async () => {
    await uploadAvatar({ name: '', type: 'image/png', size: 10 });

    expect(browserState().uploads[0].path).toMatch(/\.png$/);
  });

  it('falls back to png when a portfolio image has no extension', async () => {
    const draft = await createPortfolio({ title: '작업' });

    await uploadPortfolioImage(draft.id, { name: '', type: 'image/png', size: 10 });

    expect(browserState().uploads[0].path).toMatch(/\.png$/);
  });

  it('uploads nothing when no files are chosen', async () => {
    await expect(uploadPortfolioImages('f1')).resolves.toEqual([]);
    expect(browserState().uploads).toHaveLength(0);
  });

  it('surfaces a storage failure while uploading a batch', async () => {
    failNextUpload({ message: 'disk full' });

    await expect(
      uploadPortfolioImages('f1', [{ name: 'a.png', type: 'image/png', size: 10 }])
    ).rejects.toThrowError(/disk full/);
  });
});

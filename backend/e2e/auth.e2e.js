import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { resetWorld, signInAs, signOutOfBrowser, startWorld, stopWorld, USERS } from './support/harness';
import { browserState } from './support/browser';
import {
  OAUTH_PROVIDERS,
  deleteMyAccount,
  getCurrentUser,
  onAuthChange,
  signInWith,
  signOut,
} from '@backend/lib/api/auth';
import { getMyAccount, getMySummary } from '@backend/lib/api/mypage';
import { createDocument, listMyDocuments } from '@backend/lib/api/documents';
import { createPost } from '@backend/lib/api/posts';
import { toggleCompanyBookmark } from '@backend/lib/api/companies';
import { rows } from './support/database';

beforeAll(startWorld);
afterAll(stopWorld);
beforeEach(resetWorld);

describe('social sign-in', () => {
  it('offers github, google and kakao', () => {
    expect(OAUTH_PROVIDERS.map((p) => p.id)).toEqual(['github', 'google', 'kakao']);
  });

  it('sends the visitor to the provider with a callback url', async () => {
    await signInWith('github');

    expect(browserState().oauth).toEqual([
      { provider: 'github', redirectTo: expect.stringContaining('/auth/callback?next=%2F') },
    ]);
  });

  it('remembers where to return after login', async () => {
    await signInWith('kakao', { next: '/mypage' });

    expect(browserState().oauth[0].redirectTo).toContain('next=%2Fmypage');
  });

  it('notifies subscribers when the session changes', () => {
    const seen = [];
    const stop = onAuthChange((user) => seen.push(user));

    const [entry] = browserState().listeners;
    entry.handler('SIGNED_IN', { user: { id: USERS.a.id, email: USERS.a.email } });
    entry.handler('SIGNED_OUT', null);
    stop();

    expect(seen).toEqual([{ id: USERS.a.id, email: USERS.a.email }, null]);
    expect(entry.active).toBe(false);
  });

  it('clears the browser session on sign out', async () => {
    await signOut();

    expect(browserState().signOuts).toBe(1);
  });
});

describe('who am I', () => {
  it('returns no user for a visitor', async () => {
    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it('returns the signed-in user', async () => {
    signInAs(USERS.a);

    await expect(getCurrentUser()).resolves.toEqual({ id: USERS.a.id, email: USERS.a.email });
  });

  it('forgets the user once the session is dropped', async () => {
    signInAs(USERS.a);
    signOutOfBrowser();

    await expect(getCurrentUser()).resolves.toBeNull();
  });
});

describe('account settings', () => {
  it('rejects a visitor', async () => {
    await expect(getMyAccount()).rejects.toMatchObject({ status: 401 });
  });

  it('shows the login email, join date and providers', async () => {
    signInAs(USERS.a);

    await expect(getMyAccount()).resolves.toMatchObject({
      id: USERS.a.id,
      email: USERS.a.email,
      providers: ['github'],
      createdAt: expect.any(String),
    });
  });

  it('never exposes the login email through the public profile', async () => {
    signInAs(USERS.a);
    await getMyAccount();

    const [profile] = rows('profiles');
    expect(profile.email).toBeNull();
  });
});

describe('leaving the service', () => {
  it('rejects a visitor', async () => {
    await expect(deleteMyAccount()).rejects.toMatchObject({ status: 401 });
  });

  it('removes every trace of the member and signs the browser out', async () => {
    signInAs(USERS.a);
    await createDocument({ docType: 'resume', title: 'My resume' });
    await createPost({ postType: 'review', title: 'My review' });
    await toggleCompanyBookmark(rows('companies')[0].id);

    await deleteMyAccount();

    expect(rows('documents')).toHaveLength(0);
    expect(rows('posts')).toHaveLength(0);
    expect(rows('reactions')).toHaveLength(0);
    expect(rows('profiles')).toHaveLength(0);
    expect(browserState().signOuts).toBe(1);
  });

  it('leaves other members untouched', async () => {
    signInAs(USERS.b);
    await createDocument({ docType: 'resume', title: 'B keeps this' });

    signInAs(USERS.a);
    await createDocument({ docType: 'resume', title: 'A loses this' });
    await deleteMyAccount();

    signInAs(USERS.b);
    const listed = await listMyDocuments();

    expect(listed.items.map((d) => d.title)).toEqual(['B keeps this']);
  });

  it('starts a returning member from an empty summary', async () => {
    signInAs(USERS.a);
    await createDocument({ docType: 'resume', title: 'gone' });
    await deleteMyAccount();

    signInAs(USERS.a);
    const summary = await getMySummary();

    expect(summary.stats.docCount).toBe(0);
  });
});

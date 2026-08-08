import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import { resetWorld, signInAs, signOutOfBrowser, startWorld, stopWorld, USERS } from './support/harness';
import { browserState, failNextUpload } from './support/browser';
import { rows } from './support/database';
import {
  getMyProfile,
  getMyProfileStats,
  getProfile,
  getProfileStats,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} from '@backend/lib/api/profile';
import { getMyAccount, getMySummary } from '@backend/lib/api/mypage';
import { createDocument } from '@backend/lib/api/documents';
import { createPortfolio, publishPortfolio, togglePortfolioBookmark } from '@backend/lib/api/portfolio';
import { createPost, togglePostScrap } from '@backend/lib/api/posts';
import { toggleCompanyBookmark } from '@backend/lib/api/companies';

const avatarFile = (name = 'me.PNG', type = 'image/png', size = 1024) => ({ name, type, size });

beforeAll(startWorld);
afterAll(stopWorld);
beforeEach(resetWorld);

describe('reading a profile', () => {
  it('lets anyone read another member profile', async () => {
    signInAs(USERS.a);
    await updateProfile({ name: '장도담', desired_role: '백엔드 개발자' });
    signOutOfBrowser();

    await expect(getProfile(USERS.a.id)).resolves.toMatchObject({
      name: '장도담',
      desired_role: '백엔드 개발자',
    });
  });

  it('answers 404 for a member who does not exist', async () => {
    await expect(getProfile('missing-user')).rejects.toMatchObject({ status: 404 });
  });

  it('returns nothing rather than throwing for a visitor', async () => {
    await expect(getMyProfile()).resolves.toBeNull();
  });

  it('reads my own profile through me', async () => {
    signInAs(USERS.a);

    await expect(getMyProfile()).resolves.toMatchObject({ id: USERS.a.id });
  });
});

describe('editing my profile', () => {
  beforeEach(() => signInAs(USERS.a));

  it('saves the full form in one call', async () => {
    const saved = await updateProfile({
      name: '장도담',
      desired_role: '백엔드 개발자',
      career_level: 'junior',
      github_url: 'https://github.com/dodam',
      bio: '안녕하세요',
      skill_codes: ['react'],
      interest_codes: ['be'],
    });

    expect(saved).toMatchObject({
      name: '장도담',
      career_level: 'junior',
      skill_codes: ['react'],
    });
  });

  it('rejects a bio over a thousand characters', async () => {
    await expect(updateProfile({ bio: 'ㄱ'.repeat(1001) })).rejects.toMatchObject({ status: 400 });
  });

  it('accepts a bio of exactly a thousand characters', async () => {
    await expect(updateProfile({ bio: 'ㄱ'.repeat(1000) })).resolves.toMatchObject({
      id: USERS.a.id,
    });
  });

  it('rejects a list field that is not a list', async () => {
    await expect(updateProfile({ skill_codes: 'react' })).rejects.toMatchObject({ status: 400 });
  });

  it('rejects an edit with nothing editable in it', async () => {
    await expect(updateProfile({ id: 'hack' })).rejects.toMatchObject({ status: 400 });
  });

  it('never lets one member edit another profile', async () => {
    await updateProfile({ name: '장도담' });

    signInAs(USERS.b);
    await updateProfile({ name: 'User B' });

    await expect(getProfile(USERS.a.id)).resolves.toMatchObject({ name: '장도담' });
  });

  it('turns a visitor away', async () => {
    signOutOfBrowser();

    await expect(updateProfile({ name: 'x' })).rejects.toMatchObject({ status: 401 });
  });
});

describe('the profile photo', () => {
  beforeEach(() => signInAs(USERS.a));

  it('uploads into my own folder and saves the url on the profile', async () => {
    const url = await uploadAvatar(avatarFile());

    expect(browserState().uploads[0]).toMatchObject({ bucket: 'avatars' });
    expect(browserState().uploads[0].path).toMatch(new RegExp(`^${USERS.a.id}/avatar-\\d+\\.png$`));
    await expect(getMyProfile()).resolves.toMatchObject({ avatar_url: url });
  });

  it('rejects a file type outside the allow list', async () => {
    await expect(uploadAvatar(avatarFile('a.gif', 'image/gif'))).rejects.toThrowError(
      /JPG, PNG, WEBP/
    );
  });

  it('rejects a file over two megabytes', async () => {
    await expect(
      uploadAvatar(avatarFile('a.png', 'image/png', 2 * 1024 * 1024 + 1))
    ).rejects.toThrowError(/2MB/);
  });

  it('surfaces a storage failure', async () => {
    failNextUpload({ message: 'bucket missing' });

    await expect(uploadAvatar(avatarFile())).rejects.toThrowError(/bucket missing/);
  });

  it('clears the photo again', async () => {
    await uploadAvatar(avatarFile());

    await expect(removeAvatar()).resolves.toBeNull();
    await expect(getMyProfile()).resolves.toMatchObject({ avatar_url: null });
  });

  it('turns a visitor away', async () => {
    signOutOfBrowser();

    await expect(uploadAvatar(avatarFile())).rejects.toMatchObject({ status: 401 });
  });
});

describe('the profile counters', () => {
  it('starts at zero for a fresh member', async () => {
    signInAs(USERS.a);

    const stats = await getMyProfileStats();

    expect(Object.values(stats).every((v) => v === 0)).toBe(true);
  });

  it('counts everything the member has made and saved', async () => {
    signInAs(USERS.b);
    const theirs = await createPortfolio({ title: 'B 작업' });
    await publishPortfolio(theirs.id);
    const theirPost = await createPost({ postType: 'review', title: 'B 후기' });

    signInAs(USERS.a);
    await createDocument({ docType: 'resume', title: '이력서' });
    const mine = await createPortfolio({ title: 'A 초안' });
    await createPost({ postType: 'qbank', questions: ['Q'] });
    await toggleCompanyBookmark(rows('companies')[0].id);
    await togglePortfolioBookmark(theirs.id);
    await togglePostScrap(theirPost.id);

    const summary = await getMySummary();

    expect(summary.stats).toMatchObject({
      docCount: 1,
      portfolioCount: 1,
      draftPortfolioCount: 1,
      publishedPortfolioCount: 0,
      myQbankCount: 1,
      myReviewCount: 0,
      scrappedCompanyCount: 1,
      scrappedPortfolioCount: 1,
      scrappedPostCount: 1,
    });
    expect(mine.status).toBe('draft');
  });

  it('shows only public counters for another member', async () => {
    signInAs(USERS.a);
    await createDocument({ docType: 'resume', title: '비공개 이력서' });
    await toggleCompanyBookmark(rows('companies')[0].id);
    const draft = await createPortfolio({ title: '초안' });
    await publishPortfolio(draft.id);

    signInAs(USERS.b);
    const stats = await getProfileStats(USERS.a.id);

    expect(stats).toMatchObject({
      docCount: 0,
      scrappedCompanyCount: 0,
      publishedPortfolioCount: 1,
      portfolioCount: 1,
    });
  });

  it('answers with zeros for a member id that does not exist', async () => {
    const stats = await getProfileStats('no-such-member');

    expect(stats).toEqual({
      docCount: 0,
      portfolioCount: 0,
      publishedPortfolioCount: 0,
      draftPortfolioCount: 0,
      interviewScrapCount: 0,
      scrappedCompanyCount: 0,
      scrappedPostCount: 0,
      scrappedPortfolioCount: 0,
      myReviewCount: 0,
      myQbankCount: 0,
      finishedInterviewCount: 0,
    });
  });

  it('turns a visitor away from my own counters', async () => {
    await expect(getMyProfileStats()).rejects.toMatchObject({ status: 401 });
  });

  it('lets a visitor read another member counters', async () => {
    signInAs(USERS.a);
    signOutOfBrowser();

    await expect(getProfileStats(USERS.a.id)).resolves.toMatchObject({ docCount: 0 });
  });
});

describe('the account tab', () => {
  it('brings the profile and every counter back in one round trip', async () => {
    signInAs(USERS.a);
    await updateProfile({ name: '장도담' });
    await createDocument({ docType: 'resume', title: '이력서' });

    const [summary, account] = await Promise.all([getMySummary(), getMyAccount()]);

    expect(summary.profile).toMatchObject({ name: '장도담' });
    expect(summary.stats.docCount).toBe(1);
    expect(account).toMatchObject({ id: USERS.a.id, email: USERS.a.email });
  });

  it('turns a visitor away', async () => {
    await expect(getMySummary()).rejects.toMatchObject({ status: 401 });
  });
});

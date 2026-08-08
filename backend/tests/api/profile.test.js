import { beforeEach, describe, expect, it, vi } from 'vitest';

import { createStorageStub } from '../helpers/supabase';
import { mockApiFetch } from '../helpers/routeHarness';

vi.mock('../../lib/api/_fetch', () => ({ apiFetch: vi.fn() }));
vi.mock('../../lib/supabase/client', () => ({ createClient: vi.fn() }));
vi.mock('../../lib/api/auth', () => ({ getCurrentUser: vi.fn() }));

const { apiFetch } = await import('../../lib/api/_fetch');
const { createClient } = await import('../../lib/supabase/client');
const { getCurrentUser } = await import('../../lib/api/auth');
const { ApiError } = await import('../../lib/api/errors');
const {
  getMyProfile,
  getMyProfileStats,
  getProfile,
  getProfileStats,
  removeAvatar,
  updateProfile,
  uploadAvatar,
} = await import('../../lib/api/profile');

const file = ({ type = 'image/png', size = 1024, name = 'photo.PNG' } = {}) => ({
  type,
  size,
  name,
});

let storage;

beforeEach(() => {
  apiFetch.mockReset();
  getCurrentUser.mockResolvedValue({ id: 'u1' });
  storage = createStorageStub();
  createClient.mockReturnValue({ storage });
});

describe('getProfile', () => {
  it('encodes the id before fetching', async () => {
    mockApiFetch(apiFetch, { 'GET /api/profiles/u%201': { id: 'u 1' } });

    await expect(getProfile('u 1')).resolves.toEqual({ id: 'u 1' });
  });
});

describe('getMyProfile', () => {
  it('returns my profile', async () => {
    mockApiFetch(apiFetch, { 'GET /api/profiles/me': { id: 'u1' } });

    await expect(getMyProfile()).resolves.toEqual({ id: 'u1' });
  });

  it('returns null when signed out (401)', async () => {
    apiFetch.mockRejectedValue(new ApiError('로그인 필요', { status: 401 }));

    await expect(getMyProfile()).resolves.toBeNull();
  });

  it('returns null when the profile is missing (404)', async () => {
    apiFetch.mockRejectedValue(new ApiError('없음', { status: 404 }));

    await expect(getMyProfile()).resolves.toBeNull();
  });

  it('rethrows any other status code', async () => {
    apiFetch.mockRejectedValue(new ApiError('서버 오류', { status: 500 }));

    await expect(getMyProfile()).rejects.toThrowError('서버 오류');
  });

  it('rethrows errors that are not ApiError', async () => {
    apiFetch.mockRejectedValue(new TypeError('네트워크'));

    await expect(getMyProfile()).rejects.toBeInstanceOf(TypeError);
  });
});

describe('updateProfile', () => {
  it('updates my profile with a PATCH', async () => {
    mockApiFetch(apiFetch, { 'PATCH /api/profiles/me': { id: 'u1', name: '새이름' } });

    await expect(updateProfile({ name: '새이름' })).resolves.toMatchObject({ name: '새이름' });
    expect(apiFetch).toHaveBeenCalledWith('/api/profiles/me', {
      method: 'PATCH',
      body: { name: '새이름' },
    });
  });
});

describe('uploadAvatar', () => {
  it('rejects with 401 when signed out', async () => {
    getCurrentUser.mockResolvedValue(null);

    await expect(uploadAvatar(file())).rejects.toMatchObject({ status: 401 });
    expect(storage.from).not.toHaveBeenCalled();
  });

  it('rejects a disallowed file type', async () => {
    await expect(uploadAvatar(file({ type: 'image/gif' }))).rejects.toThrowError(
      'JPG, PNG, WEBP 이미지만 올릴 수 있습니다.'
    );
  });

  it.each(['image/jpeg', 'image/png', 'image/webp'])('%s is allowed', async (type) => {
    await expect(uploadAvatar(file({ type }))).resolves.toEqual(expect.any(String));
  });

  it('rejects a file larger than 2MB', async () => {
    await expect(uploadAvatar(file({ size: 2 * 1024 * 1024 + 1 }))).rejects.toThrowError(
      '프로필 사진은 2MB 이하만 올릴 수 있습니다.'
    );
  });

  it('accepts a file of exactly 2MB', async () => {
    await expect(uploadAvatar(file({ size: 2 * 1024 * 1024 }))).resolves.toEqual(
      expect.any(String)
    );
  });

  it('stores under the own folder with a lowercased extension', async () => {
    await uploadAvatar(file({ name: 'photo.PNG' }));

    expect(storage.buckets).toEqual(['avatars', 'avatars']);
    expect(storage.uploads[0].path).toMatch(/^u1\/avatar-\d+\.png$/);
    expect(storage.uploads[0].options).toEqual({ cacheControl: '3600', upsert: false });
  });

  it('falls back to png when there is no extension', async () => {
    await uploadAvatar(file({ name: '' }));

    expect(storage.uploads[0].path).toMatch(/\.png$/);
  });

  it('wraps an upload failure in ApiError', async () => {
    const uploadError = { message: 'quota exceeded' };
    storage = createStorageStub({ uploadError });
    createClient.mockReturnValue({ storage });

    await expect(uploadAvatar(file())).rejects.toMatchObject({
      name: 'ApiError',
      message: '사진 업로드에 실패했습니다: quota exceeded',
      cause: uploadError,
    });
  });

  it('saves the public url on the profile and returns it', async () => {
    mockApiFetch(apiFetch, { 'PATCH /api/profiles/me': { id: 'u1' } });

    const url = await uploadAvatar(file());

    expect(url).toContain('https://cdn.test/x.png#u1/avatar-');
    expect(apiFetch).toHaveBeenCalledWith('/api/profiles/me', {
      method: 'PATCH',
      body: { avatar_url: url },
    });
  });
});

describe('removeAvatar', () => {
  it('clears the avatar by setting it to null', async () => {
    mockApiFetch(apiFetch, { 'PATCH /api/profiles/me': { id: 'u1' } });

    await expect(removeAvatar()).resolves.toBeNull();
    expect(apiFetch).toHaveBeenCalledWith('/api/profiles/me', {
      method: 'PATCH',
      body: { avatar_url: null },
    });
  });
});

describe('getProfileStats', () => {
  it('requests the stats path', async () => {
    mockApiFetch(apiFetch, { 'GET /api/profiles/u1/stats': { docCount: 4 } });

    await expect(getProfileStats('u1')).resolves.toEqual({ docCount: 4 });
  });

  it('requests my own stats with me', async () => {
    mockApiFetch(apiFetch, { 'GET /api/profiles/me/stats': { docCount: 0 } });

    await expect(getMyProfileStats()).resolves.toEqual({ docCount: 0 });
  });
});

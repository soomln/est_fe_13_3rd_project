import { UPLOAD_LIMIT } from '../constants';
import { createClient } from '../supabase/client';
import { apiFetch } from './_fetch';
import { ApiError } from './errors';
import { getCurrentUser } from './auth';

export async function getProfile(userId) {
  return apiFetch(`/api/profiles/${encodeURIComponent(userId)}`);
}

export async function getMyProfile() {
  try {
    return await getProfile('me');
  } catch (e) {
    if (e instanceof ApiError && (e.status === 401 || e.status === 404)) return null;
    throw e;
  }
}

export async function updateProfile(patch) {
  return apiFetch('/api/profiles/me', { method: 'PATCH', body: patch });
}

export async function uploadAvatar(file) {
  const user = await getCurrentUser();
  if (!user) throw new ApiError('로그인이 필요합니다.', { status: 401 });

  const { maxBytes, mimes } = UPLOAD_LIMIT.avatar;
  if (!mimes.includes(file.type)) {
    throw new ApiError('JPG, PNG, WEBP 이미지만 올릴 수 있습니다.');
  }
  if (file.size > maxBytes) {
    throw new ApiError(`프로필 사진은 ${maxBytes / 1024 / 1024}MB 이하만 올릴 수 있습니다.`);
  }

  const supabase = createClient();
  const ext = file.name.split('.').pop()?.toLowerCase() || 'png';

  const path = `${user.id}/avatar-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from('avatars').upload(path, file, {
    cacheControl: '3600',
    upsert: false,
  });
  if (error) throw new ApiError(`사진 업로드에 실패했습니다: ${error.message}`, { cause: error });

  const {
    data: { publicUrl },
  } = supabase.storage.from('avatars').getPublicUrl(path);

  await updateProfile({ avatar_url: publicUrl });
  return publicUrl;
}

export async function removeAvatar() {
  await updateProfile({ avatar_url: null });
  return null;
}

export async function getProfileStats(userId) {
  return apiFetch(`/api/profiles/${encodeURIComponent(userId)}/stats`);
}

export async function getMyProfileStats() {
  return getProfileStats('me');
}

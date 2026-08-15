export const DOCUMENT_BUCKET = 'documents';

export const MY_BUCKETS = ['documents', 'portfolios', 'avatars'];

export const DRAFT_IMAGE_TTL_MS = 24 * 60 * 60 * 1000;

const isFolder = (entry) => entry.id == null;

const stamp = (entry) => Date.parse(entry.created_at ?? '') || 0;

async function children(supabase, bucket, prefix) {
  const { data } = await supabase.storage.from(bucket).list(prefix);
  return data ?? [];
}

async function removePaths(supabase, bucket, paths) {
  if (paths.length === 0) return 0;
  await supabase.storage.from(bucket).remove(paths);
  return paths.length;
}

export async function removeFolder(supabase, bucket, prefix) {
  const entries = await children(supabase, bucket, prefix);

  let removed = 0;
  const files = [];

  for (const entry of entries) {
    if (isFolder(entry)) {
      removed += await removeFolder(supabase, bucket, `${prefix}/${entry.name}`);
    } else {
      files.push(`${prefix}/${entry.name}`);
    }
  }

  return removed + (await removePaths(supabase, bucket, files));
}

export async function removeDocumentImages(supabase, userId, documentIds) {
  let removed = 0;
  for (const id of documentIds) {
    removed += await removeFolder(supabase, DOCUMENT_BUCKET, `${userId}/${id}`);
  }
  return removed;
}

export async function sweepOrphanDocumentImages(supabase, userId, keepIds, now = Date.now()) {
  const keep = new Set(keepIds);
  const folders = (await children(supabase, DOCUMENT_BUCKET, userId)).filter(
    (entry) => isFolder(entry) && !keep.has(entry.name)
  );

  let removed = 0;
  for (const folder of folders) {
    const prefix = `${userId}/${folder.name}`;
    const files = await children(supabase, DOCUMENT_BUCKET, prefix);
    if (files.length === 0) continue;

    const newest = Math.max(...files.map(stamp));
    if (now - newest < DRAFT_IMAGE_TTL_MS) continue;

    removed += await removePaths(
      supabase,
      DOCUMENT_BUCKET,
      files.map((file) => `${prefix}/${file.name}`)
    );
  }
  return removed;
}

export async function removeAllMyFiles(supabase, userId) {
  let removed = 0;
  for (const bucket of MY_BUCKETS) {
    removed += await removeFolder(supabase, bucket, userId);
  }
  return removed;
}

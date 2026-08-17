import { beforeEach, describe, expect, it } from 'vitest';

import { createStorageStub } from '../helpers/supabase';
import {
  DRAFT_IMAGE_TTL_MS,
  removeAllMyFiles,
  removeFolder,
  sweepOrphanDocumentImages,
} from '../../lib/routes/storage';

const folder = (name, created_at) => ({ name, folder: true, created_at });
const file = (name, created_at) => ({ name, created_at });

const NOW = Date.parse('2026-08-16T12:00:00Z');
const fresh = new Date(NOW - 60 * 1000).toISOString();
const stale = new Date(NOW - DRAFT_IMAGE_TTL_MS - 1000).toISOString();

let storage;
const supabase = () => ({ storage });

describe('removeFolder', () => {
  beforeEach(() => {
    storage = createStorageStub({
      files: {
        'u1/d1': [file('a.png'), file('b.png')],
      },
    });
  });

  it('removes every file directly under the prefix', async () => {
    const removed = await removeFolder(supabase(), 'documents', 'u1/d1');

    expect(removed).toBe(2);
    expect(storage.removed).toEqual(['u1/d1/a.png', 'u1/d1/b.png']);
  });

  it('does not call remove for an empty folder', async () => {
    await removeFolder(supabase(), 'documents', 'u1/empty');

    expect(storage.bucket.remove).not.toHaveBeenCalled();
  });

  it('survives a bucket that answers with nothing', async () => {
    storage = createStorageStub({ files: { 'u1/d1': null } });

    await expect(removeFolder(supabase(), 'documents', 'u1/d1')).resolves.toBe(0);
  });

  it('descends into nested folders', async () => {
    storage = createStorageStub({
      files: {
        u1: [folder('d1'), file('avatar.png')],
        'u1/d1': [file('a.png')],
      },
    });

    const removed = await removeFolder(supabase(), 'documents', 'u1');

    expect(removed).toBe(2);
    expect(storage.removed).toEqual(['u1/d1/a.png', 'u1/avatar.png']);
  });
});

describe('sweepOrphanDocumentImages', () => {
  beforeEach(() => {
    storage = createStorageStub({
      files: {
        u1: [folder('kept'), folder('orphan')],
        'u1/kept': [file('a.png', stale)],
        'u1/orphan': [file('b.png', stale)],
      },
    });
  });

  it('removes a folder with no document behind it', async () => {
    const removed = await sweepOrphanDocumentImages(supabase(), 'u1', ['kept'], NOW);

    expect(removed).toBe(1);
    expect(storage.removed).toEqual(['u1/orphan/b.png']);
  });

  it('never touches a folder that still has its document', async () => {
    await sweepOrphanDocumentImages(supabase(), 'u1', ['kept', 'orphan'], NOW);

    expect(storage.removed).toEqual([]);
  });

  it('spares a draft that is still being written', async () => {
    storage = createStorageStub({
      files: {
        u1: [folder('writing-now')],
        'u1/writing-now': [file('b.png', fresh)],
      },
    });

    await sweepOrphanDocumentImages(supabase(), 'u1', [], NOW);

    expect(storage.removed).toEqual([]);
  });

  it('judges a folder by its newest file', async () => {
    storage = createStorageStub({
      files: {
        u1: [folder('mixed')],
        'u1/mixed': [file('old.png', stale), file('new.png', fresh)],
      },
    });

    await sweepOrphanDocumentImages(supabase(), 'u1', [], NOW);

    expect(storage.removed).toEqual([]);
  });

  it('sweeps once the newest file is past the deadline', async () => {
    storage = createStorageStub({
      files: {
        u1: [folder('mixed')],
        'u1/mixed': [file('old.png', stale), file('new.png', stale)],
      },
    });

    await sweepOrphanDocumentImages(supabase(), 'u1', [], NOW);

    expect(storage.removed).toEqual(['u1/mixed/old.png', 'u1/mixed/new.png']);
  });

  it('ignores stray files sitting outside any folder', async () => {
    storage = createStorageStub({ files: { u1: [file('loose.png', stale)] } });

    await sweepOrphanDocumentImages(supabase(), 'u1', [], NOW);

    expect(storage.removed).toEqual([]);
  });

  it('sweeps a folder whose files carry no timestamp', async () => {
    storage = createStorageStub({
      files: { u1: [folder('undated')], 'u1/undated': [{ name: 'b.png', created_at: null }] },
    });

    await sweepOrphanDocumentImages(supabase(), 'u1', [], NOW);

    expect(storage.removed).toEqual(['u1/undated/b.png']);
  });

  it('skips an empty folder', async () => {
    storage = createStorageStub({ files: { u1: [folder('empty')] } });

    await sweepOrphanDocumentImages(supabase(), 'u1', [], NOW);

    expect(storage.bucket.remove).not.toHaveBeenCalled();
  });
});

describe('removeAllMyFiles', () => {
  it('clears the user folder in every bucket they own', async () => {
    storage = createStorageStub({
      files: {
        u1: [folder('d1'), file('avatar-1.png')],
        'u1/d1': [file('a.png')],
      },
    });

    await removeAllMyFiles(supabase(), 'u1');

    expect(storage.buckets).toContain('documents');
    expect(storage.buckets).toContain('portfolios');
    expect(storage.buckets).toContain('avatars');
  });

  it('reports how many files it removed', async () => {
    storage = createStorageStub({ files: { u1: [file('avatar-1.png')] } });

    await expect(removeAllMyFiles(supabase(), 'u1')).resolves.toBe(3);
  });
});

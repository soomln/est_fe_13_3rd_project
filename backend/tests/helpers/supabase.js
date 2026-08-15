import { vi } from 'vitest';

const CHAINABLE = [
  'select',
  'insert',
  'update',
  'upsert',
  'delete',
  'eq',
  'neq',
  'gt',
  'gte',
  'lt',
  'lte',
  'like',
  'ilike',
  'is',
  'in',
  'contains',
  'containedBy',
  'overlaps',
  'match',
  'not',
  'or',
  'filter',
  'textSearch',
  'order',
  'limit',
  'range',
  'abortSignal',
  'returns',
  'throwOnError',
  'single',
  'maybeSingle',
  'csv',
];

const EMPTY = { data: [], error: null, count: 0 };

const resolveValue = (value, fallback) => {
  if (typeof value === 'function') return value();
  return value === undefined ? fallback : value;
};

export function createStorageStub({
  uploadError = null,
  publicUrl = 'https://cdn.test/x.png',
  files = {},
  download = null,
  downloadError = null,
} = {}) {
  const uploads = [];
  const buckets = [];
  const listed = [];
  const removed = [];

  const bucket = {
    upload: vi.fn(async (path, file, options) => {
      uploads.push({ path, file, options });
      return { data: uploadError ? null : { path }, error: uploadError };
    }),
    getPublicUrl: vi.fn((path) => ({ data: { publicUrl: `${publicUrl}#${path}` } })),
    list: vi.fn(async (prefix) => {
      listed.push(prefix);
      if (files[prefix] === null) return { data: null, error: null };
      const entries = (files[prefix] ?? []).map((entry) =>
        typeof entry === 'string' ? { name: entry } : entry
      );
      return {
        data: entries.map((entry) => ({
          id: 'folder' in entry && entry.folder ? null : (entry.id ?? 'file'),
          name: entry.name,
          created_at: 'created_at' in entry ? entry.created_at : '2026-08-16T00:00:00Z',
        })),
        error: null,
      };
    }),
    remove: vi.fn(async (paths) => {
      removed.push(...paths);
      return { data: paths.map((path) => ({ name: path })), error: null };
    }),
    download: vi.fn(async () => ({
      data: downloadError ? null : download,
      error: downloadError,
    })),
  };

  return {
    from: vi.fn((name) => {
      buckets.push(name);
      return bucket;
    }),
    uploads,
    buckets,
    listed,
    removed,
    bucket,
  };
}

export function createSupabaseStub({
  user = null,
  tables = {},
  rpc = {},
  auth = {},
  storage,
} = {}) {
  const queries = [];
  const rpcCalls = [];
  const queues = new Map();

  const take = (source, name, key) => {
    if (!(name in source)) return EMPTY;
    if (!queues.has(key)) {
      const value = source[name];
      queues.set(key, Array.isArray(value) ? [...value] : [value]);
    }
    const queue = queues.get(key);
    return queue.length > 1 ? queue.shift() : queue[0];
  };

  const buildQuery = (label, result) => {
    const record = { table: label, steps: [] };
    queries.push(record);

    const builder = {};
    for (const method of CHAINABLE) {
      builder[method] = (...args) => {
        record.steps.push({ method, args });
        return builder;
      };
    }
    builder.then = (onFulfilled, onRejected) =>
      Promise.resolve(result).then(onFulfilled, onRejected);
    builder.catch = (onRejected) => Promise.resolve(result).catch(onRejected);
    builder.finally = (onFinally) => Promise.resolve(result).finally(onFinally);

    return builder;
  };

  const defaultClaims = user
    ? { data: { claims: { sub: user.id, email: user.email ?? null } }, error: null }
    : { data: null, error: null };

  return {
    from: vi.fn((table) => buildQuery(table, take(tables, table, `table:${table}`))),

    rpc: vi.fn((name, args) => {
      rpcCalls.push({ name, args });
      return buildQuery(`rpc:${name}`, take(rpc, name, `rpc:${name}`));
    }),

    auth: {
      getClaims: vi.fn(async () => resolveValue(auth.getClaims, defaultClaims)),
      getUser: vi.fn(async () => resolveValue(auth.getUser, { data: null, error: null })),
      signInWithOAuth: vi.fn(async () => resolveValue(auth.signInWithOAuth, { error: null })),
      signOut: vi.fn(async () => resolveValue(auth.signOut, { error: null })),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    },

    storage: storage ?? createStorageStub(),

    queries,
    rpcCalls,
  };
}

export const queriesFor = (supabase, table) => supabase.queries.filter((q) => q.table === table);

export const queryFor = (supabase, table) => queriesFor(supabase, table)[0];

export const argsOf = (record, method) =>
  record.steps.filter((s) => s.method === method).map((s) => s.args);

export const firstArgsOf = (record, method) => argsOf(record, method)[0];

export const usedMethod = (record, method) => record.steps.some((s) => s.method === method);

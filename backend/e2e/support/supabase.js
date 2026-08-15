import { ensureProfile, nextId, nextTimestamp, rows, SCHEMA } from './database';
import { registeredUsers } from './session';

const VIEW_BASE = {
  v_posts: 'posts',
  v_comments: 'comments',
  v_portfolios: 'portfolios',
  v_companies: 'companies',
};

const COLLABORATORS = 'portfolio_collaborators';

const PROFILE_LISTS = [
  'profile_educations',
  'profile_careers',
  'profile_awards',
  'profile_languages',
];

const PUBLIC_READ = [
  'profiles', 'code_master', 'companies', 'resume_templates', 'posts', 'comments',
  'reaction_counts', ...PROFILE_LISTS,
];
const OWNER_READ = ['documents', 'reactions', 'interview_sessions', 'interview_qas'];
const OWNER_WRITE = [
  'profiles', 'documents', 'portfolios', 'posts', 'comments', 'reactions',
  'interview_sessions', 'interview_qas', COLLABORATORS, ...PROFILE_LISTS,
];

const FAULTS = Symbol.for('callback.e2e.faults');

function faults() {
  if (!globalThis[FAULTS]) globalThis[FAULTS] = { tables: new Map(), rpcs: new Map(), auth: 0 };
  return globalThis[FAULTS];
}

export function resetFaults() {
  const f = faults();
  f.tables.clear();
  f.rpcs.clear();
  f.auth = 0;
}

export function failNextQuery(table, error) {
  faults().tables.set(table, error);
}

export function failNextRpc(name, error) {
  faults().rpcs.set(name, error);
}

export function failNextAuth() {
  faults().auth += 1;
}

function takeFault(bucket, key) {
  const store = faults()[bucket];
  if (!store.has(key)) return null;
  const error = store.get(key);
  store.delete(key);
  return error;
}

const COLUMN_DEFAULTS = {
  interview_sessions: {
    status: 'ongoing',
    duration_sec: 0,
    total_score: null,
    sub_scores: {},
    finished_at: null,
  },
  interview_qas: { score: null },
  portfolios: { view_count: 0 },
  posts: { view_count: 0 },
};

const rlsError = () => ({
  code: '42501',
  message: 'new row violates row-level security policy',
});

const notFound = () => ({
  code: 'PGRST116',
  message: 'JSON object requested, multiple (or no) rows returned',
});

function canRead(table, row, user) {
  if (table === COLLABORATORS) {
    const owner = rows('portfolios').find((p) => p.id === row.portfolio_id);
    return Boolean(owner) && (owner.status === 'published' || owner.user_id === user?.id);
  }
  if (PUBLIC_READ.includes(table)) return true;
  if (OWNER_READ.includes(table)) return Boolean(user) && row.user_id === user.id;
  if (table === 'portfolios') return row.status === 'published' || (user && row.user_id === user.id);
  return false;
}

function readable(table, user) {
  return rows(table).filter((row) => canRead(table, row, user));
}

const countOf = (targetType, targetId, kind) =>
  rows('reaction_counts').find(
    (r) => r.target_type === targetType && r.target_id === targetId && r.kind === kind
  )?.cnt ?? 0;

const authorOf = (userId) => rows('profiles').find((p) => p.id === userId) ?? {};

function viewPosts(user) {
  return readable('posts', user).map((p) => {
    const author = authorOf(p.user_id);
    const company = rows('companies').find((c) => c.id === p.company_id);
    return {
      ...p,
      author_name: author.name ?? null,
      author_avatar_url: author.avatar_url ?? null,
      company_name: company?.name ?? null,
      company_logo_url: company?.logo_url ?? null,
      company_slug: company?.slug ?? null,
      like_count: countOf('post', p.id, 'like'),
      scrap_count: countOf('post', p.id, 'bookmark'),
      comment_count: rows('comments').filter((c) => c.post_id === p.id).length,
    };
  });
}

function viewComments(user) {
  return readable('comments', user).map((c) => {
    const author = authorOf(c.user_id);
    return {
      ...c,
      author_name: author.name ?? null,
      author_avatar_url: author.avatar_url ?? null,
      like_count: countOf('comment', c.id, 'like'),
    };
  });
}

function viewPortfolios(user) {
  return readable('portfolios', user).map((p) => {
    const author = authorOf(p.user_id);
    return {
      ...p,
      author_name: author.name ?? null,
      author_avatar_url: author.avatar_url ?? null,
      author_desired_role: author.desired_role ?? null,
      like_count: countOf('portfolio', p.id, 'like'),
      bookmark_count: countOf('portfolio', p.id, 'bookmark'),
    };
  });
}

function viewCompanies(user) {
  return readable('companies', user).map((c) => {
    const posts = rows('posts').filter((p) => p.company_id === c.id);
    const decided = posts.filter((p) => ['pass', 'fail'].includes(p.pass_result_code));
    const scored = posts.filter((p) => typeof p.difficulty_score === 'number');

    return {
      ...c,
      bookmark_count: countOf('company', c.id, 'bookmark'),
      review_count: posts.filter((p) => p.post_type === 'review').length,
      qbank_count: posts.filter((p) => p.post_type === 'qbank').length,
      avg_difficulty: scored.length
        ? Math.round((scored.reduce((s, p) => s + p.difficulty_score, 0) / scored.length) * 10) / 10
        : null,
      pass_rate: decided.length
        ? Math.round((100 * decided.filter((p) => p.pass_result_code === 'pass').length) / decided.length)
        : null,
    };
  });
}

function viewProfileStats(user) {
  return rows('profiles').map((profile) => {
    const uid = profile.id;
    const mine = user?.id === uid;
    const portfolios = rows('portfolios').filter((p) => p.user_id === uid);
    const scraps = (type, kind = 'bookmark') =>
      mine ? rows('reactions').filter((r) => r.user_id === uid && r.target_type === type && r.kind === kind).length : 0;

    return {
      user_id: uid,
      doc_count: mine ? rows('documents').filter((d) => d.user_id === uid).length : 0,
      portfolio_count: mine ? portfolios.length : portfolios.filter((p) => p.status === 'published').length,
      published_portfolio_count: portfolios.filter((p) => p.status === 'published').length,
      draft_portfolio_count: portfolios.filter((p) => p.status === 'draft').length,
      interview_scrap_count: scraps('interview_qa'),
      scrapped_company_count: scraps('company'),
      scrapped_post_count: scraps('post'),
      scrapped_portfolio_count: scraps('portfolio'),
      my_review_count: rows('posts').filter((p) => p.user_id === uid && p.post_type === 'review').length,
      my_qbank_count: rows('posts').filter((p) => p.user_id === uid && p.post_type === 'qbank').length,
      finished_interview_count: mine
        ? rows('interview_sessions').filter((s) => s.user_id === uid && s.status === 'finished').length
        : 0,
    };
  });
}

const VIEWS = {
  v_posts: viewPosts,
  v_comments: viewComments,
  v_portfolios: viewPortfolios,
  v_companies: viewCompanies,
  v_profile_stats: viewProfileStats,
};

function syncReactionCount(op, reaction) {
  const key = (r) =>
    r.target_type === reaction.target_type && r.target_id === reaction.target_id && r.kind === reaction.kind;
  const store = rows('reaction_counts');
  const found = store.find(key);

  if (op === 'insert') {
    if (found) found.cnt += 1;
    else store.push({ ...reaction, cnt: 1, user_id: undefined });
    return;
  }
  if (!found) return;
  found.cnt -= 1;
  if (found.cnt <= 0) store.splice(store.indexOf(found), 1);
}

function cascadeDelete(table, row) {
  const drop = (name, predicate) => {
    const store = rows(name);
    for (const victim of store.filter(predicate)) {
      store.splice(store.indexOf(victim), 1);
      if (name === 'reactions') syncReactionCount('delete', victim);
    }
  };

  if (table === 'posts') {
    drop('comments', (c) => c.post_id === row.id);
    drop('reactions', (r) => r.target_type === 'post' && r.target_id === row.id);
  }
  if (table === 'comments') drop('reactions', (r) => r.target_type === 'comment' && r.target_id === row.id);
  if (table === 'portfolios') {
    drop('reactions', (r) => r.target_type === 'portfolio' && r.target_id === row.id);
    drop(COLLABORATORS, (l) => l.portfolio_id === row.id);
  }
  if (table === 'interview_sessions') {
    drop('interview_qas', (q) => q.session_id === row.id);
    drop('reactions', (r) => r.target_type === 'interview_qa');
  }
  if (table === 'reactions') syncReactionCount('delete', row);
}

function parseProjection(spec) {
  if (!spec || spec.trim() === '*') return null;
  return spec
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function project(row, columns, table) {
  if (columns) return Object.fromEntries(columns.map((c) => [c, row[c] ?? null]));

  const declared = SCHEMA[VIEW_BASE[table] ?? table];
  const blanks = declared ? Object.fromEntries(declared.map((c) => [c, null])) : {};
  const present = Object.entries(row).filter(([, value]) => value !== undefined);

  return { ...blanks, ...Object.fromEntries(present) };
}

const likeToRegExp = (pattern) =>
  new RegExp(
    `^${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/%/g, '.*').replace(/_/g, '.')}$`,
    'i'
  );

function parseOr(expression) {
  return expression.split(',').map((clause) => {
    const [column, operator, ...rest] = clause.split('.');
    const raw = rest.join('.');
    const value = raw.startsWith('"') && raw.endsWith('"') ? raw.slice(1, -1) : raw;
    return { column, operator, value };
  });
}

const matchesClause = (row, { column, operator, value }) =>
  operator === 'ilike' ? likeToRegExp(value).test(String(row[column] ?? '')) : row[column] === value;

class Query {
  constructor(table, user) {
    this.table = table;
    this.user = user;
    this.op = 'select';
    this.filters = [];
    this.orders = [];
    this.projection = null;
    this.wantCount = false;
    this.payload = null;
    this.rangeSpec = null;
    this.limitSpec = null;
    this.singleMode = null;
    this.selectAfterWrite = false;
  }

  select(spec = '*', options = {}) {
    if (this.op === 'select') this.projection = parseProjection(spec);
    else {
      this.selectAfterWrite = true;
      this.projection = parseProjection(spec);
    }
    if (options.count === 'exact') this.wantCount = true;
    return this;
  }

  insert(payload) {
    this.op = 'insert';
    this.payload = payload;
    return this;
  }

  update(payload) {
    this.op = 'update';
    this.payload = payload;
    return this;
  }

  delete() {
    this.op = 'delete';
    return this;
  }

  eq(column, value) {
    this.filters.push((row) => row[column] === value);
    return this;
  }

  neq(column, value) {
    this.filters.push((row) => row[column] !== value);
    return this;
  }

  in(column, values) {
    this.filters.push((row) => values.includes(row[column]));
    return this;
  }

  ilike(column, pattern) {
    const re = likeToRegExp(pattern);
    this.filters.push((row) => re.test(String(row[column] ?? '')));
    return this;
  }

  contains(column, values) {
    this.filters.push((row) => values.every((v) => (row[column] ?? []).includes(v)));
    return this;
  }

  or(expression) {
    const clauses = parseOr(expression);
    this.filters.push((row) => clauses.some((c) => matchesClause(row, c)));
    return this;
  }

  order(column, { ascending = true, nullsFirst = false } = {}) {
    this.orders.push({ column, ascending, nullsFirst });
    return this;
  }

  range(from, to) {
    this.rangeSpec = [from, to];
    return this;
  }

  limit(n) {
    this.limitSpec = n;
    return this;
  }

  single() {
    this.singleMode = 'single';
    return this;
  }

  maybeSingle() {
    this.singleMode = 'maybe';
    return this;
  }

  source() {
    return VIEWS[this.table] ? VIEWS[this.table](this.user) : readable(this.table, this.user);
  }

  sort(list) {
    if (this.orders.length === 0) return list;
    return [...list].sort((a, b) => {
      for (const { column, ascending, nullsFirst } of this.orders) {
        const x = a[column];
        const y = b[column];
        if (x === y) continue;
        const xNull = x === null || x === undefined;
        const yNull = y === null || y === undefined;
        if (xNull || yNull) return xNull ? (nullsFirst ? -1 : 1) : nullsFirst ? 1 : -1;
        const cmp = x > y ? 1 : -1;
        return ascending ? cmp : -cmp;
      }
      return 0;
    });
  }

  finish(list) {
    const columns = this.projection;
    const data = list.map((row) => project(row, columns, this.table));

    if (this.singleMode === 'single') {
      if (data.length !== 1) return { data: null, error: notFound(), count: null };
      return { data: data[0], error: null, count: null };
    }
    if (this.singleMode === 'maybe') {
      if (data.length > 1) return { data: null, error: notFound(), count: null };
      return { data: data[0] ?? null, error: null, count: null };
    }
    return { data, error: null, count: this.wantCount ? this.count : null };
  }

  runSelect() {
    let list = this.source().filter((row) => this.filters.every((f) => f(row)));
    this.count = list.length;
    list = this.sort(list);
    if (this.rangeSpec) list = list.slice(this.rangeSpec[0], this.rangeSpec[1] + 1);
    if (this.limitSpec !== null) list = list.slice(0, this.limitSpec);
    return this.finish(list);
  }

  runInsert() {
    if (!OWNER_WRITE.includes(this.table)) return { data: null, error: rlsError(), count: null };
    if (!this.user) return { data: null, error: rlsError(), count: null };

    const incoming = Array.isArray(this.payload) ? this.payload : [this.payload];
    if (incoming.some((r) => r.user_id !== this.user.id)) {
      return { data: null, error: rlsError(), count: null };
    }

    if (this.table === 'documents') {
      for (const candidate of incoming) {
        const owned = rows('documents').filter(
          (d) => d.user_id === this.user.id && d.doc_type === candidate.doc_type
        ).length;
        if (owned >= 10) {
          return {
            data: null,
            error: { code: 'P0001', message: 'DOCUMENT_LIMIT_EXCEEDED', hint: '' },
            count: null,
          };
        }
      }
    }

    const created = incoming.map((values) => {
      const now = nextTimestamp();
      const row = {
        id: nextId(this.table),
        created_at: now,
        updated_at: now,
        ...(COLUMN_DEFAULTS[this.table] ?? {}),
        ...values,
      };
      rows(this.table).push(row);
      if (this.table === 'reactions') syncReactionCount('insert', row);
      return row;
    });

    return this.finish(created);
  }

  runUpdate() {
    if (!OWNER_WRITE.includes(this.table) || !this.user) {
      return { data: null, error: rlsError(), count: null };
    }

    const owned = rows(this.table).filter(
      (row) => this.filters.every((f) => f(row)) && (row.user_id ?? row.id) === this.user.id
    );

    for (const row of owned) Object.assign(row, this.payload, { updated_at: nextTimestamp() });
    return this.finish(owned);
  }

  runDelete() {
    if (!OWNER_WRITE.includes(this.table) || !this.user) {
      return { data: null, error: rlsError(), count: null };
    }

    const store = rows(this.table);
    const doomed = store.filter(
      (row) => this.filters.every((f) => f(row)) && (row.user_id ?? row.id) === this.user.id
    );

    for (const row of doomed) {
      store.splice(store.indexOf(row), 1);
      cascadeDelete(this.table, row);
    }
    return this.finish(doomed);
  }

  execute() {
    const fault = takeFault('tables', this.table);
    if (fault) return { data: null, error: fault, count: null };
    if (this.op === 'insert') return this.runInsert();
    if (this.op === 'update') return this.runUpdate();
    if (this.op === 'delete') return this.runDelete();
    return this.runSelect();
  }

  then(onFulfilled, onRejected) {
    return Promise.resolve().then(() => this.execute()).then(onFulfilled, onRejected);
  }
}

function toggleReaction(user, { p_target_type, p_target_id, p_kind = 'bookmark' }) {
  if (!user) return { data: null, error: { message: 'NOT_AUTHENTICATED' } };

  const store = rows('reactions');
  const found = store.find(
    (r) =>
      r.user_id === user.id &&
      r.target_type === p_target_type &&
      r.target_id === p_target_id &&
      r.kind === p_kind
  );

  if (found) {
    store.splice(store.indexOf(found), 1);
    syncReactionCount('delete', found);
    return { data: false, error: null };
  }

  const row = {
    id: nextId('reaction'),
    user_id: user.id,
    target_type: p_target_type,
    target_id: p_target_id,
    kind: p_kind,
    created_at: nextTimestamp(),
  };
  store.push(row);
  syncReactionCount('insert', row);
  return { data: true, error: null };
}

const VIEW_TARGETS = {
  company: 'companies',
  portfolio: 'portfolios',
  post: 'posts',
  template: 'resume_templates',
};

function incrementView(_user, { p_target_type, p_target_id }) {
  const target = rows(VIEW_TARGETS[p_target_type] ?? '')?.find((r) => r.id === p_target_id);
  if (target) target.view_count = (target.view_count ?? 0) + 1;
  return { data: null, error: null };
}

function deleteMyAccount(user) {
  if (!user) return { data: null, error: { message: 'NOT_AUTHENTICATED' } };

  for (const table of ['documents', 'portfolios', 'posts', 'comments', 'reactions', 'interview_sessions', 'interview_qas', ...PROFILE_LISTS]) {
    const store = rows(table);
    for (const row of store.filter((r) => r.user_id === user.id)) {
      store.splice(store.indexOf(row), 1);
      cascadeDelete(table, row);
    }
  }

  const profiles = rows('profiles');
  const profile = profiles.find((p) => p.id === user.id);
  if (profile) profiles.splice(profiles.indexOf(profile), 1);

  return { data: null, error: null };
}

function recommendedCompanies(user, { p_limit = 6 } = {}) {
  const limit = Math.max(1, Math.min(p_limit, 50));
  const list = [...viewCompanies(user)].sort(
    (a, b) =>
      b.bookmark_count - a.bookmark_count ||
      (b.view_count ?? 0) - (a.view_count ?? 0) ||
      a.name.localeCompare(b.name)
  );
  return { data: list.slice(0, limit), error: null };
}

const LIST_SPECS = {
  p_educations: {
    table: 'profile_educations',
    toRow: (e) => ({
      school_type: e.type ?? null,
      school: e.school ?? null,
      major: e.major ?? null,
      status: e.status ?? null,
      admission: e.admission ?? null,
      graduation: e.graduation ?? null,
    }),
  },
  p_careers: {
    table: 'profile_careers',
    toRow: (c) => ({
      started_on: c.start ?? null,
      ended_on: c.end ?? null,
      company: c.company ?? null,
      job_role: c.role ?? null,
    }),
  },
  p_awards: {
    table: 'profile_awards',
    toRow: (a) => ({ awarded_on: a.date ?? null, title: a.name ?? null }),
  },
  p_languages: {
    table: 'profile_languages',
    toRow: (l) => ({ language: l.language ?? null, level: l.level ?? null, detail: l.detail ?? null }),
  },
};

const CODE_REFS = {
  profile_educations: { school_type: 'school_type', status: 'edu_status' },
  profile_languages: { level: 'language_level' },
};

function violatesCodeReference(table, row) {
  const refs = CODE_REFS[table];
  if (!refs) return null;

  for (const [column, group] of Object.entries(refs)) {
    const value = row[column];
    if (value === null || value === undefined) continue;
    const known = rows('code_master').some((c) => c.group_name === group && c.code === value);
    if (!known) return column;
  }
  return null;
}

function saveProfileLists(user, args = {}) {
  if (!user) return { data: null, error: { message: 'NOT_AUTHENTICATED' } };

  const staged = [];

  for (const [param, spec] of Object.entries(LIST_SPECS)) {
    const list = args[param];
    if (list === null || list === undefined) continue;

    const prepared = list.map((item, index) => ({
      id: nextId('profile_list'),
      user_id: user.id,
      sort_order: index,
      ...spec.toRow(item),
    }));

    for (const row of prepared) {
      const bad = violatesCodeReference(spec.table, row);
      if (bad) {
        return {
          data: null,
          error: { code: '23503', message: `insert on table "${spec.table}" violates foreign key constraint on ${bad}` },
        };
      }
    }

    staged.push([spec.table, prepared]);
  }

  for (const [table, prepared] of staged) {
    const store = rows(table);
    for (const row of store.filter((r) => r.user_id === user.id)) {
      store.splice(store.indexOf(row), 1);
    }
    store.push(...prepared);
  }

  return { data: null, error: null };
}

function findMemberByEmail(user, { p_email } = {}) {
  if (!user) return { data: [], error: null };

  const wanted = String(p_email ?? '').trim().toLowerCase();
  const found = registeredUsers().find((u) => (u.email ?? '').toLowerCase() === wanted);
  if (!found) return { data: [], error: null };

  const profile = rows('profiles').find((p) => p.id === found.id);
  if (!profile) return { data: [], error: null };

  return {
    data: [{ id: profile.id, name: profile.name ?? null, avatar_url: profile.avatar_url ?? null }],
    error: null,
  };
}

function savePortfolioCollaborators(user, { p_portfolio_id, p_user_ids } = {}) {
  if (!user) return { data: null, error: { message: 'NOT_AUTHENTICATED' } };

  const portfolio = rows('portfolios').find((p) => p.id === p_portfolio_id);
  if (!portfolio || portfolio.user_id !== user.id) {
    return { data: null, error: { message: 'PORTFOLIO_NOT_MINE' } };
  }

  const store = rows('portfolio_collaborators');
  for (const link of store.filter((l) => l.portfolio_id === p_portfolio_id)) {
    store.splice(store.indexOf(link), 1);
  }

  const seen = new Set();
  let order = 0;

  for (const id of p_user_ids ?? []) {
    if (!id || id === user.id || seen.has(id)) continue;
    if (!rows('profiles').some((p) => p.id === id)) {
      return {
        data: null,
        error: { code: '23503', message: 'violates foreign key constraint on user_id' },
      };
    }
    seen.add(id);
    store.push({
      portfolio_id: p_portfolio_id,
      user_id: id,
      sort_order: order,
      created_at: nextTimestamp(),
    });
    order += 1;
  }

  return { data: null, error: null };
}

function myProfileEmail(user) {
  if (!user) return { data: null, error: { code: '42501', message: 'permission denied' } };
  const profile = rows('profiles').find((p) => p.id === user.id);
  return { data: profile?.email ?? null, error: null };
}

const RPCS = {
  toggle_reaction: toggleReaction,
  increment_view: incrementView,
  delete_my_account: deleteMyAccount,
  get_recommended_companies: recommendedCompanies,
  my_profile_email: myProfileEmail,
  save_profile_lists: saveProfileLists,
  find_member_by_email: findMemberByEmail,
  save_portfolio_collaborators: savePortfolioCollaborators,
};

export function createSupabase(user) {
  return {
    from: (table) => new Query(table, user),

    rpc(name, args) {
      const fault = takeFault('rpcs', name);
      if (fault) return Promise.resolve({ data: null, error: fault });

      const run = RPCS[name];
      const result = run
        ? run(user, args ?? {})
        : { data: null, error: { code: 'PGRST202', message: `function ${name} does not exist` } };
      return Promise.resolve(result);
    },

    auth: {
      async getClaims() {
        if (faults().auth > 0) {
          faults().auth -= 1;
          throw new Error('auth service unavailable');
        }
        if (!user) return { data: null, error: null };
        return { data: { claims: { sub: user.id, email: user.email ?? null } }, error: null };
      },
      async getUser() {
        if (!user) return { data: null, error: { message: 'not authenticated' } };
        const profile = ensureProfile(user);
        const metadata =
          user.appMetadata ??
          (user.providers === null ? undefined : { providers: user.providers ?? ['github'] });

        return {
          data: {
            user: {
              id: user.id,
              email: user.email ?? null,
              created_at: user.noTimestamps ? null : profile.created_at,
              last_sign_in_at: user.noTimestamps ? null : profile.created_at,
              app_metadata: metadata,
            },
          },
          error: null,
        };
      },
    },
  };
}

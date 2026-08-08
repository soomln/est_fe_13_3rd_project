import { AsyncLocalStorage } from 'node:async_hooks';

const STORE = Symbol.for('callback.e2e.als');
const REGISTRY = Symbol.for('callback.e2e.users');

function storage() {
  if (!globalThis[STORE]) globalThis[STORE] = new AsyncLocalStorage();
  return globalThis[STORE];
}

function registry() {
  if (!globalThis[REGISTRY]) globalThis[REGISTRY] = new Map();
  return globalThis[REGISTRY];
}

export function registerUser(user) {
  registry().set(user.id, user);
  return user;
}

export function lookupUser(id) {
  return registry().get(id) ?? null;
}

export function runWithUser(user, fn) {
  return storage().run({ user }, fn);
}

export function currentUser() {
  return storage().getStore()?.user ?? null;
}

export function userFromCookieHeader(header) {
  const match = /(?:^|;\s*)e2e_user=([^;]+)/.exec(header ?? '');
  return match ? lookupUser(decodeURIComponent(match[1])) : null;
}

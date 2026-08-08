import { ensureProfile, resetDatabase, USERS } from './database';
import { registerUser } from './session';
import { resetBrowser } from './browser';
import { resetFaults } from './supabase';
import { startApiServer } from './server';

const KEY = Symbol.for('callback.e2e.harness');

function state() {
  if (!globalThis[KEY]) globalThis[KEY] = { api: null, cookie: null, realFetch: null };
  return globalThis[KEY];
}

export async function startWorld() {
  const s = state();
  if (s.api) return s.api;

  s.api = await startApiServer();
  s.realFetch = globalThis.fetch;

  globalThis.window = { location: { origin: s.api.baseUrl } };
  globalThis.fetch = (input, init = {}) => {
    const target = typeof input === 'string' && input.startsWith('/') ? `${s.api.baseUrl}${input}` : input;
    const headers = { ...(init.headers ?? {}) };
    if (s.cookie) headers.cookie = s.cookie;
    return s.realFetch(target, { ...init, headers });
  };

  return s.api;
}

export async function stopWorld() {
  const s = state();
  if (!s.api) return;

  globalThis.fetch = s.realFetch;
  delete globalThis.window;
  await s.api.close();
  s.api = null;
  s.cookie = null;
}

export function resetWorld() {
  resetDatabase();
  resetBrowser();
  resetFaults();
  state().cookie = null;
}

export function rawRequest(path, init = {}) {
  return fetch(path, init);
}

export function signInAs(user) {
  registerUser(user);
  ensureProfile(user);
  state().cookie = `e2e_user=${encodeURIComponent(user.id)}`;
  return user;
}

export function signOutOfBrowser() {
  state().cookie = null;
}

export const currentCookie = () => state().cookie;

export { USERS };

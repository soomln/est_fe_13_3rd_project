const KEY = Symbol.for('callback.e2e.browser');

function state() {
  if (!globalThis[KEY]) {
    globalThis[KEY] = {
      uploads: [],
      oauth: [],
      signOuts: 0,
      listeners: [],
      failUpload: null,
      failOAuth: null,
      failSignOut: null,
    };
  }
  return globalThis[KEY];
}

export const browserState = state;

export function resetBrowser() {
  const s = state();
  s.uploads = [];
  s.oauth = [];
  s.signOuts = 0;
  s.listeners = [];
  s.failUpload = null;
  s.failOAuth = null;
  s.failSignOut = null;
}

export function failNextUpload(error) {
  state().failUpload = error;
}

export function failNextOAuth(error) {
  state().failOAuth = error;
}

export function failNextSignOut(error) {
  state().failSignOut = error;
}

export function createBrowserSupabase() {
  const s = state();

  return {
    storage: {
      from: (bucket) => ({
        async upload(path, file, options) {
          if (s.failUpload) {
            const error = s.failUpload;
            s.failUpload = null;
            return { data: null, error };
          }
          s.uploads.push({ bucket, path, type: file.type, size: file.size, options });
          return { data: { path }, error: null };
        },
        getPublicUrl: (path) => ({
          data: { publicUrl: `https://storage.test/${bucket}/${path}` },
        }),
      }),
    },

    auth: {
      async signInWithOAuth({ provider, options }) {
        if (s.failOAuth) {
          const error = s.failOAuth;
          s.failOAuth = null;
          return { error };
        }
        s.oauth.push({ provider, redirectTo: options?.redirectTo });
        return { error: null };
      },
      async signOut() {
        if (s.failSignOut) {
          const error = s.failSignOut;
          s.failSignOut = null;
          return { error };
        }
        s.signOuts += 1;
        return { error: null };
      },
      onAuthStateChange(handler) {
        const entry = { handler, active: true };
        s.listeners.push(entry);
        return {
          data: {
            subscription: {
              unsubscribe() {
                entry.active = false;
              },
            },
          },
        };
      },
    },
  };
}

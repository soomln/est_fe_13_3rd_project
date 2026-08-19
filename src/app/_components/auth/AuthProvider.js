'use client';

import {
  getCurrentUser,
  onAuthChange,
  signInWith,
  signOut as signOutApi,
} from '@backend/lib/api/auth';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import AuthModal from './AuthModal';

const AuthContext = createContext(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth 는 <AuthProvider> 안에서만 사용할 수 있습니다. app/layout.js 를 확인하세요.');
  }
  return context;
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalMode, setModalMode] = useState(null);
  const [connectingProvider, setConnectingProvider] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  // getCurrentUser()(/api/me)와 onAuthChange()(Supabase 실시간 인증 이벤트)가
  // 마운트 시 동시에 실행돼서 순서 보장이 없다. onAuthChange가 먼저 정확한 상태를
  // 반영해도 뒤늦게 도착한 getCurrentUser 응답이 덮어쓸 수 있어서,
  // onAuthChange가 한 번이라도 발생하면 그 이후엔 authoritative로 취급한다.
  const authChangedRef = useRef(false);

  useEffect(() => {
    let isAlive = true;

    getCurrentUser()
      .then((currentUser) => isAlive && !authChangedRef.current && setUser(currentUser))
      .catch(() => {})
      .finally(() => isAlive && setIsLoading(false));

    return () => {
      isAlive = false;
    };
  }, []);

  useEffect(
    () =>
      onAuthChange((nextUser) => {
        authChangedRef.current = true;
        setUser(nextUser);
      }),
    []
  );

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get('auth_error');
    const authRequired = params.get('auth_required');

    if (!authError && !authRequired) return;

    if (authError) {
      setErrorMessage(
        authError === 'missing_code'
          ? '로그인이 취소되었거나 만료되었습니다. 다시 시도해 주세요.'
          : authError
      );
    } else {
      setErrorMessage('로그인이 필요한 페이지입니다.');
    }
    setModalMode('login');

    params.delete('auth_error');
    params.delete('auth_required');
    const query = params.toString();
    window.history.replaceState({}, '', window.location.pathname + (query ? `?${query}` : ''));
  }, []);

  const openLogin = useCallback(() => {
    setErrorMessage(null);
    setModalMode('login');
  }, []);

  const openSignup = useCallback(() => {
    setErrorMessage(null);
    setModalMode('signup');
  }, []);

  const closeModal = useCallback(() => {
    setModalMode(null);
    setConnectingProvider(null);
    setErrorMessage(null);
  }, []);

  const selectProvider = useCallback(async (provider) => {
    setErrorMessage(null);
    setConnectingProvider(provider);

    try {
      const params = new URLSearchParams(window.location.search);
      const next = params.get('next') ?? window.location.pathname;

      await signInWith(provider, { next });
    } catch (e) {
      setConnectingProvider(null);
      setErrorMessage(e.message);
    }
  }, []);

  const signOut = useCallback(async () => {
    await signOutApi();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isLoggedIn: user !== null,
      openLogin,
      openSignup,
      closeModal,
      signOut,
    }),
    [user, isLoading, openLogin, openSignup, closeModal, signOut]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal
        mode={modalMode}
        connectingProvider={connectingProvider}
        errorMessage={errorMessage}
        onSelectProvider={selectProvider}
        onChangeMode={setModalMode}
        onClose={closeModal}
      />
    </AuthContext.Provider>
  );
}

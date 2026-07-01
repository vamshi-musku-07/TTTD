import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api } from '../lib/api';

const AuthContext = createContext(null);

const ACCESS_KEY = 'tttd_access_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(ACCESS_KEY));
  const [loading, setLoading] = useState(true);

  const persistSession = useCallback((data) => {
    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem(ACCESS_KEY, data.accessToken);
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(ACCESS_KEY);
  }, []);

  const bootstrap = useCallback(async () => {
    const stored = localStorage.getItem(ACCESS_KEY);
    if (stored) {
      try {
        const data = await api.me(stored);
        setUser(data.user);
        setAccessToken(stored);
        setLoading(false);
        return;
      } catch {
        localStorage.removeItem(ACCESS_KEY);
      }
    }

    try {
      const data = await api.refresh();
      persistSession(data);
    } catch {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [persistSession, clearSession]);

  useEffect(() => {
    bootstrap();
  }, [bootstrap]);

  const signup = useCallback(
    async (payload) => {
      const data = await api.signup(payload);
      persistSession(data);
      return data;
    },
    [persistSession]
  );

  const login = useCallback(
    async (payload) => {
      const data = await api.login(payload);
      persistSession(data);
      return data;
    },
    [persistSession]
  );

  const googleAuth = useCallback(
    async (credential, acceptTerms = true) => {
      const data = await api.googleAuth({ credential, acceptTerms });
      persistSession(data);
      return data;
    },
    [persistSession]
  );

  const logout = useCallback(async () => {
    try {
      if (accessToken) await api.logout(accessToken);
    } finally {
      clearSession();
    }
  }, [accessToken, clearSession]);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      loading,
      isAuthenticated: !!user,
      signup,
      login,
      googleAuth,
      logout,
    }),
    [user, accessToken, loading, signup, login, googleAuth, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

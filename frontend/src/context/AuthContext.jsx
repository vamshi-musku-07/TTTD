import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api, configureApiAuth, isSessionExpiredError } from '../lib/api';

const AuthContext = createContext(null);

const ACCESS_KEY = 'tttd_access_token';
const REFRESH_INTERVAL_MS = 12 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(() => localStorage.getItem(ACCESS_KEY));
  const [loading, setLoading] = useState(true);
  const accessTokenRef = useRef(accessToken);

  useEffect(() => {
    accessTokenRef.current = accessToken;
  }, [accessToken]);

  const persistSession = useCallback((data) => {
    setUser(data.user);
    setAccessToken(data.accessToken);
    localStorage.setItem(ACCESS_KEY, data.accessToken);
    accessTokenRef.current = data.accessToken;
  }, []);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem(ACCESS_KEY);
    accessTokenRef.current = null;
  }, []);

  useEffect(() => {
    configureApiAuth({
      getToken: () => accessTokenRef.current || localStorage.getItem(ACCESS_KEY),
      onTokenRefreshed: (data) => {
        persistSession(data);
      },
      onSessionExpired: () => {
        clearSession();
      },
    });
  }, [persistSession, clearSession]);

  const bootstrap = useCallback(async () => {
    const stored = localStorage.getItem(ACCESS_KEY);

    if (stored) {
      try {
        const data = await api.me(stored);
        persistSession({
          user: data.user,
          accessToken: localStorage.getItem(ACCESS_KEY) || stored,
        });
        return;
      } catch (err) {
        if (isSessionExpiredError(err)) return;
      }
    }

    try {
      const data = await api.refresh();
      persistSession(data);
    } catch {
      clearSession();
    }
  }, [persistSession, clearSession]);

  useEffect(() => {
    bootstrap().finally(() => setLoading(false));
  }, [bootstrap]);

  useEffect(() => {
    if (!user || !accessToken) return undefined;

    const refreshSession = async () => {
      try {
        const data = await api.refresh();
        persistSession(data);
      } catch (err) {
        if (!isSessionExpiredError(err)) {
          clearSession();
        }
      }
    };

    const interval = setInterval(refreshSession, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [user, accessToken, persistSession, clearSession]);

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

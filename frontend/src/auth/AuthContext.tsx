import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  clearToken,
  getMe,
  getStoredToken,
  loginAccount,
  logoutAccount,
  registerAccount,
  storeToken,
  updateProfile,
} from '../api';
import type { AuthUser, ProfileUpdate } from '../types';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  register: (name: string, email: string, password: string) => Promise<AuthUser>;
  loginWithToken: (token: string) => Promise<AuthUser>;
  saveProfile: (profile: ProfileUpdate) => Promise<AuthUser>;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const loginWithToken = useCallback(async (token: string) => {
    storeToken(token);
    const profile = await getMe();
    setUser(profile);
    return profile;
  }, []);

  useEffect(() => {
    const token = getStoredToken();
    if (!token) {
      setLoading(false);
      return;
    }
    getMe()
      .then(setUser)
      .catch(() => {
        clearToken();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await loginAccount(email, password);
    storeToken(result.token);
    setUser(result.user);
    return result.user;
  }, []);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const result = await registerAccount(name, email, password);
      storeToken(result.token);
      setUser(result.user);
      return result.user;
    },
    [],
  );

  const saveProfile = useCallback(async (profile: ProfileUpdate) => {
    const next = await updateProfile(profile);
    setUser(next);
    return next;
  }, []);

  const logout = useCallback(() => {
    void logoutAccount().catch(() => undefined);
    clearToken();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      loginWithToken,
      saveProfile,
      setUser,
      logout,
    }),
    [user, loading, login, register, loginWithToken, saveProfile, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}

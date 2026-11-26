import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from '../lib/api';

interface AuthState {
  email: string | null;
  checking: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [email, setEmail] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    api.me().then((r) => setEmail(r.email)).catch(() => setEmail(null)).finally(() => setChecking(false));
  }, []);

  const value: AuthState = {
    email,
    checking,
    login: async (e, p) => setEmail((await api.login(e, p)).email),
    logout: async () => {
      await api.logout().catch(() => {});
      setEmail(null);
    },
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside AuthProvider');
  return ctx;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { email, checking } = useAuth();
  const location = useLocation();
  if (checking) return <div className="grid min-h-screen place-items-center text-mist">Checking session…</div>;
  if (!email) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  return <>{children}</>;
}

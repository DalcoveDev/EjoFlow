import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'; import { authService } from '../services/authService'; import type { User } from '../types';
interface AuthState { user: User | null; ready: boolean; login: (identifier: string) => Promise<User>; logout: () => void; updateName: (name: string) => Promise<void>; }
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null); const [ready, setReady] = useState(false);
  useEffect(() => { authService.getSession().then(u => { setUser(u); setReady(true); }); }, []);
  const login = async (identifier: string) => { const u = await authService.login(identifier); setUser(u); return u; };
  const logout = () => { authService.logout(); setUser(null); };
  const updateName = async (name: string) => { const u = await authService.updateName(name); setUser(u); };
  return <AuthContext.Provider value={{ user, ready, login, logout, updateName }}>{children}</AuthContext.Provider>;
}
export function useAuth() { const ctx = useContext(AuthContext); if (!ctx) throw new Error('useAuth must be used within AuthProvider'); return ctx; }
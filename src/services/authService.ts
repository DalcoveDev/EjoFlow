import type { User } from '../types';
const KEY = 'ejoflow.session';
function initialsOf(name: string): string { const parts = name.trim().split(/\s+/).filter(Boolean); if (!parts.length) return 'U'; const initials = parts.slice(0, 2).map(part => part[0]?.toUpperCase() ?? '').join(''); return initials.length >= 2 ? initials : name.trim().slice(0, 2).toUpperCase(); }
export const authService = {
  async getSession(): Promise<User | null> { const raw = localStorage.getItem(KEY); return raw ? JSON.parse(raw) as User : null; },
  async login(identifier: string): Promise<User> { const user: User = { id: crypto.randomUUID(), name: identifier.trim(), initials: initialsOf(identifier) }; localStorage.setItem(KEY, JSON.stringify(user)); return user; },
  logout(): void { localStorage.removeItem(KEY); },
};
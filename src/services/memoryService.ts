export interface ConversationSummary {
  id: string;
  provider_id: string;
  created_at: string;
  updated_at: string;
  message_count: number;
  action_count: number;
  last_message: string | null;
}
export interface ActionRecord {
  id: string;
  provider_id: string;
  action: string;
  ok: number;
  created_at: string;
}
export interface SystemStats { conversations: number; messages: number; actions: number; actionsOk: number }
export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'hasha';
  if (min < 60) return `nyuma y'iminota ${min}`;
  const h = Math.floor(min / 60);
  if (h < 24) return `nyuma y'amasaha ${h}`;
  const d = Math.floor(h / 24);
  if (d < 30) return `nyuma y'iminsi ${d}`;
  return new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}
export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}
export const memoryService = {
  async conversations(): Promise<ConversationSummary[]> {
    const res = await fetch('/api/conversations');
    if (!res.ok) return [];
    return res.json();
  },
  async actions(limit = 50): Promise<ActionRecord[]> {
    const res = await fetch(`/api/actions?limit=${limit}`);
    if (!res.ok) return [];
    return res.json();
  },
  async stats(): Promise<SystemStats | null> {
    const res = await fetch('/api/stats');
    if (!res.ok) return null;
    return res.json();
  },
};
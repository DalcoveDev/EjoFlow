import type { EjoUiData } from '../types';
export interface EjoChatReply { text: string; ui?: EjoUiData | null; conversationId?: string | null }
export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export interface StoredMessage { role: 'user' | 'assistant'; content: string; ui?: EjoUiData | null }
export interface StoredConversation { id: string; providerId: string; messages: StoredMessage[]; actions: { provider: string; action: string; ok: boolean; createdAt: string }[] }
export const ejoChatService = {
  async send(providerId: string, messages: ChatMessage[], conversationId?: string | null, regenerate = false, mode: 'chat' | 'do' = 'chat', lang: string = 'rw'): Promise<EjoChatReply | null> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ providerId, conversationId, regenerate, mode, lang, messages }),
    });
    if (res.status === 429) {
      const data = await res.json().catch(() => ({}));
      throw Object.assign(new Error(data.reply ?? '⚠️ AI yarushywe kuri uyu munsi — gerageza ejo.'), { quota: true });
    }
    if (!res.ok) throw new Error('chat-failed');
    const data = await res.json();
    return data.reply ? { text: data.reply, ui: data.ui ?? null, conversationId: data.conversationId ?? null } : null;
  },
  async getConversation(providerId: string): Promise<StoredConversation | null> {
    const res = await fetch(`/api/conversations/${encodeURIComponent(providerId)}`);
    if (!res.ok) return null;
    return res.json();
  },
};
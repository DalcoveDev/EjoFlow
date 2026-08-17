export interface EjoChatReply { text: string }
export interface ChatMessage { role: 'user' | 'assistant'; content: string }
export const ejoChatService = {
  async send(providerId: string, messages: ChatMessage[]): Promise<EjoChatReply | null> {
    const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ providerId, messages }) });
    if (!res.ok) throw new Error('chat-failed');
    const data = await res.json();
    return data.reply ? { text: data.reply } : null;
  },
};
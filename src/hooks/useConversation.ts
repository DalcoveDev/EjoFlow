import { useEffect, useState } from 'react';
import { useI18n } from '../i18n/LanguageContext';
import { ejoChatService, type ChatMessage } from '../services/ejoChatService';
import type { ConversationMessageType, EjoUiData } from '../types';
export interface ConversationItem { id: string; type: ConversationMessageType; text: string; ui?: EjoUiData | null; }
export type ConversationPhase = 'question' | 'processing' | 'review' | 'error';
export function useConversation(providerId: string) {
  const { lang } = useI18n();
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<ConversationPhase>('question');
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [conversationId, setConversationId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setItems([]);
    setMessages([]);
    setConversationId(null);
    ejoChatService.getConversation(providerId).then((conv) => {
      if (cancelled) return;
      if (conv) {
        const stored = conv.messages.filter((m) => m.role === 'user' || m.role === 'assistant');
        setMessages(stored.map((m) => ({ role: m.role, content: m.content })));
        setItems(stored.map((m) => ({
          id: crypto.randomUUID(),
          type: m.role === 'user' ? 'user' : 'assistant',
          text: m.content,
          ui: m.ui ?? null,
        })));
        setConversationId(conv.id);
      }
      setLoading(false);
    }).catch(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [providerId]);

  async function answer(value: string) {
    if (!value.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: value.trim() };
    setItems(i => [...i, { id: crypto.randomUUID(), type: 'user', text: userMsg.content }]);
    const history = [...messages, userMsg];
    setMessages(history);
    setTyping(true); setPhase('processing');
    try {
      const reply = await ejoChatService.send(providerId, history, conversationId, false, 'chat', lang);
      if (!reply) { setTyping(false); setPhase('question'); return; }
      if (reply.conversationId) setConversationId(reply.conversationId);
      setMessages(m => [...m, { role: 'assistant', content: reply.text }]);
      setItems(i => [...i, { id: crypto.randomUUID(), type: 'assistant', text: reply.text, ui: reply.ui ?? null }]);
      setTyping(false); setPhase('question');
    } catch (err) {
      const text = (err as { quota?: boolean; message?: string })?.quota ? (err as { message: string }).message : '⚠️ Ntitwashoboye kohereza ubutumwa. Gerageza nanone.';
      setItems(i => [...i, { id: crypto.randomUUID(), type: 'error', text }]);
      setTyping(false); setPhase('error');
    }
  }

  async function regenerate() {
    if (typing) return;
    const history = [...messages];
    while (history.length && history[history.length - 1].role !== 'user') history.pop();
    if (!history.length) return;
    setMessages(history);
    setItems(i => {
      const trimmed = [...i];
      while (trimmed.length && trimmed[trimmed.length - 1].type !== 'user') trimmed.pop();
      return trimmed;
    });
    setTyping(true); setPhase('processing');
    try {
      const reply = await ejoChatService.send(providerId, history, conversationId, true, 'chat', lang);
      if (!reply) { setTyping(false); setPhase('question'); return; }
      if (reply.conversationId) setConversationId(reply.conversationId);
      setMessages(m => [...m, { role: 'assistant', content: reply.text }]);
      setItems(i => [...i, { id: crypto.randomUUID(), type: 'assistant', text: reply.text, ui: reply.ui ?? null }]);
      setTyping(false); setPhase('question');
    } catch (err) {
      const text = (err as { quota?: boolean; message?: string })?.quota ? (err as { message: string }).message : '⚠️ Ntitwashoboye kohereza ubutumwa. Gerageza nanone.';
      setItems(i => [...i, { id: crypto.randomUUID(), type: 'error', text }]);
      setTyping(false); setPhase('error');
    }
  }
  return { items, phase, typing, loading, answer, regenerate };
}
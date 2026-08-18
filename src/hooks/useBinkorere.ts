import { useEffect, useState } from 'react';
import { ejoChatService, type ChatMessage } from '../services/ejoChatService';
import { useI18n } from '../i18n/LanguageContext';
import type { EjoUiData } from '../types';
export interface BinkorereItem { id: string; done: boolean; text: string; error?: string; ui?: EjoUiData | null }
export type BinkorereStage = 'idle' | 'working' | 'done' | 'error';
export function useBinkorere() {
  const { lang } = useI18n();
  const [items, setItems] = useState<BinkorereItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [stage, setStage] = useState<BinkorereStage>('idle');
  const [conversationId, setConversationId] = useState<string | null>(null);

  async function run(value: string) {
    const text = value.trim();
    if (!text || stage === 'working') return;
    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(m => [...m, userMsg]);
    setStage('working');
    try {
      const reply = await ejoChatService.send('binkorere', [...messages, userMsg], conversationId, false, 'do', lang);
      if (reply?.conversationId) setConversationId(reply.conversationId);
      setItems(i => [...i, { id: crypto.randomUUID(), done: true, text, ui: reply?.ui ?? null }]);
      setMessages(m => [...m, { role: 'assistant', content: reply?.text ?? '' }]);
      setStage(reply?.text ? 'done' : 'error');
    } catch (err) {
      const quota = (err as { quota?: boolean })?.quota;
      setItems(i => [...i, { id: crypto.randomUUID(), done: false, text, error: quota ? (err as { message: string }).message : 'Ntibyashobotse. Gerageza nanone.' }]);
      setStage('error');
    }
  }

  useEffect(() => {
    ejoChatService.getConversation('binkorere').then(conv => {
      if (!conv) return;
      setConversationId(conv.id);
      const stored = conv.messages.filter(m => m.role === 'user' || m.role === 'assistant');
      setMessages(stored.map(m => ({ role: m.role, content: m.content })));
      setItems(stored.filter(m => m.role === 'user').map(m => ({ id: crypto.randomUUID(), done: true, text: m.content, ui: m.ui ?? null })));
    }).catch(() => {});
  }, []);
  return { items, stage, run };
}
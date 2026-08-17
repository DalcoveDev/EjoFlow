import { useState } from 'react'; import { ejoChatService, type ChatMessage } from '../services/ejoChatService'; import type { ConversationMessageType } from '../types';
export interface ConversationItem { id: string; type: ConversationMessageType; text: string; }
export type ConversationPhase = 'question' | 'processing' | 'review' | 'error';
export function useConversation(providerId: string) {
  const [items, setItems] = useState<ConversationItem[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [phase, setPhase] = useState<ConversationPhase>('question');
  const [typing, setTyping] = useState(false);
  async function answer(value: string) {
    if (!value.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: value.trim() };
    setItems(i => [...i, { id: crypto.randomUUID(), type: 'user', text: userMsg.content }]);
    const history = [...messages, userMsg];
    setMessages(history);
    setTyping(true); setPhase('processing');
    try {
      const reply = await ejoChatService.send(providerId, history);
      if (!reply) { setTyping(false); setPhase('question'); return; }
      setMessages(m => [...m, { role: 'assistant', content: reply.text }]);
      setItems(i => [...i, { id: crypto.randomUUID(), type: 'assistant', text: reply.text }]);
      setTyping(false); setPhase('question');
    } catch {
      setItems(i => [...i, { id: crypto.randomUUID(), type: 'error', text: 'Ntitwashoboye kohereza ubutumwa. Gerageza nanone.' }]);
      setTyping(false); setPhase('error');
    }
  }
  return { items, phase, typing, answer };
}
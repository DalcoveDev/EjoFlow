import { useEffect, useState } from 'react'; import { mockActionService } from '../services/mock/mockActionService'; import { mockConversationService } from '../services/mock/mockConversationService'; import { delay } from '../services/mock/delay'; import type { Action, ConversationMessageType } from '../types';
export interface ConversationItem { id: string; type: ConversationMessageType; text?: string; people?: number; action?: Action; }
export type ConversationPhase = 'question' | 'processing' | 'review' | 'error';
const genericReplies: Record<string, string> = {
  rra: 'RRA irakwitabira: dukorera hamwe kwishyura imisoro no kureba amafaranga ufite.',
  gmail: 'Gmail iracyagukorera: tuzagerageza imenyesha zawe kandi tuzigushyire ku ruti.',
  whatsapp: 'WhatsApp irabyemera: ubutumwa bwawe buzajya hano nk’ikiganiro gisanzwe.',
  mtn: 'MTN Mobile Money irakwitabira: ubwishyu bukorwa ufite umubare wawe wa MoMo.',
  bk: 'Bank of Kigali iracyagukorera: reka turebe inyandiko n’uburyo bwo kwishyura.',
};
export function useConversation(providerId: string, providerName: string) {
  const isIrembo = providerId === 'irembo';
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [items, setItems] = useState<ConversationItem[]>(isIrembo ? [{ id: '1', type: 'user', text: 'Ndashaka kwishyurira umuryango wanjye Mutuelle.' }, { id: '2', type: 'assistant', text: 'Nibyo. Ndagufasha kubikora.' }, { id: '3', type: 'question', text: 'Ni abantu bangahe ushaka kwishyurira?' }] : [{ id: 'g1', type: 'assistant', text: `Muraho! Ni ${providerName}. EjoFlow irafatanya na ${providerName} kugira ngo tugukore akazi kihuse. Sobanura icyo ushaka gukora.` }]);
  const [phase, setPhase] = useState<ConversationPhase>('question');
  const [typing, setTyping] = useState(false);
  useEffect(() => { mockConversationService.create(providerId).then(conversation => setConversationId(conversation.id)); }, [providerId]);
  async function answer(value: string) {
    if (!value.trim()) return;
    if (isIrembo) {
      const people = Number(value);
      if (!Number.isFinite(people) || people < 1 || people > 20) { setItems(i => [...i, { id: crypto.randomUUID(), type: 'error', text: 'Andika umubare w’abantu uri hagati ya 1 na 20.' }]); setPhase('error'); return; }
      setItems(i => [...i, { id: crypto.randomUUID(), type: 'user', text: value }]); setTyping(true); setPhase('processing');
      const [actions] = await Promise.all([mockActionService.suggest('irembo'), delay(700)]);
      const action = actions[0];
      if (action) setItems(i => [...i, { id: crypto.randomUUID(), type: 'assistant', text: 'Murakoze. Reka ntegure ubwishyu bwa Mutuelle.' }, { id: crypto.randomUUID(), type: 'action', people, action }]);
      setTyping(false); setPhase('review');
    } else {
      setItems(i => [...i, { id: crypto.randomUUID(), type: 'user', text: value }]); setTyping(true); setPhase('processing');
      await delay(900);
      const reply = genericReplies[providerId] ?? `${providerName} iracyagukorera, kandi byose binyuze aha mu kiganiro.`;
      setItems(i => [...i, { id: crypto.randomUUID(), type: 'assistant', text: reply }, { id: crypto.randomUUID(), type: 'question', text: 'Ubundi? Sobanura ikindi ushaka cyangwa urebe intambwe zikurikirana.' }]);
      setTyping(false); setPhase('question');
    }
  }
  return { conversationId, items, phase, typing, answer };
}
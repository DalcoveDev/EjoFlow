import { delay } from './delay'; import type { Conversation } from '../../types';
export const mockConversationService = { async create(providerId?: string): Promise<Conversation> { await delay(); return { id: crypto.randomUUID(), providerId, messages: [] }; } };

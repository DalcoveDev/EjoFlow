export type ProviderStatus = 'connected' | 'unavailable' | 'loading';
export interface Capability { id: string; name: string }
export interface Provider { id: string; name: string; domain: string; description: string; status: ProviderStatus; capabilities: Capability[]; lastUsed?: string; mark: string; website?: string; }
export interface User { id: string; name: string; initials: string; }
export type ConversationMessageType = 'user' | 'assistant' | 'system' | 'question' | 'action' | 'result' | 'error';
export interface Message { id: string; author: 'user' | 'flow'; text: string; createdAt: string; type?: ConversationMessageType; }
export interface Conversation { id: string; providerId?: string; messages: Message[]; }
export interface Service { id: string; providerId: string; name: string; description: string; }
export interface Action { id: string; label: string; providerId: string; }
export interface Invoice { id: string; amount: number; currency: 'RWF'; status: 'pending' | 'paid'; }
export interface Payment { id: string; amount: number; currency: 'RWF'; status: 'pending' | 'complete'; }
export interface Transaction { id: string; paymentId: string; status: 'pending' | 'complete'; }

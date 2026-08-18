export type ProviderStatus = 'connected' | 'demo' | 'unavailable' | 'loading';
export type ProviderCategory = 'government' | 'communication' | 'business' | 'personal' | 'ai';
export interface Capability { id: string; name: string }
export interface Provider { id: string; name: string; category: ProviderCategory; domain: string; description: string; status: ProviderStatus; capabilities: Capability[]; lastUsed?: string; mark: string; website?: string; }
export interface User { id: string; name: string; initials: string; }
export type ConversationMessageType = 'user' | 'assistant' | 'system' | 'question' | 'action' | 'result' | 'error';
export interface Message { id: string; author: 'user' | 'flow'; text: string; createdAt: string; type?: ConversationMessageType; }
export interface Conversation { id: string; providerId?: string; messages: Message[]; }
export interface Service { id: string; providerId: string; name: string; description: string; }
export interface Action { id: string; label: string; providerId: string; }
export interface Invoice { id: string; amount: number; currency: 'RWF'; status: 'pending' | 'paid'; }
export interface Payment { id: string; amount: number; currency: 'RWF'; status: 'pending' | 'complete'; }
export interface Transaction { id: string; paymentId: string; status: 'pending' | 'complete'; }
export type ActivityStatus = 'completed' | 'pending' | 'failed';
export interface Activity { id: string; provider: string; service: string; action: string; status: ActivityStatus; date: string; time: string; reference?: string; amount?: string; }
export type DirectoryStatus = 'available' | 'connected' | 'coming-soon';
export interface DirectoryProvider { id: string; name: string; domain: string; category: string; status: DirectoryStatus; }
export interface EjoMailItem { sender: string; subject: string; summary: string; date: string }
export interface EjoEmailList { type: 'email_list'; title: string; count: number; items: EjoMailItem[] }
export type EjoUiData = EjoEmailList;
export interface ServiceGuide {
  id: string;
  category: string;
  providerId: string;
  name: string;
  description: string | null;
  whoCanUse: string | null;
  documents: string[] | null;
  infoNeeded: string[] | null;
  steps: string[] | null;
  fees: string | null;
  processingTime: string | null;
  access: string | null;
}
export type DiscoverStatus = 'matched' | 'clarify';
export interface DiscoverResult {
  status: DiscoverStatus;
  understanding: string;
  category?: string | null;
  service?: ServiceGuide | null;
  clarification?: string[];
}
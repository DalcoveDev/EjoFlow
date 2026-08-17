import { providers } from '../data/providers'; import type { Provider } from '../types';
export const providerService = {
  async list(): Promise<Provider[]> { return providers; },
  async getById(id: string): Promise<Provider | null> { return providers.find(provider => provider.id === id) ?? null; },
};
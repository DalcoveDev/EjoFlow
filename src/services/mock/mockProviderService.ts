import { providers } from '../../data/providers'; import { delay } from './delay'; import type { Provider } from '../../types';
export const mockProviderService = { async list(): Promise<Provider[]> { await delay(650); return providers; }, async getById(id: string) { await delay(); return providers.find(provider => provider.id === id); } };

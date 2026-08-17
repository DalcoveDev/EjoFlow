import { delay } from './delay'; import type { Service } from '../../types';
const iremboServices: Service[] = [
  { id: 'mutuelle', providerId: 'irembo', name: 'Mutuelle', description: "Kwishyura cyangwa kureba amakuru y'ubwishyu." },
  { id: 'documents', providerId: 'irembo', name: 'Inyandiko', description: "Gusaba inyandiko cyangwa kureba aho ubusabe bwayo bugeze." },
  { id: 'status', providerId: 'irembo', name: "Status y'ubusabe", description: 'Kureba aho ubusabe bwawe bugeze.' },
];
export const mockServiceService = { async listForProvider(providerId: string): Promise<Service[]> { await delay(650); return iremboServices.filter(service => service.providerId === providerId); } };
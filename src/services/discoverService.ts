import type { DiscoverResult } from '../types';
export const discoverService = {
  async discover(text: string): Promise<DiscoverResult | null> {
    const res = await fetch('/api/discover', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    return res.json();
  },
};
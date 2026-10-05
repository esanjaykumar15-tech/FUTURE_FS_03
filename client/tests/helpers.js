import { vi } from 'vitest';

export const jsonRes = (status, body) => ({ ok: status >= 200 && status < 300, status, json: async () => body });
export const mockFetch = (impl) => { const f = vi.fn(impl); vi.stubGlobal('fetch', f); return f; };

export const menuItems = [
  { id: '1', name: 'Signature Latte', description: 'Espresso with milk', category: 'Hot Coffee', price: 4.5, available: true },
  { id: '2', name: 'Cold Brew', description: 'Steeped 18 hours', category: 'Cold Drinks', price: 4.8, available: true },
  { id: '3', name: 'Lemon Iced Tea', description: 'Black tea and lemon', category: 'Cold Drinks', price: 3.9, available: false },
  { id: '4', name: 'Cheesecake', description: 'Berry compote', category: 'Desserts', price: 5.5, available: true },
];

export const future = (days = 7) => {
  const d = new Date(); d.setDate(d.getDate() + days);
  const off = d.getTimezoneOffset() * 60000;
  return new Date(d - off).toISOString().slice(0, 10);
};

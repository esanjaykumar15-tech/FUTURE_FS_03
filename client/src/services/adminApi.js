import { api } from './api.js';

const qs = (p) => {
  const s = new URLSearchParams(Object.entries(p).filter(([, v]) => v)).toString();
  return s ? `?${s}` : '';
};

// Every call carries the user's Supabase access token. The SERVER decides whether
// that user is an admin; nothing here grants access.
export function createAdminApi(token) {
  const r = (path, opts = {}) => api.request(`/admin${path}`, { ...opts, token });
  const data = (x) => x.data;
  return {
    me: () => r('/me').then(data),
    summary: () => r('/summary').then(data),
    listReservations: (params = {}) => r(`/reservations${qs(params)}`).then(data),
    updateReservation: (id, status) => r(`/reservations/${id}`, { method: 'PATCH', body: { status } }).then(data),
    listEnquiries: () => r('/enquiries').then(data),
    updateEnquiry: (id, status) => r(`/enquiries/${id}`, { method: 'PATCH', body: { status } }).then(data),
    createMenuItem: (body) => r('/menu', { method: 'POST', body }).then(data),
    updateMenuItem: (id, body) => r(`/menu/${id}`, { method: 'PATCH', body }).then(data),
    deleteMenuItem: (id) => r(`/menu/${id}`, { method: 'DELETE' }),
  };
}

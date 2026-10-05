const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api').replace(/\/$/, '');

export class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.status = status;
    this.details = details || [];
  }
}

async function request(path, { method = 'GET', body, token } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: {
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('Could not reach the server. Check your connection and try again.', 0);
  }
  if (res.status === 204) return null;
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON error body */ }
  if (!res.ok) {
    throw new ApiError(json?.error?.message || 'Something went wrong. Please try again.', res.status, json?.error?.details);
  }
  return json;
}

export const api = {
  getMenu: (params = {}) => {
    const qs = new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString();
    return request(`/menu${qs ? `?${qs}` : ''}`).then((r) => r.data);
  },
  createReservation: (body) => request('/reservations', { method: 'POST', body }),
  createEnquiry: (body) => request('/enquiries', { method: 'POST', body }),
  request, // used by the admin area (Stage 4)
};

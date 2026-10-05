import { createApp } from '../src/app.js';

export const env = { CLIENT_ORIGIN: 'http://localhost:5173', NODE_ENV: 'test' };
export const ADMIN_TOKEN = 'admin-token';
export const USER_TOKEN = 'user-token';
export const UUID = '123e4567-e89b-42d3-a456-426614174000';

// Chainable, awaitable fake of the supabase-js query builder.
// `handlers[table]({op, calls})` returns {data, error, count}.
export function makeDb(handlers = {}) {
  const log = [];
  const db = {
    auth: {
      async getUser(token) {
        const users = { [ADMIN_TOKEN]: 'admin-1', [USER_TOKEN]: 'user-1' };
        return users[token]
          ? { data: { user: { id: users[token] } }, error: null }
          : { data: { user: null }, error: { message: 'bad jwt' } };
      },
    },
    from(table) {
      const calls = [];
      let op = 'select';
      const result = () => {
        if (table === 'profiles') {
          const uid = calls.find((c) => c[0] === 'eq')?.[2];
          return { data: { role: uid === 'admin-1' ? 'admin' : 'customer' }, error: null };
        }
        const r = (handlers[table] ?? (() => ({ data: [], error: null })))({ op, calls });
        log.push({ table, op, calls });
        return r;
      };
      const b = new Proxy({}, {
        get(_t, prop) {
          if (prop === 'then') return (res, rej) => Promise.resolve(result()).then(res, rej);
          if (prop === 'single' || prop === 'maybeSingle') {
            return () => {
              const r = result();
              return Promise.resolve({ ...r, data: Array.isArray(r.data) ? r.data[0] ?? null : r.data });
            };
          }
          return (...args) => {
            if (['insert', 'update', 'delete'].includes(prop)) op = prop;
            calls.push([prop, ...args]);
            return b;
          };
        },
      });
      return b;
    },
  };
  db.log = log;
  return db;
}

export const buildApp = (handlers, limits) => {
  const db = makeDb(handlers);
  return { app: createApp({ db, env, limits }), db };
};

export const futureDate = (days = 7) => {
  const d = new Date(); d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};
export const validReservation = () => ({
  customer_name: 'Jane Doe', phone: '+1 555 123 4567',
  booking_date: futureDate(), booking_time: '18:30', party_size: 4,
});

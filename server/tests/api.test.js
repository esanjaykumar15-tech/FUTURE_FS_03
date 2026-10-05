import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import { buildApp, ADMIN_TOKEN, USER_TOKEN, UUID, futureDate, validReservation } from './helpers.js';

const auth = (t) => ({ Authorization: `Bearer ${t}` });
const items = [{ id: UUID, name: 'Latte', category: 'Hot Coffee', price: 4.5, available: true }];

describe('health & basics', () => {
  it('GET /api/health', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });
  it('unknown route returns structured 404', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/api/nope');
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBeTruthy();
  });
  it('rejects disallowed CORS origin', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/api/health').set('Origin', 'https://evil.example');
    expect(res.status).toBe(403);
  });
  it('sets Helmet headers', async () => {
    const { app } = buildApp();
    const res = await request(app).get('/api/health');
    expect(res.headers['x-content-type-options']).toBe('nosniff');
  });
  it('rejects oversized bodies', async () => {
    const { app } = buildApp();
    const res = await request(app).post('/api/enquiries').send({ message: 'x'.repeat(20000) });
    expect(res.status).toBe(413);
  });
});

describe('public menu', () => {
  it('lists items', async () => {
    const { app } = buildApp({ menu_items: () => ({ data: items, error: null }) });
    const res = await request(app).get('/api/menu');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
  it('applies category filter', async () => {
    const { app, db } = buildApp({ menu_items: () => ({ data: items, error: null }) });
    await request(app).get('/api/menu?category=Tea');
    expect(db.log[0].calls).toContainEqual(['eq', 'category', 'Tea']);
  });
  it('rejects unknown category', async () => {
    const { app } = buildApp();
    expect((await request(app).get('/api/menu?category=Pizza')).status).toBe(400);
  });
  it('does not let search input inject filter syntax', async () => {
    const { app, db } = buildApp({ menu_items: () => ({ data: [], error: null }) });
    await request(app).get('/api/menu').query({ q: 'a),id.not.is.null,(b' });
    const orCall = db.log[0].calls.find((c) => c[0] === 'or')[1];
    expect(orCall.match(/ilike/g)).toHaveLength(2); // only our two clauses
  });
  it('404 for missing item and 400 for bad id', async () => {
    const { app } = buildApp({ menu_items: () => ({ data: null, error: null }) });
    expect((await request(app).get(`/api/menu/${UUID}`)).status).toBe(404);
    expect((await request(app).get('/api/menu/not-a-uuid')).status).toBe(400);
  });
  it('returns generic 500 on database error without leaking details', async () => {
    const { app } = buildApp({ menu_items: () => ({ data: null, error: { message: 'secret db detail' } }) });
    const res = await request(app).get('/api/menu');
    expect(res.status).toBe(500);
    expect(JSON.stringify(res.body)).not.toContain('secret');
  });
});

describe('reservations (public)', () => {
  it('creates a pending reservation and never claims confirmation', async () => {
    const handler = vi.fn(() => ({ data: [{ id: UUID, status: 'pending' }], error: null }));
    const { app, db } = buildApp({ reservations: handler });
    const res = await request(app).post('/api/reservations').send(validReservation());
    expect(res.status).toBe(201);
    expect(res.body.data.status).toBe('pending');
    expect(res.body.message).toMatch(/pending/i);
    const insert = db.log[0].calls.find((c) => c[0] === 'insert')[1];
    expect(insert.status).toBe('pending');
  });
  it('rejects client-supplied status (cannot self-confirm)', async () => {
    const { app } = buildApp();
    const res = await request(app).post('/api/reservations').send({ ...validReservation(), status: 'confirmed' });
    expect(res.status).toBe(400);
  });
  it.each([
    ['past date', { booking_date: '2020-01-01' }, 'booking_date'],
    ['impossible date', { booking_date: '2099-02-31' }, 'booking_date'],
    ['too far ahead', { booking_date: futureDate(400) }, 'booking_date'],
    ['party size 0', { party_size: 0 }, 'party_size'],
    ['party size 500', { party_size: 500 }, 'party_size'],
    ['bad time', { booking_time: '25:99' }, 'booking_time'],
    ['bad phone', { phone: 'abc' }, 'phone'],
    ['short name', { customer_name: 'A' }, 'customer_name'],
  ])('rejects %s', async (_n, patch, field) => {
    const { app } = buildApp();
    const res = await request(app).post('/api/reservations').send({ ...validReservation(), ...patch });
    expect(res.status).toBe(400);
    expect(res.body.error.details.map((d) => d.field)).toContain(field);
  });
  it('returns 409 on duplicate submission', async () => {
    const { app } = buildApp({ reservations: () => ({ data: null, error: { code: '23505' } }) });
    const res = await request(app).post('/api/reservations').send(validReservation());
    expect(res.status).toBe(409);
  });
  it('returns 500 on database failure', async () => {
    const { app } = buildApp({ reservations: () => ({ data: null, error: { code: 'XX000' } }) });
    expect((await request(app).post('/api/reservations').send(validReservation())).status).toBe(500);
  });
  it('rate limits repeated submissions', async () => {
    const { app } = buildApp(
      { reservations: () => ({ data: [{ id: UUID, status: 'pending' }], error: null }) },
      { publicMax: 2 },
    );
    const send = () => request(app).post('/api/reservations').send(validReservation());
    await send(); await send();
    expect((await send()).status).toBe(429);
  });
});

describe('enquiries (public)', () => {
  const good = { name: 'Sam', email: 'sam@example.com', message: 'Do you take large bookings?' };
  it('stores a valid enquiry', async () => {
    const { app } = buildApp({ enquiries: () => ({ data: [{}], error: null }) });
    expect((await request(app).post('/api/enquiries').send(good)).status).toBe(201);
  });
  it.each([
    ['bad email', { email: 'nope' }],
    ['short message', { message: 'hi' }],
    ['bad phone', { phone: '!!' }],
    ['honeypot filled', { website: 'http://spam.example' }],
  ])('rejects %s', async (_n, patch) => {
    const { app } = buildApp();
    expect((await request(app).post('/api/enquiries').send({ ...good, ...patch })).status).toBe(400);
  });
});

describe('admin authorization', () => {
  const routes = [
    ['get', '/api/admin/reservations'],
    ['patch', `/api/admin/reservations/${UUID}`],
    ['post', '/api/admin/menu'],
    ['patch', `/api/admin/menu/${UUID}`],
    ['delete', `/api/admin/menu/${UUID}`],
    ['get', '/api/admin/enquiries'],
    ['get', '/api/admin/summary'],
  ];
  it.each(routes)('%s %s → 401 without token', async (m, url) => {
    const { app } = buildApp();
    expect((await request(app)[m](url).send({})).status).toBe(401);
  });
  it.each(routes)('%s %s → 401 with invalid token', async (m, url) => {
    const { app } = buildApp();
    expect((await request(app)[m](url).set(auth('garbage')).send({})).status).toBe(401);
  });
  it.each(routes)('%s %s → 403 for non-admin user', async (m, url) => {
    const { app } = buildApp();
    expect((await request(app)[m](url).set(auth(USER_TOKEN)).send({})).status).toBe(403);
  });
  it('non-admin cannot create menu items (and nothing is written)', async () => {
    const { app, db } = buildApp();
    await request(app).post('/api/admin/menu').set(auth(USER_TOKEN))
      .send({ name: 'X', category: 'Tea', price: 1 });
    expect(db.log.filter((l) => l.table === 'menu_items')).toHaveLength(0);
  });
});

describe('admin operations', () => {
  const newItem = { name: 'Mocha', description: 'Choc', category: 'Hot Coffee', price: 4.756 };
  it('creates a menu item with rounded price', async () => {
    const { app, db } = buildApp({ menu_items: () => ({ data: [{ id: UUID, ...newItem }], error: null }) });
    const res = await request(app).post('/api/admin/menu').set(auth(ADMIN_TOKEN)).send(newItem);
    expect(res.status).toBe(201);
    expect(db.log[0].calls.find((c) => c[0] === 'insert')[1].price).toBe(4.76);
  });
  it.each([
    ['negative price', { price: -1 }],
    ['non-numeric price', { price: 'free' }],
    ['bad category', { category: 'Pizza' }],
    ['unknown field', { role: 'admin' }],
  ])('rejects menu create with %s', async (_n, patch) => {
    const { app } = buildApp();
    const res = await request(app).post('/api/admin/menu').set(auth(ADMIN_TOKEN)).send({ ...newItem, ...patch });
    expect(res.status).toBe(400);
  });
  it('edits a menu item; rejects empty patch', async () => {
    const { app } = buildApp({ menu_items: () => ({ data: [{ id: UUID, price: 5 }], error: null }) });
    expect((await request(app).patch(`/api/admin/menu/${UUID}`).set(auth(ADMIN_TOKEN)).send({ price: 5 })).status).toBe(200);
    expect((await request(app).patch(`/api/admin/menu/${UUID}`).set(auth(ADMIN_TOKEN)).send({})).status).toBe(400);
  });
  it('deletes (204) and 404s for missing item', async () => {
    const ok = buildApp({ menu_items: () => ({ data: [{ id: UUID }], error: null }) });
    expect((await request(ok.app).delete(`/api/admin/menu/${UUID}`).set(auth(ADMIN_TOKEN))).status).toBe(204);
    const missing = buildApp({ menu_items: () => ({ data: [], error: null }) });
    expect((await request(missing.app).delete(`/api/admin/menu/${UUID}`).set(auth(ADMIN_TOKEN))).status).toBe(404);
  });
  it('updates reservation status; rejects invalid status', async () => {
    const { app } = buildApp({ reservations: () => ({ data: [{ id: UUID, status: 'confirmed' }], error: null }) });
    const url = `/api/admin/reservations/${UUID}`;
    expect((await request(app).patch(url).set(auth(ADMIN_TOKEN)).send({ status: 'confirmed' })).status).toBe(200);
    expect((await request(app).patch(url).set(auth(ADMIN_TOKEN)).send({ status: 'approved' })).status).toBe(400);
    expect((await request(app).patch(url).set(auth(ADMIN_TOKEN)).send({ status: 'confirmed', party_size: 99 })).status).toBe(400);
  });
  it('lists reservations with filters; rejects bad filter', async () => {
    const { app, db } = buildApp({ reservations: () => ({ data: [], error: null }) });
    const res = await request(app).get('/api/admin/reservations?status=pending&date=2030-01-01').set(auth(ADMIN_TOKEN));
    expect(res.status).toBe(200);
    expect(db.log[0].calls).toContainEqual(['eq', 'status', 'pending']);
    expect((await request(app).get('/api/admin/reservations?status=bogus').set(auth(ADMIN_TOKEN))).status).toBe(400);
  });
  it('summary returns counts', async () => {
    const { app } = buildApp({ menu_items: () => ({ count: 3, error: null }), reservations: () => ({ count: 2, error: null }), enquiries: () => ({ count: 1, error: null }) });
    const res = await request(app).get('/api/admin/summary').set(auth(ADMIN_TOKEN));
    expect(res.body.data).toEqual({ menuItems: 3, pendingReservations: 2, newEnquiries: 1 });
  });
});

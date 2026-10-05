import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import { mockFetch, jsonRes, menuItems } from './helpers.js';

const fake = vi.hoisted(() => ({ session: null, signInFails: false, listener: null, signOutCalls: 0 }));
vi.mock('../src/lib/supabase.js', () => ({
  supabaseConfigured: true,
  supabase: {
    auth: {
      getSession: async () => ({ data: { session: fake.session } }),
      onAuthStateChange: (cb) => { fake.listener = cb; return { data: { subscription: { unsubscribe() {} } } }; },
      signInWithPassword: async () => {
        if (fake.signInFails) return { error: { status: 400, message: 'Invalid login credentials' } };
        fake.session = { access_token: 'tok' }; fake.listener?.('SIGNED_IN', fake.session);
        return { error: null };
      },
      signOut: async () => { fake.signOutCalls++; fake.session = null; fake.listener?.('SIGNED_OUT', null); },
    },
  },
}));

const { default: App } = await import('../src/App.jsx');

const reservations = [
  { id: 'r1', customer_name: 'Jane Doe', phone: '+1 555 123 4567', booking_date: '2030-05-01', booking_time: '18:00:00', party_size: 4, status: 'pending' },
  { id: 'r2', customer_name: 'Omar Ali', phone: '+1 555 000 1111', booking_date: '2030-05-02', booking_time: '12:00:00', party_size: 2, status: 'confirmed' },
];
const enquiries = [{ id: 'e1', name: 'Sam', email: 'sam@example.com', phone: null, message: 'Do you host events?', status: 'new', created_at: '2030-01-01T10:00:00Z' }];

// Route-table fetch mock: keys are "METHOD /path".
function server(routes) {
  const f = mockFetch(async (url, opts = {}) => {
    const u = new URL(url);
    const h = routes[`${opts.method || 'GET'} ${u.pathname}`];
    if (!h) return jsonRes(404, { error: { message: `no route ${opts.method || 'GET'} ${u.pathname}` } });
    return typeof h === 'function' ? h({ url: u, body: opts.body ? JSON.parse(opts.body) : undefined, opts }) : h;
  });
  f.callsTo = (m, path) => f.mock.calls.filter(([u, o]) => (o?.method || 'GET') === m && new URL(u).pathname === path);
  return f;
}
const adminOk = { 'GET /api/admin/me': jsonRes(200, { data: { id: 'a', role: 'admin' } }) };
const go = (path) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);

beforeEach(() => { fake.session = null; fake.signInFails = false; fake.signOutCalls = 0; });

describe('admin access control', () => {
  it('redirects unauthenticated visitors to the login page and requests no admin data', async () => {
    const f = server({});
    go('/admin/menu');
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(f.mock.calls.filter(([u]) => u.includes('/admin/'))).toHaveLength(0);
  });

  it('shows a generic error for wrong credentials (no account enumeration)', async () => {
    server({}); fake.signInFails = true;
    go('/admin/login');
    const u = userEvent.setup();
    await u.type(await screen.findByLabelText(/^email/i), 'owner@example.com');
    await u.type(screen.getByLabelText(/^password/i), 'wrong');
    await u.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Incorrect email or password.');
  });

  it('validates empty login fields', async () => {
    server({});
    go('/admin/login');
    await userEvent.click(await screen.findByRole('button', { name: /sign in/i }));
    expect(screen.getByText(/enter your email/i)).toBeInTheDocument();
    expect(screen.getByText(/enter your password/i)).toBeInTheDocument();
  });

  it('signs in then lands on the dashboard', async () => {
    server({ ...adminOk, 'GET /api/admin/summary': jsonRes(200, { data: { menuItems: 13, pendingReservations: 2, newEnquiries: 1 } }) });
    go('/admin/login');
    const u = userEvent.setup();
    await u.type(await screen.findByLabelText(/^email/i), 'owner@example.com');
    await u.type(screen.getByLabelText(/^password/i), 'correct horse');
    await u.click(screen.getByRole('button', { name: /sign in/i }));
    expect(await screen.findByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('13')).toBeInTheDocument();
  });

  it('blocks a signed-in NON-admin: shows no-access and never loads admin data', async () => {
    fake.session = { access_token: 'tok' };
    const f = server({ 'GET /api/admin/me': jsonRes(403, { error: { message: 'Administrator access required' } }), 'GET /api/admin/summary': jsonRes(200, { data: {} }) });
    go('/admin');
    expect(await screen.findByRole('heading', { name: /don’t have admin access/i })).toBeInTheDocument();
    expect(f.callsTo('GET', '/api/admin/summary')).toHaveLength(0);
  });

  it('signs out and returns to login when the token is rejected (401)', async () => {
    fake.session = { access_token: 'expired' };
    server({ 'GET /api/admin/me': jsonRes(401, { error: { message: 'Invalid or expired token' } }) });
    go('/admin');
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
    expect(fake.signOutCalls).toBe(1);
  });

  it('sends the bearer token on admin requests and signs out from the header', async () => {
    fake.session = { access_token: 'tok' };
    const f = server({ ...adminOk, 'GET /api/admin/summary': jsonRes(200, { data: { menuItems: 1, pendingReservations: 0, newEnquiries: 0 } }) });
    go('/admin');
    await screen.findByRole('heading', { name: 'Dashboard' });
    expect(f.callsTo('GET', '/api/admin/summary')[0][1].headers.Authorization).toBe('Bearer tok');
    await userEvent.click(screen.getByRole('button', { name: /sign out/i }));
    expect(await screen.findByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });
});

describe('admin menu management', () => {
  beforeEach(() => { fake.session = { access_token: 'tok' }; });
  const base = () => ({ ...adminOk, 'GET /api/menu': jsonRes(200, { data: menuItems }) });

  it('lists items with edit/delete actions', async () => {
    server(base());
    go('/admin/menu');
    expect(await screen.findByText('Signature Latte')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit Cold Brew' })).toBeInTheDocument();
  });

  it('creates an item with a numeric price and the auth token', async () => {
    const f = server({ ...base(), 'POST /api/admin/menu': jsonRes(201, { data: { id: 'n' } }) });
    go('/admin/menu');
    const u = userEvent.setup();
    await u.click(await screen.findByRole('button', { name: /add item/i }));
    await u.type(screen.getByLabelText(/^name/i), 'Mocha');
    await u.type(screen.getByLabelText(/^price/i), '4.75');
    await u.click(screen.getByRole('button', { name: /save item/i }));
    expect(await screen.findByRole('status')).toHaveTextContent('Menu item added.');
    const [, opts] = f.callsTo('POST', '/api/admin/menu')[0];
    expect(JSON.parse(opts.body)).toMatchObject({ name: 'Mocha', price: 4.75, category: 'Hot Coffee', available: true, image_url: null });
    expect(opts.headers.Authorization).toBe('Bearer tok');
  });

  it('rejects empty name and negative price without calling the API', async () => {
    const f = server(base());
    go('/admin/menu');
    const u = userEvent.setup();
    await u.click(await screen.findByRole('button', { name: /add item/i }));
    await u.type(screen.getByLabelText(/^price/i), '-3');
    await u.click(screen.getByRole('button', { name: /save item/i }));
    expect(screen.getByText(/enter a name/i)).toBeInTheDocument();
    expect(screen.getByText(/price of 0 or more/i)).toBeInTheDocument();
    expect(f.callsTo('POST', '/api/admin/menu')).toHaveLength(0);
  });

  it('shows server validation errors on the matching field', async () => {
    server({ ...base(), 'POST /api/admin/menu': jsonRes(400, { error: { message: 'Validation failed', details: [{ field: 'name', message: 'Name is too long' }] } }) });
    go('/admin/menu');
    const u = userEvent.setup();
    await u.click(await screen.findByRole('button', { name: /add item/i }));
    await u.type(screen.getByLabelText(/^name/i), 'X');
    await u.type(screen.getByLabelText(/^price/i), '1');
    await u.click(screen.getByRole('button', { name: /save item/i }));
    expect(await screen.findByText('Name is too long')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save item/i })).toBeEnabled();
  });

  it('edits an item with PATCH', async () => {
    const f = server({ ...base(), 'PATCH /api/admin/menu/2': jsonRes(200, { data: {} }) });
    go('/admin/menu');
    const u = userEvent.setup();
    await u.click(await screen.findByRole('button', { name: 'Edit Cold Brew' }));
    const price = screen.getByLabelText(/^price/i);
    await u.clear(price); await u.type(price, '5.10');
    await u.click(screen.getByRole('button', { name: /save item/i }));
    expect(await screen.findByRole('status')).toHaveTextContent('Menu item updated.');
    expect(JSON.parse(f.callsTo('PATCH', '/api/admin/menu/2')[0][1].body).price).toBe(5.1);
  });

  it('requires confirmation before deleting; "Keep" cancels', async () => {
    const f = server({ ...base(), 'DELETE /api/admin/menu/4': jsonRes(204, null) });
    go('/admin/menu');
    const u = userEvent.setup();
    await u.click(await screen.findByRole('button', { name: 'Delete Cheesecake' }));
    await u.click(screen.getByRole('button', { name: 'Keep' }));
    expect(f.callsTo('DELETE', '/api/admin/menu/4')).toHaveLength(0);
    await u.click(screen.getByRole('button', { name: 'Delete Cheesecake' }));
    await u.click(screen.getByRole('button', { name: /yes, delete/i }));
    expect(await screen.findByRole('status')).toHaveTextContent('Deleted Cheesecake.');
    expect(f.callsTo('DELETE', '/api/admin/menu/4')).toHaveLength(1);
  });

  it('shows an error if delete fails', async () => {
    server({ ...base(), 'DELETE /api/admin/menu/4': jsonRes(500, { error: { message: 'Could not delete menu item' } }) });
    go('/admin/menu');
    const u = userEvent.setup();
    await u.click(await screen.findByRole('button', { name: 'Delete Cheesecake' }));
    await u.click(screen.getByRole('button', { name: /yes, delete/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not delete menu item');
  });
});

describe('admin reservations and enquiries', () => {
  beforeEach(() => { fake.session = { access_token: 'tok' }; });

  it('lists reservations and updates a status with PATCH', async () => {
    const f = server({ ...adminOk, 'GET /api/admin/reservations': jsonRes(200, { data: reservations }), 'PATCH /api/admin/reservations/r1': jsonRes(200, { data: {} }) });
    go('/admin/reservations');
    const sel = await screen.findByLabelText('Status for Jane Doe');
    await userEvent.selectOptions(sel, 'confirmed');
    expect(await screen.findByRole('status')).toHaveTextContent(/jane doe’s reservation is now confirmed/i);
    expect(JSON.parse(f.callsTo('PATCH', '/api/admin/reservations/r1')[0][1].body)).toEqual({ status: 'confirmed' });
    expect(screen.getByRole('link', { name: '+1 555 123 4567' }).getAttribute('href')).toBe('tel:+15551234567');
  });

  it('sends status, date and search filters to the API', async () => {
    const f = server({ ...adminOk, 'GET /api/admin/reservations': jsonRes(200, { data: reservations }) });
    go('/admin/reservations');
    const u = userEvent.setup();
    await screen.findByText('Jane Doe');
    await u.selectOptions(screen.getByLabelText('Status'), 'confirmed');
    await u.type(screen.getByLabelText(/search name or phone/i), 'omar');
    await waitFor(() => {
      const last = new URL(f.callsTo('GET', '/api/admin/reservations').at(-1)[0]);
      expect(last.searchParams.get('status')).toBe('confirmed');
      expect(last.searchParams.get('q')).toBe('omar');
    });
  });

  it('preselects the pending filter from the dashboard link', async () => {
    const f = server({ ...adminOk, 'GET /api/admin/reservations': jsonRes(200, { data: [] }) });
    go('/admin/reservations?status=pending');
    expect(await screen.findByText(/no reservations found/i)).toBeInTheDocument();
    expect(new URL(f.callsTo('GET', '/api/admin/reservations')[0][0]).searchParams.get('status')).toBe('pending');
  });

  it('shows an error when a status update fails', async () => {
    server({ ...adminOk, 'GET /api/admin/reservations': jsonRes(200, { data: reservations }), 'PATCH /api/admin/reservations/r1': jsonRes(500, { error: { message: 'Could not update reservation' } }) });
    go('/admin/reservations');
    await userEvent.selectOptions(await screen.findByLabelText('Status for Jane Doe'), 'cancelled');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not update reservation');
  });

  it('shows an error state with retry when the list fails to load', async () => {
    server({ ...adminOk, 'GET /api/admin/reservations': jsonRes(500, { error: { message: 'Could not load reservations' } }) });
    go('/admin/reservations');
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load reservations');
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
  });

  it('shows enquiries and marks one as read', async () => {
    const f = server({ ...adminOk, 'GET /api/admin/enquiries': jsonRes(200, { data: enquiries }), 'PATCH /api/admin/enquiries/e1': jsonRes(200, { data: {} }) });
    go('/admin/enquiries');
    expect(await screen.findByText('Do you host events?')).toBeInTheDocument();
    await userEvent.selectOptions(screen.getByLabelText('Status for enquiry from Sam'), 'read');
    await waitFor(() => expect(JSON.parse(f.callsTo('PATCH', '/api/admin/enquiries/e1')[0][1].body)).toEqual({ status: 'read' }));
  });
});

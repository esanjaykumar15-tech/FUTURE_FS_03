import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReservationForm from '../src/components/ReservationForm.jsx';
import { mockFetch, jsonRes, future } from './helpers.js';

async function fill({ name = 'Jane Doe', phone = '+1 555 123 4567', date = future(), time = '18:00', size = '4' } = {}) {
  const u = userEvent.setup();
  if (name) await u.type(screen.getByLabelText(/full name/i), name);
  if (phone) await u.type(screen.getByLabelText(/phone number/i), phone);
  if (date) fireEvent.change(screen.getByLabelText(/^date/i), { target: { value: date } });
  if (time) await u.selectOptions(screen.getByLabelText(/^time/i), time);
  fireEvent.change(screen.getByLabelText(/party size/i), { target: { value: size } });
  return u;
}
const submit = (u) => u.click(screen.getByRole('button', { name: /request reservation/i }));

describe('ReservationForm', () => {
  it('blocks an empty submission with field errors and makes no request', async () => {
    const f = mockFetch(async () => jsonRes(201, {}));
    render(<ReservationForm />);
    await userEvent.click(screen.getByRole('button', { name: /request reservation/i }));
    expect(screen.getByText(/enter your name/i)).toBeInTheDocument();
    expect(screen.getByText(/valid phone number/i)).toBeInTheDocument();
    expect(screen.getByText(/choose a date/i)).toBeInTheDocument();
    expect(screen.getByText('Choose a time.')).toBeInTheDocument();
    expect(screen.getByLabelText(/full name/i)).toHaveAttribute('aria-invalid', 'true');
    expect(f).not.toHaveBeenCalled();
  });

  it.each([
    ['past date', { date: '2020-01-01' }, /today or a future date/i],
    ['party of 0', { size: '0' }, /at least 1/i],
    ['party of 50', { size: '50' }, /over 20/i],
    ['bad phone', { phone: 'abc' }, /valid phone number/i],
  ])('rejects %s on the client', async (_n, overrides, msg) => {
    const f = mockFetch(async () => jsonRes(201, {}));
    render(<ReservationForm />);
    const u = await fill(overrides);
    await submit(u);
    expect(await screen.findByText(msg)).toBeInTheDocument();
    expect(f).not.toHaveBeenCalled();
  });

  it('sends the right payload and shows a PENDING (not confirmed) message', async () => {
    const f = mockFetch(async () => jsonRes(201, { data: { booking_date: future(), booking_time: '18:00:00', party_size: 4, status: 'pending' } }));
    render(<ReservationForm />);
    await submit(await fill());
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/pending confirmation/i);
    expect(status).toHaveTextContent(/not confirmed yet/i);
    expect(status).not.toHaveTextContent(/is confirmed|reservation confirmed/i);
    const body = JSON.parse(f.mock.calls[0][1].body);
    expect(body).toMatchObject({ customer_name: 'Jane Doe', party_size: 4, booking_time: '18:00' });
    expect(body).not.toHaveProperty('status');
  });

  it('disables the button while submitting and sends only one request', async () => {
    let release;
    const f = mockFetch(() => new Promise((r) => { release = () => r(jsonRes(201, { data: {} })); }));
    render(<ReservationForm />);
    const u = await fill();
    await submit(u);
    const btn = await screen.findByRole('button', { name: /sending request/i });
    expect(btn).toBeDisabled();
    await u.click(btn);
    expect(f).toHaveBeenCalledTimes(1);
    release();
    await screen.findByRole('status');
  });

  it('shows the server message on a duplicate (409) and keeps the form', async () => {
    mockFetch(async () => jsonRes(409, { error: { message: 'A request for this phone number, date and time was already received.' } }));
    render(<ReservationForm />);
    await submit(await fill());
    expect(await screen.findByRole('alert')).toHaveTextContent(/already received/i);
    expect(screen.getByRole('button', { name: /request reservation/i })).toBeEnabled();
  });

  it('maps server-side validation errors onto fields', async () => {
    mockFetch(async () => jsonRes(400, { error: { message: 'Validation failed', details: [{ field: 'booking_date', message: 'Bookings open up to 90 days ahead' }] } }));
    render(<ReservationForm />);
    await submit(await fill());
    expect(await screen.findByText(/90 days ahead/i)).toBeInTheDocument();
  });

  it('shows a friendly error on server failure or network failure', async () => {
    mockFetch(async () => { throw new TypeError('offline'); });
    render(<ReservationForm />);
    await submit(await fill());
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
  });
});

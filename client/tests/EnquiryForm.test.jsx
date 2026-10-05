import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import EnquiryForm from '../src/components/EnquiryForm.jsx';
import { mockFetch, jsonRes } from './helpers.js';

const fill = async (u, { name = 'Sam', email = 'sam@example.com', message = 'Do you host events?' } = {}) => {
  if (name) await u.type(screen.getByLabelText(/full name/i), name);
  if (email) await u.type(screen.getByLabelText(/^email/i), email);
  if (message) await u.type(screen.getByLabelText(/^message/i), message);
};

describe('EnquiryForm', () => {
  it('rejects an invalid email and short message without calling the API', async () => {
    const f = mockFetch(async () => jsonRes(201, {}));
    render(<EnquiryForm />);
    const u = userEvent.setup();
    await fill(u, { email: 'not-an-email', message: 'hi' });
    await u.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByText(/valid email/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 5 characters/i)).toBeInTheDocument();
    expect(f).not.toHaveBeenCalled();
  });

  it('rejects an invalid optional phone but allows it blank', async () => {
    const f = mockFetch(async () => jsonRes(201, { message: 'ok' }));
    render(<EnquiryForm />);
    const u = userEvent.setup();
    await fill(u);
    await u.type(screen.getByLabelText(/phone \(optional\)/i), 'abc');
    await u.click(screen.getByRole('button', { name: /send message/i }));
    expect(screen.getByText(/valid phone number or leave it blank/i)).toBeInTheDocument();
    await u.clear(screen.getByLabelText(/phone \(optional\)/i));
    await u.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByRole('status')).toHaveTextContent(/message sent/i);
    expect(f).toHaveBeenCalledTimes(1);
  });

  it('shows an error when the API fails and re-enables the button', async () => {
    mockFetch(async () => jsonRes(429, { error: { message: 'Too many submissions. Please try again later.' } }));
    render(<EnquiryForm />);
    const u = userEvent.setup();
    await fill(u);
    await u.click(screen.getByRole('button', { name: /send message/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/too many submissions/i);
    expect(screen.getByRole('button', { name: /send message/i })).toBeEnabled();
  });

  it('prevents duplicate submissions while sending', async () => {
    let release;
    const f = mockFetch(() => new Promise((r) => { release = () => r(jsonRes(201, {})); }));
    render(<EnquiryForm />);
    const u = userEvent.setup();
    await fill(u);
    await u.click(screen.getByRole('button', { name: /send message/i }));
    const btn = await screen.findByRole('button', { name: /sending message/i });
    expect(btn).toBeDisabled();
    await u.click(btn);
    expect(f).toHaveBeenCalledTimes(1);
    release();
    await screen.findByRole('status');
  });
});

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../src/App.jsx';
import { mockFetch, jsonRes, menuItems } from './helpers.js';

const at = (path) => render(<MemoryRouter initialEntries={[path]}><App /></MemoryRouter>);

describe('App routing and layout', () => {
  it('renders the home page with featured items (available only) and CTAs', async () => {
    mockFetch(async () => jsonRes(200, { data: menuItems }));
    at('/');
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(await screen.findByText('Signature Latte')).toBeInTheDocument();
    expect(screen.queryByText('Lemon Iced Tea')).not.toBeInTheDocument();
    const main = within(screen.getByRole('main'));
    expect(main.getByRole('link', { name: /explore menu/i })).toHaveAttribute('href', '/menu');
    expect(main.getByRole('link', { name: /reserve a table/i })).toHaveAttribute('href', '/reservations');
  });

  it('shows a labeled demo banner and has no fabricated reviews', async () => {
    mockFetch(async () => jsonRes(200, { data: [] }));
    at('/');
    expect(await screen.findByText(/demo site/i)).toBeInTheDocument();
    expect(screen.getByText(/reviews will appear here once/i)).toBeInTheDocument();
  });

  it('shows the not-found page for unknown routes', async () => {
    at('/nope');
    expect(await screen.findByRole('heading', { name: /page not found/i })).toBeInTheDocument();
  });

  it('mobile nav toggles with aria-expanded and closes on Escape', async () => {
    mockFetch(async () => jsonRes(200, { data: [] }));
    at('/privacy');
    const u = userEvent.setup();
    const toggle = await screen.findByRole('button', { name: /open menu/i });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await u.click(toggle);
    expect(screen.getByRole('button', { name: /close menu/i })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('navigation', { name: 'Mobile' })).toBeInTheDocument();
    await u.keyboard('{Escape}');
    expect(screen.queryByRole('navigation', { name: 'Mobile' })).not.toBeInTheDocument();
  });

  it('contact page exposes click-to-call and WhatsApp links', async () => {
    at('/contact');
    const call = await screen.findByRole('link', { name: /^call/i });
    expect(call.getAttribute('href')).toMatch(/^tel:\+?\d+$/);
    expect(screen.getAllByRole('link', { name: /whatsapp/i })[0].getAttribute('href')).toMatch(/^https:\/\/wa\.me\/\d+$/);
  });
});

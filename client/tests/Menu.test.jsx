import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import Menu from '../src/pages/Menu.jsx';
import { mockFetch, jsonRes, menuItems } from './helpers.js';

const setup = () => render(<MemoryRouter><Menu /></MemoryRouter>);

describe('Menu page', () => {
  it('shows a loading state, then items with prices and availability', async () => {
    mockFetch(async () => jsonRes(200, { data: menuItems }));
    setup();
    expect(screen.getByRole('status')).toHaveTextContent(/loading/i);
    expect(await screen.findByText('Signature Latte')).toBeInTheDocument();
    expect(screen.getByText('$4.50')).toBeInTheDocument();
    expect(screen.getByText('Unavailable today')).toBeInTheDocument();
    expect(screen.getAllByText('Available')).toHaveLength(3);
  });

  it('filters by category', async () => {
    mockFetch(async () => jsonRes(200, { data: menuItems }));
    setup();
    await screen.findByText('Signature Latte');
    await userEvent.click(screen.getByRole('button', { name: 'Cold Drinks' }));
    expect(screen.getByText('Cold Brew')).toBeInTheDocument();
    expect(screen.queryByText('Signature Latte')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cold Drinks' })).toHaveAttribute('aria-pressed', 'true');
  });

  it('searches by name and description, case-insensitively', async () => {
    mockFetch(async () => jsonRes(200, { data: menuItems }));
    setup();
    await screen.findByText('Signature Latte');
    await userEvent.type(screen.getByLabelText(/search the menu/i), 'BERRY');
    expect(screen.getByText('Cheesecake')).toBeInTheDocument();
    expect(screen.queryByText('Cold Brew')).not.toBeInTheDocument();
  });

  it('combines search and category and shows an empty state with no matches', async () => {
    mockFetch(async () => jsonRes(200, { data: menuItems }));
    setup();
    await screen.findByText('Signature Latte');
    await userEvent.click(screen.getByRole('button', { name: 'Tea' }));
    expect(screen.getByText(/no items match/i)).toBeInTheDocument();
  });

  it('shows an empty state when the menu has no items', async () => {
    mockFetch(async () => jsonRes(200, { data: [] }));
    setup();
    expect(await screen.findByText(/menu is empty/i)).toBeInTheDocument();
  });

  it('shows an error and recovers on retry', async () => {
    const f = mockFetch(async () => jsonRes(500, { error: { message: 'Could not load menu' } }));
    setup();
    expect(await screen.findByRole('alert')).toHaveTextContent('Could not load menu');
    f.mockImplementation(async () => jsonRes(200, { data: menuItems }));
    await userEvent.click(screen.getByRole('button', { name: /try again/i }));
    expect(await screen.findByText('Signature Latte')).toBeInTheDocument();
  });

  it('shows a network error message when the server is unreachable', async () => {
    mockFetch(async () => { throw new TypeError('failed'); });
    setup();
    expect(await screen.findByRole('alert')).toHaveTextContent(/could not reach the server/i);
  });
});

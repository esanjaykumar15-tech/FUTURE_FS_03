import { render, screen } from '@testing-library/react';
import PhotoSlot from '../src/components/PhotoSlot.jsx';
import MenuCard from '../src/components/MenuCard.jsx';
import { Latte, categoryArt } from '../src/components/illustrations.jsx';

describe('PhotoSlot image priority', () => {
  it('uses a real photo when provided, lazy-loaded, over any illustration', () => {
    render(<PhotoSlot photo={{ src: '/photos/cafe.jpg', alt: 'The café front' }} art={Latte} />);
    const img = screen.getByRole('img', { name: 'The café front' });
    expect(img.tagName).toBe('IMG');
    expect(img).toHaveAttribute('loading', 'lazy');
    expect(screen.queryByRole('img', { name: /illustration/i })).not.toBeInTheDocument();
  });
  it('falls back to an accessible illustration', () => {
    render(<PhotoSlot art={Latte} />);
    expect(screen.getByRole('img', { name: /illustration of a latte/i })).toBeInTheDocument();
  });
  it('falls back to a labeled placeholder when there is neither', () => {
    render(<PhotoSlot />);
    expect(screen.getByRole('img', { name: /sample photo placeholder/i })).toBeInTheDocument();
  });
});

describe('MenuCard images', () => {
  const base = { id: '1', name: 'X', description: 'd', price: 3, available: true };
  it.each(['Hot Coffee', 'Cold Drinks', 'Tea', 'Snacks', 'Desserts'])('shows an illustration for %s', (category) => {
    render(<MenuCard item={{ ...base, category }} />);
    expect(screen.getByRole('img', { name: /^illustration of/i })).toBeInTheDocument();
    expect(categoryArt[category]).toBeTypeOf('function');
  });
  it('prefers the item’s own image_url over the illustration', () => {
    render(<MenuCard item={{ ...base, category: 'Tea', image_url: 'https://example.com/tea.jpg' }} />);
    expect(screen.getByRole('img', { name: 'X' }).tagName).toBe('IMG');
    expect(screen.queryByRole('img', { name: /illustration/i })).not.toBeInTheDocument();
  });
});

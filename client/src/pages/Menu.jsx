import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import MenuCard from '../components/MenuCard.jsx';
import { Loading, ErrorState, EmptyState } from '../components/States.jsx';
import { useMenu } from '../hooks/useMenu.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';

export const CATEGORIES = ['Hot Coffee', 'Cold Drinks', 'Tea', 'Snacks', 'Desserts'];

export default function Menu() {
  useDocumentTitle('Menu');
  const { status, items, error, reload } = useMenu();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((i) =>
      (category === 'All' || i.category === category) &&
      (!q || i.name.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q)));
  }, [items, category, query]);

  return (
    <div className="container-page py-12">
      <h1 className="text-4xl font-bold md:text-5xl">Menu</h1>
      <p className="mt-3 max-w-xl text-espresso/80">Drinks and bakes made fresh. Availability can change through the day.</p>

      <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div role="group" aria-label="Filter by category" className="flex flex-wrap gap-2">
          {['All', ...CATEGORIES].map((c) => (
            <button key={c} type="button" aria-pressed={category === c} onClick={() => setCategory(c)}
              className={`rounded-full border-2 border-espresso px-4 py-2 font-medium transition-colors ${category === c ? 'bg-espresso text-cream' : 'hover:bg-cream-deep'}`}>
              {c}
            </button>
          ))}
        </div>
        <div className="relative md:w-72">
          <label htmlFor="menu-search" className="sr-only">Search the menu</label>
          <Search className="pointer-events-none absolute left-3.5 top-3.5 h-5 w-5 text-espresso/60" aria-hidden="true" />
          <input id="menu-search" type="search" className="input pl-11" placeholder="Search the menu" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
      </div>

      <div className="mt-8" aria-live="polite">
        {status === 'loading' && <Loading label="Loading menu" />}
        {status === 'error' && <ErrorState message={error} onRetry={reload} />}
        {status === 'ready' && items.length === 0 && <EmptyState title="The menu is empty right now.">Please check back soon.</EmptyState>}
        {status === 'ready' && items.length > 0 && visible.length === 0 && (
          <EmptyState title="No items match your search.">Try a different word or choose another category.</EmptyState>
        )}
        {status === 'ready' && visible.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{visible.map((i) => <MenuCard key={i.id} item={i} />)}</div>
        )}
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { UtensilsCrossed, CalendarClock, Mail } from 'lucide-react';
import { Loading, ErrorState } from '../../components/States.jsx';
import { useAdminApi } from '../../hooks/useAdminApi.js';
import { useResource } from '../../hooks/useResource.js';

export default function Dashboard() {
  const adminApi = useAdminApi();
  const { status, data, error, reload } = useResource(() => adminApi.summary(), [adminApi]);
  if (status === 'loading') return <Loading label="Loading summary" />;
  if (status === 'error') return <ErrorState message={error} onRetry={reload} />;

  const cards = [
    { to: '/admin/menu', label: 'Menu items', value: data.menuItems, icon: UtensilsCrossed },
    { to: '/admin/reservations?status=pending', label: 'Pending reservations', value: data.pendingReservations, icon: CalendarClock },
    { to: '/admin/enquiries', label: 'New enquiries', value: data.newEnquiries, icon: Mail },
  ];
  return (
    <div>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <ul className="mt-6 grid gap-5 sm:grid-cols-3">
        {cards.map(({ to, label, value, icon: Icon }) => (
          <li key={label}>
            <Link to={to} className="card block p-6 hover:bg-cream-deep">
              <Icon className="h-6 w-6 text-caramel-dark" aria-hidden="true" />
              <p className="mt-3 font-display text-4xl font-bold">{value}</p>
              <p className="text-espresso/80">{label}</p>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

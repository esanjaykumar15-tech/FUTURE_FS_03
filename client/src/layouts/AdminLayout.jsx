import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, UtensilsCrossed, CalendarCheck, Mail, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.jsx';
import { business } from '../config/business.js';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/menu', label: 'Menu', icon: UtensilsCrossed },
  { to: '/admin/reservations', label: 'Reservations', icon: CalendarCheck },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Mail },
];

export default function AdminLayout() {
  const { signOut } = useAuth();
  useEffect(() => {
    const m = document.createElement('meta');
    m.name = 'robots'; m.content = 'noindex, nofollow';
    document.head.appendChild(m);
    document.title = `Admin | ${business.name}`;
    return () => m.remove();
  }, []);

  const cls = ({ isActive }) => `flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 font-medium ${isActive ? 'bg-espresso text-cream' : 'hover:bg-cream-deep'}`;
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b border-espresso/10 bg-white">
        <div className="container-page flex items-center justify-between py-3">
          <p className="font-display text-xl font-bold">{business.name} admin</p>
          <button type="button" className="btn btn-secondary px-4 py-2" onClick={signOut}><LogOut className="h-4 w-4" aria-hidden="true" />Sign out</button>
        </div>
        <nav aria-label="Admin" className="container-page flex gap-1 overflow-x-auto pb-3">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end} className={cls}><Icon className="h-4 w-4" aria-hidden="true" />{label}</NavLink>
          ))}
        </nav>
      </header>
      <main id="main" className="container-page py-8"><Outlet /></main>
    </div>
  );
}

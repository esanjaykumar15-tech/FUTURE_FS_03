import { Outlet } from 'react-router-dom';
import { AuthProvider } from '../hooks/useAuth.jsx';

// Wraps all /admin routes so the Supabase client loads only for admin pages.
export default function AdminRoot() {
  return <AuthProvider><Outlet /></AuthProvider>;
}

import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useAdminApi } from '../../hooks/useAdminApi.js';
import { Loading, ErrorState } from '../States.jsx';

// UX gate only. Real enforcement is server-side on every /api/admin route;
// this component just asks the server who the user is and shows the right screen.
export default function RequireAdmin({ children }) {
  const { session, loading, signOut } = useAuth();
  const adminApi = useAdminApi();
  const location = useLocation();
  const [check, setCheck] = useState('checking'); // checking | ok | forbidden | error
  const [message, setMessage] = useState('');
  const token = session?.access_token;

  useEffect(() => {
    if (!token) return undefined;
    let active = true;
    setCheck('checking');
    adminApi.me()
      .then(() => active && setCheck('ok'))
      .catch((e) => {
        if (!active) return;
        if (e.status === 401) { signOut(); return; }
        setMessage(e.message);
        setCheck(e.status === 403 ? 'forbidden' : 'error');
      });
    return () => { active = false; };
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <Loading label="Checking sign-in" />;
  if (!session) return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  if (check === 'checking') return <Loading label="Checking permissions" />;
  if (check === 'forbidden') {
    return (
      <div className="container-page py-24 text-center">
        <h1 className="text-3xl font-bold">You don’t have admin access</h1>
        <p className="mx-auto mt-3 max-w-md">This account is signed in but isn’t an administrator. Ask the café owner to grant access, or sign in with a different account.</p>
        <button type="button" className="btn btn-primary mt-6" onClick={signOut}>Sign out</button>
      </div>
    );
  }
  if (check === 'error') return <div className="container-page py-16"><ErrorState message={message} onRetry={() => window.location.reload()} /></div>;
  return children;
}

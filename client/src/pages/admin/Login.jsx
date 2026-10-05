import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import FormField from '../../components/FormField.jsx';
import { Loading } from '../../components/States.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';
import { supabaseConfigured } from '../../lib/supabase.js';
import { business } from '../../config/business.js';

export default function Login() {
  const { session, loading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const from = location.state?.from || '/admin';

  if (loading) return <Loading label="Checking sign-in" />;
  if (session) return <Navigate to={from} replace />;

  async function onSubmit(e) {
    e.preventDefault();
    if (busy) return;
    const found = {};
    if (!values.email.trim()) found.email = 'Enter your email address.';
    if (!values.password) found.password = 'Enter your password.';
    setErrors(found); setFormError('');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await signIn(values.email.trim(), values.password);
      navigate(from, { replace: true });
    } catch (err) {
      setFormError(err.message);
    } finally { setBusy(false); }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-12">
      <h1 className="text-3xl font-bold">{business.name} admin</h1>
      <p className="mt-2 text-espresso/80">Sign in to manage the menu and reservations.</p>
      {!supabaseConfigured && (
        <p role="alert" className="mt-6 rounded-xl bg-red-50 p-4 text-red-800">Sign-in isn’t configured. Set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> and rebuild.</p>
      )}
      <form onSubmit={onSubmit} noValidate className="card mt-6 space-y-5 p-6" aria-busy={busy}>
        {formError && <p role="alert" className="rounded-xl bg-red-50 p-4 font-medium text-red-800">{formError}</p>}
        <FormField label="Email" required error={errors.email}>
          {(p) => <input {...p} type="email" autoComplete="username" className="input" value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} />}
        </FormField>
        <FormField label="Password" required error={errors.password}>
          {(p) => <input {...p} type="password" autoComplete="current-password" className="input" value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} />}
        </FormField>
        <button type="submit" className="btn btn-primary w-full" disabled={busy || !supabaseConfigured}>{busy ? 'Signing in' : 'Sign in'}</button>
      </form>
    </div>
  );
}

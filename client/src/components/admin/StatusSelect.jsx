import { useId, useState } from 'react';

// Select that saves immediately, shows saving/error state, and reverts on failure.
export default function StatusSelect({ label, value, options, onChange }) {
  const id = useId();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  async function handle(e) {
    setBusy(true); setError('');
    try { await onChange(e.target.value); } catch (err) { setError(err.message); } finally { setBusy(false); }
  }
  return (
    <div>
      <label className="sr-only" htmlFor={id}>{label}</label>
      <select id={id} className="input w-auto py-2" value={value} onChange={handle} disabled={busy}>
        {options.map((o) => <option key={o} value={o}>{o[0].toUpperCase() + o.slice(1)}</option>)}
      </select>
      {error && <p role="alert" className="mt-1 text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}

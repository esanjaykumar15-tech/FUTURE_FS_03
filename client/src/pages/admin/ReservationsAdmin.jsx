import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Loading, ErrorState, EmptyState } from '../../components/States.jsx';
import StatusSelect from '../../components/admin/StatusSelect.jsx';
import { useAdminApi } from '../../hooks/useAdminApi.js';
import { useResource } from '../../hooks/useResource.js';

export const RESERVATION_STATUSES = ['pending', 'confirmed', 'cancelled', 'completed'];

export default function ReservationsAdmin() {
  const adminApi = useAdminApi();
  const [params] = useSearchParams();
  const [status, setStatus] = useState(params.get('status') || '');
  const [date, setDate] = useState('');
  const [q, setQ] = useState('');
  const [debouncedQ, setDebouncedQ] = useState('');
  const [notice, setNotice] = useState('');

  useEffect(() => { const t = setTimeout(() => setDebouncedQ(q), 300); return () => clearTimeout(t); }, [q]);

  const res = useResource(() => adminApi.listReservations({ status, date, q: debouncedQ }), [adminApi, status, date, debouncedQ]);

  async function change(r, next) {
    await adminApi.updateReservation(r.id, next);
    setNotice(`${r.customer_name}’s reservation is now ${next}.`);
    res.reload();
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Reservations</h1>
      <p className="mt-2 text-espresso/80">Requests stay pending until you confirm them with the customer.</p>
      <div className="mt-6 flex flex-wrap items-end gap-4">
        <div className="relative">
          <label htmlFor="r-search" className="mb-1 block text-sm font-medium">Search name or phone</label>
          <Search className="pointer-events-none absolute left-3 top-[2.45rem] h-4 w-4 text-espresso/60" aria-hidden="true" />
          <input id="r-search" type="search" className="input pl-9" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <div>
          <label htmlFor="r-status" className="mb-1 block text-sm font-medium">Status</label>
          <select id="r-status" className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            {RESERVATION_STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="r-date" className="mb-1 block text-sm font-medium">Date</label>
          <input id="r-date" type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        {(status || date || q) && <button type="button" className="btn btn-secondary px-4 py-2" onClick={() => { setStatus(''); setDate(''); setQ(''); }}>Clear filters</button>}
      </div>

      {notice && <p role="status" className="mt-4 rounded-xl bg-white p-3 font-medium shadow-card">{notice}</p>}

      <div className="mt-6">
        {res.status === 'loading' && <Loading label="Loading reservations" />}
        {res.status === 'error' && <ErrorState message={res.error} onRetry={res.reload} />}
        {res.status === 'ready' && res.data.length === 0 && <EmptyState title="No reservations found.">Try clearing the filters.</EmptyState>}
        {res.status === 'ready' && res.data.length > 0 && (
          <ul className="space-y-3">
            {res.data.map((r) => (
              <li key={r.id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-semibold">{r.customer_name} <span className="font-normal">for {r.party_size}</span></p>
                  <p className="text-sm text-espresso/80">{r.booking_date} at {String(r.booking_time).slice(0, 5)}</p>
                  <a className="text-sm font-medium text-caramel-dark underline" href={`tel:${r.phone.replace(/[^+\d]/g, '')}`}>{r.phone}</a>
                </div>
                <StatusSelect label={`Status for ${r.customer_name}`} value={r.status} options={RESERVATION_STATUSES} onChange={(s) => change(r, s)} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

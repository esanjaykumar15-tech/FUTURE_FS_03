import { useState } from 'react';
import { Loading, ErrorState, EmptyState } from '../../components/States.jsx';
import StatusSelect from '../../components/admin/StatusSelect.jsx';
import { useAdminApi } from '../../hooks/useAdminApi.js';
import { useResource } from '../../hooks/useResource.js';

const STATUSES = ['new', 'read', 'resolved'];

export default function EnquiriesAdmin() {
  const adminApi = useAdminApi();
  const res = useResource(() => adminApi.listEnquiries(), [adminApi]);
  const [filter, setFilter] = useState('');
  const rows = res.data ? res.data.filter((e) => !filter || e.status === filter) : [];

  return (
    <div>
      <h1 className="text-3xl font-bold">Enquiries</h1>
      <div className="mt-6">
        <label htmlFor="e-status" className="mb-1 block text-sm font-medium">Status</label>
        <select id="e-status" className="input w-auto" value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>
      <div className="mt-6">
        {res.status === 'loading' && <Loading label="Loading enquiries" />}
        {res.status === 'error' && <ErrorState message={res.error} onRetry={res.reload} />}
        {res.status === 'ready' && rows.length === 0 && <EmptyState title="No enquiries to show." />}
        {res.status === 'ready' && rows.length > 0 && (
          <ul className="space-y-3">
            {rows.map((e) => (
              <li key={e.id} className="card space-y-3 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{e.name}</p>
                    <p className="text-sm"><a className="text-caramel-dark underline" href={`mailto:${e.email}`}>{e.email}</a>{e.phone && <> or <a className="text-caramel-dark underline" href={`tel:${e.phone.replace(/[^+\d]/g, '')}`}>{e.phone}</a></>}</p>
                    <p className="text-sm text-espresso/70">{new Date(e.created_at).toLocaleString()}</p>
                  </div>
                  <StatusSelect label={`Status for enquiry from ${e.name}`} value={e.status} options={STATUSES}
                    onChange={async (s) => { await adminApi.updateEnquiry(e.id, s); res.reload(); }} />
                </div>
                <p className="whitespace-pre-wrap">{e.message}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

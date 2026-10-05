import { useState } from 'react';
import { Pencil, Trash2, Plus } from 'lucide-react';
import FormField from '../../components/FormField.jsx';
import { Loading, ErrorState, EmptyState } from '../../components/States.jsx';
import { api, ApiError } from '../../services/api.js';
import { useAdminApi } from '../../hooks/useAdminApi.js';
import { useResource } from '../../hooks/useResource.js';
import { formatPrice } from '../../config/business.js';
import { CATEGORIES } from '../Menu.jsx';

const blank = { name: '', description: '', category: 'Hot Coffee', price: '', image_url: '', available: true };

function validate(v) {
  const e = {};
  if (!v.name.trim()) e.name = 'Enter a name.';
  if (v.price === '' || Number.isNaN(Number(v.price)) || Number(v.price) < 0) e.price = 'Enter a price of 0 or more.';
  if (v.image_url.trim() && !/^https?:\/\//i.test(v.image_url.trim())) e.image_url = 'Use a full link starting with https://';
  return e;
}

function ItemForm({ initial, onSave, onCancel }) {
  const [v, setV] = useState(initial);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [busy, setBusy] = useState(false);
  const editing = Boolean(initial.id);
  const set = (k) => (e) => setV((s) => ({ ...s, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    if (busy) return;
    const found = validate(v); setErrors(found); setFormError('');
    if (Object.keys(found).length) return;
    setBusy(true);
    try {
      await onSave({
        name: v.name.trim(), description: v.description.trim(), category: v.category,
        price: Number(v.price), image_url: v.image_url.trim() || null, available: v.available,
      });
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      else setFormError(err.message);
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} noValidate className="card space-y-4 p-6" aria-label={editing ? 'Edit menu item' : 'Add menu item'}>
      <h2 className="text-xl font-semibold">{editing ? 'Edit menu item' : 'Add menu item'}</h2>
      {formError && <p role="alert" className="rounded-xl bg-red-50 p-3 font-medium text-red-800">{formError}</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Name" required error={errors.name}>{(p) => <input {...p} className="input" value={v.name} onChange={set('name')} />}</FormField>
        <FormField label="Category" required error={errors.category}>
          {(p) => <select {...p} className="input" value={v.category} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>}
        </FormField>
        <FormField label="Price" required error={errors.price}>{(p) => <input {...p} type="number" step="0.01" min="0" inputMode="decimal" className="input" value={v.price} onChange={set('price')} />}</FormField>
        <FormField label="Image link (optional)" error={errors.image_url}>{(p) => <input {...p} type="url" className="input" value={v.image_url} onChange={set('image_url')} />}</FormField>
      </div>
      <FormField label="Description" error={errors.description}>{(p) => <textarea {...p} rows={3} className="input" value={v.description} onChange={set('description')} />}</FormField>
      <label className="flex items-center gap-2 font-medium">
        <input type="checkbox" className="h-5 w-5" checked={v.available} onChange={(e) => setV((s) => ({ ...s, available: e.target.checked }))} />
        Available to order today
      </label>
      <div className="flex gap-3">
        <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? 'Saving' : 'Save item'}</button>
        <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={busy}>Cancel</button>
      </div>
    </form>
  );
}

export default function MenuAdmin() {
  const adminApi = useAdminApi();
  const { status, data, error, reload } = useResource(() => api.getMenu(), []);
  const [editing, setEditing] = useState(null); // null | item | blank
  const [confirmId, setConfirmId] = useState(null);
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');

  async function save(body) {
    if (editing.id) await adminApi.updateMenuItem(editing.id, body);
    else await adminApi.createMenuItem(body);
    setNotice(editing.id ? 'Menu item updated.' : 'Menu item added.');
    setEditing(null); reload();
  }

  async function remove(item) {
    setActionError('');
    try {
      await adminApi.deleteMenuItem(item.id);
      setNotice(`Deleted ${item.name}.`); setConfirmId(null); reload();
    } catch (e) { setActionError(e.message); }
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold">Menu</h1>
        {!editing && <button type="button" className="btn btn-primary" onClick={() => { setNotice(''); setEditing({ ...blank }); }}><Plus className="h-5 w-5" aria-hidden="true" />Add item</button>}
      </div>
      {notice && <p role="status" className="mt-4 rounded-xl bg-white p-3 font-medium shadow-card">{notice}</p>}
      {actionError && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 font-medium text-red-800">{actionError}</p>}
      {editing && <div className="mt-6"><ItemForm key={editing.id || 'new'} initial={{ ...blank, ...editing, price: editing.price ?? '', image_url: editing.image_url ?? '' }} onSave={save} onCancel={() => setEditing(null)} /></div>}

      <div className="mt-6">
        {status === 'loading' && <Loading label="Loading menu" />}
        {status === 'error' && <ErrorState message={error} onRetry={reload} />}
        {status === 'ready' && data.length === 0 && <EmptyState title="No menu items yet.">Use “Add item” to create the first one.</EmptyState>}
        {status === 'ready' && data.length > 0 && (
          <ul className="space-y-3">
            {data.map((item) => (
              <li key={item.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="font-semibold">{item.name} <span className="font-normal text-espresso/70">{formatPrice(item.price)}</span></p>
                  <p className="text-sm text-espresso/70">{item.category}, {item.available ? 'available' : 'unavailable'}</p>
                </div>
                {confirmId === item.id ? (
                  <div className="flex items-center gap-2" role="group" aria-label={`Confirm delete ${item.name}`}>
                    <span className="font-medium">Delete this item?</span>
                    <button type="button" className="btn bg-red-700 px-4 py-2 text-white" onClick={() => remove(item)}>Yes, delete</button>
                    <button type="button" className="btn btn-secondary px-4 py-2" onClick={() => setConfirmId(null)}>Keep</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button type="button" className="btn btn-secondary px-4 py-2" aria-label={`Edit ${item.name}`} onClick={() => { setNotice(''); setEditing(item); }}><Pencil className="h-4 w-4" aria-hidden="true" />Edit</button>
                    <button type="button" className="btn btn-secondary px-4 py-2" aria-label={`Delete ${item.name}`} onClick={() => setConfirmId(item.id)}><Trash2 className="h-4 w-4" aria-hidden="true" />Delete</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

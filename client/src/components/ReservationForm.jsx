import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import FormField from './FormField.jsx';
import { api, ApiError } from '../services/api.js';
import { validateReservation, todayISO } from '../lib/validation.js';
import { business } from '../config/business.js';

const empty = { customer_name: '', phone: '', booking_date: '', booking_time: '', party_size: 2, website: '' };

export default function ReservationForm() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle'); // idle | submitting | success
  const [formError, setFormError] = useState('');
  const [result, setResult] = useState(null);

  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (status === 'submitting') return;
    setFormError('');
    const found = validateReservation(values);
    setErrors(found);
    if (Object.keys(found).length) return;

    setStatus('submitting');
    try {
      const body = { ...values, customer_name: values.customer_name.trim(), phone: values.phone.trim(), party_size: Number(values.party_size) };
      const res = await api.createReservation(body);
      setResult(res);
      setStatus('success');
    } catch (err) {
      setStatus('idle');
      if (err instanceof ApiError && err.status === 400 && err.details.length) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      } else {
        setFormError(err.message);
      }
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="card p-8">
        <CheckCircle2 className="h-9 w-9 text-caramel-dark" aria-hidden="true" />
        <h2 className="mt-3 text-2xl font-semibold">Request received, pending confirmation</h2>
        <p className="mt-3 max-w-prose">
          We’ve received your request for {result?.data?.party_size ?? values.party_size} on {result?.data?.booking_date ?? values.booking_date} at {(result?.data?.booking_time ?? values.booking_time).slice(0, 5)}.
          <strong> Your table is not confirmed yet.</strong> The café will contact you on {values.phone} to confirm.
        </p>
        <button type="button" className="btn btn-secondary mt-6" onClick={() => { setValues(empty); setErrors({}); setStatus('idle'); }}>Make another request</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card space-y-5 p-6 sm:p-8" aria-busy={status === 'submitting'}>
      {formError && <p role="alert" className="rounded-xl bg-red-50 p-4 font-medium text-red-800">{formError}</p>}
      <FormField label="Full name" required error={errors.customer_name}>
        {(p) => <input {...p} className="input" autoComplete="name" value={values.customer_name} onChange={set('customer_name')} />}
      </FormField>
      <FormField label="Phone number" required error={errors.phone} hint="We’ll call or message this number to confirm.">
        {(p) => <input {...p} type="tel" className="input" autoComplete="tel" value={values.phone} onChange={set('phone')} />}
      </FormField>
      <div className="grid gap-5 sm:grid-cols-2">
        <FormField label="Date" required error={errors.booking_date}>
          {(p) => <input {...p} type="date" className="input" min={todayISO()} value={values.booking_date} onChange={set('booking_date')} />}
        </FormField>
        <FormField label="Time" required error={errors.booking_time}>
          {(p) => (
            <select {...p} className="input" value={values.booking_time} onChange={set('booking_time')}>
              <option value="">Choose a time</option>
              {business.timeSlots.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          )}
        </FormField>
      </div>
      <FormField label="Party size" required error={errors.party_size} hint="For parties over 20, please call us.">
        {(p) => <input {...p} type="number" inputMode="numeric" min="1" max="20" className="input sm:w-40" value={values.party_size} onChange={set('party_size')} />}
      </FormField>
      {/* Honeypot: hidden from people and assistive tech; bots tend to fill it. */}
      <div className="hidden" aria-hidden="true">
        <label>Leave this empty<input tabIndex={-1} autoComplete="off" value={values.website} onChange={set('website')} name="website" /></label>
      </div>
      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={status === 'submitting'}>
        {status === 'submitting' ? 'Sending request' : 'Request reservation'}
      </button>
      <p className="text-sm text-espresso/70">This is a request only. A table is reserved once the café confirms it with you.</p>
    </form>
  );
}

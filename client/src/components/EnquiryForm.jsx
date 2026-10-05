import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import FormField from './FormField.jsx';
import { api, ApiError } from '../services/api.js';
import { validateEnquiry } from '../lib/validation.js';

const empty = { name: '', email: '', phone: '', message: '', website: '' };

export default function EnquiryForm() {
  const [values, setValues] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('idle');
  const [formError, setFormError] = useState('');
  const set = (k) => (e) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function onSubmit(e) {
    e.preventDefault();
    if (status === 'submitting') return;
    setFormError('');
    const found = validateEnquiry(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    setStatus('submitting');
    try {
      await api.createEnquiry({ ...values, name: values.name.trim(), email: values.email.trim(), phone: values.phone.trim(), message: values.message.trim() });
      setStatus('success');
    } catch (err) {
      setStatus('idle');
      if (err instanceof ApiError && err.status === 400 && err.details.length) setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      else setFormError(err.message);
    }
  }

  if (status === 'success') {
    return (
      <div role="status" className="card p-8">
        <CheckCircle2 className="h-9 w-9 text-caramel-dark" aria-hidden="true" />
        <h2 className="mt-3 text-2xl font-semibold">Message sent</h2>
        <p className="mt-2">Thanks, we’ve received your message and will reply by email or phone.</p>
        <button type="button" className="btn btn-secondary mt-6" onClick={() => { setValues(empty); setStatus('idle'); }}>Send another message</button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="card space-y-5 p-6 sm:p-8" aria-busy={status === 'submitting'}>
      {formError && <p role="alert" className="rounded-xl bg-red-50 p-4 font-medium text-red-800">{formError}</p>}
      <FormField label="Full name" required error={errors.name}>{(p) => <input {...p} className="input" autoComplete="name" value={values.name} onChange={set('name')} />}</FormField>
      <FormField label="Email" required error={errors.email}>{(p) => <input {...p} type="email" className="input" autoComplete="email" value={values.email} onChange={set('email')} />}</FormField>
      <FormField label="Phone (optional)" error={errors.phone}>{(p) => <input {...p} type="tel" className="input" autoComplete="tel" value={values.phone} onChange={set('phone')} />}</FormField>
      <FormField label="Message" required error={errors.message}>{(p) => <textarea {...p} rows={5} className="input" value={values.message} onChange={set('message')} />}</FormField>
      <div className="hidden" aria-hidden="true"><label>Leave this empty<input tabIndex={-1} autoComplete="off" name="website" value={values.website} onChange={set('website')} /></label></div>
      <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>{status === 'submitting' ? 'Sending message' : 'Send message'}</button>
    </form>
  );
}

import { useId } from 'react';

export default function FormField({ label, error, hint, required, children }) {
  const id = useId();
  const describedBy = [error && `${id}-err`, hint && `${id}-hint`].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block font-medium">
        {label}{required && <span className="text-red-700" aria-hidden="true"> *</span>}
      </label>
      {children({ id, 'aria-invalid': error ? 'true' : undefined, 'aria-describedby': describedBy, 'aria-required': required || undefined })}
      {hint && !error && <p id={`${id}-hint`} className="mt-1 text-sm text-espresso/70">{hint}</p>}
      {error && <p id={`${id}-err`} className="mt-1 text-sm font-medium text-red-700">{error}</p>}
    </div>
  );
}

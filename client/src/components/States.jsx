import { AlertCircle, Loader2, SearchX } from 'lucide-react';

export function Loading({ label = 'Loading' }) {
  return (
    <div role="status" className="flex items-center justify-center gap-3 py-16 text-espresso/80">
      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }) {
  return (
    <div role="alert" className="card mx-auto max-w-lg p-8 text-center">
      <AlertCircle className="mx-auto h-8 w-8 text-red-700" aria-hidden="true" />
      <p className="mt-3 font-semibold">We couldn’t load this.</p>
      <p className="mt-1 text-espresso/80">{message}</p>
      {onRetry && <button type="button" className="btn btn-primary mt-5" onClick={onRetry}>Try again</button>}
    </div>
  );
}

export function EmptyState({ title, children }) {
  return (
    <div className="card mx-auto max-w-lg p-8 text-center">
      <SearchX className="mx-auto h-8 w-8 text-caramel-dark" aria-hidden="true" />
      <p className="mt-3 font-semibold">{title}</p>
      {children && <p className="mt-1 text-espresso/80">{children}</p>}
    </div>
  );
}

import { Coffee } from 'lucide-react';

// Shows an authorized photo when provided; otherwise an honest, labeled placeholder.
export default function PhotoSlot({ photo, className = '', label = 'Sample photo' }) {
  if (photo?.src) {
    return <img src={photo.src} alt={photo.alt || ''} loading="lazy" decoding="async" className={`object-cover ${className}`} />;
  }
  return (
    <div role="img" aria-label={`${label} placeholder`} className={`flex flex-col items-center justify-center gap-2 bg-cream-deep text-caramel-dark ${className}`}>
      <Coffee className="h-10 w-10" aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

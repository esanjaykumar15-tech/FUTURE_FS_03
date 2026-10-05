import { Coffee } from 'lucide-react';

// Priority: authorized real photo > illustration > labeled placeholder.
export default function PhotoSlot({ photo, art: Art, className = '', label = 'Sample photo' }) {
  if (photo?.src) {
    return <img src={photo.src} alt={photo.alt || ''} loading="lazy" decoding="async" className={`object-cover ${className}`} />;
  }
  if (Art) return <div className={`overflow-hidden ${className}`}><Art /></div>;
  return (
    <div role="img" aria-label={`${label} placeholder`} className={`flex flex-col items-center justify-center gap-2 bg-cream-deep text-caramel-dark ${className}`}>
      <Coffee className="h-10 w-10" aria-hidden="true" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

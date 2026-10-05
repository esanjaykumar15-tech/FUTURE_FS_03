import PhotoSlot from './PhotoSlot.jsx';
import { formatPrice } from '../config/business.js';

export default function MenuCard({ item }) {
  return (
    <article className={`card overflow-hidden ${item.available ? '' : 'opacity-75'}`}>
      <PhotoSlot photo={item.image_url ? { src: item.image_url, alt: item.name } : null} label="Sample photo" className="h-44 w-full" />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-semibold">{item.name}</h3>
          <p className="shrink-0 font-semibold text-caramel-dark">{formatPrice(item.price)}</p>
        </div>
        <p className="mt-2 text-espresso/80">{item.description}</p>
        <p className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-medium ${item.available ? 'bg-cream text-espresso' : 'bg-espresso text-cream'}`}>
          {item.available ? 'Available' : 'Unavailable today'}
        </p>
      </div>
    </article>
  );
}

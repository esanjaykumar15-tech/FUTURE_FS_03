import { Link } from 'react-router-dom';
import { Phone, MapPin, MessageCircle, Instagram, Facebook } from 'lucide-react';
import Logo from './Logo.jsx';
import { business, mapUrl, telUrl, whatsappUrl } from '../config/business.js';

export default function Footer() {
  const { instagram, facebook } = business.social;
  return (
    <footer className="mt-24 bg-espresso text-cream">
      <div className="container-page grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-cream/80">Coffee, tea and something sweet. Request a table or send us a message anytime.</p>
        </div>
        <div>
          <h2 className="text-lg font-semibold">Visit and contact</h2>
          <ul className="mt-4 space-y-3 text-cream/90">
            <li><a className="flex gap-2 hover:underline" href={mapUrl} target="_blank" rel="noopener noreferrer"><MapPin className="h-5 w-5 shrink-0" aria-hidden="true" />{business.address}</a></li>
            <li><a className="flex gap-2 hover:underline" href={telUrl}><Phone className="h-5 w-5 shrink-0" aria-hidden="true" />{business.phone}</a></li>
            <li><a className="flex gap-2 hover:underline" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-5 w-5 shrink-0" aria-hidden="true" />Message on WhatsApp</a></li>
          </ul>
          {(instagram || facebook) && (
            <p className="mt-4 flex gap-4">
              {instagram && <a href={instagram} aria-label="Instagram" target="_blank" rel="noopener noreferrer"><Instagram aria-hidden="true" /></a>}
              {facebook && <a href={facebook} aria-label="Facebook" target="_blank" rel="noopener noreferrer"><Facebook aria-hidden="true" /></a>}
            </p>
          )}
        </div>
        <div>
          <h2 className="text-lg font-semibold">Explore</h2>
          <ul className="mt-4 space-y-2 text-cream/90">
            <li><Link className="hover:underline" to="/menu">Menu</Link></li>
            <li><Link className="hover:underline" to="/reservations">Reserve a table</Link></li>
            <li><Link className="hover:underline" to="/privacy">Privacy notice</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-cream/15 py-5 text-center text-sm text-cream/70">
        © {new Date().getFullYear()} {business.name}
      </div>
    </footer>
  );
}

import { Link } from 'react-router-dom';
import { business } from '../config/business.js';

export default function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label={`${business.name} home`}>
      <svg viewBox="0 0 64 64" className="h-9 w-9" aria-hidden="true">
        <rect width="64" height="64" rx="14" fill={light ? '#F5EBDD' : '#35251D'} />
        <path d="M16 26h27v10a10 10 0 0 1-10 10h-7a10 10 0 0 1-10-10z" fill={light ? '#35251D' : '#F5EBDD'} />
        <path d="M43 29h3a5 5 0 0 1 0 10h-3" fill="none" stroke={light ? '#35251D' : '#F5EBDD'} strokeWidth="3" />
        <path d="M24 20c0-3 3-3 3-6M32 20c0-3 3-3 3-6" fill="none" stroke="#B8784A" strokeWidth="3" strokeLinecap="round" />
      </svg>
      <span className="font-display text-xl font-bold">{business.name}</span>
    </Link>
  );
}

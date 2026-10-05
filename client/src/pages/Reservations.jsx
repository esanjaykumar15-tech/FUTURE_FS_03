import ReservationForm from '../components/ReservationForm.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { Link } from 'react-router-dom';

export default function Reservations() {
  useDocumentTitle('Reserve a table');
  return (
    <div className="container-page py-12">
      <h1 className="text-4xl font-bold md:text-5xl">Reserve a table</h1>
      <p className="mt-3 max-w-xl text-espresso/80">Send us a request and the café will confirm it by phone. We don’t show live availability, so we’ll let you know if another time works better.</p>
      <div className="mt-8 max-w-2xl"><ReservationForm /></div>
      <p className="mt-6 max-w-2xl text-sm text-espresso/70">We use your details only to handle this request. Read the <Link className="underline" to="/privacy">privacy notice</Link>.</p>
    </div>
  );
}

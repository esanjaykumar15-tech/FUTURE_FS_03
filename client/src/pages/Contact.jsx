import { Phone, MessageCircle, MapPin, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import EnquiryForm from '../components/EnquiryForm.jsx';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { business, mapUrl, telUrl, whatsappUrl } from '../config/business.js';

export default function Contact() {
  useDocumentTitle('Contact');
  return (
    <div className="container-page py-12">
      <h1 className="text-4xl font-bold md:text-5xl">Contact</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-2">
        <div>
          <EnquiryForm />
          <p className="mt-4 text-sm text-espresso/70">Read how we use your details in the <Link className="underline" to="/privacy">privacy notice</Link>.</p>
        </div>
        <div className="space-y-6">
          <div className="card space-y-4 p-6">
            <a className="flex gap-3 font-medium hover:underline" href={telUrl}><Phone className="h-5 w-5 text-caramel-dark" aria-hidden="true" />Call {business.phone}</a>
            <a className="flex gap-3 font-medium hover:underline" href={whatsappUrl} target="_blank" rel="noopener noreferrer"><MessageCircle className="h-5 w-5 text-caramel-dark" aria-hidden="true" />Message on WhatsApp</a>
            <a className="flex gap-3 font-medium hover:underline" href={mapUrl} target="_blank" rel="noopener noreferrer"><MapPin className="h-5 w-5 shrink-0 text-caramel-dark" aria-hidden="true" />{business.address} (get directions)</a>
          </div>
          <div className="card p-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold"><Clock className="h-5 w-5 text-caramel-dark" aria-hidden="true" />Opening hours</h2>
            <dl className="mt-3 divide-y divide-espresso/10">
              {business.hours.map((h) => <div key={h.day} className="flex justify-between py-2"><dt>{h.day}</dt><dd>{h.open} to {h.close}</dd></div>)}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

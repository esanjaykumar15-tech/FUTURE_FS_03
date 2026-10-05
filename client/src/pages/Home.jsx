import { Link } from 'react-router-dom';
import { Clock, MapPin } from 'lucide-react';
import PhotoSlot from '../components/PhotoSlot.jsx';
import MenuCard from '../components/MenuCard.jsx';
import { Hero, Interior, galleryArt } from '../components/illustrations.jsx';
import { Loading, ErrorState } from '../components/States.jsx';
import { useMenu } from '../hooks/useMenu.js';
import { useDocumentTitle } from '../hooks/useDocumentTitle.js';
import { business, mapUrl } from '../config/business.js';

const SampleNote = () => business.isSample && <p className="mt-3 text-sm italic text-espresso/70">Sample text, to be replaced with the café’s own words.</p>;

export default function Home() {
  useDocumentTitle('');
  const { status, items, error, reload } = useMenu();
  const featured = items.filter((i) => i.available).slice(0, 3);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <>
      <section className="container-page grid items-center gap-10 py-14 md:grid-cols-[1.2fr_1fr] md:py-20">
        <div>
          <h1 className="text-5xl font-bold leading-[1.05] md:text-7xl">Slow mornings and well-made coffee.</h1>
          <p className="mt-6 max-w-lg text-lg text-espresso/85">Pull up a chair for coffee, tea and something sweet. Browse the menu, then request a table and we’ll get back to you.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/menu" className="btn btn-primary">Explore menu</Link>
            <Link to="/reservations" className="btn btn-secondary">Reserve a table</Link>
          </div>
        </div>
        <PhotoSlot photo={business.photos[0]} art={Hero} label="Sample hero photo" className="mx-auto h-[26rem] w-full max-w-sm rounded-t-[999px] rounded-b-3xl border-4 border-caramel md:h-[30rem]" />
      </section>

      <section className="container-page py-12" aria-labelledby="featured-h">
        <h2 id="featured-h" className="text-3xl font-semibold">Featured from the menu</h2>
        <div className="mt-8">
          {status === 'loading' && <Loading label="Loading menu" />}
          {status === 'error' && <ErrorState message={error} onRetry={reload} />}
          {status === 'ready' && featured.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{featured.map((i) => <MenuCard key={i.id} item={i} />)}</div>
          )}
          {status === 'ready' && featured.length === 0 && <p className="text-espresso/80">The menu is being updated. Please check back soon.</p>}
        </div>
        <Link to="/menu" className="mt-8 inline-block font-semibold text-caramel-dark underline underline-offset-4">See the full menu</Link>
      </section>

      <section className="container-page grid gap-10 py-12 md:grid-cols-2 md:items-center" aria-labelledby="about-h">
        <PhotoSlot photo={business.photos[1]} art={Interior} label="Sample interior photo" className="h-72 w-full rounded-2xl" />
        <div>
          <h2 id="about-h" className="text-3xl font-semibold">Our story</h2>
          <p className="mt-4 text-lg leading-relaxed text-espresso/85">A neighborhood café built around good coffee, fresh baking and a table where you can stay a while.</p>
          <SampleNote />
          <Link to="/about" className="mt-5 inline-block font-semibold text-caramel-dark underline underline-offset-4">More about us</Link>
        </div>
      </section>

      <section className="container-page py-12" aria-labelledby="gallery-h">
        <h2 id="gallery-h" className="text-3xl font-semibold">Gallery</h2>
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[0, 1, 2, 3].map((n) => <PhotoSlot key={n} photo={business.photos[n + 2]} art={galleryArt[n]} className="h-40 w-full rounded-2xl md:h-52" />)}
        </div>
      </section>

      <section className="container-page grid gap-8 py-12 md:grid-cols-2" aria-labelledby="extras-h">
        <div className="card p-8">
          <h2 id="extras-h" className="text-2xl font-semibold">What guests say</h2>
          {business.testimonials.length > 0 ? (
            <ul className="mt-5 space-y-5">{business.testimonials.map((t) => <li key={t.author}><blockquote>“{t.quote}”</blockquote><p className="mt-1 font-medium">{t.author}</p></li>)}</ul>
          ) : <p className="mt-4 text-espresso/80">Customer reviews will appear here once the café shares quotes it has permission to publish.</p>}
        </div>
        <div className="card p-8">
          <h2 className="text-2xl font-semibold">Special offers</h2>
          {business.offers.length > 0 ? (
            <ul className="mt-5 space-y-4">{business.offers.map((o) => <li key={o.title}><p className="font-semibold">{o.title}</p><p className="text-espresso/80">{o.description}</p></li>)}</ul>
          ) : <p className="mt-4 text-espresso/80">No offers are running right now. Check back soon.</p>}
        </div>
      </section>

      <section className="container-page py-12" aria-labelledby="visit-h">
        <div className="card grid gap-8 p-8 md:grid-cols-2">
          <div>
            <h2 id="visit-h" className="text-3xl font-semibold">Visit us</h2>
            <p className="mt-4 flex gap-2"><MapPin className="mt-1 h-5 w-5 shrink-0 text-caramel-dark" aria-hidden="true" />{business.address}</p>
            <a href={mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary mt-5">Get directions</a>
          </div>
          <div>
            <h3 className="flex items-center gap-2 text-xl font-semibold"><Clock className="h-5 w-5 text-caramel-dark" aria-hidden="true" />Opening hours</h3>
            <dl className="mt-3 divide-y divide-espresso/10">
              {business.hours.map((h) => (
                <div key={h.day} className={`flex justify-between py-2 ${h.day === today ? 'font-semibold' : ''}`}>
                  <dt>{h.day}{h.day === today && ' (today)'}</dt><dd>{h.open} to {h.close}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
